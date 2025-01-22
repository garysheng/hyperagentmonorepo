create table if not exists twitter_temp_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  oauth_token text not null,
  oauth_token_secret text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
); 