# Telegram Bot Integration

## Overview
HyperAgent.so will allow celebrity teams to create and manage a Telegram bot that serves as a unified inbound message handler. This provides several advantages:
- Full control over the bot's functionality and message handling
- Rich message formatting and interactive elements
- No OAuth complexity compared to Twitter
- Built-in support for teams and channels

## User Journey

### 1. Bot Creation & Setup
1. Team member visits Settings page in HyperAgent dashboard
2. Clicks "Add Telegram Bot" button
3. System guides them through:
   - Creating a new bot via @BotFather
   - Getting the bot token
   - Setting up bot commands and description
   - Customizing bot profile/avatar

### 2. Bot Configuration
1. Team configures bot settings:
   - Welcome message
   - Auto-responses
   - Rate limiting
   - Blocked words/spam filtering
2. Sets up team notification preferences:
   - Which messages need immediate attention
   - Where notifications should be sent (Telegram channel, email, etc.)

### 3. Integration with HyperAgent
1. All inbound messages to the bot are:
   - Stored in the opportunities table
   - Processed through our AI classification pipeline
   - Displayed in the HyperAgent dashboard
2. Team members can:
   - Reply directly through the dashboard
   - Assign messages to team members
   - Add internal notes/comments
   - Track conversation history

### 4. Public Usage
1. Celebrity shares their bot username (e.g., @CelebNameBot)
2. Users can:
   - Send direct messages to the bot
   - Receive automated responses based on message content
   - Get updates on their message status
3. Bot can:
   - Collect structured data via forms
   - Handle media attachments
   - Provide quick reply buttons for common queries

## Technical Implementation

### Bot Setup Process
1. User provides bot token from @BotFather
2. System validates token and sets up webhook
3. Creates necessary database records linking bot to celebrity
4. Configures initial bot settings and commands

### Message Flow
1. Inbound message arrives via Telegram webhook
2. System:
   - Creates new opportunity record
   - Runs AI classification
   - Notifies relevant team members
3. Team members can respond through dashboard
4. Responses are sent back through bot API

### Database Updates
1. New table: `celebrity_telegram_bots`
   ```sql
   CREATE TABLE celebrity_telegram_bots (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     celebrity_id UUID REFERENCES celebrities(id),
     bot_token TEXT NOT NULL,
     bot_username TEXT NOT NULL,
     bot_settings JSONB DEFAULT '{}',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

2. New fields in opportunities table:
   ```sql
   ALTER TABLE opportunities ADD COLUMN
     source TEXT DEFAULT 'telegram',
     telegram_chat_id BIGINT,
     telegram_message_id BIGINT;
   ```

### Security Considerations
1. Bot tokens stored encrypted at rest
2. Rate limiting on bot messages
3. Spam detection and blocking
4. Team member access controls
5. Message encryption in transit and at rest

## Grammy Bot Implementation

### Project Structure (apps/grammy-bot)
```
apps/grammy-bot/
├── src/
│   ├── bot/
│   │   ├── commands/           # Bot command handlers
│   │   │   ├── start.ts       # /start command
│   │   │   └── help.ts        # /help command
│   │   ├── conversations/      # Complex multi-step flows
│   │   │   └── onboarding.ts  # Initial user onboarding
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.ts        # Check if user can message
│   │   │   ├── logger.ts      # Log incoming messages
│   │   │   └── ratelimit.ts   # Rate limiting
│   │   └── utils/             # Helper functions
│   │       ├── keyboard.ts    # Keyboard builders
│   │       └── messages.ts    # Message templates
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── perplexity.ts      # AI classification
│   ├── types/
│   │   └── index.ts           # Type definitions
│   ├── config.ts              # Bot configuration
│   └── index.ts               # Main bot entry
├── tests/                     # Test files
├── Dockerfile                 # For containerization
├── package.json
└── tsconfig.json
```

### Key Features

1. **Bot Instance Setup**
   ```typescript
   // src/index.ts
   import { Bot, session } from 'grammy';
   import { conversations } from '@grammyjs/conversations';
   import { hydrateReply } from '@grammyjs/parse-mode';
   
   const bot = new Bot(process.env.BOT_TOKEN!);
   
   // Add session support for complex flows
   bot.use(session({
     initial: () => ({
       step: 'initial',
       data: {},
     }),
   }));
   
   // Enable conversations for multi-step interactions
   bot.use(conversations());
   
   // Parse mode for rich text
   bot.use(hydrateReply);
   ```

2. **Message Handling**
   ```typescript
   // src/bot/middleware/handler.ts
   export async function handleMessage(ctx: Context) {
     // Create opportunity in Supabase
     const opportunity = await createOpportunity({
       celebrity_id: getCelebrityId(ctx.chat.id),
       initial_content: ctx.message.text,
       telegram_chat_id: ctx.chat.id,
       telegram_message_id: ctx.message.message_id,
     });
     
     // Run AI classification
     await classifyOpportunity(opportunity.id);
     
     // Send acknowledgment
     await ctx.reply('Thanks for your message! Our team will review it shortly.');
   }
   ```

3. **Webhook Setup**
   ```typescript
   // src/index.ts
   if (process.env.NODE_ENV === 'production') {
     bot.api.setWebhook(process.env.WEBHOOK_URL!);
   } else {
     bot.start();
   }
   ```

### Deployment Strategy

1. **Railway Setup**
   ```bash
   # Install Railway CLI
   pnpm add -g @railway/cli

   # Login to Railway
   railway login

   # Initialize project
   railway init

   # Link to existing project
   railway link
   ```

2. **Railway Configuration**
   - **railway.json**
   ```json
   {
     "$schema": "https://railway.app/railway.schema.json",
     "build": {
       "builder": "NIXPACKS",
       "buildCommand": "pnpm install && pnpm build"
     },
     "deploy": {
       "startCommand": "pnpm start",
       "healthcheckPath": "/health",
       "healthcheckTimeout": 100,
       "restartPolicyType": "ON_FAILURE"
     }
   }
   ```

3. **Environment Variables** (set in Railway Dashboard)
   ```env
   BOT_TOKEN=your_bot_token
   WEBHOOK_URL=https://${RAILWAY_STATIC_URL}/webhook
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   PERPLEXITY_API_KEY=your_perplexity_key
   ```

4. **Deployment Process**
   - Automatic deployments on push to main branch
   - Railway handles:
     - Build process
     - Environment variables
     - HTTPS endpoints
     - Automatic restarts
     - Logging
     - Metrics

5. **Monitoring & Logging**
   - Railway built-in logs and metrics
   - Custom logging middleware
   - Error tracking with Sentry
   - Status endpoint for health checks

### Development Workflow

1. **Local Development**
   ```bash
   # Start bot in polling mode
   pnpm dev

   # Run tests
   pnpm test

   # Deploy to Railway
   railway up
   ```

2. **Testing Strategy**
   - Unit tests for command handlers
   - Integration tests with test bot token
   - E2E tests for critical flows

3. **CI/CD Pipeline with Railway**
   - Connect GitHub repository to Railway
   - Automatic deployments on push to main
   - Preview deployments for pull requests
   - Environment promotion (staging → production)

## Future Enhancements
1. Rich media handling (photos, videos, files)
2. Interactive buttons and forms
3. Automated workflows based on message content
4. Integration with team Telegram channels
5. Analytics and reporting on bot usage
6. Multi-language support
7. Custom bot commands per celebrity

## Twitter Integration (Future)
Once Twitter OAuth is resolved:
1. Set up auto-reply for Twitter DMs:
   - "Thanks for your message! For faster response, please contact me via my Telegram bot: @CelebNameBot"
2. Include deep link to start Telegram chat
3. Optionally include context/reference code to link conversations

### Multi-Tenant Bot Architecture

1. **Single Deployment, Multiple Bots**
   - One Railway deployment handles all celebrity bots
   - Bot tokens stored in Supabase `celebrity_telegram_bots` table
   - Dynamic bot instance creation based on incoming webhooks

2. **Webhook Structure**
   ```
   https://${RAILWAY_STATIC_URL}/webhook/:celebrityId
   ```
   - Each celebrity gets a unique webhook URL
   - `celebrityId` is used to look up the correct bot token

3. **Bot Instance Management**
   ```typescript
   // src/bot/manager.ts
   import { Bot } from 'grammy';
   import { createClient } from '@supabase/supabase-js';

   export class BotManager {
     private bots: Map<string, Bot> = new Map();
     private supabase = createClient(
       process.env.SUPABASE_URL!,
       process.env.SUPABASE_SERVICE_ROLE_KEY!
     );

     async getBotInstance(celebrityId: string): Promise<Bot | null> {
       // Return existing bot instance if available
       if (this.bots.has(celebrityId)) {
         return this.bots.get(celebrityId)!;
       }

       // Fetch bot token from Supabase
       const { data: botConfig } = await this.supabase
         .from('celebrity_telegram_bots')
         .select('bot_token, bot_settings')
         .eq('celebrity_id', celebrityId)
         .single();

       if (!botConfig?.bot_token) {
         return null;
       }

       // Create new bot instance
       const bot = new Bot(botConfig.bot_token);
       
       // Configure bot with celebrity-specific settings
       await this.configureBotInstance(bot, botConfig.bot_settings);
       
       // Store for reuse
       this.bots.set(celebrityId, bot);
       
       return bot;
     }

     private async configureBotInstance(bot: Bot, settings: any) {
       // Add middleware and configurations specific to this celebrity
       bot.use(session({
         initial: () => ({
           step: 'initial',
           data: {},
           settings: settings,
         }),
       }));

       bot.use(conversations());
       bot.use(hydrateReply);
       
       // Add celebrity-specific command handlers
       await this.setupCommands(bot, settings);
     }
   }
   ```

4. **Webhook Handler**
   ```typescript
   // src/index.ts
   import express from 'express';
   import { BotManager } from './bot/manager';

   const app = express();
   const botManager = new BotManager();

   app.post('/webhook/:celebrityId', async (req, res) => {
     const { celebrityId } = req.params;
     
     // Get bot instance for this celebrity
     const bot = await botManager.getBotInstance(celebrityId);
     if (!bot) {
       return res.status(404).json({ error: 'Bot not found' });
     }

     // Handle the update
     await bot.handleUpdate(req.body);
     
     res.sendStatus(200);
   });

   app.get('/health', (_, res) => res.sendStatus(200));

   const port = process.env.PORT || 3000;
   app.listen(port, () => {
     console.log(`Bot server running on port ${port}`);
   });
   ```

5. **Bot Setup Process**
   ```typescript
   // src/bot/setup.ts
   export async function setupNewCelebrityBot(
     celebrityId: string,
     botToken: string,
     settings: any
   ) {
     // Validate bot token
     const bot = new Bot(botToken);
     try {
       // Verify bot token is valid
       const botInfo = await bot.api.getMe();
       
       // Generate unique webhook URL for this celebrity's bot
       const webhookUrl = `${process.env.RAILWAY_STATIC_URL}/webhook/${celebrityId}`;
       
       // Set webhook for this specific bot
       await bot.api.setWebhook(webhookUrl);
       
       // Store in Supabase with webhook URL
       await supabase
         .from('celebrity_telegram_bots')
         .upsert({
           celebrity_id: celebrityId,
           bot_token: botToken,
           bot_username: botInfo.username,
           webhook_url: webhookUrl,
           bot_settings: settings,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString(),
         });

       return { 
         success: true, 
         botInfo,
         webhookUrl 
       };
     } catch (error) {
       return { 
         success: false, 
         error: error instanceof Error ? error.message : 'Unknown error' 
       };
     }
   }
   ```

6. **Database Schema Update**
   ```sql
   -- Update celebrity_telegram_bots table
   ALTER TABLE celebrity_telegram_bots 
   ADD COLUMN webhook_url TEXT NOT NULL,
   ADD COLUMN last_webhook_update TIMESTAMP WITH TIME ZONE;

   -- Add index for faster lookups
   CREATE INDEX idx_celebrity_telegram_bots_celebrity_id 
   ON celebrity_telegram_bots(celebrity_id);
   ```

7. **Webhook Verification**
   ```typescript
   // src/middleware/verify-webhook.ts
   import { Request, Response, NextFunction } from 'express';
   import { createHmac } from 'crypto';

   export async function verifyTelegramWebhook(
     req: Request, 
     res: Response, 
     next: NextFunction
   ) {
     const { celebrityId } = req.params;
     
     // Verify the request is coming from Telegram
     const telegramToken = req.header('X-Telegram-Bot-Api-Secret-Token');
     if (!telegramToken) {
       return res.status(401).json({ error: 'Missing authentication' });
     }

     // Get bot config from Supabase
     const { data: botConfig } = await supabase
       .from('celebrity_telegram_bots')
       .select('bot_token, webhook_url')
       .eq('celebrity_id', celebrityId)
       .single();

     if (!botConfig) {
       return res.status(404).json({ error: 'Bot not found' });
     }

     // Verify webhook URL matches
     const expectedUrl = `${process.env.RAILWAY_STATIC_URL}/webhook/${celebrityId}`;
     if (botConfig.webhook_url !== expectedUrl) {
       return res.status(400).json({ error: 'Invalid webhook URL' });
     }

     // Store bot token in request for later use
     req.botToken = botConfig.bot_token;
     next();
   }
   ```

8. **Updated Webhook Handler**
   ```typescript
   // src/index.ts
   import { verifyTelegramWebhook } from './middleware/verify-webhook';

   // ... express app setup ...

   app.post(
     '/webhook/:celebrityId',
     verifyTelegramWebhook,
     async (req, res) => {
       const { celebrityId } = req.params;
       const botToken = req.botToken; // Added by middleware
       
       // Get or create bot instance
       const bot = await botManager.getBotInstance(celebrityId);
       if (!bot) {
         return res.status(500).json({ error: 'Failed to initialize bot' });
       }

       // Handle the update
       await bot.handleUpdate(req.body);
       
       res.sendStatus(200);
     }
   );
   ```

### Environment Variables
```env
RAILWAY_STATIC_URL=your-railway-url
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key
PERPLEXITY_API_KEY=your_perplexity_key
``` 