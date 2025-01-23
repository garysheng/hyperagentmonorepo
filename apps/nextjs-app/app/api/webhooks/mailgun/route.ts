import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email/mailgun';
import { MailgunWebhookPayload } from '@/types';

const emailService = new EmailService();

export async function POST(req: Request) {
  try {
    // Get the raw form data
    const formData = await req.formData();
    
    // Convert FormData to payload object
    const payload: Partial<MailgunWebhookPayload> = {
      sender: formData.get('sender') as string,
      recipient: formData.get('recipient') as string,
      subject: formData.get('subject') as string,
      'body-plain': formData.get('body-plain') as string,
      'Message-Id': formData.get('Message-Id') as string,
      'In-Reply-To': formData.get('In-Reply-To') as string,
      References: formData.get('References')?.toString().split(' '),
      signature: {
        timestamp: formData.get('timestamp') as string,
        token: formData.get('token') as string,
        signature: formData.get('signature') as string
      }
    };

    // Log incoming webhook for debugging
    console.log('Received Mailgun webhook:', {
      sender: payload.sender,
      recipient: payload.recipient,
      subject: payload.subject,
      messageId: payload['Message-Id']
    });

    // Process the webhook
    await emailService.receiveWebhook(payload as MailgunWebhookPayload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Mailgun webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

// Disable body parsing since Mailgun sends as form-data
export const config = {
  api: {
    bodyParser: false,
  },
}; 