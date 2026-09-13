-- Support persisting the Weekly Planner, Daily Planner, Goals, Habits,
-- and Weekly Review screens (previously local-state-only UI).

-- Weekly plans: richer priorities + a focus statement + a 7-day map.
alter table public.weekly_plans
  add column if not exists focus text not null default '',
  add column if not exists day_plans jsonb not null default '{}';

alter table public.weekly_plans
  add constraint weekly_plans_user_week_unique unique (user_id, week_of);

-- Daily plans: top-3 outcomes, time-block notes, and a catch-all notes field.
alter table public.daily_plans
  add column if not exists top_three jsonb not null default '[]',
  add column if not exists blocks jsonb not null default '{}',
  add column if not exists notes text not null default '';

alter table public.daily_plans
  add constraint daily_plans_user_date_unique unique (user_id, date);

-- Goals: the dashboard organizes goals into fixed life areas with one
-- scheduled next action each.
alter table public.goals
  add column if not exists area text,
  add column if not exists next_action text not null default '';

alter table public.goals
  add constraint goals_user_area_unique unique (user_id, area);

-- Habits: stable ordering for the habit tracker grid.
alter table public.habits
  add column if not exists position smallint not null default 0;

-- Weekly reviews: an overall alignment score alongside the reflection prompts.
alter table public.weekly_reviews
  add column if not exists alignment_score smallint
    check (alignment_score between 1 and 10) not null default 7;
