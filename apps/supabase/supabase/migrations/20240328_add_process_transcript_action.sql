-- Add comment explaining the action types including process_transcript
COMMENT ON COLUMN opportunity_actions.action_type IS 'Types of actions that can be taken on opportunities: upgrade_relevance, downgrade_relevance, assign_goal, assign_user, flag_discussion, update_status, start_conversation, process_transcript'; 
