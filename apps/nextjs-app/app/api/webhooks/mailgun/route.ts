import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TableName } from '@/types';
import crypto from 'crypto';

// Verify Mailgun webhook signature
function verifyWebhookSignature(
  timestamp: string,
  token: string,
  signature: string,
  signingKey: string
): boolean {
  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp.concat(token))
    .digest('hex');
  return encodedToken === signature;
}

// Generate a unique hash for a message
function generateMessageHash(sender: string, content: string): string {
  return crypto
    .createHash('sha256')
    .update(`${sender}:${content}`)
    .digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Get signature verification data
    const timestamp = formData.get('timestamp') as string;
    const token = formData.get('token') as string;
    const signature = formData.get('signature') as string;
    const signingKey = process.env.MAILGUN_SIGNING_KEY;

    if (!signingKey) {
      console.error('MAILGUN_SIGNING_KEY not configured');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(timestamp, token, signature, signingKey)) {
      console.error('Invalid Mailgun webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Extract email data
    const fromAddress = formData.get('sender')?.toString() || '';
    const toAddresses = (formData.get('recipient')?.toString() || '').split(',').map(addr => addr.trim());
    const subject = formData.get('subject')?.toString() || '';
    const content = (formData.get('stripped-text') || formData.get('body-plain'))?.toString() || '';
    const mailgunMessageId = formData.get('Message-Id')?.toString() || '';

    // Generate message hash
    const messageHash = generateMessageHash(fromAddress, content);

    const supabase = await createClient();

    // Check if we've already processed this message
    const { data: existingMessage } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .select('id')
      .eq('message_hash', messageHash)
      .maybeSingle();

    if (existingMessage) {
      console.log('Duplicate message detected, skipping processing:', { messageHash });
      return NextResponse.json({ success: true, status: 'duplicate' });
    }

    // First, try to find an existing opportunity from this sender
    const { data: existingOpportunity } = await supabase
      .from(TableName.OPPORTUNITIES)
      .select('id, status')
      .eq('sender_handle', fromAddress)
      .eq('source', 'WIDGET')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!existingOpportunity) {
      console.error('No existing opportunity found for sender:', fromAddress);
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    // Find or create email thread for this opportunity
    const { data: emailThread } = await supabase
      .from(TableName.EMAIL_THREADS)
      .select('id')
      .eq('opportunity_id', existingOpportunity.id)
      .single();

    let threadId: string;
    if (emailThread) {
      threadId = emailThread.id;
    } else {
      // Create new thread if none exists
      const { data: newThread, error: threadError } = await supabase
        .from(TableName.EMAIL_THREADS)
        .insert({
          opportunity_id: existingOpportunity.id,
          subject,
        })
        .select()
        .single();

      if (threadError || !newThread) {
        console.error('Failed to create email thread:', threadError);
        return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
      }
      threadId = newThread.id;
    }

    // Add the new message to the thread
    const { error: messageError } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .insert({
        thread_id: threadId,
        from_address: fromAddress,
        to_addresses: toAddresses,
        subject,
        content,
        mailgun_message_id: mailgunMessageId,
        message_hash: messageHash,
        direction: 'inbound'
      });

    if (messageError) {
      console.error('Failed to create message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Update opportunity status if needed
    if (existingOpportunity.status === 'new' || existingOpportunity.status === 'approved') {
      const { error: statusError } = await supabase
        .from(TableName.OPPORTUNITIES)
        .update({ status: 'conversation_started' })
        .eq('id', existingOpportunity.id);

      if (statusError) {
        console.error('Failed to update opportunity status:', statusError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mailgun webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Disable body parsing since Mailgun sends as form-data
export const config = {
  api: {
    bodyParser: false,
  },
}; 