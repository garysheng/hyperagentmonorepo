-- Add columns for classification details
ALTER TABLE opportunities
ADD COLUMN IF NOT EXISTS classification_explanation text,
ADD COLUMN IF NOT EXISTS classified_at timestamptz;

-- Add comment to explain the columns
COMMENT ON COLUMN opportunities.classification_explanation IS 'Detailed explanation from the AI about why it assigned the classification';
COMMENT ON COLUMN opportunities.classified_at IS 'Timestamp when the opportunity was classified by the AI'; 