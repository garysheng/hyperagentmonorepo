-- Make twitter_username nullable
alter table celebrities
  alter column twitter_username drop not null; 