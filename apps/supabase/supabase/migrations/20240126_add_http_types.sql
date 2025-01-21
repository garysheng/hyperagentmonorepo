-- Create the http_header type
CREATE TYPE extensions.http_header AS (
  field text,
  value text
);

-- Create the http_request type
CREATE TYPE extensions.http_request AS (
  method text,
  url text,
  headers extensions.http_header[],
  content_type text,
  content text
);

-- Update the trigger_classification function to use the types
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
  service_role_key text;
BEGIN
  -- Get the opportunity
  SELECT * INTO opp FROM opportunities WHERE id = opportunity_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Opportunity not found';
  END IF;

  -- Set the edge function URL and service role key
  edge_function_url := 'https://avbjfurvihtlhwfozrez.supabase.co/functions/v1/classifyOpportunity';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  -- Log the function call
  RAISE NOTICE 'Classification function called for opportunity % with content: %', opp.id, opp.initial_content;

  -- Call the edge function
  SELECT 
    status,
    content::text
  INTO
    response_status,
    response_body
  FROM extensions.http((
    'POST',
    edge_function_url,
    ARRAY[
      ('Content-Type', 'application/json'),
      ('Authorization', 'Bearer ' || service_role_key)
    ]::extensions.http_header[],
    'application/json',
    jsonb_build_object('opportunityId', opportunity_id)::text
  )::extensions.http_request);

  -- Log the response for debugging
  RAISE NOTICE 'Edge function response: status %, body %', response_status, response_body;

  -- Return the opportunity
  RETURN opp;
END;
$$; 