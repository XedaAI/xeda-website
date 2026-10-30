-- BS-74: website chat transcripts are kept for 30 days, then deleted.
--
-- Art. 5(1)(e) DSGVO (storage limitation). Until now chat_conversations and
-- chat_messages grew forever. The widget tells the visitor about the 30 days in
-- its first message, so this job is what makes that sentence true.
--
-- A real schedule rather than the opportunistic cleanup rate_limits uses: that
-- pattern only runs when someone calls the function, so a quiet month would
-- leave month-old transcripts in place -- fine for counters, not for a promise
-- made to the person whose words they are.

create or replace function public.purge_website_chats()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  -- Messages by their own age, so a long-running conversation does not keep
  -- its oldest lines alive.
  delete from public.chat_messages
   where created_at < now() - interval '30 days';

  -- Then conversations nobody has touched in 30 days. Any messages they still
  -- hold go with them by the existing ON DELETE CASCADE.
  delete from public.chat_conversations
   where updated_at < now() - interval '30 days';
end;
$$;

-- Callable by the scheduler (runs as postgres) and nothing client-facing.
revoke all on function public.purge_website_chats() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;

-- Idempotent: drop any earlier copy of the job before scheduling it, so a
-- re-run of this migration cannot fail or leave two jobs behind.
select cron.unschedule(jobid) from cron.job where jobname = 'purge-website-chats';

-- Daily at 03:17 UTC, off the hour to stay clear of other scheduled work.
-- Worst case a message survives 30 days plus up to one day.
select cron.schedule(
  'purge-website-chats',
  '17 3 * * *',
  $$select public.purge_website_chats()$$
);
