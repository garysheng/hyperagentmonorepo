-- Add new columns to writing_styles table
ALTER TABLE writing_styles
  ADD COLUMN enthusiasm_level INTEGER CHECK (enthusiasm_level >= 0 AND enthusiasm_level <= 100) DEFAULT 50,
  ADD COLUMN directness_level INTEGER CHECK (directness_level >= 0 AND directness_level <= 100) DEFAULT 50,
  ADD COLUMN humor_level INTEGER CHECK (humor_level >= 0 AND humor_level <= 100) DEFAULT 30,
  ADD COLUMN sentence_length_preference INTEGER CHECK (sentence_length_preference >= 0 AND sentence_length_preference <= 100) DEFAULT 50,
  ADD COLUMN vocabulary_complexity INTEGER CHECK (vocabulary_complexity >= 0 AND vocabulary_complexity <= 100) DEFAULT 50,
  ADD COLUMN technical_language_level INTEGER CHECK (technical_language_level >= 0 AND technical_language_level <= 100) DEFAULT 30,
  ADD COLUMN emoji_usage_level INTEGER CHECK (emoji_usage_level >= 0 AND emoji_usage_level <= 100) DEFAULT 20;

-- Update formality_level constraints
ALTER TABLE writing_styles 
  DROP CONSTRAINT IF EXISTS writing_styles_formality_level_check,
  ADD CONSTRAINT writing_styles_formality_level_check 
    CHECK (formality_level >= 0 AND formality_level <= 100);

-- Rename preferred_sign_offs to preferred_signoffs if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'writing_styles' 
    AND column_name = 'preferred_sign_offs'
  ) THEN
    ALTER TABLE writing_styles RENAME COLUMN preferred_sign_offs TO preferred_signoffs;
  END IF;
END $$; 