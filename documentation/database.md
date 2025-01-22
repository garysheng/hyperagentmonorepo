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