-- Create function to invoke edge function for opportunity classification
CREATE OR REPLACE FUNCTION handle_opportunity_classification()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text;
  service_role_key text;
BEGIN
  -- Get settings from environment
  edge_function_url := 'http://127.0.0.1:54321/functions/v1';
  service_role_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

  -- Only trigger classification for unclassified opportunities
  IF NEW.relevance_score = -1 THEN
    -- Queue the classification task
    SELECT net.http_post(
      url := edge_function_url || '/classifyOpportunity',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object(
        'opportunityId', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for opportunity classification
CREATE OR REPLACE TRIGGER on_opportunity_created
  AFTER INSERT ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION handle_opportunity_classification();

-- Comment explaining the trigger
COMMENT ON FUNCTION handle_opportunity_classification IS 'Triggers classification edge function for new unclassified opportunities'; 