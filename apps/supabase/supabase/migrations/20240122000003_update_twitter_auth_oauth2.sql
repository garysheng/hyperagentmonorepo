-- First, drop the old columns
alter table twitter_auth
  drop column if exists oauth_token,
  drop column if exists oauth_token_secret;

-- Then add the new OAuth 2.0 columns
alter table twitter_auth
  add column if not exists access_token text not null,
  add column if not exists refresh_token text; 