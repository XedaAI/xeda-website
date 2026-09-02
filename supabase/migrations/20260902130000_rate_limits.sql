-- Durable, shared rate limiting for edge functions.
--
-- Replaces the per-isolate `new Map()` limiters in send-contact-email and
-- subscribe-newsletter, which reset on every cold start and were never shared
-- between concurrent isolates -- i.e. they were not a control at all.
--
-- State lives here so every isolate sees the same counters.

create table if not exists public.rate_limits (
  bucket        text        not null,
  identifier    text        not null,
  request_count integer     not null default 0,
  window_start  timestamptz not null default now(),
  primary key (bucket, identifier)
);

comment on table public.rate_limits is
  'Edge function rate-limit counters. Service-role only; never exposed to clients.';

create index if not exists rate_limits_window_start_idx
  on public.rate_limits (window_start);

-- RLS on with NO policies: anon and authenticated can reach nothing here.
-- The service role bypasses RLS, so only edge functions can read or write it.
alter table public.rate_limits enable row level security;

revoke all on table public.rate_limits from anon, authenticated;

-- Atomically bump the counter for (bucket, identifier) and report whether the
-- caller is still under the limit. Windows are fixed, not sliding: the first
-- request starts the window and it resets once p_window has elapsed.
create or replace function public.check_rate_limit(
  p_bucket     text,
  p_identifier text,
  p_max        integer,
  p_window     interval
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  insert into public.rate_limits as rl (bucket, identifier, request_count, window_start)
  values (p_bucket, p_identifier, 1, now())
  on conflict (bucket, identifier) do update
    set request_count = case
          when rl.window_start < now() - p_window then 1
          else rl.request_count + 1
        end,
        window_start = case
          when rl.window_start < now() - p_window then now()
          else rl.window_start
        end
  returning rl.request_count into v_count;

  -- Opportunistic cleanup so the table cannot grow without bound. Roughly one
  -- call in a hundred pays for it; no pg_cron dependency.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_count <= p_max;
end;
$$;

-- SECURITY DEFINER functions are executable by PUBLIC by default. Without this
-- revoke, any anon caller could hit the RPC directly and inflate or reset the
-- very counters that are supposed to restrain them.
revoke all on function public.check_rate_limit(text, text, integer, interval)
  from public, anon, authenticated;

grant execute on function public.check_rate_limit(text, text, integer, interval)
  to service_role;
