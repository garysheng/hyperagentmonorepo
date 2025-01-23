import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { createClient } from '@/lib/supabase/server';
import { EmailMessage, EmailThread, MailgunWebhookPayload, SendEmailParams, TableName } from '@/types';
import crypto from 'crypto';

export class EmailService {
  private mailgun: ReturnType<Mailgun['client']>;
  private domain: string;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY!,
    });
    this.domain = process.env.MAILGUN_PRIMARY_DOMAIN!;
  }

  // Get Supabase client for each request
  private getSupabase() {
    return createClient();
  }

  // Format the email address for a celebrity
  public formatEmailAddress(celebrityId: string, celebrityName: string) {
    return {
      email: `team+${celebrityId}@${this.domain}`,
      formatted: `${celebrityName} Team <team+${celebrityId}@${this.domain}>`
    };
  }

  async sendEmail({
    to,
    celebrityId,
    celebrityName,
    subject,
    text,
    threadId,
    messageId
  }: SendEmailParams) {
    const { formatted: from } = this.formatEmailAddress(celebrityId, celebrityName);

    const response = await this.mailgun.messages.create(this.domain, {
      to,
      from,
      subject,
      text,
      'h:In-Reply-To': messageId,
      'h:References': threadId,
    });

    return response;
  }

  private getCelebrityIdFromEmail(email: string): string {
    // Extract celebrityId from email address
    // Format: team+celebrityId@domain.com
    const match = email.match(/team\+([^@]+)@/);
    if (!match) {
      throw new Error('Invalid email format');
    }
    return match[1];
  }

  async receiveWebhook(payload: MailgunWebhookPayload) {
    const { 
      sender,
      recipient,
      subject,
      'body-plain': content,
      'Message-Id': messageId,
      'In-Reply-To': inReplyTo,
      References: references
    } = payload;

    // Verify webhook signature
    this.verifyWebhookSignature(payload.signature);

    // Find or create thread
    const threadId = inReplyTo || references?.[0] || messageId;
    
    // Store message
    const thread = await this.findOrCreateThread({
      threadId,
      subject,
      celebrityId: this.getCelebrityIdFromEmail(recipient)
    });

    await this.createMessage({
      thread_id: thread.id,
      from: sender,
      to: [recipient],
      subject,
      content,
      mailgun_message_id: messageId,
      direction: 'inbound'
    });

    // Update thread's last message timestamp
    const supabase = await this.getSupabase();
    await supabase
      .from(TableName.EMAIL_THREADS)
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', thread.id);
  }

  private async findOrCreateThread({
    threadId,
    subject,
    celebrityId,
  }: {
    threadId: string;
    subject: string;
    celebrityId: string;
  }): Promise<EmailThread> {
    const supabase = await this.getSupabase();

    // Try to find existing thread
    const { data: existingThread } = await supabase
      .from(TableName.EMAIL_THREADS)
      .select()
      .eq('id', threadId)
      .single();

    if (existingThread) {
      return existingThread;
    }

    // Create new thread
    const { data: newThread, error } = await supabase
      .from(TableName.EMAIL_THREADS)
      .insert({
        id: threadId,
        celebrity_id: celebrityId,
        subject,
        last_message_at: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return newThread;
  }

  private async createMessage({
    thread_id,
    from,
    to,
    subject,
    content,
    mailgun_message_id,
    direction,
  }: Omit<EmailMessage, 'id' | 'created_at'>) {
    const supabase = await this.getSupabase();

    const { error } = await supabase
      .from(TableName.EMAIL_MESSAGES)
      .insert({
        thread_id,
        from,
        to,
        subject,
        content,
        mailgun_message_id,
        direction,
      });

    if (error) {
      throw error;
    }
  }

  private verifyWebhookSignature(signature: MailgunWebhookPayload['signature']) {
    const encodedToken = crypto
      .createHmac('sha256', process.env.MAILGUN_WEBHOOK_SIGNING_KEY!)
      .update(signature.timestamp + signature.token)
      .digest('hex');

    if (encodedToken !== signature.signature) {
      throw new Error('Invalid webhook signature');
    }
  }
} 