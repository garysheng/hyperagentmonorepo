-- Add transcript processing fields to opportunities table
ALTER TABLE opportunities
ADD COLUMN meeting_note_transcript text,
ADD COLUMN meeting_note_summary text,
ADD COLUMN meeting_note_action_recap text,
ADD COLUMN meeting_note_processed_at timestamptz,
ADD COLUMN meeting_note_processed_by uuid REFERENCES auth.users(id);

-- Add comment descriptions to the new columns
COMMENT ON COLUMN opportunities.meeting_note_transcript IS 'The actual transcript text uploaded for this opportunity';
COMMENT ON COLUMN opportunities.meeting_note_summary IS 'LLM-generated summary of the discussion about this opportunity';
COMMENT ON COLUMN opportunities.meeting_note_action_recap IS 'Documents what actions/changes were made based on the meeting discussion';
COMMENT ON COLUMN opportunities.meeting_note_processed_at IS 'When the transcript was processed';
COMMENT ON COLUMN opportunities.meeting_note_processed_by IS 'Who uploaded/processed the transcript'; 