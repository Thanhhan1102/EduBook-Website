-- Run after 202609250003_book_covers.sql.
-- Existing books keep their recorded condition; older ineligible rentals must be reviewed by staff.
create or replace function public.enforce_edubook_rental_condition()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.availability in ('rent', 'both') and new.condition <> 'over80' then
    raise exception 'Sách cho thuê phải có độ mới trên 80%%.';
  end if;
  return new;
end;
$$;

drop trigger if exists on_edubook_rental_condition on public.books;
create trigger on_edubook_rental_condition
before insert or update of availability, condition on public.books
for each row execute function public.enforce_edubook_rental_condition();

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
    if v_mode = 'rent' and v_book.condition <> 'over80' then
      raise exception 'Giáo trình này không đủ điều kiện cho thuê.';
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

  v_deposit := 0;
  update public.orders set total = v_total, deposit = v_deposit where id = v_order_id;
  return jsonb_build_object('id', v_order_id, 'total', v_total, 'deposit', v_deposit);
end;
$$;

revoke all on function public.enforce_edubook_rental_condition() from public, anon, authenticated;
revoke all on function public.place_order(jsonb, jsonb, text) from public, anon;
grant execute on function public.place_order(jsonb, jsonb, text) to authenticated;