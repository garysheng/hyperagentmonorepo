-- Create function to invoke edge function for opportunity classification
CREATE OR REPLACE FUNCTION handle_opportunity_classification()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Classification trigger called for opportunity %', NEW.id;
  
  -- Call the internal classification function
  PERFORM handle_opportunity_classification_internal(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for opportunity classification
DROP TRIGGER IF EXISTS on_opportunity_created ON opportunities;
CREATE OR REPLACE TRIGGER on_opportunity_modified
  AFTER INSERT OR UPDATE ON opportunities
  FOR EACH ROW
  WHEN (NEW.relevance_score = -1)
  EXECUTE FUNCTION handle_opportunity_classification();

-- Comment explaining the trigger
COMMENT ON FUNCTION handle_opportunity_classification IS 'Triggers classification edge function for new or updated unclassified opportunities'; 