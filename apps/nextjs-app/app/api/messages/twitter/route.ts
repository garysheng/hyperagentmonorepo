import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getReadWriteClient } from '@/lib/twitter/client'
import { TableName } from '@/types'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { opportunityId, message } = await request.json()

    if (!opportunityId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get opportunity details
    const { data: opportunity, error: oppError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .select(`
        id,
        sender_id,
        twitter_sender_id,
        twitter_dm_conversation_id
      `)
      .eq('id', opportunityId)
      .single()

    if (oppError || !opportunity) {
      return NextResponse.json(
        { error: 'Could not find opportunity' },
        { status: 404 }
      )
    }

    // Get Twitter auth for the celebrity
    const { data: twitterAuth, error: authError } = await supabase
      .from(TableName.TWITTER_AUTH)
      .select('access_token, refresh_token')
      .single()

    if (authError || !twitterAuth) {
      return NextResponse.json(
        { error: 'Could not find Twitter authentication' },
        { status: 404 }
      )
    }

    // Send DM using Twitter API
    const twitterClient = getReadWriteClient(twitterAuth.access_token, twitterAuth.refresh_token)
    const dmResponse = await twitterClient.v1.sendDm({
      recipient_id: opportunity.twitter_sender_id,
      text: message
    })

    if (!dmResponse) {
      throw new Error('Failed to send DM')
    }

    // Update opportunity status
    const { error: updateError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .update({
        status: 'conversation_started',
        status_updated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', opportunityId)

    if (updateError) {
      throw updateError
    }

    // Create message record
    const { error: messageError } = await supabase
      .from(TableName.OPPORTUNITY_MESSAGES)
      .insert({
        opportunity_id: opportunityId,
        content: message,
        platform_message_id: dmResponse.event.id,
        direction: 'outbound',
        created_at: new Date().toISOString()
      })

    if (messageError) {
      throw messageError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending Twitter DM:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 