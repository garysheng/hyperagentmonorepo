# Pivot: Chat Widget Implementation

## Overview
Added a chat widget feature to allow direct communication between potential collaborators and celebrities/teams. This pivot enhances the platform's accessibility by providing an immediate, frictionless way for users to submit opportunities.

## Technical Implementation

### Widget Architecture
- Standalone JavaScript bundle that can be embedded on any website
- Uses Preact for lightweight rendering
- Shadow DOM for style isolation
- Configurable through data attributes

### Key Features
- Email collection for sender identification
- Real-time message submission
- Automatic opportunity creation in the database
- Configurable themes and positioning
- Isolated styles to prevent conflicts with host site

### Integration Example
```html
<script 
  src="/api/widget/v1.js" 
  data-celebrity-id="YOUR_CELEBRITY_ID"
  data-primary-color="#0F172A"
  data-position="bottom-right"
  async
></script>
```

## Database Changes
- Opportunities table now supports widget-originated submissions
- Added `sender_handle` (email) for widget submissions
- Automatic classification through Perplexity AI integration

## Benefits
1. Lower barrier to entry for submitting opportunities
2. Wider reach through embeddable widget
3. Consistent opportunity collection and processing
4. Seamless integration with existing classification system

## Future Enhancements
- Real-time chat capabilities
- Custom branding options
- Message templates
- Analytics integration
- Multi-language support 