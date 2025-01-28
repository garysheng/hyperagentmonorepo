-- Add default_user_id to goals table
ALTER TABLE goals
ADD COLUMN default_user_id uuid REFERENCES auth.users(id);

-- Add comment for clarity
COMMENT ON COLUMN goals.default_user_id IS 'The default team member to assign when this goal is matched to an opportunity'; 