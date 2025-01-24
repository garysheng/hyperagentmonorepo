import { EmailService } from '@/lib/email/mailgun';
import { createClient } from '@/lib/supabase/server';
import { TableName } from '@/types';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const emailService = new EmailService();

interface OpportunityWithCelebrity {
  sender_handle: string;
  initial_content: string;
  created_at: string;
  email_from: string | null;
  email_to: string[] | null;
  celebrity: {
    id: string;
    celebrity_name: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opportunityId, message, messageId } = body;

    // Validate required fields
    if (!opportunityId) {
      console.error('Missing opportunityId in request:', body);
      return NextResponse.json(
        { error: 'opportunityId is required' },
        { status: 400 }
      );
    }

    if (!message) {
      console.error('Missing message in request:', body);
      return NextResponse.json(
        { error: 'message is required' },
        { status: 400 }
      );
    }

    // Get opportunity and celebrity details
    const supabase = await createClient();
    const { data: opportunity, error: opportunityError } = await supabase
      .from(TableName.OPPORTUNITIES)
      .select(`
        sender_handle,
        initial_content,
        created_at,
        email_from,
        email_to,
        celebrity:celebrities(
          id,
          celebrity_name
        )
      `)
      .eq('id', opportunityId)
      .single<OpportunityWithCelebrity>();

    console.log('Opportunity lookup:', { opportunity, error: opportunityError, opportunityId });

    if (opportunityError) {
      console.error('Error fetching opportunity:', opportunityError);
      throw new Error(`Failed to fetch opportunity: ${opportunityError.message}`);
    }

    if (!opportunity) {
      throw new Error(`Opportunity not found with ID: ${opportunityId}`);
    }

    if (!opportunity.celebrity) {
      console.error('Celebrity data missing for opportunity:', { opportunityId, opportunity });
      throw new Error(`Celebrity data not found for opportunity: ${opportunityId}`);
    }

    // Try email_from first, then fall back to sender_handle
    const recipientEmail = opportunity.email_from || opportunity.sender_handle;

    // Validate we have a valid email to send to
    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.error('Invalid recipient email:', { 
        opportunityId, 
        email_from: opportunity.email_from,
        sender_handle: opportunity.sender_handle 
      });
      throw new Error('Valid recipient email address is missing');
    }

    console.log('Sending email to:', recipientEmail);

    // Get formatted email address
    const { email: fromEmail } = emailService.formatEmailAddress(
      opportunity.celebrity.id,
      opportunity.celebrity.celebrity_name
    );

    // Find existing thread for this opportunity
    const { data: existingThread, error: threadLookupError } = await supabase
      .from(TableName.EMAIL_THREADS)
      .select('id, subject')
      .eq('opportunity_id', opportunityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (threadLookupError && threadLookupError.code !== 'PGRST116') {
      console.error('Error looking up thread:', threadLookupError);
      throw new Error(`Failed to lookup thread: ${threadLookupError.message}`);
    }

    // Use existing thread or create new one
    const currentThreadId = existingThread?.id || randomUUID();
    const threadSubject = existingThread?.subject || 'Response from Team';

    if (!existingThread) {
      // Create new thread
      const { error: threadError } = await supabase
        .from(TableName.EMAIL_THREADS)
        .insert({
          id: currentThreadId,
          opportunity_id: opportunityId,
          subject: threadSubject,
          last_message_at: new Date().toISOString(),
          status: 'active'
        });

      if (threadError) {
        throw threadError;
      }

      // Store initial message from proposer
      const { error: initialMessageError } = await supabase
        .from(TableName.EMAIL_MESSAGES)
        .insert({
          thread_id: currentThreadId,
          from_address: opportunity.sender_handle,
          to_addresses: [fromEmail],
          subject: 'Initial Message',
          content: opportunity.initial_content,
          direction: 'inbound',
          created_at: opportunity.created_at
        });

      if (initialMessageError) {
        throw initialMessageError;
      }
    }

    // Send email
    const emailResponse = await emailService.sendEmail({
      to: recipientEmail,
      celebrityId: opportunity.celebrity.id,
      celebrityName: opportunity.celebrity.celebrity_name,
      subject: existingThread ? `Re: ${threadSubject}` : threadSubject,
      text: message,
      threadId: currentThreadId,
      messageId
    });

    // Create outbound message record
    const { error: messageError } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .insert({
        thread_id: currentThreadId,
        from_address: fromEmail,
        to_addresses: [recipientEmail],
        subject: existingThread ? `Re: ${threadSubject}` : threadSubject,
        content: message,
        mailgun_message_id: emailResponse.id,
        direction: 'outbound',
        created_at: new Date().toISOString()
      });

    if (messageError) {
      throw messageError;
    }

    // Update thread last_message_at
    const { error: threadError } = await supabase
      .from(TableName.EMAIL_THREADS)
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', currentThreadId);

    if (threadError) {
      throw threadError;
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
      { error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
} 