# cms

Staff content management for the public site: create and edit puppies, upload their photos and videos, publish and
unpublish, mark a puppy as gone home, edit FAQs, the featured testimonial and the public contact settings.

Authorisation is in the database (RLS and the publish and soft-delete triggers); this module validates input, shapes
errors and tells the site to refresh (`ContentPublisher`) after each change. Reads for the public site stay in the
catalog and content adapters.

- `domain`: input schemas, slug generation, media rules.
- `application`: use cases over `CmsRepository`, `MediaStore`, `ContentPublisher`.
- `infrastructure/supabase`: adapters over the staff session client.
- `presentation`: user-facing error messages (the pages live in `app/`).
