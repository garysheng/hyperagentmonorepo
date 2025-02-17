## Twitter DMs

### twitter_dms
Tracks Twitter DMs and their processing status

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| celebrity_id | uuid | Foreign key to celebrities table |
| dm_conversation_id | text | Twitter DM conversation ID |
| dm_event_id | text | Twitter DM event ID |
| sender_id | text | Twitter user ID of sender |
| sender_username | text | Twitter username of sender |
| message_text | text | Content of the DM |
| created_at | timestamptz | When the DM was sent |
| processed_at | timestamptz | When we processed this DM into an opportunity (null if not processed) |
| opportunity_id | uuid | Foreign key to opportunities table (null if not processed) |
| last_fetched_at | timestamptz | When we last fetched this DM from Twitter |

### opportunities (modified)
Add fields to track Twitter source:

| Column | Type | Description |
|--------|------|-------------|
| ... | ... | Existing fields ... |
| source | text | Added field - Can be 'TWITTER_DM', 'MANUAL', etc. |
| twitter_dm_conversation_id | text | Twitter DM conversation ID (if source is 'TWITTER_DM') |
| twitter_dm_event_id | text | Twitter DM event ID (if source is 'TWITTER_DM') |
| twitter_sender_id | text | Twitter user ID of sender (if source is 'TWITTER_DM') |
| twitter_sender_username | text | Twitter username of sender (if source is 'TWITTER_DM') |

## Email Integration

### email_threads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| opportunity_id | UUID | Reference to opportunities table |
| subject | TEXT | Email subject |
| last_message_at | TIMESTAMP WITH TIME ZONE | Timestamp of last message |
| status | TEXT | Thread status (active, archived, spam) |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | Last update timestamp |

### email_messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| thread_id | UUID | Reference to email_threads table |
| from | TEXT | Sender email address |
| to | TEXT[] | Array of recipient email addresses |
| subject | TEXT | Email subject |
| content | TEXT | Email content |
| mailgun_message_id | TEXT | Mailgun message ID |
| direction | TEXT | Message direction (inbound, outbound) |
| created_at | TIMESTAMP WITH TIME ZONE | Creation timestamp |

### Indexes
```sql
-- email_threads indexes
CREATE INDEX idx_email_threads_opportunity_id ON email_threads(opportunity_id);
CREATE INDEX idx_email_threads_last_message_at ON email_threads(last_message_at);
CREATE INDEX idx_email_threads_status ON email_threads(status);

-- email_messages indexes
CREATE INDEX idx_email_messages_thread_id ON email_messages(thread_id);
CREATE INDEX idx_email_messages_mailgun_message_id ON email_messages(mailgun_message_id);
CREATE INDEX idx_email_messages_direction ON email_messages(direction);
```

### Foreign Keys
```sql
ALTER TABLE email_threads
  ADD CONSTRAINT fk_email_threads_opportunity
  FOREIGN KEY (opportunity_id)
  REFERENCES opportunities(id)
  ON DELETE CASCADE;

ALTER TABLE email_messages
  ADD CONSTRAINT fk_email_messages_thread
  FOREIGN KEY (thread_id)
  REFERENCES email_threads(id)
  ON DELETE CASCADE;
``` 

# Email Tables

## email_threads
- `id` uuid PK
- `opportunity_id` uuid FK -> opportunities.id
- `subject` text
- `last_message_at` timestamp with time zone
- `message_count` integer default 0
- `status` text check (status in ('active', 'archived'))
- `created_at` timestamp with time zone default now()
- `updated_at` timestamp with time zone default now()

## email_messages
- `id` uuid PK
- `thread_id` uuid FK -> email_threads.id
- `opportunity_id` uuid FK -> opportunities.id
- `sender_email` text
- `sender_name` text
- `recipient_email` text
- `subject` text
- `content` text
- `content_html` text null
- `raw_content` text
- `headers` jsonb default '{}'
- `external_id` text unique
- `direction` text check (direction in ('inbound', 'outbound'))
- `timestamp` timestamp with time zone
- `created_at` timestamp with time zone default now()

Indexes:
- `email_messages_thread_id_idx` on thread_id
- `email_messages_opportunity_id_idx` on opportunity_id
- `email_messages_external_id_idx` unique on external_id
- `email_messages_timestamp_idx` on timestamp

Triggers:
- Update `last_message_at` and `message_count` on email_threads when messages are inserted/deleted
- Update `updated_at` on email_threads when modified