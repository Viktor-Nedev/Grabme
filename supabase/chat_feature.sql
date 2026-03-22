-- Grabme chat + event participation migration
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

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

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;
alter table public.event_participants enable row level security;

drop policy if exists "conversations_select_members" on public.conversations;
create policy "conversations_select_members" on public.conversations
  for select using (
    type = 'group'
    or public.is_conversation_member(conversations.id)
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
      where c.id = conversation_members.conversation_id
        and c.created_by_profile_id = auth.uid()
    )
  );

drop policy if exists "conversation_members_update_admin" on public.conversation_members;
create policy "conversation_members_update_admin" on public.conversation_members
  for update using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_members.conversation_id
        and c.created_by_profile_id = auth.uid()
    )
  );

drop policy if exists "conversation_members_delete_self_or_admin" on public.conversation_members;
create policy "conversation_members_delete_self_or_admin" on public.conversation_members
  for delete using (
    auth.uid() = profile_id
    or exists (
      select 1 from public.conversations c
      where c.id = conversation_members.conversation_id
        and c.created_by_profile_id = auth.uid()
    )
  );

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
