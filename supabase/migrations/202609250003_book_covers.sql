-- Run after 202609250002_admin_dashboard.sql.
-- Public book covers live in Storage; public.books.image_url stores their URLs.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'book-covers', 'book-covers', true, 5 * 1024 * 1024,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "EduBook staff upload book covers" on storage.objects;
create policy "EduBook staff upload book covers"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'book-covers'
  and (select public.is_edubook_staff())
  and (storage.foldername(name))[1] = (select auth.uid()::text)
  and lower(storage.extension(name)) in ('jpg', 'png', 'webp')
);

drop policy if exists "EduBook staff read own book covers" on storage.objects;
create policy "EduBook staff read own book covers"
on storage.objects for select to authenticated
using (
  bucket_id = 'book-covers'
  and (select public.is_edubook_staff())
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists "EduBook staff delete own book covers" on storage.objects;
create policy "EduBook staff delete own book covers"
on storage.objects for delete to authenticated
using (
  bucket_id = 'book-covers'
  and (select public.is_edubook_staff())
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);
