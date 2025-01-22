-- Add source column to opportunities table
ALTER TABLE opportunities ADD COLUMN source VARCHAR NOT NULL DEFAULT 'TWITTER_DM';

-- Add check constraint to ensure valid source values
ALTER TABLE opportunities ADD CONSTRAINT opportunities_source_check 
  CHECK (source IN ('TWITTER_DM', 'WIDGET'));

-- Add twitter-specific columns if they don't exist
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS twitter_dm_conversation_id VARCHAR;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS twitter_dm_event_id VARCHAR;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS twitter_sender_id VARCHAR;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS twitter_sender_username VARCHAR;

-- Add widget-specific columns if they don't exist
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS widget_name VARCHAR;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS widget_email VARCHAR;
ALTER TABLE opportunities ADD COLUMN IF NOT EXISTS widget_phone VARCHAR;

-- Add index on source column
CREATE INDEX IF NOT EXISTS idx_opportunities_source ON opportunities(source); 