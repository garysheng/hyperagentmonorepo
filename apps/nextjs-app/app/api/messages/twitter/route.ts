import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { getTwitterClient } from '@/lib/twitter/client'

export async function POST(request: Request) {
  try {
    const { opportunityId, message } = await request.json()

    if (!opportunityId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get opportunity details
    const { data: opportunity, error: opportunityError } = await supabase
      .from('opportunities')
      .select('*, celebrity:celebrities(*)')
      .eq('id', opportunityId)
      .single()

    if (opportunityError || !opportunity) {
      console.error('Error fetching opportunity:', opportunityError)
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    // Get Twitter auth for the celebrity
    const { data: twitterAuth, error: twitterAuthError } = await supabase
      .from('twitter_auth')
      .select('access_token, refresh_token')
      .eq('celebrity_id', opportunity.celebrity_id)
      .single()

    if (twitterAuthError || !twitterAuth) {
      console.error('Error fetching Twitter auth:', twitterAuthError)
      return NextResponse.json(
        { error: 'Twitter authentication not found' },
        { status: 404 }
      )
    }

    // Initialize Twitter client
    const twitterClient = getTwitterClient(twitterAuth.access_token)

    // Send DM
    const dmResponse = await twitterClient.v2.sendDmToParticipant(
      opportunity.sender_id,
      { text: message }
    )

    if (!dmResponse) {
      throw new Error('Failed to send DM')
    }

    // Update opportunity status
    const { error: updateError } = await supabase
      .from('opportunities')
      .update({ 
        status: 'conversation_started',
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)

    if (updateError) {
      console.error('Error updating opportunity:', updateError)
      return NextResponse.json(
        { error: 'Failed to update opportunity status' },
        { status: 500 }
      )
    }

    // Create message record
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        opportunity_id: opportunityId,
        content: message,
        sender_type: 'celebrity',
        created_at: new Date().toISOString(),
        platform_message_id: dmResponse.dm_conversation_id
      })

    if (messageError) {
      console.error('Error creating message record:', messageError)
      return NextResponse.json(
        { error: 'Failed to create message record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Twitter DM:', error)
    return NextResponse.json(
      { error: 'Failed to send Twitter DM' },
      { status: 500 }
    )
  }
} 