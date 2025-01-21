-- Create twitter_auth table
CREATE TABLE IF NOT EXISTS twitter_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create auth_states table for OAuth state verification
CREATE TABLE IF NOT EXISTS auth_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, state)
);

-- Add RLS policies
ALTER TABLE twitter_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_states ENABLE ROW LEVEL SECURITY;

-- Users can only read their own Twitter auth
CREATE POLICY "Users can view own twitter auth" ON twitter_auth
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own Twitter auth
CREATE POLICY "Users can update own twitter auth" ON twitter_auth
  FOR ALL USING (auth.uid() = user_id);

-- Users can manage their own auth states
CREATE POLICY "Users can manage own auth states" ON auth_states
  FOR ALL USING (auth.uid() = user_id); 