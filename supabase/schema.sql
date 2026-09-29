begin;

create table if not exists public.progress_events (
  user_id uuid not null references auth.users (id) on delete cascade,
  event_id text not null,
  event jsonb not null,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

alter table public.progress_events enable row level security;

drop policy if exists "Users can read their own progress" on public.progress_events;
create policy "Users can read their own progress"
  on public.progress_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own progress" on public.progress_events;
create policy "Users can insert their own progress"
  on public.progress_events
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on table public.progress_events from anon;
grant select, insert on table public.progress_events to authenticated;

create table if not exists public.course_states (
  user_id uuid not null references auth.users (id) on delete cascade,
  state_key text not null,
  saved_at bigint not null,
  payload jsonb not null,
  primary key (user_id, state_key)
);
alter table public.course_states enable row level security;
drop policy if exists "Read own course state" on public.course_states;
create policy "Read own course state" on public.course_states for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Insert own course state" on public.course_states;
create policy "Insert own course state" on public.course_states for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Update own course state" on public.course_states;
create policy "Update own course state" on public.course_states for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on table public.course_states from anon;
grant select, insert, update on table public.course_states to authenticated;

create or replace function public.save_course_state(p_key text, p_saved_at bigint, p_payload jsonb)
returns void language sql security invoker set search_path = public as $$
  insert into public.course_states(user_id,state_key,saved_at,payload)
  values(auth.uid(),p_key,p_saved_at,p_payload)
  on conflict(user_id,state_key) do update
    set saved_at=excluded.saved_at,payload=excluded.payload
    where excluded.saved_at >= course_states.saved_at;
$$;
revoke all on function public.save_course_state(text,bigint,jsonb) from public;
grant execute on function public.save_course_state(text,bigint,jsonb) to authenticated;

commit;
