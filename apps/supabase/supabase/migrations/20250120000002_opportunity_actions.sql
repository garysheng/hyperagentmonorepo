-- Add new columns to opportunities table
ALTER TABLE opportunities 
  ADD COLUMN assigned_to UUID REFERENCES auth.users(id),
  ADD COLUMN needs_discussion BOOLEAN DEFAULT FALSE,
  ADD COLUMN relevance_override_explanation TEXT,
  ADD COLUMN relevance_override_by UUID REFERENCES auth.users(id),
  ADD COLUMN relevance_override_at TIMESTAMPTZ,
  ADD COLUMN status_updated_by UUID REFERENCES auth.users(id),
  ADD COLUMN status_updated_at TIMESTAMPTZ;

-- Create comments table for team discussions
CREATE TABLE opportunity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_opportunities_assigned_to ON opportunities(assigned_to);
CREATE INDEX idx_opportunities_needs_discussion ON opportunities(needs_discussion);
CREATE INDEX idx_opportunity_comments_opportunity_id ON opportunity_comments(opportunity_id);

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