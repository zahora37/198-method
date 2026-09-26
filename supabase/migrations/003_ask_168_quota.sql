-- Calendar-month limits for Ask 168. Months start at 00:00 UTC on the first.
-- Apply after 001_initial_schema.sql and 002_product_core.sql.

create table if not exists public.ask_168_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  month_start date not null,
  question_count integer not null default 0 check (question_count >= 0),
  primary key (user_id, month_start)
);

alter table public.ask_168_usage enable row level security;

create policy "Users can read own Ask 168 usage"
  on public.ask_168_usage for select to authenticated
  using (auth.uid() = user_id);

-- Only the trusted function below can change usage counts.
revoke insert, update, delete on public.ask_168_usage from public, anon, authenticated;
grant select on public.ask_168_usage to authenticated;

-- Subscription tiers are set by Stripe's server-side webhook, not by clients.
revoke update on public.profiles from public, anon, authenticated;

create or replace function public.claim_ask_168_question()
returns table (allowed boolean, used integer, monthly_limit integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  account_id uuid := auth.uid();
  account_tier text;
  period_start date := date_trunc('month', now() at time zone 'UTC')::date;
  new_count integer;
  cap integer;
  claimed boolean;
begin
  if account_id is null then
    raise exception 'Sign in required';
  end if;

  select p.tier into account_tier from public.profiles p where p.id = account_id;
  cap := case account_tier when 'pro' then 100 when 'premium' then 300 else 0 end;
  if cap = 0 then
    return query select false, 0, cap;
    return;
  end if;

  insert into public.ask_168_usage (user_id, month_start, question_count)
  values (account_id, period_start, 1)
  on conflict (user_id, month_start) do update
    set question_count = public.ask_168_usage.question_count + 1
    where public.ask_168_usage.question_count < cap
  returning question_count into new_count;
  claimed := new_count is not null;

  if new_count is null then
    select a.question_count into new_count
    from public.ask_168_usage a
    where a.user_id = account_id and a.month_start = period_start;
  end if;
  return query select claimed, coalesce(new_count, cap), cap;
end;
$$;

revoke all on function public.claim_ask_168_question() from public, anon;
grant execute on function public.claim_ask_168_question() to authenticated;
