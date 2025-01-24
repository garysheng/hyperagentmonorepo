-- Add scopes column to twitter_auth table
ALTER TABLE twitter_auth
  ADD COLUMN IF NOT EXISTS scopes TEXT[];

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_twitter_auth_scopes ON twitter_auth USING GIN(scopes);

-- Comment
COMMENT ON COLUMN twitter_auth.scopes IS 'Array of OAuth scopes granted by the user'; 