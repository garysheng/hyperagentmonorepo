# Transcript Processing Feature Design

## Overview
A feature that allows team members to upload conversation transcripts about pending opportunities, which will then be processed to automatically update the opportunity status and metadata based on the discussion content.

## Initial MVP Scope
- Upload transcript segments for individual opportunities
- Process transcript content using LLM to determine:
  - New opportunity status (Approved/Rejected)
  - Meeting notes and key discussion points
- Show confirmation window before applying changes
- Update opportunity metadata with processed information

## User Flow
1. User navigates to `/inbound` page where all opportunities are listed
2. User finds and clicks on the pending opportunity they want to update
3. User clicks "Upload Transcript" button
4. User pastes/uploads transcript segment relevant to this opportunity
5. System processes transcript using LLM
6. System shows confirmation dialog with:
   - Proposed status change
   - Extracted meeting notes
   - Any other metadata changes
7. User can approve or reject the proposed changes
8. If approved, system updates the opportunity record
9. User is returned to the `/inbound` page with updated opportunity status

## Data Model Updates
Add the following fields to the existing `opportunities` table:

```typescript
interface OpportunityExtension {
  meeting_note_transcript: text       // The actual transcript text uploaded
  meeting_note_summary: text          // LLM-generated summary of the discussion
  meeting_note_action_recap: text     // Documents what actions/changes were made based on the meeting
  meeting_note_processed_at: timestamptz  // When the transcript was processed
  meeting_note_processed_by: uuid     // Who uploaded/processed the transcript
}
```

The `meeting_note_action_recap` will capture changes like:
- Status changes (e.g., "Changed status from PENDING to APPROVED")
- Reasoning behind decisions
- Any other metadata updates made based on the meeting discussion

## Technical Components
1. **Frontend**
   - Transcript upload modal/form
   - Confirmation dialog showing proposed changes
   - Loading states during processing

2. **Backend**
   - Transcript processing endpoint
   - LLM integration for analyzing transcript
   - Opportunity update logic

3. **LLM Processing**
   - Extract key decision points
   - Determine proposed status
   - Generate concise meeting notes
   - Identify any relevant metadata updates

## Future Enhancements
1. Bulk transcript processing
   - Upload full meeting transcripts
   - Process multiple opportunities at once
   - Batch confirmation of changes

2. Advanced Processing
   - Sentiment analysis
   - Action item extraction
   - Automatic tagging/categorization

3. Integration Features
   - Calendar integration for meeting context
   - Automatic recording transcription
   - Team member attribution

## Security Considerations
- Only authorized team members can upload transcripts
- Audit trail of transcript uploads and applied changes
- Secure storage of transcript data
- Rate limiting on processing endpoints

## Implementation Phases

### Phase 1 (MVP)
- Basic transcript upload for single opportunity
- Simple LLM processing
- Confirmation dialog
- Status and notes updates

### Phase 2
- Enhanced transcript analysis
- More detailed metadata extraction
- Improved UI/UX
- Analytics and tracking

### Phase 3
- Bulk processing capabilities
- Advanced integrations
- Automated workflows 