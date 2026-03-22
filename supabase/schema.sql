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
  show_on_map boolean not null default true,
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
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all" on public.profiles for select using (true);

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update using (auth.uid() = id);

-- Organizations policies
drop policy if exists "organizations_select_all" on public.organizations;
create policy "organizations_select_all" on public.organizations for select using (true);

drop policy if exists "organizations_insert_owner" on public.organizations;
create policy "organizations_insert_owner" on public.organizations
  for insert with check (auth.uid() = profile_id);

drop policy if exists "organizations_update_owner" on public.organizations;
create policy "organizations_update_owner" on public.organizations
  for update using (auth.uid() = profile_id);

-- Donations policies
drop policy if exists "donations_select_all" on public.donations;
create policy "donations_select_all" on public.donations for select using (true);

drop policy if exists "donations_insert_owner" on public.donations;
create policy "donations_insert_owner" on public.donations
  for insert with check (
    (profile_id = auth.uid())
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists "donations_update_owner" on public.donations;
create policy "donations_update_owner" on public.donations
  for update using (
    (profile_id = auth.uid())
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists "donations_delete_owner" on public.donations;
create policy "donations_delete_owner" on public.donations
  for delete using (
    (profile_id = auth.uid())
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

-- Requests policies
drop policy if exists "requests_select_all" on public.requests;
create policy "requests_select_all" on public.requests for select using (true);

drop policy if exists "requests_insert_owner" on public.requests;
create policy "requests_insert_owner" on public.requests
  for insert with check (auth.uid() = profile_id);

drop policy if exists "requests_update_owner" on public.requests;
create policy "requests_update_owner" on public.requests
  for update using (auth.uid() = profile_id);

drop policy if exists "requests_delete_owner" on public.requests;
create policy "requests_delete_owner" on public.requests
  for delete using (auth.uid() = profile_id);

-- Events policies
drop policy if exists "events_select_all" on public.events;
create policy "events_select_all" on public.events for select using (true);

drop policy if exists "events_insert_owner" on public.events;
create policy "events_insert_owner" on public.events
  for insert with check (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists "events_update_owner" on public.events;
create policy "events_update_owner" on public.events
  for update using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

drop policy if exists "events_delete_owner" on public.events;
create policy "events_delete_owner" on public.events
  for delete using (
    exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.profile_id = auth.uid()
    )
  );

-- Comments policies
drop policy if exists "comments_select_all" on public.comments;
create policy "comments_select_all" on public.comments for select using (true);

drop policy if exists "comments_insert_owner" on public.comments;
create policy "comments_insert_owner" on public.comments
  for insert with check (auth.uid() = profile_id);

drop policy if exists "comments_update_owner" on public.comments;
create policy "comments_update_owner" on public.comments
  for update using (auth.uid() = profile_id);

drop policy if exists "comments_delete_owner" on public.comments;
create policy "comments_delete_owner" on public.comments
  for delete using (auth.uid() = profile_id);

-- Chat + event participation tables
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('direct', 'group')),
  title text,
  event_id uuid references public.events(id) on delete set null,
  created_by_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists conversations_event_group_unique
on public.conversations(event_id)
where event_id is not null and type = 'group';

create table if not exists public.conversation_members (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  unique (conversation_id, profile_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'going' check (status in ('going')),
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists(
    select 1
    from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.profile_id = auth.uid()
  );
$$;

create or replace function public.touch_conversation_updated_at()
returns trigger as $$
begin
  update public.conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_conversation_updated_at_trigger on public.messages;
create trigger touch_conversation_updated_at_trigger
after insert on public.messages
for each row
execute function public.touch_conversation_updated_at();

-- Enable RLS on new tables
alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.event_participants enable row level security;

-- Conversation policies
drop policy if exists "conversations_select_members" on public.conversations;
create policy "conversations_select_members" on public.conversations
  for select using (
    type = 'group'
    or
    public.is_conversation_member(conversations.id)
  );

drop policy if exists "conversations_insert_creator" on public.conversations;
create policy "conversations_insert_creator" on public.conversations
  for insert with check (auth.uid() = created_by_profile_id);

drop policy if exists "conversations_update_admin" on public.conversations;
create policy "conversations_update_admin" on public.conversations
  for update using (
    created_by_profile_id = auth.uid()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversations.id
        and cm.profile_id = auth.uid()
        and cm.role = 'admin'
    )
  );

drop policy if exists "conversations_delete_admin" on public.conversations;
create policy "conversations_delete_admin" on public.conversations
  for delete using (
    created_by_profile_id = auth.uid()
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = conversations.id
        and cm.profile_id = auth.uid()
        and cm.role = 'admin'
    )
  );

-- Conversation members policies
drop policy if exists "conversation_members_select_members" on public.conversation_members;
create policy "conversation_members_select_members" on public.conversation_members
  for select using (
    public.is_conversation_member(conversation_members.conversation_id)
  );

drop policy if exists "conversation_members_insert_member_or_admin" on public.conversation_members;
create policy "conversation_members_insert_member_or_admin" on public.conversation_members
  for insert with check (
    auth.uid() = profile_id
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.created_by_profile_id = auth.uid()
    )
  );

drop policy if exists "conversation_members_update_admin" on public.conversation_members;
create policy "conversation_members_update_admin" on public.conversation_members
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.created_by_profile_id = auth.uid()
    )
  );

drop policy if exists "conversation_members_delete_self_or_admin" on public.conversation_members;
create policy "conversation_members_delete_self_or_admin" on public.conversation_members
  for delete using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and c.created_by_profile_id = auth.uid()
    )
  );

-- Message policies
drop policy if exists "messages_select_members" on public.messages;
create policy "messages_select_members" on public.messages
  for select using (
    public.is_conversation_member(messages.conversation_id)
  );

drop policy if exists "messages_insert_member_sender" on public.messages;
create policy "messages_insert_member_sender" on public.messages
  for insert with check (
    auth.uid() = profile_id
    and exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.profile_id = auth.uid()
    )
  );

drop policy if exists "messages_delete_sender_or_admin" on public.messages;
create policy "messages_delete_sender_or_admin" on public.messages
  for delete using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.conversation_members cm
      where cm.conversation_id = messages.conversation_id
        and cm.profile_id = auth.uid()
        and cm.role = 'admin'
    )
  );

-- Event participants policies
drop policy if exists "event_participants_select_all" on public.event_participants;
create policy "event_participants_select_all" on public.event_participants
  for select using (true);

drop policy if exists "event_participants_insert_self" on public.event_participants;
create policy "event_participants_insert_self" on public.event_participants
  for insert with check (auth.uid() = profile_id);

drop policy if exists "event_participants_delete_self_or_owner" on public.event_participants;
create policy "event_participants_delete_self_or_owner" on public.event_participants
  for delete using (
    auth.uid() = profile_id
    or exists (
      select 1
      from public.events e
      join public.organizations o on o.id = e.organization_id
      where e.id = event_participants.event_id
        and o.profile_id = auth.uid()
    )
  );

-- Grants (avoid 403s for anon/authenticated with RLS still enforcing access)
grant select on public.conversations to anon, authenticated;
grant select, insert, update, delete on public.conversations to authenticated;

grant select on public.conversation_members to anon, authenticated;
grant select, insert, update, delete on public.conversation_members to authenticated;

grant select on public.messages to anon, authenticated;
grant select, insert, update, delete on public.messages to authenticated;

grant select on public.event_participants to anon, authenticated;
grant select, insert, update, delete on public.event_participants to authenticated;

-- Storage bucket + policies
insert into storage.buckets (id, name, public)
values ('grabme-assets', 'grabme-assets', true)
on conflict (id) do nothing;

drop policy if exists "assets_read_all" on storage.objects;
create policy "assets_read_all" on storage.objects
  for select using (bucket_id = 'grabme-assets');

drop policy if exists "assets_insert_auth" on storage.objects;
create policy "assets_insert_auth" on storage.objects
  for insert with check (bucket_id = 'grabme-assets' and auth.role() = 'authenticated');

drop policy if exists "assets_update_owner" on storage.objects;
create policy "assets_update_owner" on storage.objects
  for update using (bucket_id = 'grabme-assets' and auth.uid() = owner);

drop policy if exists "assets_delete_owner" on storage.objects;
create policy "assets_delete_owner" on storage.objects
  for delete using (bucket_id = 'grabme-assets' and auth.uid() = owner);
