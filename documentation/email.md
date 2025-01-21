# Email Integration

## Overview
HyperAgent.so will provide email integration allowing celebrity teams to:
- Get a dedicated email address (e.g., `hello@celebname.hyperagent.so`)
- Process incoming emails through our AI classification pipeline
- Respond to emails directly from our dashboard
- Track email threads and conversations

## Technical Stack

### 1. Email Providers
- **Outbound Email**: [Resend](https://resend.com)
  - Sending transactional emails
  - Email analytics
  - High deliverability

- **Inbound Email**: [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
  - Free email routing service
  - Routes emails to our webhook endpoint
  - Handles spam filtering
  - Supports catch-all addresses

### 2. Email Flow
1. **Inbound**:
   ```
   User → hello@celebname.hyperagent.so → Cloudflare Email Routing → Our Webhook → Supabase → Dashboard
   ```

2. **Outbound**:
   ```
   Dashboard → Resend API → User's Email
   ```

## User Flow

### 1. Initial Setup
1. Team member visits Settings → Email Integration in HyperAgent dashboard
2. System automatically generates their email address:
   - Format: `hello@{celebname}.hyperagent.so`
   - `celebname` is derived from their celebrity profile
   - Example: `hello@mrbeast.hyperagent.so`
3. Team can customize the prefix (optional):
   - Default: `hello@`
   - Options: `contact@`, `team@`, `inquiries@`
   - Custom prefix on request

### 2. Email Configuration
1. Once email is provisioned:
   - Set up team notification preferences
   - Configure auto-responses
   - Define spam filters
   - Set up email signature

### 3. Testing Flow
1. System sends test email to verify setup
2. Team member sends test inbound email
3. Verify it appears in dashboard
4. Test reply functionality

### 4. Going Live
1. Update public contact information with new email
2. Add email to social media profiles
3. Configure working hours for auto-responses
4. Enable AI classification

## Technical Implementation

### 1. Cloudflare Setup
```typescript
// src/lib/email/cloudflare.ts
import { createClient } from '@supabase/supabase-js';

export async function setupEmailRouting(subdomain: string) {
  // Create catch-all route in Cloudflare
  await fetch('https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/email/routing/rules', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `Route for ${subdomain}`,
      enabled: true,
      matchers: [{
        type: 'literal',
        field: 'to',
        value: `*@${subdomain}.hyperagent.so`
      }],
      actions: [{
        type: 'forward',
        value: [process.env.WEBHOOK_EMAIL]
      }]
    })
  });
}
```

### 2. Database Updates
```sql
-- Store email configuration
CREATE TABLE celebrity_email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    celebrity_id UUID REFERENCES celebrities(id),
    email_prefix TEXT NOT NULL DEFAULT 'hello',
    subdomain TEXT NOT NULL,
    cloudflare_route_id TEXT,
    auto_response_enabled BOOLEAN DEFAULT false,
    auto_response_text TEXT,
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add email-specific fields to opportunities table
ALTER TABLE opportunities 
ADD COLUMN email_thread_id TEXT,
ADD COLUMN email_message_id TEXT,
ADD COLUMN email_subject TEXT,
ADD COLUMN email_from TEXT,
ADD COLUMN email_to TEXT[];
```

### 3. Email Service
```typescript
// src/lib/email/client.ts
import { Resend } from 'resend';

export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY!);
  }

  async sendEmail(params: {
    celebrityId: string;
    to: string;
    subject: string;
    text: string;
    html?: string;
    replyTo?: string;
    threadId?: string;
  }) {
    const { data: account } = await this.supabase
      .from('celebrity_email_accounts')
      .select('email_prefix, subdomain')
      .eq('celebrity_id', params.celebrityId)
      .single();

    if (!account) throw new Error('Email account not found');

    const from = `${account.email_prefix}@${account.subdomain}.hyperagent.so`;
    const replyTo = `${account.email_prefix}@${account.subdomain}.hyperagent.so`;

    return this.resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html,
      reply_to: replyTo, // Always set reply-to to our address
      headers: params.threadId ? {
        'References': params.threadId,
        'In-Reply-To': params.threadId
      } : undefined
    });
  }
}
```

### 4. Webhook Handler
```typescript
// src/pages/api/webhooks/email.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createHmac } from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Verify Cloudflare Email Worker signature
  const signature = req.headers['cf-email-signature'];
  if (!verifyCloudflareSignature(req.body, signature)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { to, from, subject, text, messageId } = req.body;

  // Extract subdomain from to address
  const match = to.match(/@([^.]+)\.hyperagent\.so/);
  if (!match) return res.status(400).json({ error: 'Invalid recipient' });

  const subdomain = match[1];

  // Look up celebrity by subdomain
  const { data: account } = await supabase
    .from('celebrity_email_accounts')
    .select('celebrity_id')
    .eq('subdomain', subdomain)
    .single();

  if (!account) return res.status(404).json({ error: 'Account not found' });

  // Create opportunity
  await createOpportunity({
    celebrity_id: account.celebrity_id,
    source: 'email',
    sender_handle: from,
    initial_content: text,
    email_thread_id: messageId,
    email_message_id: messageId,
    email_subject: subject,
    email_from: from,
    email_to: [to]
  });

  res.status(200).json({ received: true });
}
```

## Required Environment Variables
```env
# Resend (Outbound)
RESEND_API_KEY=re_123...

# Cloudflare (Inbound)
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_ACCOUNT_ID=your_account_id

# Webhook
WEBHOOK_EMAIL=inbox@mail.hyperagent.so
```

## Security Considerations

1. **Email Authentication**
   - We manage SPF, DKIM, and DMARC for hyperagent.so
   - Webhook signature verification
   - Rate limiting per subdomain

2. **Spam Prevention**
   - Inbound spam filtering
   - Outbound rate limiting
   - Block list management

3. **Data Privacy**
   - Email content encryption at rest
   - PII handling compliance
   - Attachment scanning

## Development Workflow

1. **Local Testing**
   ```bash
   # Start webhook tunnel
   pnpm dlx localtunnel --port 3000

   # Test webhook
   curl -X POST http://localhost:3000/api/webhooks/email \
     -H "Content-Type: application/json" \
     -H "resend-signature: test-signature" \
     -d @test/fixtures/email-webhook.json
   ```

2. **Testing Strategy**
   - Use test subdomains (e.g., `test1.hyperagent.so`)
   - Mock Resend API responses
   - E2E tests for email flows

## Future Enhancements

1. **Advanced Features**
   - Email templates
   - Scheduled sending
   - Auto-responders

2. **Analytics**
   - Open tracking
   - Click tracking
   - Response time metrics

3. **Custom Domains** (Future)
   - Support for celebrity's own domains
   - Custom DNS setup
   - Domain verification process 