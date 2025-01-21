-- Clear existing data
DELETE FROM opportunity_comments;
DELETE FROM opportunities;
DELETE FROM goals;
DELETE FROM celebrities WHERE twitter_username = 'garysheng';

-- Insert Gary's celebrity profile
INSERT INTO celebrities (id, celebrity_name, twitter_username, twitter_password, created_at)
VALUES (
  'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
  'Gary Sheng',
  'garysheng',
  'placeholder_password',
  NOW()
);

-- Insert Gary's goals
INSERT INTO goals (id, celebrity_id, name, description, priority, created_at)
VALUES
  (
    'goal-1-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'Find Great Tech Opportunities',
    'Connect with employers looking for an AI-first software engineer',
    1,
    NOW()
  ),
  (
    'goal-2-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'Find Romantic Partner',
    'Meet a hot, smart romantic partner',
    2,
    NOW()
  );

-- Insert sample opportunities
INSERT INTO opportunities (
  id,
  celebrity_id,
  sender_handle,
  initial_content,
  relevance_score,
  status,
  goal_id,
  created_at,
  needs_discussion,
  tags
) VALUES
  -- High relevance tech opportunity
  (
    'opp-1-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'elonmusk',
    'Hey @garysheng - saw your work on AI agents. We''re building something similar at X. Would you be interested in leading our AI infrastructure team?',
    5,
    'pending',
    'goal-1-uid',
    NOW() - INTERVAL '2 days',
    true,
    '{"tags": ["job_opportunity", "senior_role", "ai_focus"]}'
  ),
  -- Medium relevance tech opportunity
  (
    'opp-2-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'techrecruiter',
    'Hi Gary! I represent a Series A startup working on AI agents. Looking for a senior engineer. Competitive package. Interested?',
    3,
    'pending',
    'goal-1-uid',
    NOW() - INTERVAL '1 day',
    false,
    '{"tags": ["job_opportunity", "startup"]}'
  ),
  -- High relevance dating opportunity
  (
    'opp-3-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'brilliant_dev',
    'Hey Gary! I''m a ML researcher at Stanford, also into rock climbing and philosophy. Would love to grab coffee and chat about AI and life :)',
    4,
    'pending',
    'goal-2-uid',
    NOW() - INTERVAL '12 hours',
    false,
    '{"tags": ["dating", "shared_interests"]}'
  ),
  -- Low relevance spam
  (
    'opp-4-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'crypto_bro',
    'YO BRO! Want to make 100x returns on this new NFT project?!?!',
    1,
    'rejected',
    null,
    NOW() - INTERVAL '3 days',
    false,
    '{"tags": ["spam", "crypto"]}'
  ),
  -- Medium relevance, needs discussion
  (
    'opp-5-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'startup_ceo',
    'Gary - interested in being an advisor for our AI startup? 1% equity, minimal time commitment.',
    3,
    'pending',
    'goal-1-uid',
    NOW() - INTERVAL '6 hours',
    true,
    '{"tags": ["advisor_role", "equity", "needs_discussion"]}'
  ),
  -- Ambiguous opportunity
  (
    'opp-6-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'tech_influencer',
    'Love your work on AI agents! Would you be up for dinner next week? Have some interesting opportunities to discuss.',
    3,
    'pending',
    null,
    NOW() - INTERVAL '1 hour',
    true,
    '{"tags": ["networking", "unclear_intent"]}'
  ),
  -- Low relevance tech opportunity
  (
    'opp-7-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'junior_dev',
    'Hi! Would you mentor me in web development? I''m just starting out with HTML and CSS.',
    2,
    'pending',
    'goal-1-uid',
    NOW() - INTERVAL '4 days',
    false,
    '{"tags": ["mentorship", "low_priority"]}'
  ),
  -- Medium relevance dating opportunity
  (
    'opp-8-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'yoga_teacher',
    'Hey Gary! Your profile is fascinating. Would love to discuss consciousness and AI over tea sometime.',
    3,
    'pending',
    'goal-2-uid',
    NOW() - INTERVAL '2 hours',
    false,
    '{"tags": ["dating", "philosophical"]}'
  ),
  -- High priority, on hold
  (
    'opp-9-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'google_recruiter',
    'Hi Gary - I''m a technical recruiter at Google AI. Would love to discuss our Agent Development team. Are you open to a chat?',
    5,
    'on_hold',
    'goal-1-uid',
    NOW() - INTERVAL '5 days',
    false,
    '{"tags": ["job_opportunity", "big_tech", "ai_focus"]}'
  ),
  -- Approved opportunity
  (
    'opp-10-uid',
    'ce571147-9c4d-4a98-955c-0cb3a40c03f9',
    'tech_founder',
    'Gary - impressed by your work. We''re building an AI agent marketplace. Series B, strong team from Google/Meta. Let''s talk?',
    4,
    'approved',
    'goal-1-uid',
    NOW() - INTERVAL '7 days',
    false,
    '{"tags": ["job_opportunity", "startup", "ai_focus"]}'
  );

-- Add some comments
INSERT INTO opportunity_comments (
  id,
  opportunity_id,
  user_id,
  content,
  created_at
) VALUES
  (
    'comment-1-uid',
    'opp-1-uid',
    (SELECT id FROM auth.users WHERE email = 'garysheng11@gmail.com' LIMIT 1),
    'This looks like a great opportunity! Need to research X''s AI initiatives.',
    NOW() - INTERVAL '1 day'
  ),
  (
    'comment-2-uid',
    'opp-5-uid',
    (SELECT id FROM auth.users WHERE email = 'garysheng11@gmail.com' LIMIT 1),
    'Need to clarify equity terms and expected time commitment.',
    NOW() - INTERVAL '5 hours'
  ); 