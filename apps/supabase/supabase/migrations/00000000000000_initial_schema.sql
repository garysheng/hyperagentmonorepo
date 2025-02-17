-- Create tables for HyperAgent.so

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role TEXT CHECK (role IN ('admin', 'support_agent', 'celebrity')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT TO authenticated USING (true);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_creation();

-- Create function to handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    email = NEW.email,
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user updates
CREATE OR REPLACE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();

-- Celebrities table
CREATE TABLE celebrities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_name VARCHAR NOT NULL,
  twitter_username VARCHAR,
  twitter_password VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_id UUID NOT NULL REFERENCES celebrities(id),
  name VARCHAR NOT NULL,
  description TEXT,
  priority INT4,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities table (DMs)
CREATE TABLE opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_id UUID NOT NULL REFERENCES celebrities(id),
  goal_id UUID REFERENCES goals(id),
  sender_id UUID NOT NULL,
  sender_handle VARCHAR NOT NULL,
  initial_content TEXT NOT NULL,
  relevance_score FLOAT8 CHECK (relevance_score >= 0 AND relevance_score <= 5),
  tags JSONB DEFAULT '[]'::jsonb,
  status VARCHAR NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'on_hold')),
  assigned_to UUID REFERENCES users(id),
  needs_discussion BOOLEAN DEFAULT false,
  relevance_override_explanation TEXT,
  relevance_override_by UUID REFERENCES users(id),
  relevance_override_at TIMESTAMPTZ,
  status_updated_by UUID REFERENCES users(id),
  status_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Messages table (DM Thread)
CREATE TABLE opportunity_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_handle VARCHAR NOT NULL,
  message_content TEXT NOT NULL,
  direction VARCHAR NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Comments table (Internal Discussion)
CREATE TABLE opportunity_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunity Actions table (Audit Log)
CREATE TABLE opportunity_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  action_type VARCHAR NOT NULL CHECK (action_type IN ('status_change', 'tag_update', 'score_override', 'feedback_flag')),
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_celebrity_id ON goals(celebrity_id);
CREATE INDEX idx_opportunities_celebrity_id ON opportunities(celebrity_id);
CREATE INDEX idx_opportunities_goal_id ON opportunities(goal_id);
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_needs_discussion ON opportunities(needs_discussion);
CREATE INDEX idx_opportunity_messages_opportunity_id ON opportunity_messages(opportunity_id);
CREATE INDEX idx_opportunity_comments_opportunity_id ON opportunity_comments(opportunity_id);
CREATE INDEX idx_opportunity_actions_opportunity_id ON opportunity_actions(opportunity_id);

-- Add RLS policies
ALTER TABLE celebrities ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for celebrities
CREATE POLICY "Users can view all celebrities" ON celebrities
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for goals
CREATE POLICY "Users can view all goals" ON goals
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for opportunities
CREATE POLICY "Users can view all opportunities" ON opportunities
  FOR SELECT TO authenticated USING (true);

-- RLS Policies for opportunity messages
CREATE POLICY "Users can view messages for opportunities they have access to" ON opportunity_messages
  FOR SELECT USING (true);

-- RLS Policies for opportunity comments
CREATE POLICY "Users can view all comments" ON opportunity_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments" ON opportunity_comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own comments" ON opportunity_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for opportunity actions
CREATE POLICY "Users can view all actions" ON opportunity_actions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create actions" ON opportunity_actions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); 