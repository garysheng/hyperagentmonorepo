alter table opportunities
  add column if not exists sender_bio text,
  add column if not exists classification_explanation text; 