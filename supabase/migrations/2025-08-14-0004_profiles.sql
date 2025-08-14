-- Profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  namibian_id text,
  company_name text,
  account_type text check (account_type in ('individual','business','enterprise','government')) default 'individual',
  is_verified boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- RLS: owner can read/update own profile
create policy if not exists profiles_select_self on public.profiles for select using (auth.uid() = id);
create policy if not exists profiles_update_self on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Update trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles for each row execute function public.set_updated_at();

