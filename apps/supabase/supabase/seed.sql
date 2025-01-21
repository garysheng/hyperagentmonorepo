-- Delete existing data
DELETE FROM opportunity_comments;
DELETE FROM opportunities;
DELETE FROM goals;
DELETE FROM users;
DELETE FROM celebrities;

-- Insert celebrity
INSERT INTO celebrities (id, celebrity_name, twitter_username, twitter_password, created_at)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Gary Sheng',
  'garysheng',
  'placeholder_password',
  now()
);

-- Insert user profile
INSERT INTO users (id, email, role, full_name, celebrity_id, created_at)
VALUES (
  '1575508b-6997-4d35-aa43-514d7b502dd9',
  'garysheng11@gmail.com',
  'celebrity',
  'Gary Sheng',
  '11111111-1111-1111-1111-111111111111',
  now()
);

-- Insert goals
INSERT INTO goals (id, celebrity_id, name, description, priority, created_at)
VALUES
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Find Software Engineering Role', 'Connect with great employers for a software engineering position', 1, now()),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Find Romantic Partner', 'Meet a romantic partner', 2, now());

-- Insert opportunities (DMs)
INSERT INTO opportunities (id, celebrity_id, sender_id, sender_handle, initial_content, relevance_score, status, goal_id, created_at, updated_at)
VALUES
  -- Tech opportunities
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'techrecruiter1', 'Hi Gary! I''m a tech recruiter at Google and I''d love to chat about some exciting engineering roles we have.', 5, 'pending', '22222222-2222-2222-2222-222222222222', now(), now()),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'metacareers', 'We have several senior engineering positions open at Meta. Would you be interested in learning more?', 5, 'pending', '22222222-2222-2222-2222-222222222222', now(), now()),
  
  -- Dating/Romantic opportunities
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'ai_researcher', 'Hey Gary! I''m a PhD candidate in AI at Stanford. Love your work on AI agents! Would love to grab coffee and discuss consciousness, AGI, and maybe more? 😊', 5, 'pending', '33333333-3333-3333-3333-333333333333', now(), now()),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'tech_artist', 'Hi! I''m a creative technologist who combines AI with interactive art. Your perspective on AI is fascinating. Tea sometime?', 4, 'pending', '33333333-3333-3333-3333-333333333333', now(), now()),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'startup_ceo', 'Hey Gary - founder of an AI ethics startup here. Love rock climbing and philosophy too. Would love to connect over dinner!', 4, 'pending', '33333333-3333-3333-3333-333333333333', now(), now()),
  ('99999999-9999-9999-9999-999999999999', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'yoga_teacher', 'Your tweets about consciousness and AI caught my eye. I teach yoga and study neuroscience. Coffee and deep conversations?', 3, 'pending', '33333333-3333-3333-3333-333333333333', now(), now()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'product_designer', 'Hi Gary! UX designer working on AI products. Also into meditation and effective altruism. Would love to chat over boba!', 4, 'pending', '33333333-3333-3333-3333-333333333333', now(), now()),
  
  -- Services/Other
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'datingcoach', 'I help tech professionals find meaningful relationships. Let me know if you''d like some tips!', 2, 'pending', null, now(), now()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', gen_random_uuid(), 'matchmaker', 'I specialize in matchmaking for busy professionals. I might have the perfect match for you!', 2, 'pending', null, now(), now());

-- Insert comments
INSERT INTO opportunity_comments (id, opportunity_id, user_id, content, created_at, updated_at)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', '1575508b-6997-4d35-aa43-514d7b502dd9', 'Interesting opportunity at Google, should follow up.', now(), now()),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '66666666-6666-6666-6666-666666666666', '1575508b-6997-4d35-aa43-514d7b502dd9', 'Great background and shared interests. Stanford connection is a plus.', now(), now()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '77777777-7777-7777-7777-777777777777', '1575508b-6997-4d35-aa43-514d7b502dd9', 'Creative and technical background is intriguing. Worth exploring.', now(), now()),
  ('11111111-1111-1111-1111-111111111112', '88888888-8888-8888-8888-888888888888', '1575508b-6997-4d35-aa43-514d7b502dd9', 'Founder, into climbing and philosophy - lots of common interests.', now(), now());