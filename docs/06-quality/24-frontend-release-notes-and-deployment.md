# 24. Frontend release notes and deployment guide

| | |
|---|---|
| **Status** | Frontend track delivered on mock data (phases F0 to F6 and F9 of the Standard P0 schedule) |
| **Written** | 2026-11-02 03:12 IST |
| **App root** | `app/` |

## 1. What is built

**Exact copy of the reference (owner instruction, 2026-11-02 03:5x IST; supersedes D13 "placeholders").** The app uses the reference's own compiled stylesheet (`app/src/app/reference.css`), its class names and DOM structure, its fonts (self-hosted variable builds), its page text, and its photos and videos (200 files in `app/public/media`, downloaded with the owner's permission). Page markup was generated from the reference's server-rendered HTML and live DOM; behaviour was ported from the reference's scripts and checked against the live site.

Routes: `/`, `/puppies` (URL-synced filters), `/puppies/[slug]` (42 pages), `/gone-home`, `/happy-families` (viewer), `/how-it-works` (tabs), `/faq` (search and accordion), `/contact` (letter form with envelope and postbox animation), `/privacy` and `/terms` (placeholders, not on the reference, pending D16), 404, `robots.txt`, `sitemap.xml`.

Behaviour ported: route curtain (intro and page transitions), header that hides on scroll, native-dialog menu, scroll-reveal, scene visibility, pinned "Meet the pups" door scroller, step-by-step chat, ribbon on puppy pages, gallery with full-screen viewer and video, photo wall viewer, FAQ board, filter pad with the reference's exact rules (see section 3).

Architecture: modular monolith (`catalog`, `content`, `crm`, `storefront`), shared kernel, navigation registry and a composition root choosing the mock adapters; boundaries enforced by ESLint and architecture tests. Generated presentation files (`*.generated.tsx`, sketch artwork per puppy) hold the reference's per-card artwork; tests assert they cover every puppy.

Mock data: 15 available, 27 gone-home, 132 media references, 64 family photos, 9 FAQs, 16 contact options; a completeness test guards the counts. Regenerate fixtures with `node scripts/build-fixtures.mjs`.

## 2. Quality evidence (2026-11-02)

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean (strict) |
| `npm run test` | 69 unit, component and architecture tests pass |
| `npm run build` | succeeds |
| `npx playwright test` | 8 journeys pass in Chromium |
| Side-by-side with the live reference | home, puppies, detail, contact checked at 1440 px; filter behaviour measured on the live site |

Visual parity (automated, `app/tests/visual/compare.mjs`, live reference vs this build, reduced-motion screenshots at 1440, 768 and 375 px): home, puppies, gone home, how it works and FAQ differ by 0 to 0.3 % of pixels; happy families by 0.4 to 6 % (sub-pixel image-height rounding shifts rows at tablet and phone widths); puppy and contact pages by about 0.2 % once the consent notice is hidden (`HIDE_CONSENT=1`).

Added behaviour since the first exact-copy pass: the reference's own font files (text metrics now identical), Lenis inertial scrolling with the reference settings, the mascot engine (poses, eye tracking, click tricks, idle tricks) and the roaming mascot that walks between stops as you scroll, the mouse paw trail, the airplane that flies along the Korea to Dubai route, swipe gestures and slide-in in both photo viewers, and the reference's reveal rules (queued while the curtain is down).

Not done or not exact: the consent notice under both forms (a deliberate addition, decision D16, adds one paragraph so those pages are 50 to 100 px taller than the reference); Cloudflare-style email obfuscation (plain mailto is used); spring physics on the viewers (a CSS slide-in is used); the reference's remaining micro-interactions that were not visible in the side-by-side runs; axe and Lighthouse runs; other browsers and real devices.

## 3. Reference behaviour confirmed on the live site (gaps G1 to G6)

- Filters: "where" chips combine (imported AND Korean Teacup); breed and boy/girl are single choice and replace each other; "Everywhere" is pressed when no "where" filter is set. URL keys: `breed`, `origin`, `collection`, `gender` (`male` or `female`). A pair puppy ("boy & girl") matches both Boys (6) and Girls (10).
- Result line: "N puppies looking for a home" unfiltered, "N puppies match" or "1 puppy match" when filtered. `?origin=local` shows "0 puppies match" with no chip pressed. Empty state: "No puppies match just now." with "Ask on WhatsApp" and "Show all puppies".
- Gone-home puppy pages have no "the way home" section and a different enquiry title; previous and next wrap around.

## 4. Deploy to Vercel

The assignment needs a live URL; this repository has no remote and no Vercel account is connected, so the owner performs these steps:

1. Create an empty GitHub repository and push: `git remote add origin <url>` then `git push -u origin main --follow-tags`.
2. In Vercel choose "Import Project", select the repository and set **Root Directory** to `app`.
3. Framework preset: Next.js (build and output defaults). Node 22 or newer.
4. Environment variables (Production): `NEXT_PUBLIC_SITE_URL` (the final URL), `APP_ENV=production`, `DATA_SOURCE=mock`, `CONSENT_TEXT_VERSION=v1`. See `app/.env.example`.
5. Deploy, then check `/`, `/puppies`, a detail page, `/sitemap.xml` and that `/dev/gallery` returns 404.

With `APP_ENV` other than `production`, `robots.txt` disallows all crawling, so preview deployments stay out of search results.

## 5. Loom outline (about 5 minutes)

1. Goal and constraints (48 hours, mock data first, backend later).
2. Research and documentation first: what the review gate caught.
3. Structure: modules and layers, the boundary tests, why the composition root exists.
4. Tools: Next.js, TypeScript strict, Tailwind v4, Zod, Vitest, Playwright, Claude Code (see `18-ai-usage-and-prompt-log.md`).
5. Demo: home, filters, detail, forms, FAQ, mobile menu.
6. Testing and the one-pass fix rule per phase; challenges (mock data gaps, mobile unknowns).
7. Deployment and what comes next (admin portal on Supabase).
