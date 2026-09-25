-- Run in SQL Editor on projects that already applied 202609240001_edubook.sql.
-- Replaces only the signup trigger function. Existing users and orders are unchanged.

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
