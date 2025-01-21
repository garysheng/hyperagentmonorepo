-- Create Twitter auth table
create table if not exists user_twitter_auth (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  twitter_id text,
  oauth_token text,
  oauth_token_secret text,
  temp_oauth_token text,
  temp_oauth_token_secret text,
  screen_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id),
  unique(twitter_id)
);

-- Set up RLS
alter table user_twitter_auth enable row level security;

create policy "Users can view their own Twitter auth"
  on user_twitter_auth for select
  using (auth.uid() = user_id);

create policy "Users can update their own Twitter auth"
  on user_twitter_auth for update
  using (auth.uid() = user_id);

create policy "Users can insert their own Twitter auth"
  on user_twitter_auth for insert
  with check (auth.uid() = user_id); 