import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { createClient } from '@/lib/supabase/server';
import { EmailMessage, EmailThread, MailgunWebhookPayload, SendEmailParams, TableName } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

export class EmailService {
  private mailgun: ReturnType<Mailgun['client']>;
  private domain: string;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.mailgun = mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY!,
    });
    this.domain = process.env.MAILGUN_DOMAIN!;
  }

  // Get Supabase client for each request
  private getSupabase() {
    return createClient();
  }

  async sendEmail({
    to,
    from,
    subject,
    text,
    threadId,
    messageId
  }: SendEmailParams) {
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

  private async findOrCreateThread({
    threadId,
    subject,
    opportunityId,
  }: {
    threadId: string;
    subject: string;
    opportunityId: string;
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
        opportunity_id: opportunityId,
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

  private getOpportunityFromEmail(email: string): string {
    // Extract opportunity ID from email address
    // Format: reply+opportunity_id@domain.com
    const match = email.match(/reply\+([^@]+)@/);
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
      opportunityId: this.getOpportunityFromEmail(recipient)
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

    // Update thread last_message_at
    const supabase = await this.getSupabase();
    await supabase
      .from(TableName.EMAIL_THREADS)
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', thread.id);
  }

  private verifyWebhookSignature(signature: MailgunWebhookPayload['signature']) {
    const crypto = require('crypto');
    
    const encodedToken = crypto
      .createHmac('sha256', process.env.MAILGUN_WEBHOOK_SIGNING_KEY!)
      .update(signature.timestamp.concat(signature.token))
      .digest('hex');

    if (encodedToken !== signature.signature) {
      throw new Error('Invalid webhook signature');
    }
  }
}

export const emailService = new EmailService(); 