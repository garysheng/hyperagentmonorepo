-- Add message_hash column to email_messages table
ALTER TABLE email_messages
ADD COLUMN message_hash text;

-- First, generate hashes for all messages
UPDATE email_messages
SET message_hash = encode(
  digest(
    from_address || ':' || content,
    'sha256'
  ),
  'hex'
)
WHERE message_hash IS NULL;

-- Find and handle duplicates before creating unique index
WITH duplicates AS (
  SELECT message_hash, array_agg(id ORDER BY created_at DESC) as message_ids
  FROM email_messages
  WHERE message_hash IS NOT NULL
  GROUP BY message_hash
  HAVING COUNT(*) > 1
)
DELETE FROM email_messages
WHERE id IN (
  SELECT unnest(message_ids[2:]) -- Keep the most recent message, delete others
  FROM duplicates
);

-- Now create unique index after handling duplicates
CREATE UNIQUE INDEX email_messages_message_hash_idx ON email_messages (message_hash); 