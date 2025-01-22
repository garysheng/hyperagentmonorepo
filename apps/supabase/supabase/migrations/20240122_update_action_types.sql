-- First drop the existing constraint
ALTER TABLE opportunity_actions 
DROP CONSTRAINT IF EXISTS opportunity_actions_action_type_check;

-- Add new constraint with all our action types
ALTER TABLE opportunity_actions 
ADD CONSTRAINT opportunity_actions_action_type_check 
CHECK (action_type IN (
  'upgrade_relevance',
  'downgrade_relevance',
  'assign_goal',
  'assign_user',
  'flag_discussion',
  'update_status',
  'add_comment',
  'update_tags',
  'trigger_classification'
)); 