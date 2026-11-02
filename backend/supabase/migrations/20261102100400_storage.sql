-- B1 storage: published media is public; drafts are private; staff manage both through RLS.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-media', 'site-media', true, 104857600, array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm']),
  ('media-drafts', 'media-drafts', false, 104857600, array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm']),
  ('private-docs', 'private-docs', false, 20971520, array['application/pdf','image/jpeg','image/png'])
on conflict (id) do nothing;

-- Staff with content.write manage media in both media buckets; anonymous visitors can read only the public bucket.
create policy "site media readable by everyone" on storage.objects for select to anon, authenticated using (bucket_id = 'site-media');
create policy "staff manage site media" on storage.objects for all to authenticated
  using (bucket_id in ('site-media', 'media-drafts') and (select app_private.has_permission('content.write')))
  with check (bucket_id in ('site-media', 'media-drafts') and (select app_private.has_permission('content.write')));
create policy "staff read private docs" on storage.objects for select to authenticated
  using (bucket_id = 'private-docs' and ((select app_private.has_permission('orders.read')) or (select app_private.has_permission('invoices.read'))));
create policy "staff write private docs" on storage.objects for insert to authenticated
  with check (bucket_id = 'private-docs' and ((select app_private.has_permission('orders.write')) or (select app_private.has_permission('invoices.write'))));
