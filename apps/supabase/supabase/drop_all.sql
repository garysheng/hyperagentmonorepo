-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS opportunity_comments CASCADE;
DROP TABLE IF EXISTS opportunity_actions CASCADE;
DROP TABLE IF EXISTS opportunity_messages CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS celebrities CASCADE;

-- Drop any extensions we created
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE; 