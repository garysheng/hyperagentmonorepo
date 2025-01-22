alter table twitter_auth
  add column if not exists screen_name text,
  add column if not exists twitter_id text; 