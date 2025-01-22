-- Create email_threads table
CREATE TABLE email_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email_messages table
CREATE TABLE email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES email_threads(id) ON DELETE CASCADE,
  from_address TEXT NOT NULL,
  to_addresses TEXT[] NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  mailgun_message_id TEXT UNIQUE,
  direction TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_email_threads_opportunity_id ON email_threads(opportunity_id);
CREATE INDEX idx_email_threads_last_message_at ON email_threads(last_message_at);
CREATE INDEX idx_email_threads_status ON email_threads(status);

CREATE INDEX idx_email_messages_thread_id ON email_messages(thread_id);
CREATE INDEX idx_email_messages_mailgun_message_id ON email_messages(mailgun_message_id);
CREATE INDEX idx_email_messages_direction ON email_messages(direction);

-- Add email fields to opportunities table
ALTER TABLE opportunities
ADD COLUMN email_from TEXT,
ADD COLUMN email_to TEXT[]; 