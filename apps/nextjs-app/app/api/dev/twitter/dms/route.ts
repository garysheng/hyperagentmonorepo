import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { TwitterApi } from 'twitter-api-v2'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
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
      return NextResponse.json(
        { error: 'Twitter not connected' },
        { status: 400 }
      )
    }

    // Initialize Twitter client
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: twitterAuth.access_token,
      accessSecret: twitterAuth.refresh_token,
    })

    // Fetch DMs
    const dms = await client.v1.listDmEvents({
      count: 10,
    })

    return NextResponse.json(dms.events.map(event => ({
      id: event.id,
      text: event.message_create.message_data.text,
      sender_id: event.message_create.sender_id,
      sender_screen_name: event.message_create.sender_id, // We'll need to fetch user details separately
      created_at: event.created_timestamp,
    })))
  } catch (error) {
    console.error('Error fetching Twitter DMs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch DMs' },
      { status: 500 }
    )
  }
} 