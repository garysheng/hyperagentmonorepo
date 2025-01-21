-- Delete existing data
DELETE FROM opportunity_actions;
DELETE FROM opportunity_comments;
DELETE FROM opportunity_messages;
DELETE FROM opportunities;
DELETE FROM goals;
DELETE FROM users;
DELETE FROM celebrities;
DELETE FROM auth.users;

-- Insert celebrity
INSERT INTO celebrities (id, celebrity_name, twitter_username, twitter_password, created_at)
VALUES (
  '0ca0f921-7ccd-4975-9afb-3bed98367403',
  'Gary Sheng',
  'garysheng',
  'placeholder_password',
  now()
);

-- Insert admin user
INSERT INTO auth.users (
  id,
  email,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  'aaaaaaaa-0000-4000-a000-000000000000',
  'admin@hyperagent.ai',
  '{"full_name": "Admin User"}'::jsonb,
  now(),
  now()
);

-- Update admin user role
UPDATE users
SET role = 'admin'
WHERE email = 'admin@hyperagent.ai';

-- Insert goals
INSERT INTO goals (id, celebrity_id, name, description, priority, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '0ca0f921-7ccd-4975-9afb-3bed98367403', 'Find Software Engineering Role', 'Connect with great employers for a software engineering position', 1, now()),
  ('33333333-3333-3333-3333-333333333333', '0ca0f921-7ccd-4975-9afb-3bed98367403', 'Find Romantic Partner', 'Meet a romantic partner', 2, now());

-- Insert test celebrity if not exists
INSERT INTO celebrities (id, celebrity_name, twitter_username, twitter_password, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Test Celebrity', 'testceleb', 'test_password_123', NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test goals
INSERT INTO goals (id, celebrity_id, name, description, priority, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Charity Events', 'Looking for meaningful charity collaborations and events', 1, NOW()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Podcast Opportunities', 'Interested in appearing on tech and entrepreneurship podcasts', 2, NOW()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Speaking Engagements', 'Open to speaking at conferences and events about technology', 3, NOW());

-- Insert opportunities (DMs)
INSERT INTO opportunities (
  id, 
  celebrity_id, 
  sender_id, 
  sender_handle, 
  initial_content, 
  relevance_score, 
  status, 
  goal_id, 
  needs_discussion,
  created_at, 
  updated_at
)
VALUES
  -- Tech opportunities
  (
    '44444444-4444-4444-4444-444444444444',
    '0ca0f921-7ccd-4975-9afb-3bed98367403',
    gen_random_uuid(),
    'techrecruiter1',
    'Hi Gary! I''m a tech recruiter at Google and I''d love to chat about some exciting engineering roles we have.',
    4.8,
    'pending',
    '22222222-2222-2222-2222-222222222222',
    false,
    now(),
    now()
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '0ca0f921-7ccd-4975-9afb-3bed98367403',
    gen_random_uuid(),
    'metacareers',
    'We have several senior engineering positions open at Meta. Would you be interested in learning more?',
    4.5,
    'pending',
    '22222222-2222-2222-2222-222222222222',
    true,
    now(),
    now()
  ),
  -- Dating opportunities
  (
    '66666666-6666-6666-6666-666666666666',
    '0ca0f921-7ccd-4975-9afb-3bed98367403',
    gen_random_uuid(),
    'ai_researcher',
    'Hey Gary! I''m a PhD candidate in AI at Stanford. Love your work on AI agents! Would love to grab coffee and discuss consciousness, AGI, and maybe more? 😊',
    4.9,
    'pending',
    '33333333-3333-3333-3333-333333333333',
    false,
    now(),
    now()
  ),
  (
    '77777777-7777-7777-7777-777777777777',
    '0ca0f921-7ccd-4975-9afb-3bed98367403',
    gen_random_uuid(),
    'tech_artist',
    'Hi! I''m a creative technologist who combines AI with interactive art. Your perspective on AI is fascinating. Tea sometime?',
    4.2,
    'pending',
    '33333333-3333-3333-3333-333333333333',
    false,
    now(),
    now()
  );

-- Insert messages
INSERT INTO opportunity_messages (
  id,
  opportunity_id,
  sender_id,
  sender_handle,
  message_content,
  direction,
  created_at
)
VALUES
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    gen_random_uuid(),
    'techrecruiter1',
    'We offer competitive compensation and great benefits!',
    'inbound',
    now()
  ),
  (
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    gen_random_uuid(),
    'ai_researcher',
    'I''m particularly interested in your thoughts on consciousness and AI alignment.',
    'inbound',
    now()
  );

-- Insert comments from admin
INSERT INTO opportunity_comments (
  id,
  opportunity_id,
  user_id,
  content,
  created_at,
  updated_at
)
VALUES
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-0000-4000-a000-000000000000',
    'Google is a top priority. Should respond within 24 hours.',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    '66666666-6666-6666-6666-666666666666',
    'aaaaaaaa-0000-4000-a000-000000000000',
    'Strong match - academic background and shared interests in AI.',
    now(),
    now()
  );

-- Insert actions
INSERT INTO opportunity_actions (
  id,
  opportunity_id,
  user_id,
  action_type,
  old_value,
  new_value,
  created_at
)
VALUES
  (
    gen_random_uuid(),
    '44444444-4444-4444-4444-444444444444',
    'aaaaaaaa-0000-4000-a000-000000000000',
    'score_override',
    '{"score": 4.5}'::jsonb,
    '{"score": 4.8}'::jsonb,
    now()
  ),
  (
    gen_random_uuid(),
    '55555555-5555-5555-5555-555555555555',
    'aaaaaaaa-0000-4000-a000-000000000000',
    'status_change',
    '{"status": "pending"}'::jsonb,
    '{"status": "needs_discussion"}'::jsonb,
    now()
  );