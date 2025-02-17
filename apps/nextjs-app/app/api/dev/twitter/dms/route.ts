import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getTwitterClient } from '@/lib/twitter/client'
import { ApiResponseError } from 'twitter-api-v2'
import { IncomingHttpHeaders } from 'http'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get Twitter tokens
    const { data: twitterAuth, error: tokenError } = await supabase
      .from('twitter_auth')
      .select('access_token, refresh_token')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !twitterAuth) {
      console.error('Token lookup error:', tokenError)
      return NextResponse.json(
        { error: 'Twitter not connected' },
        { status: 401 }
      )
    }

    console.log('Found Twitter tokens:', {
      hasAccessToken: !!twitterAuth.access_token,
      hasRefreshToken: !!twitterAuth.refresh_token
    })

    const client = getTwitterClient(twitterAuth.access_token)

    try {
      const dms = await client.v2.listDmEvents({
        max_results: 5,
        "dm_event.fields": ["id", "text", "created_at", "sender_id", "dm_conversation_id"]
      })
      return NextResponse.json(dms)
    } catch (twitterError) {
      if (twitterError instanceof ApiResponseError) {
        console.error('Twitter API error details:', {
          error: twitterError,
          message: twitterError.message,
          data: twitterError.data,
          code: twitterError.code,
          rateLimitInfo: twitterError.rateLimit,
          headers: twitterError.headers
        })

        // Get headers safely
        const headers = twitterError.headers as IncomingHttpHeaders
        const dailyLimit = headers['x-user-limit-24hour-limit']
        const dailyReset = headers['x-user-limit-24hour-reset']
        const dailyRemaining = headers['x-user-limit-24hour-remaining']

        // Return rate limit information in the error response
        return NextResponse.json({
          error: twitterError.data,
          message: `You can try again at ${new Date(Number(dailyReset) * 1000).toLocaleString()}`,
          code: twitterError.code,
          rateLimitInfo: twitterError.rateLimit,
          headers: {
            'x-user-limit-24hour-limit': dailyLimit,
            'x-user-limit-24hour-reset': dailyReset,
            'x-user-limit-24hour-remaining': dailyRemaining
          }
        }, { status: twitterError.code })
      } else {
        console.error('Unknown Twitter error:', twitterError)
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch Twitter DMs', details: twitterError instanceof Error ? twitterError.message : 'Unknown error' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching Twitter DMs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 