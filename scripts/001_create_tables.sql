-- Create profiles table (references auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamp default now()
);

-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  start_time timestamp not null,
  end_time timestamp not null,
  status text not null default 'BUSY' check (status in ('BUSY', 'SWAPPABLE', 'SWAP_PENDING')),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Create swap_requests table
create table if not exists public.swap_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  responder_id uuid not null references auth.users(id) on delete cascade,
  requester_slot_id uuid not null references public.events(id) on delete cascade,
  responder_slot_id uuid not null references public.events(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING', 'ACCEPTED', 'REJECTED')),
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.swap_requests enable row level security;

-- Profiles RLS policies
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Events RLS policies
create policy "events_select_own" on public.events for select using (auth.uid() = user_id);
create policy "events_select_other_swappable" on public.events for select using (status = 'SWAPPABLE' and auth.uid() != user_id);
create policy "events_insert_own" on public.events for insert with check (auth.uid() = user_id);
create policy "events_update_own" on public.events for update using (auth.uid() = user_id);
create policy "events_delete_own" on public.events for delete using (auth.uid() = user_id);

-- Swap requests RLS policies
create policy "swap_requests_select_own" on public.swap_requests for select using (auth.uid() = requester_id or auth.uid() = responder_id);
create policy "swap_requests_insert_own" on public.swap_requests for insert with check (auth.uid() = requester_id);
create policy "swap_requests_update_own" on public.swap_requests for update using (auth.uid() = responder_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
