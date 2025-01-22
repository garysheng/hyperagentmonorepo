import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Send email
    const emailResponse = await resend.emails.send({
      from: `${opportunity.celebrity.name} <${process.env.RESEND_FROM_EMAIL}>`,
      to: [opportunity.sender_handle], // For widget opportunities, sender_handle contains the email
      subject: 'Response to Your Message',
      text: message,
    })

    if (!emailResponse) {
      throw new Error('Failed to send email')
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
      .from('opportunity_messages')
      .insert({
        opportunity_id: opportunityId,
        content: message,
        sender_type: 'celebrity',
        created_at: new Date().toISOString(),
        platform_message_id: emailResponse.data?.id,
        direction: 'outbound'
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
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
} 