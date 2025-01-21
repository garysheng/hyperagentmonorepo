-- Function to check if classification trigger exists
CREATE OR REPLACE FUNCTION has_classification_trigger()
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_opportunity_created'
    AND tgrelid = 'opportunities'::regclass
  );
END;
$$;

-- Function to manually trigger classification
CREATE OR REPLACE FUNCTION trigger_classification(opportunity_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verify opportunity exists
  IF NOT EXISTS (SELECT 1 FROM opportunities WHERE id = opportunity_id) THEN
    RAISE EXCEPTION 'Opportunity not found';
  END IF;

  -- Call the classification function directly
  PERFORM handle_opportunity_classification();
END;
$$;

-- Comment on functions
COMMENT ON FUNCTION has_classification_trigger IS 'Checks if the opportunity classification trigger is installed';
COMMENT ON FUNCTION trigger_classification IS 'Manually triggers classification for a specific opportunity'; 