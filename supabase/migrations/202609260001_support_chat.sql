-- Run after 202609250002_admin_dashboard.sql. Messages persist per student account.
create table if not exists public.support_messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sender_id uuid not null default auth.uid() references auth.users(id),
  sender_role text not null check (sender_role in ('student', 'staff')),
  body text not null check (length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists support_messages_thread_idx
  on public.support_messages (user_id, created_at, id);
create index if not exists support_messages_unread_idx
  on public.support_messages (user_id, sender_role) where read_at is null;

alter table public.support_messages enable row level security;
revoke all on public.support_messages from public, anon, authenticated;
grant select on public.support_messages to authenticated;
grant insert (user_id, sender_role, body) on public.support_messages to authenticated;
grant update (read_at) on public.support_messages to authenticated;
grant usage on sequence public.support_messages_id_seq to authenticated;

drop policy if exists "Students and staff read support messages" on public.support_messages;
create policy "Students and staff read support messages"
  on public.support_messages for select to authenticated
  using (
    (user_id = (select auth.uid()) and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'student' and p.active
    )) or (select public.is_edubook_staff())
  );

drop policy if exists "Students send their own support messages" on public.support_messages;
create policy "Students send their own support messages"
  on public.support_messages for insert to authenticated
  with check (
    user_id = (select auth.uid()) and sender_id = (select auth.uid())
    and sender_role = 'student' and exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'student' and p.active
    )
  );

drop policy if exists "Staff reply to student support messages" on public.support_messages;
create policy "Staff reply to student support messages"
  on public.support_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid()) and sender_role = 'staff'
    and (select public.is_edubook_staff()) and exists (
      select 1 from public.profiles p where p.id = user_id and p.role = 'student'
    )
  );

drop policy if exists "Students mark staff replies read" on public.support_messages;
create policy "Students mark staff replies read"
  on public.support_messages for update to authenticated
  using (user_id = (select auth.uid()) and sender_role = 'staff')
  with check (user_id = (select auth.uid()) and sender_role = 'staff');

drop policy if exists "Staff mark student messages read" on public.support_messages;
create policy "Staff mark student messages read"
  on public.support_messages for update to authenticated
  using ((select public.is_edubook_staff()) and sender_role = 'student')
  with check ((select public.is_edubook_staff()) and sender_role = 'student');

create or replace function public.list_support_chats()
returns table (
  user_id uuid, full_name text, student_id text, last_body text,
  last_at timestamptz, message_count bigint, unread_count bigint
)
language sql stable security invoker set search_path = ''
as $$
  select m.user_id, p.full_name, p.student_id,
    (array_agg(m.body order by m.created_at desc, m.id desc))[1] as last_body,
    max(m.created_at) as last_at,
    count(*) as message_count,
    count(*) filter (where m.sender_role = 'student' and m.read_at is null) as unread_count
  from public.support_messages m
  join public.profiles p on p.id = m.user_id
  where (select public.is_edubook_staff())
  group by m.user_id, p.full_name, p.student_id
  order by max(m.created_at) desc;
$$;

revoke all on function public.list_support_chats() from public, anon;
grant execute on function public.list_support_chats() to authenticated;
