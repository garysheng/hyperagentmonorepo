-- Create tables for HyperAgent.so

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Celebrities table
CREATE TABLE celebrities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_name VARCHAR NOT NULL,
  twitter_username VARCHAR NOT NULL UNIQUE,
  twitter_password VARCHAR NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_id UUID NOT NULL REFERENCES celebrities(id),
  name VARCHAR NOT NULL,
  description TEXT,
  priority INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(celebrity_id, name)
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
  goal_id UUID REFERENCES goals(id),
  sender_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  sender_handle VARCHAR NOT NULL,
  initial_content TEXT NOT NULL,
  relevance_score FLOAT CHECK (relevance_score >= 1 AND relevance_score <= 5),
  tags JSONB DEFAULT '[]',
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'on_hold')),
  assigned_to UUID REFERENCES auth.users(id),
  needs_discussion BOOLEAN DEFAULT FALSE,
  relevance_override_explanation TEXT,
  relevance_override_by UUID REFERENCES auth.users(id),
  relevance_override_at TIMESTAMPTZ,
  status_updated_by UUID REFERENCES auth.users(id),
  status_updated_at TIMESTAMPTZ,
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

-- Opportunity Comments table for team discussions
CREATE TABLE opportunity_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
CREATE INDEX idx_goals_celebrity_id ON goals(celebrity_id);
CREATE INDEX idx_opportunities_celebrity_id ON opportunities(celebrity_id);
CREATE INDEX idx_opportunities_goal_id ON opportunities(goal_id);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_needs_discussion ON opportunities(needs_discussion);
CREATE INDEX idx_opportunity_messages_opportunity_id ON opportunity_messages(opportunity_id);
CREATE INDEX idx_opportunity_comments_opportunity_id ON opportunity_comments(opportunity_id);
CREATE INDEX idx_opportunity_actions_opportunity_id ON opportunity_actions(opportunity_id);

-- Add RLS policies
ALTER TABLE opportunity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on opportunities they have access to" ON opportunity_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM opportunities o
      WHERE o.id = opportunity_id
    )
  );

CREATE POLICY "Authenticated users can create comments" ON opportunity_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" ON opportunity_comments
  FOR UPDATE USING (auth.uid() = user_id); 