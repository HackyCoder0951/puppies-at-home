-- Local development seed: public site settings taken from the reference site (business contact details only).
insert into public.site_settings (key, value, is_public) values
  ('whatsapp_number', '"971541676733"', true),
  ('whatsapp_text', '"Hi TeddyPups! I''d love to know more about your puppies."', true),
  ('phone_href', '"tel:+971541676733"', true),
  ('email', '"teddypupsadmin@gmail.com"', true),
  ('address', '"Downtown Dubai, United Arab Emirates"', true),
  ('maps_href', '"https://maps.app.goo.gl/ZdJvwHBSQWWZT54s7"', true),
  ('instagram', '"https://www.instagram.com/teddypups.worldwide/"', true),
  ('tiktok', '"https://www.tiktok.com/@teddypupsuae"', true),
  ('facebook', '"https://www.facebook.com/profile.php?id=61567496944539"', true)
on conflict (key) do nothing;
