-- Clear existing data
DELETE FROM opportunity_comments;
DELETE FROM opportunities;
DELETE FROM goals;
DELETE FROM celebrities WHERE twitter_username = 'garysheng';

-- Insert Gary's celebrity profile
INSERT INTO celebrities (id, celebrity_name, twitter_username, twitter_password, created_at)
VALUES (
  gen_random_uuid(),
  'Gary Sheng',
  'garysheng',
  'placeholder_password',
  NOW()
);

-- Insert Gary's goals
WITH celebrity_id AS (
  SELECT id FROM celebrities WHERE twitter_username = 'garysheng'
)
INSERT INTO goals (id, celebrity_id, name, description, priority, created_at)
VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    'Find Great Tech Opportunities',
    'Connect with employers looking for an AI-first software engineer',
    1,
    NOW()
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    'Find Romantic Partner',
    'Meet a hot, smart romantic partner',
    2,
    NOW()
  );

-- Insert sample opportunities
WITH celebrity_id AS (
  SELECT id FROM celebrities WHERE twitter_username = 'garysheng'
),
tech_goal AS (
  SELECT id FROM goals WHERE name = 'Find Great Tech Opportunities'
),
dating_goal AS (
  SELECT id FROM goals WHERE name = 'Find Romantic Partner'
)
INSERT INTO opportunities (
  id,
  celebrity_id,
  sender_id,
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
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'elonmusk',
    'Hey @garysheng - saw your work on AI agents. We''re building something similar at X. Would you be interested in leading our AI infrastructure team?',
    5,
    'pending',
    (SELECT id FROM tech_goal),
    NOW() - INTERVAL '2 days',
    true,
    '{"tags": ["job_opportunity", "senior_role", "ai_focus"]}'
  ),
  -- Medium relevance tech opportunity
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'techrecruiter',
    'Hi Gary! I represent a Series A startup working on AI agents. Looking for a senior engineer. Competitive package. Interested?',
    3,
    'pending',
    (SELECT id FROM tech_goal),
    NOW() - INTERVAL '1 day',
    false,
    '{"tags": ["job_opportunity", "startup"]}'
  ),
  -- High relevance dating opportunity
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'brilliant_dev',
    'Hey Gary! I''m a ML researcher at Stanford, also into rock climbing and philosophy. Would love to grab coffee and chat about AI and life :)',
    4,
    'pending',
    (SELECT id FROM dating_goal),
    NOW() - INTERVAL '12 hours',
    false,
    '{"tags": ["dating", "shared_interests"]}'
  ),
  -- Low relevance spam
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
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
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'startup_ceo',
    'Gary - interested in being an advisor for our AI startup? 1% equity, minimal time commitment.',
    3,
    'pending',
    (SELECT id FROM tech_goal),
    NOW() - INTERVAL '6 hours',
    true,
    '{"tags": ["advisor_role", "equity", "needs_discussion"]}'
  ),
  -- Ambiguous opportunity
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
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
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'junior_dev',
    'Hi! Would you mentor me in web development? I''m just starting out with HTML and CSS.',
    2,
    'pending',
    (SELECT id FROM tech_goal),
    NOW() - INTERVAL '4 days',
    false,
    '{"tags": ["mentorship", "low_priority"]}'
  ),
  -- Medium relevance dating opportunity
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'yoga_teacher',
    'Hey Gary! Your profile is fascinating. Would love to discuss consciousness and AI over tea sometime.',
    3,
    'pending',
    (SELECT id FROM dating_goal),
    NOW() - INTERVAL '2 hours',
    false,
    '{"tags": ["dating", "philosophical"]}'
  ),
  -- High priority, on hold
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'google_recruiter',
    'Hi Gary - I''m a technical recruiter at Google AI. Would love to discuss our Agent Development team. Are you open to a chat?',
    5,
    'on_hold',
    (SELECT id FROM tech_goal),
    NOW() - INTERVAL '5 days',
    false,
    '{"tags": ["job_opportunity", "big_tech", "ai_focus"]}'
  ),
  -- Approved opportunity
  (
    gen_random_uuid(),
    (SELECT id FROM celebrity_id),
    gen_random_uuid(),
    'tech_founder',
    'Gary - impressed by your work. We''re building an AI agent marketplace. Series B, strong team from Google/Meta. Let''s talk?',
    4,
    'approved',
    (SELECT id FROM tech_goal),
    NOW() - INTERVAL '7 days',
    false,
    '{"tags": ["job_opportunity", "startup", "ai_focus"]}'
  );

-- Add some comments
WITH user_id AS (
  SELECT id FROM auth.users WHERE email = 'garysheng11@gmail.com' LIMIT 1
),
opp_1 AS (
  SELECT id FROM opportunities WHERE sender_handle = 'elonmusk' LIMIT 1
),
opp_2 AS (
  SELECT id FROM opportunities WHERE sender_handle = 'startup_ceo' LIMIT 1
)
INSERT INTO opportunity_comments (
  id,
  opportunity_id,
  user_id,
  content,
  created_at
) VALUES
  (
    gen_random_uuid(),
    (SELECT id FROM opp_1),
    (SELECT id FROM user_id),
    'This looks like a great opportunity! Need to research X''s AI initiatives.',
    NOW() - INTERVAL '1 day'
  ),
  (
    gen_random_uuid(),
    (SELECT id FROM opp_2),
    (SELECT id FROM user_id),
    'Need to clarify equity terms and expected time commitment.',
    NOW() - INTERVAL '5 hours'
  ); 