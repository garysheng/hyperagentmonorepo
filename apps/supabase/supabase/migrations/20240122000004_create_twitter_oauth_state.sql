create table if not exists twitter_oauth_state (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) not null,
  state text not null,
  code_verifier text not null,
  created_at timestamptz not null default now()
); 