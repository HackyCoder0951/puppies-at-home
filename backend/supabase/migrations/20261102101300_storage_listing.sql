-- Public files are served by the bucket's public URL without any policy; a select policy for anonymous visitors only
-- lets them list (enumerate) every file name. Keep listing for signed-in users (the admin) and drop it for anon.
drop policy if exists "site media readable by everyone" on storage.objects;
create policy "site media listed by signed-in users" on storage.objects for select to authenticated using (bucket_id = 'site-media');
