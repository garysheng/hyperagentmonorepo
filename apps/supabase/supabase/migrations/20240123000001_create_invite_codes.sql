-- Create invite codes table
create table invite_codes (
  id uuid primary key default uuid_generate_v4(),
  celebrity_id uuid references celebrities(id) not null,
  code text unique not null,
  role text not null check (role in ('admin', 'support_agent')),
  created_by uuid references auth.users(id) not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  used_at timestamptz,
  used_by uuid references auth.users(id)
);

-- Index for quick invite code lookups
create index invite_codes_code_idx on invite_codes(code);

-- Function to generate a secure random invite code
create or replace function generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer := 0;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$;

-- Function to create a new invite code
create or replace function create_invite_code(
  p_celebrity_id uuid,
  p_role text,
  p_created_by uuid
) returns table (
  id uuid,
  code text,
  expires_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_code text;
  v_result record;
begin
  -- Generate a unique code
  loop
    v_code := generate_invite_code();
    begin
      insert into invite_codes (celebrity_id, code, role, created_by)
      values (p_celebrity_id, v_code, p_role, p_created_by)
      returning id, code, expires_at into v_result;
      exit;
    exception when unique_violation then
      -- If code already exists, loop will try again
    end;
  end loop;
  
  return query select v_result.id, v_result.code, v_result.expires_at;
end;
$$;

-- Function to validate and use an invite code
create or replace function use_invite_code(
  p_code text,
  p_user_id uuid
) returns table (
  celebrity_id uuid,
  role text
)
language plpgsql
security definer
as $$
declare
  v_invite record;
begin
  -- Get and lock the invite code
  select * into v_invite
  from invite_codes
  where code = upper(p_code)
    and used_at is null
    and expires_at > now()
  for update skip locked;

  if v_invite.id is null then
    raise exception 'Invalid or expired invite code';
  end if;

  -- Mark code as used
  update invite_codes
  set used_at = now(),
      used_by = p_user_id
  where id = v_invite.id;

  -- Return the celebrity_id and role
  return query select v_invite.celebrity_id, v_invite.role;
end;
$$;

-- RLS Policies
alter table invite_codes enable row level security;

-- Admins can see all invite codes for their celebrity
create policy "Admins can see all invite codes"
  on invite_codes for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
        and users.celebrity_id = invite_codes.celebrity_id
    )
  );

-- Admins can create invite codes
create policy "Admins can create invite codes"
  on invite_codes for insert
  with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
        and users.celebrity_id = invite_codes.celebrity_id
    )
  );

-- Function to check if a code is valid (without using it)
create or replace function check_invite_code(p_code text)
returns boolean
language sql
security definer
as $$
  select exists (
    select 1
    from invite_codes
    where code = upper(p_code)
      and used_at is null
      and expires_at > now()
  );
$$; 