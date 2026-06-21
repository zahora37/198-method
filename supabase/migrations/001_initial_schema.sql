-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  tier text not null default 'free' check (tier in ('free', 'pro', 'premium')),
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Time categories
create table public.time_categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  hours_per_week numeric(5,2) not null default 0,
  target_hours numeric(5,2),
  color text default '#6366f1',
  created_at timestamptz not null default now()
);

alter table public.time_categories enable row level security;

create policy "Users can manage own time categories"
  on public.time_categories for all
  using (auth.uid() = user_id);

-- Weekly plans
create table public.weekly_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_of date not null,
  top_priorities jsonb default '[]',
  status text not null default 'draft' check (status in ('draft', 'active', 'complete')),
  created_at timestamptz not null default now()
);

alter table public.weekly_plans enable row level security;

create policy "Users can manage own weekly plans"
  on public.weekly_plans for all
  using (auth.uid() = user_id);

-- Daily plans
create table public.daily_plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date not null,
  tasks jsonb default '[]',
  energy_level smallint check (energy_level between 1 and 5),
  weekly_plan_id uuid references public.weekly_plans(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.daily_plans enable row level security;

create policy "Users can manage own daily plans"
  on public.daily_plans for all
  using (auth.uid() = user_id);

-- Goals
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'complete', 'archived')),
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id);

-- Habits
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  created_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Users can manage own habits"
  on public.habits for all
  using (auth.uid() = user_id);

-- Habit logs
create table public.habit_logs (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid references public.habits(id) on delete cascade not null,
  completed_date date not null,
  created_at timestamptz not null default now(),
  unique(habit_id, completed_date)
);

alter table public.habit_logs enable row level security;

create policy "Users can manage own habit logs"
  on public.habit_logs for all
  using (
    auth.uid() = (select user_id from public.habits where id = habit_id)
  );

-- Weekly reviews
create table public.weekly_reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  week_of date not null,
  what_worked text,
  what_didnt text,
  time_reflection text,
  next_change text,
  created_at timestamptz not null default now(),
  unique(user_id, week_of)
);

alter table public.weekly_reviews enable row level security;

create policy "Users can manage own weekly reviews"
  on public.weekly_reviews for all
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
