# Instagram DM Integration

## Overview
HyperAgent.so will integrate with Instagram DMs using the `instagram-private-api` package, allowing celebrity teams to:
- Access and manage Instagram DMs through our dashboard
- Process DMs through our AI classification pipeline
- Respond to messages directly from our interface

## Technical Implementation

### 1. Database Updates
```sql
-- Store Instagram credentials securely
CREATE TABLE celebrity_instagram_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    celebrity_id UUID REFERENCES celebrities(id),
    username TEXT NOT NULL,
    encrypted_password TEXT NOT NULL,
    account_id TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    login_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Instagram-specific fields to opportunities table
ALTER TABLE opportunities 
ADD COLUMN instagram_thread_id TEXT,
ADD COLUMN instagram_message_id TEXT;
```

### 2. Instagram Client Service
```typescript
// src/lib/instagram/client.ts
import { IgApiClient } from 'instagram-private-api';
import { createClient } from '@supabase/supabase-js';

export class InstagramService {
  private clients: Map<string, IgApiClient> = new Map();
  private supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async getClientForCelebrity(celebrityId: string): Promise<IgApiClient | null> {
    // Return existing client if available
    if (this.clients.has(celebrityId)) {
      return this.clients.get(celebrityId)!;
    }

    // Get Instagram credentials
    const { data: account } = await this.supabase
      .from('celebrity_instagram_accounts')
      .select('username, encrypted_password')
      .eq('celebrity_id', celebrityId)
      .single();

    if (!account) return null;

    // Create new client
    const ig = new IgApiClient();
    ig.state.generateDevice(account.username);

    try {
      // Login
      await ig.simulate.preLoginFlow();
      await ig.account.login(account.username, this.decryptPassword(account.encrypted_password));
      process.nextTick(async () => await ig.simulate.postLoginFlow());

      // Store for reuse
      this.clients.set(celebrityId, ig);
      
      return ig;
    } catch (error) {
      console.error('Instagram login failed:', error);
      return null;
    }
  }

  private decryptPassword(encrypted: string): string {
    // TODO: Implement decryption
    return encrypted;
  }
}
```

### 3. DM Polling Service
```typescript
// src/services/instagram-polling.ts
import { InstagramService } from '../lib/instagram/client';

export class InstagramPollingService {
  constructor(private instagram: InstagramService) {}

  async pollNewMessages(celebrityId: string) {
    const ig = await this.instagram.getClientForCelebrity(celebrityId);
    if (!ig) return;

    try {
      // Fetch inbox
      const inbox = await ig.feed.directInbox().items();

      for (const thread of inbox) {
        const messages = await ig.feed.directThread({ 
          threadId: thread.thread_id 
        }).items();

        for (const message of messages) {
          if (message.item_type === 'text') {
            await this.processMessage({
              celebrityId,
              threadId: thread.thread_id,
              messageId: message.item_id,
              sender: thread.users[0].username,
              content: message.text,
              timestamp: message.timestamp
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to poll Instagram messages:', error);
    }
  }

  private async processMessage(message: InstagramMessage) {
    // Create opportunity in Supabase
    const opportunity = await createOpportunity({
      celebrity_id: message.celebrityId,
      source: 'instagram',
      sender_handle: message.sender,
      initial_content: message.content,
      instagram_thread_id: message.threadId,
      instagram_message_id: message.messageId,
    });

    // Run AI classification
    await classifyOpportunity(opportunity.id);
  }
}
```

### 4. Message Reply Implementation
```typescript
// src/lib/instagram/reply.ts
export async function replyToInstagramMessage(
  celebrityId: string,
  threadId: string,
  message: string
) {
  const ig = await instagramService.getClientForCelebrity(celebrityId);
  if (!ig) throw new Error('Instagram client not available');

  try {
    await ig.directThread.broadcast({
      threadId,
      text: message,
    });

    return true;
  } catch (error) {
    console.error('Failed to send Instagram reply:', error);
    throw error;
  }
}
```

## Security Considerations

1. **Credential Storage**
   - Instagram passwords are encrypted at rest
   - Encryption key stored in secure environment variables
   - Regular password rotation recommended

2. **Rate Limiting**
   - Implement exponential backoff for API calls
   - Track API usage per celebrity
   - Handle Instagram API limits gracefully

3. **Error Handling**
   - Monitor login failures
   - Alert on repeated authentication issues
   - Implement automatic session recovery

## Development Workflow

1. **Local Development**
   ```bash
   # Start polling service
   pnpm dev:instagram
   ```

2. **Testing**
   - Use test Instagram accounts for development
   - Mock Instagram API responses in tests
   - Implement retry logic for flaky API calls

## Limitations & Risks

1. **API Reliability**
   - `instagram-private-api` is unofficial
   - Instagram may change their API
   - Need monitoring for breaking changes

2. **Account Security**
   - Risk of account flagging
   - Need careful rate limiting
   - Should implement gradual polling

3. **Message Types**
   - Initial version handles text only
   - Media messages logged but not processed
   - Stories/posts interactions not supported

## Future Enhancements

1. **Media Support**
   - Handle images and videos
   - Support story replies
   - Process voice messages

2. **Advanced Features**
   - Quick replies
   - Message templates
   - Automated responses

3. **Analytics**
   - Response time tracking
   - Engagement metrics
   - Conversion tracking 