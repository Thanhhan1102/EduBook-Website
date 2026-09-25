-- Run after 202609250004_rental_rules_free_deposit.sql.
-- Supabase Cron runs the expiration sweep every minute.
create extension if not exists pg_cron;

alter table public.orders add column if not exists expires_at timestamptz;
alter table public.orders add column if not exists expired_at timestamptz;

-- Existing open orders receive a fresh 24-hour window at migration time.
update public.orders
set expires_at = case
  when status in ('pending', 'confirmed', 'ready') then now() + interval '24 hours'
  else created_at + interval '24 hours'
end
where expires_at is null;

alter table public.orders alter column expires_at set default (now() + interval '24 hours');
alter table public.orders alter column expires_at set not null;

create index if not exists orders_active_expiry_idx on public.orders(expires_at)
where status in ('pending', 'confirmed', 'ready');

create or replace function public.handle_order_status()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.status = old.status then return new; end if;
  if old.status in ('cancelled', 'completed') then
    raise exception 'Yêu cầu đã kết thúc, không thể đổi trạng thái.';
  end if;
  if old.expires_at <= now() and new.status <> 'cancelled' then
    raise exception 'Thời gian giữ sách đã hết. Hãy tải lại danh sách đơn.';
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

create or replace function public.expire_book_holds()
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  update public.orders
  set status = 'cancelled', expired_at = now()
  where status in ('pending', 'confirmed', 'ready') and expires_at <= now();
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.expire_book_holds() from public, anon, authenticated;

select cron.schedule(
  'edubook-expire-book-holds',
  '* * * * *',
  'select public.expire_book_holds();'
);

create or replace function public.book_holds_ready()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from cron.job
    where jobname = 'edubook-expire-book-holds' and active
  );
$$;

revoke all on function public.book_holds_ready() from public, anon;
grant execute on function public.book_holds_ready() to authenticated;
