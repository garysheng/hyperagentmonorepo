# Bulk Transcript Processing Feature

## Overview
A wizard-based interface for processing meeting transcripts that discuss multiple opportunities. This feature allows users to upload a single transcript and process multiple opportunities in a streamlined manner.

## Processing Paths

### 1. Single Opportunity Processing
- User selects an individual opportunity
- Uploads/pastes transcript specific to that opportunity
- System processes single transcript via `/api/opportunities/process-transcript`
- Immediate feedback and status update

### 2. Bulk Processing
- User uploads transcript containing multiple opportunities
- System processes via `/api/opportunities/process-bulk-transcript`
- Wizard interface guides through multiple updates
- Each opportunity is processed individually using existing endpoints

## User Flow (Bulk Processing)
1. User clicks "Upload Meeting Transcript" button on the inbound page
2. User uploads a transcript file
3. System analyzes transcript to identify discussed opportunities
4. Wizard interface appears showing:
   - Total number of opportunities identified
   - Progress through the wizard (e.g., "Step 2 of 5")
   - Current opportunity being processed

## Wizard Steps
1. **Initial Analysis**
   - System scans transcript to identify all opportunities discussed
   - Shows list of identified opportunities
   - User can deselect any incorrectly identified opportunities

2. **Per-Opportunity Review**
   - For each identified opportunity:
     - Shows relevant transcript section
     - Displays current status and proposed changes
     - User can approve/reject changes
     - User can edit summary and action items
     - User can skip to process later
     - When approved, changes are applied immediately via `/api/opportunities/apply-transcript`

3. **Final Summary**
   - Overview of all processed opportunities
   - List of any skipped opportunities
   - Option to return to skipped opportunities

## Technical Requirements
1. **Transcript Analysis**
   - Maintain existing single opportunity processing
   - Add new bulk processing capability
   - Extract relevant sections per opportunity
   - Match discussed opportunities with database records

2. **UI Components**
   - Multi-step wizard component for bulk processing
   - Progress tracking
   - Per-opportunity review interface
   - Summary view
   - Keep existing single opportunity interface

3. **API Endpoints**
   - `/api/opportunities/process-transcript` - Single opportunity processing
   - `/api/opportunities/process-bulk-transcript` - Initial bulk transcript analysis
   - `/api/opportunities/apply-transcript` - Apply changes for each opportunity (existing)

## Data Model Updates
- Add support for bulk processing sessions
- Track wizard progress state
- Store intermediate results
- Maintain compatibility with single opportunity updates

## Success Metrics
- Time saved vs individual processing
- Accuracy of opportunity identification
- User completion rate of wizard
- Error rate in bulk processing
- Usage split between single and bulk processing 