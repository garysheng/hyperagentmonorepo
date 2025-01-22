import { createClient } from '@/lib/supabase/server'
import { getTwitterClient } from '@/lib/twitter/client'
import { NextResponse } from 'next/server'
import { ApiResponseError } from 'twitter-api-v2'
import { createTwitterDMOpportunity } from '@/lib/twitter/opportunities'

// Only allow this endpoint to be called by cron jobs
const CRON_SECRET = process.env.CRON_SECRET

interface TwitterDMEvent {
  id: string
  event_type: string
  text?: string
  sender_id?: string
  created_at?: string
  dm_conversation_id?: string
}

interface ValidTwitterDMEvent {
  id: string
  event_type: 'MessageCreate'
  text: string
  sender_id: string
  created_at: string
  dm_conversation_id: string
}

// Type guard for message DM events
function isValidDMEvent(event: TwitterDMEvent): event is ValidTwitterDMEvent {
  return (
    event.event_type === 'MessageCreate' &&
    typeof event.text === 'string' &&
    typeof event.sender_id === 'string' &&
    typeof event.created_at === 'string' &&
    typeof event.dm_conversation_id === 'string'
  )
}

export async function GET(request: Request) {
  try {
    // Verify cron secret
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    
    if (secret !== CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()

    // Get all celebrities with Twitter auth
    const { data: twitterAuths, error: authError } = await supabase
      .from('twitter_auth')
      .select('access_token, celebrity_id')
      .not('access_token', 'is', null)

    if (authError) {
      throw authError
    }

    console.log(`Found ${twitterAuths?.length || 0} celebrities with Twitter auth`)

    // For each celebrity with Twitter auth
    for (const auth of twitterAuths || []) {
      try {
        const client = getTwitterClient(auth.access_token)

        // Get existing opportunities to avoid duplicates
        const { data: existingOpportunities } = await supabase
          .from('opportunities')
          .select('twitter_dm_event_id')
          .eq('celebrity_id', auth.celebrity_id)
          .eq('source', 'TWITTER_DM')

        const existingDmIds = new Set(existingOpportunities?.map(o => o.twitter_dm_event_id))

        // Fetch DMs
        const dmsResponse = await client.v2.listDmEvents({
          max_results: 50,
          "dm_event.fields": ["id", "text", "created_at", "sender_id", "dm_conversation_id", "event_type"]
        })

        // Create opportunities for new DMs
        for (const event of dmsResponse.data.data || []) {
          const dm = event as TwitterDMEvent

          // Skip if we already have an opportunity for this DM
          if (existingDmIds.has(dm.id)) {
            continue
          }

          // Skip if not a valid message event
          if (!isValidDMEvent(dm)) {
            continue
          }

          // Get sender's username
          const sender = await client.v2.user(dm.sender_id)

          try {
            await createTwitterDMOpportunity(supabase, {
              celebrity_id: auth.celebrity_id,
              conversation_id: dm.dm_conversation_id,
              event_id: dm.id,
              sender_id: dm.sender_id,
              sender_username: sender.data.username,
              message_content: dm.text,
            })
          } catch (err) {
            console.error('Error creating opportunity:', err)
          }
        }

      } catch (err) {
        // Handle rate limits and other Twitter API errors
        if (err instanceof ApiResponseError) {
          console.error('Twitter API error for celebrity', auth.celebrity_id, ':', {
            code: err.code,
            message: err.message,
            rateLimitInfo: err.rateLimit,
            headers: err.headers
          })
        } else {
          console.error('Error processing celebrity', auth.celebrity_id, ':', err)
        }
        // Continue with next celebrity
        continue
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in fetch-twitter-dms cron:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 