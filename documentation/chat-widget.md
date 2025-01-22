# Chat Widget Integration

## Overview
HyperAgent.so will provide a lightweight, embeddable chat widget that celebrities can add to their websites. The widget facilitates direct communication between potential collaborators and the celebrity's team, with built-in AI classification and opportunity management.

## Key Features
- **Embeddable Widget**: Simple script tag installation
- **Customizable Appearance**: Matches celebrity's brand/website
- **Guided Conversation Flow**: Structured interaction to gather necessary information
- **Direct Integration**: Creates opportunities in HyperAgent dashboard
- **No Dependencies**: Standalone system without relying on third-party platforms

## User Flow

### 1. Celebrity/Team Setup
1. Sign up for HyperAgent
2. Configure basic profile:
   - Celebrity name
   - Goals and priorities
   - Acceptable proposal types
   - Team member access
3. Get widget embed code:
   ```html
   <script src="https://widget.hyperagent.so/v1.js" data-celebrity-id="YOUR_ID"></script>
   ```

### 2. Website Visitor Experience
1. **Initial Interaction**:
   - Visitor sees chat bubble on website
   - Opening message explains what celebrity is open to
   - Clear expectations set upfront

2. **Email Collection**:
   - Early request for email
   - Explanation of follow-up process
   - Privacy policy reference

3. **Proposal Details**:
   - Guided form-like experience in chat format
   - Required fields:
     - Name/Organization
     - Proposal type (matched to celebrity's goals)
     - Detailed description
   - Optional fields:
     - Website/Portfolio
     - Social media profiles
     - Previous work examples

4. **Submission & Follow-up**:
   - Automated thank you message
   - Clear next steps and timeline
   - No false promises of direct celebrity contact

### 3. Team Dashboard Integration
1. New opportunity created automatically
2. AI classification runs on submission
3. Team notified based on relevance score
4. Full conversation history preserved

## Technical Implementation

### 1. Widget Architecture
```typescript
interface WidgetConfig {
  celebrityId: string;
  theme?: {
    primaryColor: string;
    textColor: string;
    fontFamily: string;
  };
  position?: 'bottom-right' | 'bottom-left';
  initialMessage?: string;
}

interface ProposalSubmission {
  email: string;
  name: string;
  organization?: string;
  proposalType: string;
  description: string;
  links?: {
    website?: string;
    social?: string[];
    portfolio?: string;
  };
  metadata: {
    source_url: string;
    user_agent: string;
    timestamp: string;
  };
}
```

### 2. Database Updates
```sql
-- Store widget configurations
CREATE TABLE celebrity_widget_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    celebrity_id UUID REFERENCES celebrities(id),
    theme JSONB DEFAULT '{}',
    allowed_domains TEXT[],
    custom_messages JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add widget-specific fields to opportunities
ALTER TABLE opportunities 
ADD COLUMN source_url TEXT,
ADD COLUMN widget_session_id UUID;
```

### 3. API Endpoints
```typescript
// Widget initialization
GET /api/widget/{celebrityId}/config

// Proposal submission
POST /api/widget/{celebrityId}/submit

// Widget analytics
POST /api/widget/{celebrityId}/events
```

### 4. Email Integration with Mailgun

#### Overview
The chat widget integrates with Mailgun for handling email conversations with opportunity submitters:
- Dedicated email addresses for each celebrity (e.g., `opportunities@{celebname}.hyperagent.so`)
- Thread-based email conversations
- Email history tracking
- Team collaboration on email threads

#### Technical Implementation
```typescript
interface EmailThread {
  id: string;
  opportunity_id: string;
  subject: string;
  last_message_at: Date;
  status: 'active' | 'archived' | 'spam';
  created_at: Date;
  updated_at: Date;
}

interface EmailMessage {
  id: string;
  thread_id: string;
  from: string;
  to: string[];
  subject: string;
  content: string;
  mailgun_message_id: string;
  direction: 'inbound' | 'outbound';
  created_at: Date;
}

// Database schema
CREATE TABLE email_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id),
  subject TEXT NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES email_threads(id),
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  mailgun_message_id TEXT UNIQUE,
  direction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

// Email service setup
class EmailService {
  private mailgun: Mailgun;
  private domain: string;

  constructor() {
    this.mailgun = new Mailgun(process.env.MAILGUN_API_KEY!);
    this.domain = process.env.MAILGUN_DOMAIN!;
  }

  async sendEmail({
    to,
    from,
    subject,
    text,
    threadId,
    messageId
  }: SendEmailParams) {
    return this.mailgun.messages.create(this.domain, {
      to,
      from,
      subject,
      text,
      'h:In-Reply-To': messageId,
      'h:References': threadId
    });
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

    // Find or create thread
    const threadId = inReplyTo || references?.[0] || messageId;
    
    // Store message
    await db.transaction(async (trx) => {
      const thread = await findOrCreateThread({
        threadId,
        subject,
        opportunityId: getOpportunityFromEmail(recipient)
      });

      await createMessage({
        threadId: thread.id,
        from: sender,
        to: [recipient],
        subject,
        content,
        mailgunMessageId: messageId,
        direction: 'inbound'
      });
    });
  }
}
```

#### Configuration
Required environment variables:
```env
MAILGUN_API_KEY=key-xxx...
MAILGUN_DOMAIN=mail.hyperagent.so
MAILGUN_WEBHOOK_SIGNING_KEY=xxx...
```

#### Email Flow
1. **Inbound**:
   ```
   User → opportunities@celebname.hyperagent.so → Mailgun → Webhook → Database → Dashboard
   ```

2. **Outbound**:
   ```
   Dashboard → Mailgun API → User's Email
   ```

#### Security
- SPF, DKIM, and DMARC records for the domain
- Webhook signature verification
- Rate limiting per sender
- Spam filtering via Mailgun
- Email content scanning
- PII handling compliance

## Security Considerations

1. **Domain Restrictions**
   - Whitelist allowed domains
   - CORS policy enforcement
   - Rate limiting per domain

2. **Data Protection**
   - Email address encryption
   - GDPR compliance
   - Data retention policies

3. **Abuse Prevention**
   - Spam protection
   - Input validation
   - IP-based rate limiting

## Development Workflow

1. **Local Testing**
   ```bash
   # Start widget development
   pnpm dev:widget

   # Build widget
   pnpm build:widget
   ```

2. **Testing Strategy**
   - Unit tests for chat flow
   - Integration tests for submissions
   - E2E tests with example website

## Future Enhancements

1. **Advanced Features**
   - Custom chat flows
   - Rich media uploads
   - Multi-language support

2. **Analytics**
   - Conversion tracking
   - Drop-off analysis
   - User behavior insights

3. **Team Features**
   - Live chat capability
   - Saved responses
   - Team member routing 