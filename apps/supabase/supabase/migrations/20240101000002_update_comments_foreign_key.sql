-- Drop existing foreign key if it exists
ALTER TABLE opportunity_comments
  DROP CONSTRAINT IF EXISTS opportunity_comments_user_id_fkey;

-- Add new foreign key to public.users
ALTER TABLE opportunity_comments
  ADD CONSTRAINT opportunity_comments_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE; 