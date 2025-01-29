-- Create source enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE source AS ENUM ('TWITTER_DM', 'WIDGET', 'EMAIL');
EXCEPTION
    WHEN duplicate_object THEN
        ALTER TYPE source ADD VALUE IF NOT EXISTS 'EMAIL';
END $$;

-- Update any existing rows that might need the new source (unlikely in this case)
-- UPDATE opportunities SET source = 'EMAIL' WHERE source IS NULL; 