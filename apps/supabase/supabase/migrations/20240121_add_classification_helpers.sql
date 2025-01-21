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
RETURNS opportunities
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  opp opportunities%ROWTYPE;
  response_status int;
  response_body text;
  edge_function_url text;
BEGIN
  -- Get the opportunity
  SELECT * INTO opp FROM opportunities WHERE id = opportunity_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Opportunity not found';
  END IF;

  -- Get the edge function URL and service role key
  edge_function_url := 'https://avbjfurvihtlhwfozrez.supabase.co/functions/v1/classifyOpportunity';

  -- Log the function call
  RAISE NOTICE 'Classification function called for opportunity % with content: %', opp.id, opp.initial_content;

  -- Call the edge function
  SELECT 
    status,
    content::text
  INTO
    response_status,
    response_body
  FROM net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object(
      'opportunityId', opportunity_id
    )
  );

  -- Log the response for debugging
  RAISE NOTICE 'Edge function response: status %, body %', response_status, response_body;

  -- Return the opportunity
  RETURN opp;
END;
$$;

-- Internal function to handle classification logic
CREATE OR REPLACE FUNCTION handle_opportunity_classification_internal(opp opportunities)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only trigger classification for unclassified opportunities
  IF opp.relevance_score = -1 THEN
    PERFORM trigger_classification(opp.id);
  END IF;
END;
$$;

-- Comment on functions
COMMENT ON FUNCTION has_classification_trigger IS 'Checks if the opportunity classification trigger is installed';
COMMENT ON FUNCTION trigger_classification IS 'Manually triggers classification for a specific opportunity';
COMMENT ON FUNCTION handle_opportunity_classification_internal IS 'Internal function to handle the actual classification logic'; 