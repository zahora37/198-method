-- 168 Method product core
-- Converts the prototype tables into a connected product model.
-- Additive only: existing Track and My 168 data is preserved.

create extension if not exists "uuid-ossp";

-- Shared user categories used across My 168, Track, Focus, Dashboard, and Ask 168.
create table if not exists public.user_categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text not null default '#ddd6fe',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

alter table public.user_categories enable row level security;

drop policy if exists "Users can view own categories" on public.user_categories;
create policy "Users can view own categories" on public.user_categories for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own categories" on public.user_categories;
create policy "Users can insert own categories" on public.user_categories for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own categories" on public.user_categories;
create policy "Users can update own categories" on public.user_categories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own categories" on public.user_categories;
create policy "Users can delete own categories" on public.user_categories for delete using (auth.uid() = user_id);

-- Shared updated_at trigger helper.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_user_categories_updated_at on public.user_categories;
create trigger set_user_categories_updated_at
  before update on public.user_categories
  for each row execute function public.set_updated_at();

-- Extend existing time_blocks without deleting existing schedule data.
alter table public.time_blocks
  add column if not exists track_item_id uuid,
  add column if not exists recurrence_group_id uuid,
  add column if not exists category_id uuid references public.user_categories(id) on delete set null;

create index if not exists time_blocks_user_start_idx on public.time_blocks(user_id, start_at);
create index if not exists time_blocks_track_item_idx on public.time_blocks(track_item_id);
create index if not exists time_blocks_recurrence_group_idx on public.time_blocks(recurrence_group_id);

-- Extend existing Track table. Existing columns such as due_date, repeat_rule,
-- reminder, time_needed_minutes, priority, amount, auto_pay, notes, status,
-- last_completed_at, created_at, and updated_at remain the source of truth.
alter table public.track_items
  add column if not exists category_id uuid references public.user_categories(id) on delete set null,
  add column if not exists workflow_status text not null default 'inbox',
  add column if not exists completed_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists recurrence_group_id uuid;

-- Separate workflow location from outcome status.
-- status can continue to mean Upcoming / Overdue / Completed.
-- workflow_status powers Inbox / Planned / In Progress / Completed / Archived.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'track_items_workflow_status_check') then
    alter table public.track_items
      add constraint track_items_workflow_status_check
      check (workflow_status in ('inbox', 'planned', 'in_progress', 'completed', 'archived'));
  end if;
end $$;

create index if not exists track_items_user_workflow_idx on public.track_items(user_id, workflow_status);
create index if not exists track_items_recurrence_group_idx on public.track_items(recurrence_group_id);

-- Reuse the existing updated_at column.
drop trigger if exists set_track_items_updated_at on public.track_items;
create trigger set_track_items_updated_at
  before update on public.track_items
  for each row execute function public.set_updated_at();

-- Link a calendar block back to the Track responsibility that created it.
do $$
declare
  track_id_type text;
begin
  select data_type into track_id_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'track_items' and column_name = 'id';

  if track_id_type = 'uuid' and not exists (
    select 1 from pg_constraint where conname = 'time_blocks_track_item_id_fkey'
  ) then
    alter table public.time_blocks
      add constraint time_blocks_track_item_id_fkey
      foreign key (track_item_id) references public.track_items(id) on delete set null;
  end if;
end $$;

-- Completion history preserves past completions while recurring Track items continue forward.
create table if not exists public.track_item_completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  track_item_id uuid,
  completed_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

alter table public.track_item_completions enable row level security;

drop policy if exists "Users can view own completion history" on public.track_item_completions;
create policy "Users can view own completion history" on public.track_item_completions for select using (auth.uid() = user_id);
drop policy if exists "Users can insert own completion history" on public.track_item_completions;
create policy "Users can insert own completion history" on public.track_item_completions for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update own completion history" on public.track_item_completions;
create policy "Users can update own completion history" on public.track_item_completions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Users can delete own completion history" on public.track_item_completions;
create policy "Users can delete own completion history" on public.track_item_completions for delete using (auth.uid() = user_id);

create index if not exists track_item_completions_user_idx on public.track_item_completions(user_id, completed_at desc);
create index if not exists track_item_completions_item_idx on public.track_item_completions(track_item_id);

-- Seed one shared pastel category palette for each account.
insert into public.user_categories (user_id, name, color, sort_order)
select u.id, v.name, v.color, v.sort_order
from auth.users u
cross join (values
  ('Sleep', '#ddd6fe', 10),
  ('Work', '#dbeafe', 20),
  ('Family', '#fce7f3', 30),
  ('Health', '#d1fae5', 40),
  ('Home', '#fef3c7', 50),
  ('Personal', '#f3e8ff', 60),
  ('Education', '#ccfbf1', 70),
  ('Social', '#ffedd5', 80),
  ('Finance', '#f5f0e6', 90),
  ('Vehicle', '#e0f2fe', 100),
  ('Subscription', '#fae8ff', 110),
  ('Other', '#e7e5e4', 120)
) as v(name, color, sort_order)
where not exists (
  select 1 from public.user_categories c where c.user_id = u.id
)
on conflict (user_id, name) do nothing;
