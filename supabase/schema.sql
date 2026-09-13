create table if not exists public.progress_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null,
  event jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.progress_events enable row level security;

create policy "Users can read their own progress"
  on public.progress_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own progress"
  on public.progress_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.progress_events from anon;
grant select, insert on table public.progress_events to authenticated;
