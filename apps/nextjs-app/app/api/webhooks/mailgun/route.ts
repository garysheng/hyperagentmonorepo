import { emailService } from '@/lib/email/mailgun';
import { MailgunWebhookPayload } from '@/types';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const payload = await request.json() as MailgunWebhookPayload;
    await emailService.receiveWebhook(payload);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Mailgun webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 