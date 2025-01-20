-- Create tables for HyperAgent.so

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Celebrities table
CREATE TABLE celebrities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_name VARCHAR NOT NULL,
  twitter_username VARCHAR NOT NULL UNIQUE,
  twitter_password VARCHAR NOT NULL,
  goals JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_id UUID NOT NULL REFERENCES celebrities(id),
  email VARCHAR NOT NULL UNIQUE,
  role VARCHAR NOT NULL CHECK (role IN ('admin', 'support_agent', 'celebrity')),
  full_name VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_id UUID NOT NULL REFERENCES celebrities(id),
  sender_handle VARCHAR NOT NULL,
  initial_content TEXT NOT NULL,
  relevance_score FLOAT,
  tags JSONB DEFAULT '[]',
  status VARCHAR NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'snoozed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity Messages table
CREATE TABLE opportunity_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  sender_id UUID REFERENCES users(id),
  sender_handle VARCHAR NOT NULL,
  message_content TEXT NOT NULL,
  direction VARCHAR NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunity Actions table
CREATE TABLE opportunity_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  user_id UUID REFERENCES users(id),
  action_type VARCHAR NOT NULL CHECK (action_type IN ('status_change', 'tag_update', 'score_override', 'feedback_flag')),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_celebrity_id ON users(celebrity_id);
CREATE INDEX idx_opportunities_celebrity_id ON opportunities(celebrity_id);
CREATE INDEX idx_opportunity_messages_opportunity_id ON opportunity_messages(opportunity_id);
CREATE INDEX idx_opportunity_actions_opportunity_id ON opportunity_actions(opportunity_id); 