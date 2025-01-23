-- First, drop the existing constraint
ALTER TABLE opportunities 
DROP CONSTRAINT IF EXISTS opportunities_status_check;

-- Add the new constraint with conversation_started status
ALTER TABLE opportunities
ADD CONSTRAINT opportunities_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'on_hold', 'conversation_started')); 