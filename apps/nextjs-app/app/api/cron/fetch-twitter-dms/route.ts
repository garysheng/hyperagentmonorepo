import { createClient } from '@/lib/supabase/server'
import { getTwitterClient, refreshTwitterToken } from '@/lib/twitter/client'
import { NextResponse } from 'next/server'
import { ApiResponseError } from 'twitter-api-v2'
import { createTwitterDMOpportunity } from '@/lib/twitter/opportunities'
import { DMEventV2, TwitterDM } from '@/types/twitter'
import { TableName } from '@/types'

// Only allow this endpoint to be called by cron jobs
const CRON_SECRET = process.env.CRON_SECRET

// Type guard for message DM events with required fields
function isValidMessageEvent(event: DMEventV2): event is Extract<DMEventV2, { event_type: 'MessageCreate' }> & {
    text: string;
    created_at: string;
    dm_conversation_id: string;
    sender_id: string;
} {
    return (
        event.event_type === 'MessageCreate' &&
        typeof event.text === 'string' &&
        typeof event.created_at === 'string' &&
        typeof event.dm_conversation_id === 'string' &&
        typeof event.sender_id === 'string'
    )
}

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get all Twitter auths
        const { data: twitterAuths, error: authError } = await supabase
            .from('twitter_auth')
            .select(`
        user_id,
        access_token,
        refresh_token
      `)

        if (authError || !twitterAuths?.length) {
            console.error('Error fetching Twitter auths:', authError)
            return NextResponse.json(
                { error: 'No Twitter accounts found' },
                { status: 404 }
            )
        }

        const results = []

        // Process DMs for each Twitter account
        for (const auth of twitterAuths) {
            try {
                let client = getTwitterClient(auth.access_token)

                try {
                    // Get user's celebrity ID through the users table
                    const { data: userWithCelebrity } = await supabase
                        .from('users')
                        .select('celebrity_id')
                        .eq('id', auth.user_id)
                        .single()

                    if (!userWithCelebrity?.celebrity_id) {
                        console.error('No celebrity found for user:', auth.user_id)
                        continue
                    }

                    // Get DMs using v2 API
                    const dmEvents = await client.v2.listDmEvents({
                        max_results: 50,
                        "dm_event.fields": ["id", "text", "created_at", "sender_id", "dm_conversation_id", "referenced_tweets", "attachments"]
                    })

                    // Process each DM
                    for await (const event of dmEvents) {
                        // Skip if not a valid message event
                        if (!isValidMessageEvent(event)) continue

                        // Get the last processed DM for this conversation from opportunities table
                        const { data: lastProcessed } = await supabase
                            .from(TableName.OPPORTUNITIES)
                            .select('created_at')
                            .eq('twitter_dm_conversation_id', event.dm_conversation_id)
                            .eq('source', 'TWITTER_DM')
                            .order('created_at', { ascending: false })
                            .limit(1)
                            .single()

                        // Skip if we've already processed this DM
                        if (lastProcessed && new Date(lastProcessed.created_at) >= new Date(event.created_at)) {
                            continue
                        }

                        // Get sender info
                        const twitterUser = await client.v2.user(event.sender_id, {
                            "user.fields": ["id", "username"]
                        })

                        if (twitterUser.data) {
                            // Create opportunity from DM
                            const result = await createTwitterDMOpportunity({
                                supabase,
                                celebrity_id: userWithCelebrity.celebrity_id,
                                dm: {
                                    ...event,
                                    sender: {
                                        id: twitterUser.data.id,
                                        username: twitterUser.data.username
                                    }
                                } as TwitterDM
                            })

                            results.push(result)
                        }
                    }
                } catch (error) {
                    if (error instanceof ApiResponseError && error.code === 401 && auth.refresh_token) {
                        // Refresh token and update in database
                        const newTokens = await refreshTwitterToken(auth.refresh_token)
                        await supabase
                            .from('twitter_auth')
                            .update(newTokens)
                            .eq('user_id', auth.user_id)

                        // Retry with new token
                        client = getTwitterClient(newTokens.access_token)
                        continue
                    }
                    throw error
                }
            } catch (error) {
                if (error instanceof ApiResponseError) {
                    console.error('Twitter API error:', {
                        code: error.code,
                        rateLimitInfo: error.rateLimit,
                        message: error.message
                    })
                } else {
                    console.error('Error processing Twitter account:', error)
                }
            }
        }

        return NextResponse.json({ processed: results.length })
    } catch (error) {
        console.error('Error in Twitter DM cron:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 