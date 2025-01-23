import { EmailService } from '@/lib/email/mailgun';
import { createClient } from '@/lib/supabase/server';
import { TableName } from '@/types';
import { NextResponse } from 'next/server';

const emailService = new EmailService();

interface OpportunityWithCelebrity {
  sender_handle: string;
  celebrity: {
    id: string;
    celebrity_name: string;
  };
}

export async function POST(request: Request) {
  try {
    const { opportunityId, message, threadId, messageId } = await request.json();

    // Get opportunity and celebrity details
    const supabase = await createClient();
    const { data: opportunity, error: opportunityError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .select(`
        sender_handle,
        celebrity:celebrities(
          id,
          celebrity_name
        )
      `)
      .eq('id', opportunityId)
      .single<OpportunityWithCelebrity>();

    if (opportunityError || !opportunity || !opportunity.celebrity) {
      throw new Error('Opportunity or celebrity not found');
    }

    // Validate sender_handle exists and is an email
    if (!opportunity.sender_handle || !opportunity.sender_handle.includes('@')) {
      throw new Error('Valid recipient email address is missing');
    }

    console.log('Sending email to:', opportunity.sender_handle);

    // Send email
    const emailResponse = await emailService.sendEmail({
      to: opportunity.sender_handle,
      celebrityId: opportunity.celebrity.id,
      celebrityName: opportunity.celebrity.celebrity_name,
      subject: threadId ? 'Re: Your Message' : 'Response from Team',
      text: message,
      threadId,
      messageId
    });

    // Get formatted email address
    const { email: fromEmail } = emailService.formatEmailAddress(
      opportunity.celebrity.id,
      opportunity.celebrity.celebrity_name
    );

    // Create message record
    const { error: messageError } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .insert({
        thread_id: threadId,
        from_address: fromEmail,
        to_addresses: [opportunity.sender_handle],
        subject: threadId ? 'Re: Your Message' : 'Response from Team',
        content: message,
        mailgun_message_id: emailResponse.id,
        direction: 'outbound'
      });

    if (messageError) {
      throw messageError;
    }

    // Update thread last_message_at
    if (threadId) {
      const { error: threadError } = await supabase
        .from(TableName.EMAIL_THREADS)
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', threadId);

      if (threadError) {
        throw threadError;
      }
    }

    // Update opportunity status to conversation_started
    const { error: statusError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .update({ status: 'conversation_started' })
      .eq('id', opportunityId);

    if (statusError) {
      throw statusError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
} 