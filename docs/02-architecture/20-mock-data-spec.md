# 20. Mock Data Specification (frontend-first phase)

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Decision** | Owner, 2026-11-02 about 01:15 IST: build the frontend UI/UX first, deliver the backend later, and mock all data from the reference site |
| **Related** | `04` section 9 (data boundary), `05` (target schema), `13` (public spec), `17` section 0 (sequencing), `docs/04-design-ux/reference-analysis/` |

## 1. Goal

Run the whole public site on **local mock data that has the same shape the backend will return later**, so that swapping mock for Supabase changes one layer and no component. The mock content comes from the reference site.

## 2. What the reference exposes (observed)

The reference page payloads contain structured data, so the mock can be built from real field names instead of guessed ones.

### 2.1 Puppy object (15 available, seen on `/` and `/puppies`)

```jsonc
{
  "id": "4218427a-dd65-4b09-a089-584b912aa7ab",   // uuid
  "slug": "maltipoo-max-male",
  "name": "Max",
  "displayName": "Max",
  "breed": "Maltipoo",
  "gender": "male",                                // "male" | "female" (pair entries use another value, to confirm)
  "genderLabel": "Boy",
  "age": "3 months",                               // free text ("2.5 months", "boy 3 months Maltipoo & 2 months Cavapoo")
  "colour": "",
  "description": "",
  "records": [],
  "status": "available",
  "featured": false,
  "seoDescription": "",
  "published": true,
  "origin":      { "name": "...", "slug": "..." },        // local / imported (names to confirm)
  "collections": [ { "name": "...", "slug": "..." } ],    // e.g. Korean teacup (to confirm)
  "breeds":      [ { "name": "Maltipoo", "slug": "maltipoo" } ],
  "cover":  { /* MediaItem */ },
  "media":  [ /* MediaItem[] (photos and videos) */ ]
}
```

### 2.2 MediaItem (photos, videos, family photos)

```jsonc
{
  "id": "gAaGwoGej2g6",
  "url": "/media/<id>/<hash>/<file>.jpg",        // served by the reference's image optimiser
  "kind": "image",                                // "image" | "video"
  "width": 1200, "height": 1600,
  "alt": "Female Korean Teacup Maltipoo puppy",
  "caption": "",                                  // families use captions with emoji
  "focalX": 0.525, "focalY": 0.426,               // focal point for cropping
  "color": "#e8e8e8",                             // dominant colour (placeholder)
  "blurDataUrl": "data:image/webp;base64,...",    // tiny blur placeholder
  "durationS": null,                              // seconds for video
  "poster": null                                  // video poster
}
```

### 2.3 Other datasets

| Dataset | Shape observed | Source on the reference |
|---|---|---|
| Families (64) | `MediaItem[]` with `caption` (some empty) and the shared alt "A happy TeddyPups family with their new puppy" | `/happy-families` payload |
| FAQ (9) | question and answer text (also as `FAQPage` JSON-LD) | `/faq` payload and markup |
| Gone-home (27) | name, breed, sex, source label ("TeddyPups" or "Dubai showroom"), avatar image with `objectPosition` and `backgroundColor`; detail pages exist per slug | `/gone-home` markup; slugs in `sitemap.xml` |
| Testimonial (1) | quote, author "Sarah M.", location "Dubai, UAE" | home and families pages |
| Site settings | phone `+971 54 167 6733`, email, address "Downtown Dubai, United Arab Emirates", Maps link, Instagram, TikTok, Facebook, WhatsApp prefilled text | footer, contact page |
| Static copy | How it works text, journey steps, passport entries, trust points, footer blurb | page markup |

## 3. Content inventory (counts)

| Item | Count | Notes |
|---|---|---|
| Available puppies | 15 | Slugs: `maltipoo-max-male`, `korean-teacup-maltipoo-female`, `korean-teacup-poodle-female`, `maltipoo-cavapoo-male`, `toy-poodle-male-female`, `maltipoo-female-2`, `pomeranian-female`, `copper-male`, `shitzu-female`, `shitzu-male`, `maltipoo-female-1`, `maltipoo-female`, `korean-teacup-pomeranian-1`, `korean-teacup-pomeranian`, `korean-teacup-pomeranian-male` |
| Gone-home puppies | **27** (sitemap slugs; earlier "about 28" was an approximation) | `pomeranian-ace-boy`, `poodle-leo-male`, `maltipoo-mia-girl`, `maltipoo-sadie-girl`, `blue-marle-pomeranian`, `pomsky-ollie-boy`, `maltipoo-bruno-boy`, `maltese-buddy-male`, `maltese-charlie-male`, `pomeranian-daisy-girl`, `pomeranian-bella-female`, `poodle-teddy-male`, `poodle-molly-female`, `pomski-coco-girl`, `pomsky-rosie-girl`, `pomeranian-leo-boy`, `poodle-molly-girl`, `poodle-rocky-boy`, `maltipoo-sophie-girl`, `maltipoo-lola-girl`, `pomeranian-rex-boy`, `pomsky-finn-male`, `maltipoo-zoe-girl`, `pomeranian-mimi-girl`, `bichon-bailey-boy`, `puppy`, `maltipo`. Two slugs (`puppy`, `maltipo`) look like data-entry leftovers. |
| Detail pages | 42 (15 + 27) | Unknown slug returns 404 "Puppy not found" |
| Family photos | 64 | |
| FAQs | 9 | |
| Filters | where: Everywhere, Imported, Korean Teacup; breed: Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu; sex: Boys, Girls | |

## 4. Repository boundary (how the mock stays swappable)

Per the modular monolith (`21`), each module owns its types, its ports and its adapters. All pages read data only through use cases; use cases depend only on **ports**. The mock implements the ports from local fixtures; the backend phase adds Supabase adapters for the same ports.

```ts
// modules/catalog/domain  (entities and value objects: pure types)
interface MediaItem { id; url; kind: 'image'|'video'; width; height; alt; caption; focalX; focalY; color; blurDataUrl?; durationS?; poster? }
interface Puppy { id; slug; name; displayName; breed; gender; genderLabel; age; colour; description; status: 'available'|'reserved'|'gone_home';
                  featured; published; origin: {name; slug}; collections: Ref[]; breeds: Ref[]; cover: MediaItem; media: MediaItem[]; goneHome?: { source: string } }

// modules/catalog/application/ports
interface PuppyRepository { listAvailable(): Promise<Puppy[]>; listGoneHome(): Promise<Puppy[]>; getBySlug(slug): Promise<Puppy|null>; neighbours(slug): Promise<{prev?: Puppy; next?: Puppy}> }

// modules/content/domain and application/ports
interface FamilyPhoto extends MediaItem {};  interface Faq { id; question; answer };  interface Testimonial { quote; author; location }
interface SiteSettings { phone; whatsappNumber; whatsappText; email; address; mapsUrl; social: {instagram; tiktok; facebook}; ... }
interface FamilyRepository { list(): Promise<FamilyPhoto[]> };  interface FaqRepository { list(): Promise<Faq[]> };  interface SettingsRepository { get(): Promise<SiteSettings>; testimonial(): Promise<Testimonial> }

// modules/crm/application/ports
interface EnquiryRepository { submit(input: EnquiryInput): Promise<{ ok: true; id: string } | { ok: false; error }> }
```

- Fixtures and mock adapters live in `modules/<m>/infrastructure/mock/` (JSON plus `Mock*Repository.ts`); Supabase adapters later in `modules/<m>/infrastructure/supabase/`; both satisfy the same **contract test suite**.
- The composition root (`composition/container.ts`) selects the adapter set by `DATA_SOURCE=mock|supabase`.
- Use cases (`ListAvailablePuppies`, `GetPuppyDetail`, `FilterPuppies`, `ListFamilies`, `SearchFaqs`, `SubmitEnquiry`) return DTOs; presentation never sees adapters.
- Fields the backend adds later (price, notes, internal status) are optional and absent in mock data; public read models never expose them.
- The types double as the contract the later `v_public_*` views must return (`05` section 6).

## 5. Mock behaviours to implement

| Behaviour | Mock implementation |
|---|---|
| Listing, detail, neighbours, filters, counts | Computed from fixtures in memory |
| Unknown slug | Returns `null`, page shows 404 |
| Enquiry and contact forms | `EnquiryService` validates with the same schema as the future endpoint, waits a short delay (for the animation), returns success; optional failure switch for testing the error state; nothing is stored (or kept in memory/localStorage for demos) |
| WhatsApp, tel, mailto, Maps, social links | Real links from `SiteSettings` fixture |
| Revalidation | Not needed |
| Admin, auth, payments, notifications | Not built in this phase |

## 6. How the fixtures are produced

1. A one-off **extraction script** (to be written in the development phase, kept in `scripts/` and run by hand) reads the reference's pages, parses the embedded structured payload and writes the fixtures into each module (`modules/catalog/infrastructure/mock/`, `modules/content/infrastructure/mock/`). Inputs are the saved copies in `docs/05-research/evidence/captures` or live fetches.
2. Fields are mapped one to one from section 2. Unconfirmed fields (`origin` and `collections` names, `gender` value for pairs) are read from the payload at extraction time and verified.
3. Static copy (How it works, journey, passport, footer blurb) is typed into `modules/content/infrastructure/static/` from `docs/05-research/03-screenshots-and-video-review.md` and the reference markup.
4. A validation step type-checks every fixture against the Zod schemas and fails on missing alt text, slugs, or dimensions.
5. Fixtures are committed; the script is only rerun if the reference changes.

## 7. Media (images and videos): decision needed

The photos, videos and illustrations belong to the reference's owner (`docs/07-planning/16-risk-register-and-decisions.md` risk R-02, sign-off D6). "Mock the data fully from the reference" can be satisfied in three ways:

| Option | What it means | Rights position | Visual fidelity |
|---|---|---|---|
| **A. Placeholders** | Same dimensions, alt text, dominant colour and blur placeholder, but neutral placeholder images | Safe | Layout identical, photos different |
| **B. Hotlink the reference's media URLs** | The clone's pages load `/media/...` from the reference host | Third-party bandwidth use; breaks if they change or block; the reference's CSP and CORS may block it; likely not acceptable for a public deployment | Identical photos |
| **C. Local copies of the reference's media** | Download into the repository for the assignment | Copying third-party photos (including photos of private customers) into a public repository is a rights and privacy risk without written permission | Identical photos |

Recommended: **A** for anything committed or deployed publicly, with an optional **C** limited to a local, git-ignored folder for private visual comparison only if the owner confirms permission. Illustrations (mascot, doors, signpost and so on) must be redrawn regardless (`docs/04-design-ux/reference-analysis/component-mapping.md` section 4). This is decision **D13** in `RESEARCH-SIGNOFF.md`. **Resolved by the owner on 2026-11-02: option A, placeholders.**

## 8. Fixture quality rules

- Every `MediaItem` has width, height, alt text, focal point and a placeholder colour or blur so the layout never shifts.
- Slugs are unique and stable; the two odd gone-home slugs are kept (the reference serves them) unless the owner wants them cleaned.
- Ages and names are copied as text exactly as the reference shows them (including entries such as "boy · 3 months Maltipoo & 2 months Cavapoo").
- Order of lists follows the reference.
- Family captions keep their emoji.
- No personal data beyond what the reference already shows publicly (first names on tickets, "Sarah M."). Do not capture customers' faces in committed images (see section 7).

## 9. Tests for the mock layer

Schema validation of all fixtures; repository unit tests (filters, neighbours, counts "15" and "N puppies match", 404 for unknown slug); form service tests (valid, invalid, simulated failure); a contract test that the mock output satisfies the types the Supabase repositories must satisfy later.

## 10. What changes when the backend arrives

Implement the Supabase repositories (`04` section 9), switch `DATA_SOURCE`, add the admin portal and the rest of phases 4 to 13 in `17`. No component or page changes are required.

## Open questions

1. ~~Media option A, B or C (section 7)?~~ Resolved: A (placeholders).
2. Should the mock enquiry submissions be stored locally (for demos) or discarded?
3. Keep the two odd gone-home slugs (`puppy`, `maltipo`) or tidy them?
4. Which mock failure scenarios should the demo include (network error, validation error)?
