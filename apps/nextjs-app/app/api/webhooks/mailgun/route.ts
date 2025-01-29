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

// Extract celebrity ID from email address
function getCelebrityIdFromEmail(email: string): string | null {
  const match = email.match(/postmaster\+team\+([^@]+)@/);
  return match ? match[1] : null;
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

    // Extract celebrity ID from recipient email
    const celebrityId = getCelebrityIdFromEmail(toAddresses[0]);
    if (!celebrityId) {
      console.error('Invalid recipient email format:', toAddresses[0]);
      return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 });
    }

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
      .eq('celebrity_id', celebrityId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let opportunityId: string;

    if (existingOpportunity) {
      opportunityId = existingOpportunity.id;
      
      // Update opportunity status if needed
      if (existingOpportunity.status === 'new' || existingOpportunity.status === 'approved') {
        await supabase
          .from(TableName.OPPORTUNITIES)
          .update({ status: 'conversation_started' })
          .eq('id', existingOpportunity.id);
      }
    } else {
      // Create new opportunity
      const { data: newOpportunity, error: opportunityError } = await supabase
        .from(TableName.OPPORTUNITIES)
        .insert({
          celebrity_id: celebrityId,
          sender_handle: fromAddress,
          source: 'EMAIL',
          status: 'new',
          content: content,
          subject: subject
        })
        .select()
        .single();

      if (opportunityError || !newOpportunity) {
        console.error('Failed to create opportunity:', opportunityError);
        return NextResponse.json({ error: 'Failed to create opportunity' }, { status: 500 });
      }

      opportunityId = newOpportunity.id;
    }

    // Create new email thread
    const { data: newThread, error: threadError } = await supabase
      .from(TableName.EMAIL_THREADS)
      .insert({
        opportunity_id: opportunityId,
        subject,
      })
      .select()
      .single();

    if (threadError || !newThread) {
      console.error('Failed to create email thread:', threadError);
      return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
    }

    // Add the new message to the thread
    const { error: messageError } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .insert({
        thread_id: newThread.id,
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