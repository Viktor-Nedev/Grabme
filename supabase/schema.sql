-- Grabme schema + RLS policies
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key,
  role text not null check (role in ('user', 'organization')),
  name text not null,
  email text not null unique,
  phone text,
  avatar_url text,
  location_text text,
  lat double precision,
  lng double precision,
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organization_name text not null,
  address text not null,
  organization_type text not null,
  operating_hours text,
  capacity integer not null default 0,
  food_types text[] not null default '{}',
  verified boolean not null default false,
  lat double precision,
  lng double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  category text not null,
  quantity text not null,
  expiry_date timestamptz not null,
  pickup_address text not null,
  lat double precision,
  lng double precision,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  available_from timestamptz,
  available_until timestamptz,
  storage_type text,
  notes text,
  image_url text
);

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  comment text,
  people_count integer not null default 1,
  urgency text not null check (urgency in ('low','medium','high','critical')),
  food_type text not null,
  location_text text,
  lat double precision,
  lng double precision,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  image_url text
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null,
  event_date timestamptz not null,
  address text not null,
  lat double precision,
  lng double precision,
  food_type text not null,
  capacity integer not null,
  notes text,
  status text not null default 'scheduled',
  created_at timestamptz not null default now(),
  image_url text
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.donations enable row level security;
alter table public.requests enable row level security;
alter table public.events enable row level security;
alter table public.comments enable row level security;

-- Profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- Organizations policies
create policy "organizations_select_all" on public.organizations for select using (true);
create policy "organizations_insert_owner" on public.organizations
  for insert with check (auth.uid() = profile_id);
create policy "organizations_update_owner" on public.organizations
  for update using (auth.uid() = profile_id);

-- Donations policies
create policy "donations_select_all" on public.donations for select using (true);
create policy "donations_insert_owner" on public.donations
  for insert with check (
    (profile_id = auth.uid())
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );
create policy "donations_update_owner" on public.donations
  for update using (
    (profile_id = auth.uid())
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );
create policy "donations_delete_owner" on public.donations
  for delete using (
    (profile_id = auth.uid())
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

-- Requests policies
create policy "requests_select_all" on public.requests for select using (true);
create policy "requests_insert_owner" on public.requests
  for insert with check (auth.uid() = profile_id);
create policy "requests_update_owner" on public.requests
  for update using (auth.uid() = profile_id);
create policy "requests_delete_owner" on public.requests
  for delete using (auth.uid() = profile_id);

-- Events policies
create policy "events_select_all" on public.events for select using (true);
create policy "events_insert_owner" on public.events
  for insert with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );
create policy "events_update_owner" on public.events
  for update using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );
create policy "events_delete_owner" on public.events
  for delete using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

-- Comments policies
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_owner" on public.comments
  for insert with check (auth.uid() = profile_id);
create policy "comments_update_owner" on public.comments
  for update using (auth.uid() = profile_id);
create policy "comments_delete_owner" on public.comments
  for delete using (auth.uid() = profile_id);

-- Storage bucket + policies
insert into storage.buckets (id, name, public)
values ('grabme-assets', 'grabme-assets', true)
on conflict (id) do nothing;

create policy "assets_read_all" on storage.objects
  for select using (bucket_id = 'grabme-assets');

create policy "assets_insert_auth" on storage.objects
  for insert with check (bucket_id = 'grabme-assets' and auth.role() = 'authenticated');

create policy "assets_update_owner" on storage.objects
  for update using (bucket_id = 'grabme-assets' and auth.uid() = owner);

create policy "assets_delete_owner" on storage.objects
  for delete using (bucket_id = 'grabme-assets' and auth.uid() = owner);
