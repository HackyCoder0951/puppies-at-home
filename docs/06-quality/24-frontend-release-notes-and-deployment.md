# 24. Frontend release notes and deployment guide

| | |
|---|---|
| **Status** | Frontend track delivered on mock data (phases F0 to F6 and F9 of the Standard P0 schedule) |
| **Written** | 2026-11-02 03:12 IST |
| **App root** | `app/` |

## 1. What is built

Routes: `/`, `/puppies` (URL-synced filters), `/puppies/[slug]` (42 pages: 15 available, 27 gone home), `/gone-home`, `/happy-families` (lightbox), `/how-it-works` (toggle), `/faq` (search and accordion), `/contact`, `/privacy` and `/terms` (placeholders pending D16), 404, `/dev/gallery` (hidden in production, `noindex`), `robots.txt`, `sitemap.xml`.

Architecture: modular monolith with modules `catalog`, `content`, `crm`, `storefront`; shared kernel, design system, navigation registry and a composition root choosing the mock adapters. Boundaries are enforced by ESLint and by architecture tests (with self-tests).

Mock data: 15 available, 27 gone-home, 132 media references (placeholders), 64 family photos, 9 FAQs, 16 contact options. A completeness test fails if any count drifts. Regenerate with `node scripts/build-fixtures.mjs` (needs the private snapshot in `docs/05-research/evidence/data-snapshot`).

## 2. Quality evidence (2026-11-02)

| Check | Result |
|---|---|
| `npm run lint` | clean |
| `npm run typecheck` | clean (strict, `noUncheckedIndexedAccess`) |
| `npm run test` | 65 unit, component and architecture tests pass |
| `npm run build` | succeeds; 42 puppy pages statically generated |
| `npx playwright test` | 7 smoke journeys pass in Chromium |
| Horizontal overflow | none at 375, 768, 1024 and 1920 px on all 10 routes |
| Structure checks | one `h1`, labelled controls, named buttons and links, `main` landmark on 11 pages |

Not done: pixel comparison with the reference, axe-core run, Lighthouse, real-device mobile check, cross-browser run. Mobile layouts are provisional until the owner supplies mobile captures (D14).

## 3. Assumptions to confirm (gaps G1 to G6)

Filters combine groups with AND and values inside a group with OR; a boy-and-girl pair matches both sexes; `?origin=local` shows an empty state (there are no local puppies); previous and next wrap within available or gone-home; empty results offer "Clear filters" and WhatsApp. Page copy that was not captured verbatim (journey, delivery, how-it-works steps, empty states) is authored and original. The testimonial attribution is generic (no real client name).

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
