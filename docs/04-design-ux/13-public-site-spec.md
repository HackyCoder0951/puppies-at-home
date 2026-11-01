# 13. Public Site Specification

| | |
|---|---|
| **Status** | Draft, awaiting review |
| **Version** | 0.1 |
| **Date** | 2026-11-02 |
| **Related** | `docs/05-research/02-design-pattern-analysis.md`, `03-screenshots-and-video-review.md`, `04-ui-ux-animation-effects-color-layout.md`, `05-responsive-analysis.md`, `02` (FR-PUB) |

This is the consolidated build spec for the clone. Detailed evidence, hex values, keyframes and measurements stay in the research files; this document says **what to build, from which data, and how it behaves**. Where the reference behaviour is weak, the "Improvement" line is separate and optional.

## 1. Page inventory

| Route | Data (Supabase) | Cache tag | Main interactions |
|---|---|---|---|
| `/` | `v_public_puppies` (15 latest published), `v_public_faqs` (3), `v_public_families` (8), `v_public_testimonial`, `v_public_settings` | puppies, faqs, families, settings | Pinned door scroller (≥1024), journey phone, passport stamps, sunset, house door, WhatsApp CTAs |
| `/puppies` | `v_public_puppies`, `v_public_gone_home` (5) | puppies, gone-home | Multi-select filters synced to the URL, count, clear, hover tilt |
| `/puppies/[slug]` | `v_public_puppy_detail`, neighbours | `puppy:{slug}` | Gallery with video, enquiry form, scroll-progress bar, prev/next |
| `/gone-home` | `v_public_gone_home` | gone-home | Ticket reveal, links to detail |
| `/happy-families` | `v_public_families` (all), `v_public_testimonial` | families | Polaroid wall, lightbox |
| `/how-it-works` | static content plus settings | settings | Toggle (In Dubai / Imported), anchor pills |
| `/faq` | `v_public_faqs` | faqs | Search, accordion |
| `/contact` | settings | settings | Letter form |
| `/privacy`, `/terms` (**not on the reference; proposed, pending D16**) | static content | none | Linked from the footer and every form (`06` section 6.12) |
| `404` and unknown puppy | n/a | n/a | "Puppy not found" page |

Static copy that is not in the database (How it works text, trust points, journey steps) lives in typed content files under `modules/content/infrastructure/static/` so content and presentation stay separate. The editable pieces (settings, hero text, FAQs, testimonial, puppies, families) come from Supabase.

## 2. Global layout

- Fixed header (height 4.75rem): logo + wordmark, 6 links, WhatsApp pill; inline from 1024px; menu overlay below; WhatsApp pill from 640px.
- Gutter `clamp(1rem, 4vw, 3.5rem)`; header inner max width 110rem; inner page content about 1100px.
- Footer: night background, brand blurb, Explore links (including "Delivery & collection" anchor), contact, social pills, basket mascot, handwriting tagline.
- Bottom contact bar (WhatsApp + Call) below 768px.
- Scalloped header edge on inner pages and when scrolled on home; wave divider before the footer.
- Skip link to `#main`; one `h1` per page; focus ring 3px toffee-deep with 3px offset.

## 3. Design tokens (summary; full list in research 04)

Colours: milk `#fffdf8`, cocoa `#2a170e`, cocoa-soft `#5a3a28`, toffee `#c2622b`, toffee-deep `#a24a1a`, toffee-ink `#8e3f15`, honey `#f2be6b`, honey-soft `#fbe3b4`, sky `#bfddf5`, sky-deep `#2f6e9e`, blush `#f9cdbf`, WhatsApp green `#1f7a4d`. Door colours `#a24a1a #5a3a28 #d4893f #b8644a #7a4a2e`. Scene gradients as in research 04 table A1.

Fonts: Fraunces 800 (display), Figtree 400/600/620/650 (UI), Shantell Sans 500 (handwriting). Base 17px; H1 84.5px at ≥1024 (41.6px at 375), H2 `clamp(2.6rem, 6.4vw, 6.25rem)`.

Shapes and effects: 3px cocoa outlines, pill buttons with hard offset shadow `0 8px 0 -2.4px cocoa`, arches and circles for photos, tilt on cards, quilt and scallop patterns, tape, stamp ink, plank lines.

Easings: pounce `cubic-bezier(.34,1.56,.64,1)`, silk `cubic-bezier(.22,1,.36,1)`, snap `cubic-bezier(.7,0,.2,1)`.

## 4. Home page scenes (build order and behaviour)

| # | Scene | Build notes |
|---|---|---|
| 1 | Hero | Kicker, H1 (max 15ch), lede, two buttons, mascot peeking over the quilted ground; arched photo row **only on wide screens** (cut-off to confirm between 1024 and 1440) |
| 2 | Meet the pups | Header + "See all" button; ≥1024px pinned stage (sticky 100vh, wrapper height `100vh + 0.8 × overflow`), doors in order, mascot walking, door opens and photo pops when reached, final "Meet them all" door; below 1024px (and reduced motion) a grid of ajar doors, 2 columns at 375 and 3 at 768 |
| 3 | Two ways | Title, signpost with two arrows (≥1024); each way has its own arrow and stacks below 1024; showroom skyline with awning photo; plane route Korea to Dubai; two buttons linking to `/puppies?origin=local` and `/puppies?origin=imported` |
| 4 | Journey | 3 steps with number discs; phone mock (sticky at ≥1024) whose chat changes with the active step (greeting + breed chips linking to `/puppies?breed=…`, photos + video bubble, delivery paw-trail bubble); typing dots; "How it works" button; below 1024 all steps and the full chat are shown |
| 5 | Passport | Book with title page and four stamps (vet-checked, Korea to Dubai safely, Support 24/7, Trusted worldwide); stamps thump in on scroll |
| 6 | Happy families | Sunset + skyline, speech-bubble testimonial, house facade with 8 taped polaroids, lamppost, door, button to `/happy-families` |
| 7 | Night FAQ | Stars, floating "?", three always-open Q&As, "Read all questions" button |
| 8 | CTA house | Lit house with door that opens to a puppy on scroll, WhatsApp and contact buttons |
| 9 | Footer | As in section 2 |

Text content for all scenes: see `docs/05-research/03-screenshots-and-video-review.md` and the reference page text captured in `docs/05-research/evidence/captures/reference-home.html`.

## 5. `/puppies`

- Header: kicker "from Teddy's sketchbook", H1 with hand-drawn underline, intro, circular mascot "self-portrait" at the right (stays beside the text on mobile).
- Filter pad (taped card) with rows **where**, **breed**, **boy or girl**; chips are toggle buttons with `aria-pressed`.
- Semantics: within a row, selections combine with OR; rows combine with AND (to confirm against the reference). "Everywhere" resets the where row. "Imported" shows origin imported; "Korean Teacup" shows the Korean teacup flag.
- URL: `?breed=maltipoo&origin=imported&sex=girl`; loading the URL pre-selects chips; the home page chips and "two ways" buttons link with these parameters.
- Result line: "N puppies looking for a home" with no filters, "N puppies match" with filters, plus "Clear filters" link; empty state with message and WhatsApp button (copy to design, not observed).
- Grid: `repeat(auto-fill, minmax(min(14.5rem, 40vw), 1fr))`, staggered vertical rhythm; circular photo with ring wash and ink doodles, tilted "Available" tag (swing on reveal), name, "sex · age"; hover tilts the frame and hops doodles; video marker.
- Below: "Already gone home" band (5 latest), wave, footer. Gone-home cards remain visible while filtering.

## 6. `/puppies/[slug]`

Sections: breadcrumb and number tag "1 hello, it's me"; gallery (paper-stack frame, counter, round prev/next, thumbnails; video thumbnail with play); info card (tilted, pin hole, mascot on the corner; Available pill or "gone home ♥"; name; breed; four facts: Breed, Boy or girl, Age, Where; buttons "Ask about {Name} on WhatsApp" and "Send an enquiry"); "what comes with {Name}" checklist (Vaccinated, Dewormed, Verified health certificate, Thoroughly checked); "the way home" 4 steps (imported variant "Coming home from abroad"; local variant text to confirm); enquiry form "Ask about {Name}" with prefilled message; previous/next puppy cards; scroll-progress ribbon on the left edge. Gone-home variant: "Ask about a puppy like this", form title "Looking for a puppy like this?", breadcrumb "Gone home / {Name}".

Metadata: title `{Name}, {Breed} puppy | TeddyPups U.A.E.`; description from template; `BreadcrumbList` JSON-LD; unknown slug 404.

## 7. Other pages

- **`/gone-home`**: header with kiosk illustration; ticket grid (3 per row desktop, 1 per row mobile); each ticket = notched card, round photo, name, breed and sex, source ("TeddyPups" or "Dubai showroom"), "home ♥", vertical "admit one" stub; blur-up image placeholders; reveal with clip-path wipe, staggered.
- **`/happy-families`**: kicker, H1 with heart, intro, "N moments and counting" (from data), taped notebook testimonial; polaroid wall (CSS columns: 2 mobile, 3 tablet, 4 desktop; to confirm mobile count) with tape colours, tilt, captions, hover lift; lightbox overlay (dark backdrop, image, counter "k / N", Previous, Next, Close, keys: arrows, Esc, focus trap, return focus).
- **`/how-it-works`**: H1 + intro; anchor pills (Two ways home, Our premium puppy promise, Delivery & collection, Why choose us); toggle "In Dubai (meet in person)" / "Imported (order upon request)" switching the illustration (skyline with sun vs plane route), heading, text and 4 step cards (icon disc, step number, title, text); promise passport with three entries; delivery and collection with plane and 2×2 blocks; why choose us list and a bordered CTA card with two buttons.
- **`/faq`**: corkboard; sticky left column (search "sniff out a question", "N notes on the board", mascot with "!" bubble, "Ask your own question" button); notes with coloured pins and tilt; accordion semantics (`button[aria-expanded][aria-controls]`), open note straightens and unfolds the corner; search filters notes live with an empty note state.
- **`/contact`**: H1 + intro; left stack: WhatsApp button, call, email, "Visit us in Downtown Dubai" card (awning, skyline, photo arch, address, "Open in Google Maps"); right: letter form (see section 8); mobile order: form first.

## 8. Forms

| Form | Fields | Rules |
|---|---|---|
| Contact letter | name* (2–80), phone* (international, normalised), email (optional), area (optional, ≤80), interested puppy (select: "any puppy" + available puppies), message (optional, ≤2000), hidden honeypot `website` | "Post my letter" |
| Puppy enquiry | name*, phone*, email, area, message (prefilled "Hi! I'd love to know more about {Name} ({Breed}).") | "Send enquiry"; puppy id attached |

Consent and privacy (`06` sections 6.5 and 6.12): each form shows a short consent line linking to `/privacy`, a statement that the sender is 18 or older, and unticked optional boxes for marketing and WhatsApp updates; text is versioned.

Behaviour: client validation with inline messages (same Zod schema as the server), submit disabled while sending, rate limit and spam checks (`08`), success: letter-fold and envelope-to-mailbox animation then "sent" message (reduced motion: immediate message); error: friendly retry message and the WhatsApp alternative button. A consent line for data use and optional WhatsApp updates (wording from owner). The submission creates an `enquiry` and, when matching, links or creates a `customer`.

## 9. Motion and effects (what to implement and in which phase)

| Phase | Items |
|---|---|
| Foundation | Tokens, buttons with hover and press, nav states, menu overlay with circle reveal, reveal-on-scroll hook, focus states, reduced-motion handling |
| Signature | Door scroller (pinned + fallback), journey phone states, passport stamps, sunset and house door via `animation-timeline: view()` with `@supports`, polaroid and ticket reveals, tag swing, FAQ unfold |
| Polish | Loading curtain with running puppy, mascot idle loops, paw cursor, paw-print trail layer, roaming mascot overlay, twinkle and float ambience |

Keyframe names, durations and curves are in `docs/05-research/04-ui-ux-animation-effects-color-layout.md` part B and should be reused in the same units.

## 10. Responsive rules

Use `docs/05-research/05-responsive-analysis.md` tables: inline nav at ≥1024; bottom bar below 768; WhatsApp pill at ≥640; passport book 2 columns at ≥900; two-column scenes and pinned scroller at ≥1024; puppy grid 2 columns at 375 and 768; zero horizontal overflow from 320 to 1920.

## 11. Data integration rules

> **Frontend-first note (2026-11-02):** in the first delivery the repositories below are the **mock** implementations built from the reference's data (`20-mock-data-spec.md`). Cache tags and revalidation apply only after the Supabase repositories are added. The rules otherwise hold unchanged.


- Public components receive props; only each module's `infrastructure/supabase` adapters talk to Supabase (backend track); pages call use cases (`21`).
- Cached readers with tags; admin mutations call `revalidateTag`.
- Images via `next/image` with Supabase Storage loader, `sizes` per layout, blur placeholder from `blur_data_url`.
- Filters operate on the cached list in the browser (as in the reference); total published puppies are small (dozens), so the full list ships once.
- Settings feed phone, WhatsApp number and text, email, address, maps and social links everywhere (single source).

## 12. Accessibility and SEO for the public site

Alt text from `puppy_media.alt`; decorative SVG `aria-hidden`; keyboard operable filters, accordion, gallery, lightbox and menu; titles, descriptions, canonical, Open Graph, Twitter, JSON-LD (`PetStore`, `BreadcrumbList`), sitemap and robots (excluding `/admin`). **Improvements (optional, labelled):** shorten curtain on repeat navigation, contrast fixes on dark scenes, minimum size for handwriting labels, keyboard path through the pinned door scroller.

## Open questions

1. Confirm the OR/AND logic of the filters against the reference.
2. Local-puppy variant of "the way home" steps (not captured).
3. Empty-state copy for filters with no matches.
4. Hero arch cut-off width and the local vs imported text on detail pages.
5. Keep, shorten or drop the curtain and the roaming mascot?
