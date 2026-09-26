-- Run after 202609250004_rental_rules_free_deposit.sql.
-- The original schema calculated a 20% deposit on older requests. No online
-- deposit was collected, so remove those legacy estimates without changing
-- the book total or the order items.
update public.orders set deposit = 0 where deposit <> 0;

alter table public.orders alter column deposit set default 0;
alter table public.orders drop constraint if exists orders_deposit_free_check;
alter table public.orders add constraint orders_deposit_free_check check (deposit = 0);
