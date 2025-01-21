-- Function to check if classification trigger exists
CREATE OR REPLACE FUNCTION has_classification_trigger()
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'on_opportunity_modified'
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
DECLARE
  opp opportunities%ROWTYPE;
BEGIN
  -- Verify opportunity exists
  SELECT * INTO opp FROM opportunities WHERE id = opportunity_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Opportunity not found';
  END IF;

  -- Call the classification function directly with the opportunity data
  PERFORM handle_opportunity_classification_internal(opp);
END;
$$;

-- Internal function to handle classification logic
CREATE OR REPLACE FUNCTION handle_opportunity_classification_internal(opp opportunities)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  edge_function_url text;
  service_role_key text;
  response record;
BEGIN
  -- Log the function call
  RAISE NOTICE 'Classification function called for opportunity % with content: %', opp.id, opp.initial_content;

  -- Get settings from environment
  edge_function_url := 'http://127.0.0.1:54321/functions/v1/classifyOpportunity';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  -- Only trigger classification for unclassified opportunities
  IF opp.relevance_score = -1 THEN
    -- Log the API call
    RAISE NOTICE 'Calling edge function for opportunity %', opp.id;

    -- Queue the classification task
    SELECT * INTO response FROM net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'opportunityId', opp.id
      )
    );

    -- Log response
    RAISE NOTICE 'Edge function response for opportunity %: %', opp.id, response;
  END IF;
END;
$$;

-- Comment on functions
COMMENT ON FUNCTION has_classification_trigger IS 'Checks if the opportunity classification trigger is installed';
COMMENT ON FUNCTION trigger_classification IS 'Manually triggers classification for a specific opportunity';
COMMENT ON FUNCTION handle_opportunity_classification_internal IS 'Internal function to handle the actual classification logic'; 