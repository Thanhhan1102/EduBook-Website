-- Run after 202609260002_free_deposit_orders.sql on an existing database.
-- Move only the bundled accounting samples; leave staff-created books and profiles unchanged.
update public.books
set faculty = 'Khoa Tài chính - Kế toán'
where id in ('acc101', 'kt204')
  and faculty in ('Khoa Quản trị Kinh doanh', 'Kế toán');
