-- Run once in Supabase SQL Editor after 202609240001_edubook.sql.
-- Staff can manage books, orders and student accounts. Only root admins manage staff roles.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'subadmin', 'admin'));
alter table public.profiles add column if not exists active boolean not null default true;

create or replace function public.is_edubook_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and active
  );
$$;

create or replace function public.is_edubook_staff()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'subadmin') and active
  );
$$;

drop policy if exists "Read own or admin profiles" on public.profiles;
create policy "Read own or staff profiles" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_edubook_staff()));

drop policy if exists "Read admin books" on public.books;
create policy "Read staff books" on public.books for select to authenticated
using ((select public.is_edubook_staff()));
drop policy if exists "Admin inserts books" on public.books;
create policy "Staff inserts books" on public.books for insert to authenticated
with check ((select public.is_edubook_staff()));
drop policy if exists "Admin updates books" on public.books;
create policy "Staff updates books" on public.books for update to authenticated
using ((select public.is_edubook_staff())) with check ((select public.is_edubook_staff()));

drop policy if exists "Read own or admin orders" on public.orders;
create policy "Read own or staff orders" on public.orders for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_edubook_staff()));
drop policy if exists "Admin updates order status" on public.orders;
create policy "Staff updates order status" on public.orders for update to authenticated
using ((select public.is_edubook_staff())) with check ((select public.is_edubook_staff()));
drop policy if exists "Read own or admin order items" on public.order_items;
create policy "Read own or staff order items" on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders
  where orders.id = order_id
    and (orders.user_id = (select auth.uid()) or (select public.is_edubook_staff()))
));

create or replace function public.list_admin_accounts()
returns table (
  id uuid, email text, full_name text, student_id text, faculty text,
  phone text, role text, active boolean, created_at timestamptz
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_edubook_staff() then raise exception 'Bạn không có quyền xem tài khoản.'; end if;
  return query
    select p.id, coalesce(u.email, '')::text, p.full_name, p.student_id,
      p.faculty, p.phone, p.role, p.active, p.created_at
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

create or replace function public.set_student_active(p_user_id uuid, p_active boolean)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_edubook_staff() then raise exception 'Bạn không có quyền quản lý sinh viên.'; end if;
  if p_active is null then raise exception 'Trạng thái tài khoản không hợp lệ.'; end if;
  update public.profiles set active = p_active
  where id = p_user_id and role = 'student';
  if not found then raise exception 'Không tìm thấy tài khoản sinh viên.'; end if;
  return true;
end;
$$;

create or replace function public.set_subadmin_role(p_user_id uuid, p_role text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if not public.is_edubook_admin() then raise exception 'Chỉ admin chính được cấp quyền SubAdmin.'; end if;
  if p_role not in ('student', 'subadmin') or p_role is null then
    raise exception 'Vai trò không hợp lệ.';
  end if;
  update public.profiles set role = p_role
  where id = p_user_id and role in ('student', 'subadmin')
    and (p_role = 'student' or active);
  if not found then raise exception 'Không tìm thấy tài khoản phù hợp hoặc tài khoản đã bị khóa.'; end if;
  return true;
end;
$$;

-- The existing place_order function is SECURITY DEFINER, so its inserts need a
-- database-side account check independent of table RLS.
create or replace function public.ensure_active_order_customer()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = new.user_id and id = (select auth.uid()) and role = 'student' and active
  ) then
    raise exception 'Tài khoản không có quyền đặt sách.';
  end if;
  return new;
end;
$$;
drop trigger if exists on_edubook_order_customer on public.orders;
create trigger on_edubook_order_customer
before insert on public.orders for each row execute function public.ensure_active_order_customer();

revoke all on function public.is_edubook_staff() from public, anon;
grant execute on function public.is_edubook_staff() to authenticated;
revoke all on function public.list_admin_accounts() from public, anon;
grant execute on function public.list_admin_accounts() to authenticated;
revoke all on function public.set_student_active(uuid, boolean) from public, anon;
grant execute on function public.set_student_active(uuid, boolean) to authenticated;
revoke all on function public.set_subadmin_role(uuid, text) from public, anon;
grant execute on function public.set_subadmin_role(uuid, text) to authenticated;
revoke all on function public.ensure_active_order_customer() from public, anon, authenticated;
