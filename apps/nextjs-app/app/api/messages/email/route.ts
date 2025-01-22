import { emailService } from '@/lib/email/mailgun';
import { createClient } from '@/lib/supabase/server';
import { TableName } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { opportunityId, message, threadId, messageId } = await request.json();

    // Get opportunity details
    const supabase = await createClient();
    const { data: opportunity, error: opportunityError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .select('email_from')
      .eq('id', opportunityId)
      .single();

    if (opportunityError || !opportunity) {
      throw new Error('Opportunity not found');
    }

    // Send email
    const emailResponse = await emailService.sendEmail({
      to: opportunity.email_from,
      from: `reply+${opportunityId}@${process.env.MAILGUN_DOMAIN}`,
      subject: 'Re: Your Opportunity',
      text: message,
      threadId,
      messageId
    });

    // Create message record
    const { error: messageError } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .insert({
        thread_id: threadId,
        from: `reply+${opportunityId}@${process.env.MAILGUN_DOMAIN}`,
        to: [opportunity.email_from],
        subject: 'Re: Your Opportunity',
        content: message,
        mailgun_message_id: emailResponse.id,
        direction: 'outbound'
      });

    if (messageError) {
      throw messageError;
    }

    // Update thread last_message_at
    const { error: threadError } = await supabase
      .from(TableName.EMAIL_THREADS)
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', threadId);

    if (threadError) {
      throw threadError;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
} 