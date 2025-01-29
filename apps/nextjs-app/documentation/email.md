# Email Channel Integration Design

## Overview
Leverage existing email infrastructure to provide a direct email channel for fan outreach. This allows fans to contact celebrities through a familiar, professional medium while maintaining our existing opportunity processing workflow.

## Current Infrastructure
We already have:
- Mailgun integration for email handling
- Email thread tracking
- Email message processing
- Opportunity creation from emails
- Email response capabilities

## Email Address Format
The email format follows the pattern:
```
postmaster+team+{celebrity_id}@hyperagent.so
```
Example:
```
postmaster+team+0ca0f921-7ccd-4975-9afb-3bed98367403@hyperagent.so
```

Benefits of this format:
- Built-in celebrity identification through UUID
- No need for custom domain management
- Works with existing Mailgun configuration
- Consistent format across all celebrities
- Easy to parse in webhook handlers

## Proposed Channel Integration

### 1. Email Channel Display
On the Channels page, add an email section that shows:
- The dedicated email address in format: `postmaster+team+{celebrity_id}@hyperagent.so`
- Copy to clipboard functionality
- Status indicator (active/inactive)
- Recent email statistics
- Toggle to enable/disable email channel

### 2. Email Address Generation
- No generation needed - use existing celebrity_id
- Format is deterministic: `postmaster+team+{celebrity_id}@hyperagent.so`
- Store enabled/disabled state in `celebrity_channels` table

### 3. Email Processing Flow
1. Fan sends email to celebrity's postmaster address
2. Mailgun webhook receives email
3. System extracts celebrity_id from email address
4. System creates:
   - New opportunity record
   - Initial email thread
   - Email message record
5. Normal opportunity classification process runs
6. Team can respond through existing email interface

### 4. Database Schema Updates
```sql
-- Add email configuration to celebrity_channels
ALTER TABLE celebrity_channels
ADD COLUMN email_enabled boolean DEFAULT false,
ADD COLUMN email_settings jsonb;
```
Note: We don't need to store the email address since it's derived from celebrity_id

### 5. Security & Spam Prevention
- Rate limiting per sender
- Spam filtering through Mailgun
- Email verification requirements
- Size limits on attachments
- Content filtering options

### 6. User Interface Elements
1. Channel Configuration:
   - Enable/disable email channel
   - Display formatted email address
   - Copy button for email address
   - Set auto-responder message
   - Configure spam settings

2. Statistics Display:
   - Total emails received
   - Response rate
   - Average response time
   - Conversion metrics

### 7. Auto-Responder Options
- Configurable welcome message
- Business hours notification
- Expected response time
- Links to other channels/resources

## Implementation Phases

### Phase 1: Basic Integration
- Add email channel UI to channels page
- Enable/disable functionality
- Display formatted email address with copy button
- Connect to existing email processing

### Phase 2: Enhanced Features
- Auto-responder configuration
- Advanced spam settings
- Email statistics dashboard

### Phase 3: Advanced Features
- Email templates
- Scheduled responses
- Attachment handling
- Advanced analytics

## Technical Considerations
1. Email Routing:
   - Use existing Mailgun routes
   - Parse celebrity_id from email address in webhook
   - Error handling for invalid celebrity_ids

2. Rate Limiting:
   - Per sender limits
   - Overall channel limits
   - Configurable thresholds

3. Storage:
   - Email content
   - Attachments
   - Thread history

4. Performance:
   - Email processing queue
   - Async handling
   - Database optimization

## Questions to Resolve
1. Auto-responder requirements?
2. Attachment policy?
3. Spam handling preferences?
4. Should we show the full email address or mask the UUID in the UI?

## Next Steps
1. Review updated design document
2. Plan database schema updates
3. Design UI mockups
4. Implement Phase 1 
