-- Run once in the Supabase SQL Editor for project jhhpygtddakqcdjthuxq.
-- Student records and orders are protected by RLS. No service key is used in the browser.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  student_id text not null unique check (length(trim(student_id)) between 4 and 24),
  faculty text not null,
  phone text,
  birthday text,
  address text,
  role text not null default 'student' check (role in ('student', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.books (
  id text primary key,
  title text not null,
  code text not null,
  faculty text not null,
  author text not null,
  condition text not null check (condition in ('new', 'over80', 'over60')),
  availability text not null check (availability in ('buy', 'rent', 'both')),
  price integer not null check (price >= 0),
  old_price integer not null check (old_price >= 0),
  rent_price integer not null check (rent_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text not null,
  description text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_name text not null,
  student_id text not null,
  email text not null,
  phone text not null,
  pickup text not null,
  total integer not null default 0 check (total >= 0),
  deposit integer not null default 0 check (deposit >= 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'ready', 'completed', 'cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  book_id text not null references public.books(id),
  book_title text not null,
  mode text not null check (mode in ('buy', 'rent')),
  quantity integer not null check (quantity between 1 and 99),
  unit_price integer not null check (unit_price >= 0)
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists order_items_order_idx on public.order_items(order_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, student_id, faculty, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'student_id',
    new.raw_user_meta_data ->> 'faculty',
    'student'
  );
  return new;
end;
$$;

drop trigger if exists on_edubook_user_created on auth.users;
create trigger on_edubook_user_created
after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_edubook_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke all on public.profiles, public.books, public.orders, public.order_items from anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.books to anon, authenticated;
grant insert, update on public.books to authenticated;
grant select on public.orders to authenticated;
grant update(status) on public.orders to authenticated;
grant select on public.order_items to authenticated;

drop policy if exists "Read own or admin profiles" on public.profiles;
create policy "Read own or admin profiles" on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select public.is_edubook_admin()));

drop policy if exists "Read active books" on public.books;
create policy "Read active books" on public.books for select to anon, authenticated
using (active);
drop policy if exists "Read admin books" on public.books;
create policy "Read admin books" on public.books for select to authenticated
using ((select public.is_edubook_admin()));
drop policy if exists "Admin inserts books" on public.books;
create policy "Admin inserts books" on public.books for insert to authenticated
with check ((select public.is_edubook_admin()));
drop policy if exists "Admin updates books" on public.books;
create policy "Admin updates books" on public.books for update to authenticated
using ((select public.is_edubook_admin())) with check ((select public.is_edubook_admin()));

drop policy if exists "Read own or admin orders" on public.orders;
create policy "Read own or admin orders" on public.orders for select to authenticated
using (user_id = (select auth.uid()) or (select public.is_edubook_admin()));
drop policy if exists "Admin updates order status" on public.orders;
create policy "Admin updates order status" on public.orders for update to authenticated
using ((select public.is_edubook_admin())) with check ((select public.is_edubook_admin()));

drop policy if exists "Read own or admin order items" on public.order_items;
create policy "Read own or admin order items" on public.order_items for select to authenticated
using (exists (
  select 1 from public.orders
  where orders.id = order_id
    and (orders.user_id = (select auth.uid()) or (select public.is_edubook_admin()))
));

create or replace function public.place_order(p_items jsonb, p_contact jsonb, p_pickup text)
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_email text;
  v_order_id uuid;
  v_line jsonb;
  v_book public.books%rowtype;
  v_mode text;
  v_quantity integer;
  v_unit_price integer;
  v_total integer := 0;
  v_deposit integer;
begin
  if v_user_id is null then raise exception 'Bạn cần đăng nhập trước khi đặt sách.'; end if;
  select * into v_profile from public.profiles where id = v_user_id;
  if not found or v_profile.role <> 'student' then
    raise exception 'Chỉ tài khoản sinh viên được đặt sách.';
  end if;
  select email into v_email from auth.users where id = v_user_id;
  if jsonb_typeof(p_items) <> 'array' then
    raise exception 'Danh sách sách đặt không hợp lệ.';
  end if;
  if jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'Danh sách sách đặt không hợp lệ.';
  end if;
  if length(trim(coalesce(p_contact ->> 'name', ''))) not between 2 and 120
    or coalesce(p_contact ->> 'studentId', '') <> v_profile.student_id
    or lower(coalesce(p_contact ->> 'email', '')) <> lower(v_email)
    or length(trim(coalesce(p_contact ->> 'phone', ''))) not between 8 and 20 then
    raise exception 'Thông tin người đặt không khớp tài khoản.';
  end if;
  if p_pickup is null or p_pickup not in (
    'Nhà sách EduBook — 12 Nguyễn Văn Bảo',
    'Smart Locker IUH — Cổng A',
    'Quầy hỗ trợ Thư viện IUH'
  ) then raise exception 'Điểm nhận sách không hợp lệ.'; end if;

  insert into public.orders (user_id, contact_name, student_id, email, phone, pickup)
  values (
    v_user_id, trim(p_contact ->> 'name'), v_profile.student_id,
    v_email, trim(p_contact ->> 'phone'), p_pickup
  ) returning id into v_order_id;
  update public.profiles set phone = trim(p_contact ->> 'phone') where id = v_user_id;

  for v_line in select item from jsonb_array_elements(p_items) as elements(item) loop
    v_mode := v_line ->> 'mode';
    if v_mode is null or v_mode not in ('buy', 'rent')
      or coalesce(v_line ->> 'quantity', '') !~ '^[1-9][0-9]?$' then
      raise exception 'Số lượng hoặc hình thức đặt sách không hợp lệ.';
    end if;
    v_quantity := (v_line ->> 'quantity')::integer;
    select * into v_book from public.books
    where id = v_line ->> 'id' and active for update;
    if not found or (v_book.availability <> 'both' and v_book.availability <> v_mode) then
      raise exception 'Một sách trong giỏ không còn được cung cấp.';
    end if;
    if v_book.stock < v_quantity then
      raise exception 'Tồn kho không đủ cho %.', v_book.title;
    end if;
    v_unit_price := case when v_mode = 'rent' then v_book.rent_price else v_book.price end;
    update public.books set stock = stock - v_quantity where id = v_book.id;
    insert into public.order_items (order_id, book_id, book_title, mode, quantity, unit_price)
    values (v_order_id, v_book.id, v_book.title, v_mode, v_quantity, v_unit_price);
    v_total := v_total + v_unit_price * v_quantity;
  end loop;

  v_deposit := (ceil(v_total::numeric * 0.2 / 1000) * 1000)::integer;
  update public.orders set total = v_total, deposit = v_deposit where id = v_order_id;
  return jsonb_build_object('id', v_order_id, 'total', v_total, 'deposit', v_deposit);
end;
$$;

revoke all on function public.is_edubook_admin() from public, anon;
grant execute on function public.is_edubook_admin() to authenticated;
revoke all on function public.place_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text) to authenticated;

create or replace function public.handle_order_status()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = old.status then return new; end if;
  if old.status in ('cancelled', 'completed') then
    raise exception 'Yêu cầu đã kết thúc, không thể đổi trạng thái.';
  end if;
  if new.status = 'cancelled' then
    update public.books as book
    set stock = book.stock + restored.quantity
    from (
      select book_id, sum(quantity)::integer as quantity
      from public.order_items where order_id = new.id group by book_id
    ) as restored
    where book.id = restored.book_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_edubook_order_status on public.orders;
create trigger on_edubook_order_status
after update of status on public.orders
for each row execute function public.handle_order_status();
