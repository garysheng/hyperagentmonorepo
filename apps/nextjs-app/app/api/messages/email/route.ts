import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
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
        sender_handle,
        initial_content
      `)
      .eq('id', opportunityId)
      .single()

    if (oppError || !opportunity) {
      return NextResponse.json(
        { error: 'Could not find opportunity' },
        { status: 404 }
      )
    }

    // Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { data: emailResponse } = await resend.emails.send({
      from: 'noreply@gauntlet.ai',
      to: opportunity.sender_id, // Using sender_id as email address
      subject: 'Response to your message',
      text: message
    })

    if (!emailResponse?.id) {
      throw new Error('Failed to send email')
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
        platform_message_id: emailResponse.id,
        direction: 'outbound',
        created_at: new Date().toISOString()
      })

    if (messageError) {
      throw messageError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 