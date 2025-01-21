-- Update the relevance_score constraint to allow -1 for unclassified and 0-5 for classified
ALTER TABLE opportunities
  DROP CONSTRAINT opportunities_relevance_score_check;

ALTER TABLE opportunities
  ADD CONSTRAINT opportunities_relevance_score_check 
  CHECK (
    relevance_score = -1 OR -- Unclassified
    (relevance_score >= 0 AND relevance_score <= 5) -- Classified range
  );

-- Update any existing opportunities with score=1 to be unclassified (-1)
UPDATE opportunities 
SET relevance_score = -1 
WHERE relevance_score = 1;

COMMENT ON COLUMN opportunities.relevance_score IS 'Score ranges: -1 = unclassified, 0-5 = classified (0 lowest, 5 highest)'; 