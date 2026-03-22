-- Add show_on_map flag for organizations
alter table public.organizations
add column if not exists show_on_map boolean not null default true;
