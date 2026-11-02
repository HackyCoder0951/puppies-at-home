# inbox

Staff side of enquiries and customers. Public submissions arrive through `create_enquiry` (see the app's crm module and
the Supabase adapters) which also creates or matches the customer and stores the consent evidence. This module lets staff
list and search enquiries, change their status, assign them, add notes, and maintain customer records.

Authorisation lives in RLS and triggers (assignment needs `enquiries.assign`, notes are authored by the signed-in staff
member). `list_staff()` provides colleague names for assignment because operators cannot read other profiles directly.

- `domain`: statuses, row types, phone helper for `wa.me` links.
- `application`: input schemas, use cases over `InboxRepository`.
- `infrastructure/supabase`: adapter over the staff session client.
- `presentation`: messages and labels.
