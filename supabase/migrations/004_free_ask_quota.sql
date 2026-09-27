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
  if account_id is null then raise exception 'Sign in required'; end if;
  select p.tier into account_tier from public.profiles p where p.id = account_id;
  cap := case account_tier when 'pro' then 300 when 'premium' then 300 else 10 end;
  insert into public.ask_168_usage (user_id, month_start, question_count)
  values (account_id, period_start, 1)
  on conflict (user_id, month_start) do update
    set question_count = public.ask_168_usage.question_count + 1
    where public.ask_168_usage.question_count < cap
  returning question_count into new_count;
  claimed := new_count is not null;
  if new_count is null then
    select a.question_count into new_count from public.ask_168_usage a
    where a.user_id = account_id and a.month_start = period_start;
  end if;
  return query select claimed, coalesce(new_count, cap), cap;
end;
$$;
