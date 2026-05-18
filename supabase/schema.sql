-- LyricForge v1 schema
-- Run this in Supabase SQL Editor after creating your project.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  credits_remaining integer not null default 2 check (credits_remaining >= 0),
  credits_used integer not null default 0 check (credits_used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.generation_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  model text,
  credits_before integer not null,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.reserve_generation_credit(p_user_id uuid)
returns table (credits_before integer, credits_after integer)
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    credits_remaining = credits_remaining - 1,
    credits_used = credits_used + 1
  where id = p_user_id
    and credits_remaining > 0
  returning credits_remaining + 1, credits_remaining
  into credits_before, credits_after;

  if not found then
    raise exception 'no_credits';
  end if;

  return next;
end;
$$;

create or replace function public.refund_reserved_credit(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set
    credits_remaining = credits_remaining + 1,
    credits_used = greatest(credits_used - 1, 0)
  where id = p_user_id;
end;
$$;

create or replace function public.log_generation(
  p_user_id uuid,
  p_provider text,
  p_model text,
  p_credits_before integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.generation_log (user_id, provider, model, credits_before)
  values (p_user_id, p_provider, p_model, p_credits_before);
end;
$$;

-- Compatibility function for future synchronous music providers.
create or replace function public.deduct_credit_and_log(
  p_user_id uuid,
  p_provider text,
  p_model text
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_credits_before integer;
  v_credits_after integer;
begin
  update public.profiles
  set
    credits_remaining = credits_remaining - 1,
    credits_used = credits_used + 1
  where id = p_user_id
    and credits_remaining > 0
  returning credits_remaining + 1, credits_remaining
  into v_credits_before, v_credits_after;

  if not found then
    raise exception 'no_credits';
  end if;

  insert into public.generation_log (user_id, provider, model, credits_before)
  values (p_user_id, p_provider, p_model, v_credits_before);

  return v_credits_after;
end;
$$;

alter table public.profiles enable row level security;
alter table public.generation_log enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can read own log" on public.generation_log;
create policy "Users can read own log"
  on public.generation_log
  for select
  to authenticated
  using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.generation_log to authenticated;

-- Server-side proxy functions use the Supabase secret/service role key.
-- These grants keep server credit operations working even when projects use
-- stricter default table privileges.
grant usage on schema public to service_role;
grant select, insert, update on public.profiles to service_role;
grant select, insert, update on public.generation_log to service_role;
grant execute on function public.reserve_generation_credit(uuid) to service_role;
grant execute on function public.refund_reserved_credit(uuid) to service_role;
grant execute on function public.log_generation(uuid, text, text, integer) to service_role;
grant execute on function public.deduct_credit_and_log(uuid, text, text) to service_role;
