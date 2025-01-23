-- Create set_updated_at function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create writing_styles table
CREATE TABLE writing_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  celebrity_id UUID REFERENCES celebrities(id) ON DELETE CASCADE,
  formality_level INTEGER CHECK (formality_level >= 1 AND formality_level <= 5),
  preferred_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
  avoided_phrases TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_greetings TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_sign_offs TEXT[] DEFAULT ARRAY[]::TEXT[],
  voice_examples JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create unique index on celebrity_id
CREATE UNIQUE INDEX idx_writing_styles_celebrity_id ON writing_styles(celebrity_id);

-- Add RLS policies
ALTER TABLE writing_styles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view writing styles for their celebrity"
  ON writing_styles
  FOR SELECT
  USING (
    celebrity_id IN (
      SELECT celebrity_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update writing styles for their celebrity"
  ON writing_styles
  FOR UPDATE
  USING (
    celebrity_id IN (
      SELECT celebrity_id FROM users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    celebrity_id IN (
      SELECT celebrity_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert writing styles for their celebrity"
  ON writing_styles
  FOR INSERT
  WITH CHECK (
    celebrity_id IN (
      SELECT celebrity_id FROM users WHERE id = auth.uid()
    )
  );

-- Add trigger to update updated_at
CREATE TRIGGER set_writing_styles_updated_at
  BEFORE UPDATE ON writing_styles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at(); 