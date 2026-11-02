# 19. Development Progress Log

| | |
|---|---|
| **Status** | Living document (append only) |
| **Started** | 2026-11-01 21:49 IST |
| **Last updated** | 2026-11-02 19:06 IST |
| **Time zone** | IST (UTC+05:30), the clock of the machine the work runs on |
| **Related** | `18-ai-usage-and-prompt-log.md` (exact prompts and verification), `17-implementation-roadmap.md` (planned phases) |

> **Path migration note (2026-11-02, 01:50 IST).** Entries written before this time use the old folder layout (`docs/NN-name.md`, `research/`, `reference-analysis/`, `docs/prompt/`). They are kept as written because this log is append-only. Current locations: documents are in `docs/<topic>/` (see `docs/README.md` for the number-to-path table); `research/*.md` is now `docs/05-research/`; `research/captures`, `research/pages` and `research/video-recording` are now `docs/05-research/evidence/captures`, `.../pages` and `.../video-recording` (the page folders `gone home`, `how it works` and `visit & contact` became `gone-home`, `how-it-works` and `visit-contact`); `reference-analysis/` is now `docs/04-design-ux/reference-analysis/`; `docs/prompt/` is now `docs/08-process/prompts/`.

## 1. Purpose and rules

This log records, in time order, **what the owner asked for and what was delivered in response**, so the Loom walkthrough and the interview can follow the project's real timeline.

How it relates to the other logs:

| Document | Records |
|---|---|
| `18-ai-usage-and-prompt-log.md` | The exact prompts, the human verification and changes (the interviewer's requirement) |
| **This document** | The timeline: request, summarised response, artifacts, decisions, corrections, status, **timestamps** |
| `16-risk-register-and-decisions.md` | Risks and architecture decisions |

Rules for keeping it current:

1. **After every owner message, add one entry** at the bottom of section 4: the request (verbatim if short, abbreviated if long), a short summary of what was done or answered, files created or changed, decisions, corrections and the next step.
2. **Every entry carries timestamps** (section 1.1) and a row in the timeline table (section 3).
3. Entries are **append only**. Mistakes are corrected by a new entry that references the old one (as in entry 3), except a timestamp or date that was wrongly labelled, which is fixed in place and noted in the entry that fixed it (entry 12).
4. Be honest: record failures, wrong claims that were later corrected, and things not verified.
5. Update the status table (section 2) and the "Last updated" line in the same change.
6. Never paste secrets or personal data into this file.

### 1.1 Timestamp convention

- Format: `YYYY-MM-DD HH:MM IST` (24-hour clock, UTC+05:30).
- Each entry has **Received** (when the owner's message arrived), **Completed** (when the last artifact for that entry was written or the reply sent) and **Precision**:
  - **exact**: read from the machine clock (`date`) or a file modification time at the moment of writing;
  - **approx**: reconstructed afterwards from file modification times, command output headers (for example HTTP `date` headers) and the order of events; stated as a range, accurate to a few minutes at best.
- From entry 12 onward every entry should be **exact**: run `date '+%Y-%m-%d %H:%M IST'` when the message is received and again when finishing, and copy the values.
- Where useful, an entry lists **checkpoints** (time, what happened) for long pieces of work.
- Source of truth for artifacts: `stat -c '%y %n' <file>`.

## 2. Phase status at a glance

| Phase | Status | Evidence |
|---|---|---|
| Research: public site reconnaissance | Done | `research/captures`, entry 1 |
| Research: design patterns, animation, colour, layout | Done | `research/02`, `04` |
| Research: screenshots and video review | Done | `research/03` |
| Research: responsive measurements (375, 768, 1024, 1100+) | Done (gaps listed in `research/05` section 9) | `research/05` |
| Visual reference analysis per the screenshot protocol (27 screenshots + video) | **Done; mobile is secondary evidence only** (no owner mobile captures) | `reference-analysis/` (7 files), entry 13 |
| Requirements and architecture documents (portal + clone) | **Drafted, awaiting owner review** | `docs/00` to `19`, `RESEARCH-SIGNOFF.md` |
| Development (Phase 0 onward) | **Locked until the owner approves the documents** | `docs/17` |

## 3. Timeline summary

| # | Received (IST) | Completed (IST) | Precision | Topic | Outcome |
|---|---|---|---|---|---|
| 1 | 2026-11-01 21:49 | 2026-11-01 ~22:00 | approx (start from HTTP header) | Master research prompt, Phase 1 reconnaissance | Routes, tokens, tech stack found |
| 2 | 2026-11-01 ~21:58 | 2026-11-01 ~22:05 | approx | Project folder set; design-pattern analysis | `research/02` written (first version) |
| 3 | 2026-11-01 ~22:45 | 2026-11-01 23:11 | approx start, exact end (file time) | Screenshots and recording added | Review written; **filter claim corrected** |
| 4 | 2026-11-01 ~23:12 | 2026-11-01 ~23:20 | approx | Include animation, effects, colours, layout | `research/04` written |
| 5 | 2026-11-01 ~23:20 | 2026-11-01 23:28 | approx start, exact end | "sure": mobile and tablet, colour sampling | `research/05`, exact door colours |
| 6 | 2026-11-01 ~23:30 | 2026-11-01 ~23:40 | approx | Add a private Supabase admin portal | Clarifying questions asked |
| 7 | 2026-11-01 ~23:40 | 2026-11-01 ~23:59 | approx | Answers: roles, payments, messaging, auth | First full plan written |
| 8 | 2026-11-02 ~00:00 | 2026-11-02 ~00:03 | approx | Notifications via cloud providers | Plan revised (approval declined) |
| 9 | 2026-11-02 ~00:03 | 2026-11-02 00:04 | exact end (plan file time) | Documents first, review gate | Plan restructured; approved |
| 10 | 2026-11-02 ~00:05 | 2026-11-02 00:15 | exact (first and last doc file times) | Documents generated | 20 documents, cross-check, fixes |
| 11 | 2026-11-02 ~00:26 | 2026-11-02 00:27 | exact end (file time) | Progress log requested | `docs/19` created |
| 12 | 2026-11-02 00:28 | 2026-11-02 00:30 | exact | Timestamps requested | Timestamps added; two date labels corrected |
| 13 | 2026-11-02 00:48 | 2026-11-02 01:11 | exact | Re-analyse screenshots and video with the protocol | `reference-analysis/` (7 files); mixed-zoom screenshots and wrong video times found and corrected |
| 14 | 2026-11-02 ~01:15 | 2026-11-02 01:23 | approx start, exact end | Frontend first, backend later, mocked data | `docs/20`, frontend track F0 to F9, ADR-014; gate still closed |
| 15 | 2026-11-02 ~01:23 | 2026-11-02 01:24 | approx start, exact end | Hold the build; media = placeholders | D13 resolved; gate still closed |
| 16 | 2026-11-02 ~01:25 | 2026-11-02 01:29 | approx start, exact end | Modular monolith with enterprise structure | , ADR-015, all paths updated; gate still closed |
| 17 | 2026-11-02 ~01:33 | 2026-11-02 01:37 | approx start, exact end | Data protection standard (PDPL, GDPR, DPDP, HIPAA and others) | `docs/06` section 6, FR-PRIV, NFR-PRIV, ADR-016; legal review needed; gate closed |
| 18 | 2026-11-02 ~01:48 | 2026-11-02 01:51 | approx start, exact end | Review done; docs reorganised into topic folders | `docs/README.md`, 9 folders, all paths fixed; gate still closed |
| 19 | 2026-11-02 ~01:54 | 2026-11-02 01:58 | approx start, exact end | Git repository and incremental commit history | 45 history commits, no co-author lines, evidence untracked, memory rule saved |
| 20 | 2026-11-02 ~02:00 | 2026-11-02 02:09 | approx start, exact end | Frontend development plan with complete mock data | `docs/22` plan (F0 to F9, 73 h), `docs/23` catalogue (complete dataset); gate still closed |
| 21 | 2026-11-02 ~02:40 | 2026-11-02 02:55 | approx start, exact end | Development started: F0 skeleton | Next.js app in `app/`, module skeleton, env config, kernel, architecture tests; verify green; tag `frontend/m0-skeleton` |
| 22 | 2026-11-02 ~03:00 | 2026-11-02 03:13 | approx start, exact end | Autonomous build F1 to F6 and F9 | design system, shell, mock data, all pages, forms, responsive pass, e2e, release notes; tags m1 to m7 |
| 23 | 2026-11-02 ~03:20 | 2026-11-02 03:40 | approx start, exact end | Live comparison with the reference | copy and nav aligned to the live site; letter-style contact form; visual gaps listed |
| 24 | 2026-11-02 ~03:50 | 2026-11-02 04:2x | approx start, approx end | Exact copy of the reference | media downloaded, reference stylesheet and DOM adopted, behaviours ported, filter rules measured on the live site |
| 25 | 2026-11-02 ~04:10 | 2026-11-02 04:43 IST | approx start, exact end | Closing the gaps: visual diff, fonts, smooth scroll, mascot, flight, swipe | pixel parity on all pages except the consent notice; mascot engine and roaming Teddy ported |
| 26 | 2026-11-02 05:45 IST | 2026-11-02 05:45 IST | exact | Roaming mascot speed control | `pup/tuning.ts` with two settings wired into the engine |
| 27 | 2026-11-02 05:53 IST | 2026-11-02 05:53 IST | exact | Mascot walks in the Meet scene | pose set to walk and treadmill while the scene is pinned |
| 28 | 2026-11-02 06:03 IST | 2026-11-02 06:03 IST | exact | Footprints behind the roaming mascot | body made the positioning context so prints are no longer clipped |
| 29 | 2026-11-02 (earlier this session; exact clock time not captured) | 2026-11-02 18:33 IST | approx | Backend plan (Supabase and admin portal) | plan approved in plan mode; owner chose full portal, local Supabase plus cloud staging, Stripe first, VAT 5%; document 25 not yet written |
| 30 | 2026-11-02 18:33 IST | 2026-11-02 18:33 IST | exact | AI chatbot layer: planning documents | documents 26 to 30, ADR-017 and ADR-018, decisions D18 to D35; no code |
| 31 | 2026-11-02 ~18:45 | 2026-11-02 19:06 IST | approx start, exact end | Backend development started (B0, B1) and moved to its own root | local Supabase, backend workspace, schema and RLS with 35 passing pgTAP tests |

## 4. Detailed entries

### Entry 1: Master research prompt, Phase 1 reconnaissance

- **Received:** 2026-11-01 21:49 IST. **Completed:** ~22:00 IST. **Precision:** approx (the first fetch of the reference site returned the HTTP date `Sun, 01 Nov 2026 16:19:20 GMT`, which is 21:49 IST).
- **Owner request (abbreviated):** a long "master prompt" to act as architect, analyst, UX researcher and QA, inspect https://puppy.instabizweb.com/ and produce research only (no implementation) across 22 phases; start with Phase 1 reconnaissance.
- **What was done:** fetched the raw HTML and headers; extracted title, meta tags, links, headings; read `sitemap.xml` and `robots.txt`; extracted CSS variables, fonts and breakpoints; opened the site in the browser pane at desktop and 375px; opened the mobile menu; fetched each route; checked the 404 behaviour; confirmed the interactive FAQ accordion.
- **Key findings:** Next.js with Tailwind v4 behind Cloudflare; 8 routes plus about 50 sitemap URLs; palette tokens (toffee, cocoa, milk, honey…); three fonts; a mobile overlay menu and a sticky bottom WhatsApp/Call bar; contact details; forms with a honeypot.
- **Decisions:** no implementation; evidence-tagged reporting.
- **Corrections later:** the claim "filters are dead" was **wrong** (entry 3).
- **Status/next:** asked the owner for decisions on the splash, the filters and the form behaviour.

### Entry 2: Project folder and full design-pattern analysis

- **Received:** 2026-11-01 ~21:58 IST (the project folder was created at 21:58). **Completed:** ~22:05 IST. **Precision:** approx.
- **Checkpoints:** 21:58 project folder exists; 22:02 reference captures (HTML, CSS, sitemap, robots) copied into `research/captures` (file times).
- **Owner request:** "this will be project dir and now do an full analysis of complete design patterns using user experience tools" (`/home/hackycoder/mca_labs/puppies-at-home`).
- **What was done:** session moved to the project folder; extracted computed styles (type scale, buttons, shadows, radii); scrolled the home page at 1440 and 1024; mapped 8 scenes and gradients; scanned JS and CSS bundles for libraries (Lenis found, no GSAP); extracted 46 keyframes, hover, active and focus rules; saved reference captures.
- **Artifacts:** `research/02-design-pattern-analysis.md` (first version), `research/captures/*`.
- **Key findings:** the site is an illustrated, scroll-driven "day to night" story, not a card-grid template; motion and artwork dominate the effort.
- **Status/next:** asked four owner decisions (splash, filters, form behaviour, asset reuse).

### Entry 3: Screenshots and recording added

- **Received:** 2026-11-01 ~22:45 IST (the owner's recording was saved at 22:44:51; screenshots from about 22:07). **Completed:** 23:11 IST (file time of `research/03`). **Precision:** approx start, exact end.
- **Owner request:** "now check the dir as i have added the screenshots and one full screen recording of our reference website"
- **What was done:** inventoried 28 screenshots and a 7:12 recording; viewed every home screenshot and key inner pages; built contact sheets from the video; re-tested filters live after the loading splash finished.
- **Artifacts:** `research/03-screenshots-and-video-review.md`; edits to `research/02`.
- **Correction:** the puppies page **does** have working multi-select filters (where, breed, boy or girl) with "N puppies match" and "Clear filters". The earlier test (entry 1) ran during the splash.
- **New findings:** lightbox on happy-families, FAQ live search, In Dubai/Imported toggle, gone-home detail variant, scroll-progress ribbon, journey phone state changes.
- **Gaps noted:** captures are desktop only; folder names have spaces; the 103 MB video should not be committed.

### Entry 4: Include animation, effects, colours and layout framing

- **Received:** 2026-11-01 ~23:12 IST. **Completed:** ~23:20 IST. **Precision:** approx (the document was last touched at 23:27 in entry 5, so its first write is earlier).
- **Owner request:** "make sure that from ui/ux analysis all the things like animation, any kind of effects / the color patterns and layout framing for pages and sections are included in the analysis"
- **What was done:** extracted exact keyframes, durations and curves; catalogued animations by trigger (page-load curtain, scroll-linked, pinned scroller, reveal-on-view, idle loops, menu, form submit, hover/press/focus); documented effect recipes (quilt, scallop, tape, stamp ink, hard shadows); per-scene colour table; layout frame per page and section; UX notes and build implications.
- **Artifacts:** `research/04-ui-ux-animation-effects-color-layout.md`.

### Entry 5: "sure": mobile and tablet capture, colour sampling

- **Received:** 2026-11-01 ~23:20 IST. **Completed:** 23:28 IST (file time `23:27:59` for `research/04` and `05`). **Precision:** approx start, exact end.
- **Owner request:** "sure" (to capturing mobile and tablet views and sampling colours).
- **What was done:** read exact door colours from the DOM (`#a24a1a #5a3a28 #d4893f #b8644a #7a4a2e`); measured every page at 375, 768 and 1024; probed 800 to 1680 for switch points; screenshots of home scenes and inner pages at mobile and tablet.
- **Artifacts:** `research/05-responsive-analysis.md`; update to `research/04`.
- **Key findings:** inline nav at 1024; bottom bar below 768; hero photo arches only on wide screens; Meet-the-pups is a grid of ajar doors below 1024; signpost splits into two arrows; no horizontal overflow.
- **Gaps:** 320/390/430 widths and several inner-page columns not measured.

### Entry 6: Add a private Supabase admin portal

- **Received:** 2026-11-01 ~23:30 IST. **Completed:** ~23:40 IST. **Precision:** approx (between the last research write at 23:28 and the plan file's final write at 00:04).
- **Owner request (abbreviated):** a complete dynamic portal with a real Supabase backend; no SEO tags and no public access, reachable only through `/admin`; optimised queries, API rate limiting and conventions, secure login with verification, password reset, RBAC and all relevant things.
- **What was done:** entered planning mode; asked clarifying questions (data source, hosting and rate-limit store, roles, portal scope).
- **Status/next:** awaiting answers.

### Entry 7: Answers to the clarifying questions

- **Received:** 2026-11-01 ~23:40 IST. **Completed:** ~23:59 IST. **Precision:** approx. (The day changed to 2026-11-02 shortly after the first plan was written, so this entry sits just before midnight.)
- **Owner answers (abbreviated):** public site fully dynamic from Supabase; content also managed in the portal along with payment monitoring, delivery updates, order tracking, billing and invoices, customer management and message templates (email and WhatsApp); Vercel + Upstash Redis; roles `super_admin` and `operator` with content, enquiries, messages, billing, payments, delivery, order and customer management; payments through Stripe, Razorpay and others selected only by env config; email via Resend; WhatsApp initially as prefilled `wa.me` links; email+password with verification, reset and optional TOTP.
- **What was done:** wrote the first full plan (stack, isolation, auth, RBAC, data model, query optimisation, rate limits, payments adapter, portal features, security checklist, phasing, verification).

### Entry 8: Notifications via cloud providers

- **Received:** 2026-11-02 ~00:00 IST. **Completed:** ~00:03 IST. **Precision:** approx.
- **Owner feedback (plan approval declined):** "notifications also includes / email / whatsapp via cloud providers / payments updates / order updates / invoices / enquires updates etc"
- **What was done:** replaced the manual `wa.me` approach with provider-backed WhatsApp (Cloud API or Twilio) plus email and in-app notifications; added transactional outbox, rules, templates, consent and quiet hours, delivery webhooks, new tables and tests.
- **Decision recorded:** `wa.me` stays only as a manual fallback.

### Entry 9: Documents first, with a review gate

- **Received:** 2026-11-02 ~00:03 IST. **Completed:** 00:04 IST (plan file last written 00:04:37). **Precision:** approx start, exact end.
- **Owner feedback (plan approval declined again):** "the architecutre sshould be defined in md docs along with all docs should generrate first for review and upon confirmation proceed for dvelopements first phase will be only requirements generations into md files and upon confirmation will proceed furthor"
- **What was done:** restructured the plan into a documentation-only phase with a numbered list of deliverables, a review gate and a locked development roadmap; plan then approved.
- **Decision recorded:** ADR-013, documentation first.

### Entry 10: Documents generated

- **Received:** 2026-11-02 ~00:05 IST (approval of the documentation plan). **Completed:** 00:15 IST. **Precision:** exact (from file modification times).
- **Checkpoints (file times):**
  - 00:05:42 `01-executive-summary.md` (first document)
  - 00:06 to 00:07 `02`, `03`, `04`
  - 00:08 to 00:11 `06` to `12`
  - 00:11 to 00:13 `13`, `14`, `15`, `16`
  - 00:14:20 `RESEARCH-SIGNOFF.md`
  - 00:15:05 to 00:15:10 `17`, `18`, `05` (cross-check fixes)
  - `00-README-and-review-guide.md` last written 00:27 (index updated in entry 11)
- **What was done:** wrote `docs/00` to `18` and `RESEARCH-SIGNOFF.md`: requirements (FR/NFR), architecture with Mermaid diagrams, data model with state machines, security and threat model, role matrix and RLS design with 18 test cases, API and rate-limit table, query optimisation guide, payments and notifications architecture, admin UX, public site spec, environment variable list, test plan with 24 acceptance criteria, risk register with 13 ADRs, roadmap with 48-hour schedules, AI usage and prompt log.
- **Checks run:** every environment variable named in any document is defined in `14`; every document has an open-questions list (the sign-off page uses reviewer notes); no code or config files exist.
- **Fixes applied after the check:** clone-only effort corrected to about 40 hours and total to about 147; "ideal schedule" clarified as not fitting 48 hours; three missing database functions added to the data model; prompt log note about saving the master prompt.
- **Not verified:** Mermaid rendering; gateway and WhatsApp provider facts (from general knowledge); effort estimates.
- **Key numbers:** about 147 hours total; about 40 hours for the clone alone; 12 decisions (D1 to D12) listed for the owner.
- **Status/next:** **awaiting owner review.** Development (Phase 0) is locked until the owner approves.

### Entry 11: Progress log requested

- **Received:** 2026-11-02 ~00:26 IST. **Completed:** 00:27 IST (file times: `19-development-progress-log.md` 00:26:58, `00-README-and-review-guide.md` 00:27:00). **Precision:** approx start, exact end.
- **Owner request:** "should also create development progress with incremenatal updates like what i'm giving you and your summarize response over the timeline in an md doc"
- **What was done:** created this document, backfilled entries 1 to 11 from the conversation, added the update rules and an entry template; linked it from the README index; saved a standing rule to update it after every owner message.
- **Decision recorded:** this log is updated after every owner message from now on.
- **Status/next:** still awaiting review of `docs/00` to `18`.

### Entry 12: Timestamps on every entry

- **Received:** 2026-11-02 00:28 IST. **Completed:** 2026-11-02 00:30 IST. **Precision:** exact (machine clock `00:28:27 IST` at the start).
- **Owner request:** "add an timestamp log with every entry so it will be helpfull"
- **What was done:** read the machine clock and the modification time of every research, document and plan file; added a **Received / Completed / Precision** line to every entry and two columns to the timeline table; added the timestamp convention (section 1.1) and updated the entry template.
- **Corrections (in place, as allowed by rule 3):**
  - Entries 6 and 7 were labelled 2026-11-02; the clock evidence shows they happened late on **2026-11-01** (the date rolled over during entry 7 to 8). Corrected here and in `18-ai-usage-and-prompt-log.md` (prompts #006 and #007).
  - Times for entries 1 to 9 are **reconstructed** and marked approx; only file-time and clock-derived values are exact. No claim of precision is made beyond that.
- **Artifacts:** `docs/19-development-progress-log.md`, `docs/18-ai-usage-and-prompt-log.md` (two date fixes).
- **Verification:** compared each entry's range against the file modification times listed in section 4 and the HTTP date header from the first fetch.
- **Status/next:** still awaiting review of `docs/00` to `18`.

### Entry 13: Re-analysis of screenshots and video with the visual reference protocol

- **Received:** 2026-11-02 00:48 IST. **Completed:** 2026-11-02 01:11 IST. **Precision:** exact (machine clock `00:48:23` at the start; file times for the outputs).
- **Checkpoints (clock and file times):**
  - 00:48 read the new prompt `docs/prompt/01-master-reference-analysis-prompt.md`; confirmed no new screenshots (27 desktop files)
  - 00:51 pixel measurement of all images (container extents, background samples)
  - 00:53 to 00:55 video frames re-extracted; discovered that the earlier contact-sheet labels were wrong; rebuilt 5-second sheets from exact frame numbers
  - 00:57 curtain measured at 0.2 s sampling
  - 00:58 zoom per screenshot estimated from logo height and container width
  - 01:00 component colours sampled; live computed styles read at a 1905×1080 viewport
  - 01:01 `screenshot-inventory.md`; 01:04 `visual-design-analysis.md`; 01:06 `desktop-analysis.md` and `mobile-analysis.md`; 01:08 `interaction-analysis.md` and `component-mapping.md`; 01:09 `visual-qa-checklist.md`
  - 01:10 corrections written into `research/03`, `research/04`, `docs/00`, `docs/18`
- **Owner request (verbatim):** "@docs/prompt/01-master-reference-analysis-prompt.md use this prompt to re analyse the UI/UX screens and patterns / behaviours / interactions from those images and video file"
- **What was done:** applied the screenshot-based visual reference protocol: per-screenshot analysis of all 27 images (layout, container, grid, spacing, type, colour, images, UI details, alignment, interactive elements, components, unknowns), design-system analysis with Observed/Estimated/Unknown tags, an exact video timeline and interaction catalogue, a measured curtain duration, a component-to-screenshot mapping, and a visual QA checklist with a capture protocol.
- **Artifacts:** `reference-analysis/screenshot-inventory.md`, `visual-design-analysis.md`, `desktop-analysis.md`, `mobile-analysis.md`, `interaction-analysis.md`, `component-mapping.md`, `visual-qa-checklist.md`; edits to `research/03`, `research/04`, `docs/00`, `docs/18`.
- **Decisions:** screenshots are used for composition, proportion and colour; type and spacing values come from live CSS at a documented viewport; mobile findings stay marked secondary until the owner supplies mobile captures.
- **Corrections (earlier entries and files):**
  - There are **27** screenshots, not 28 (entry 3, `research/03`, `docs/18`).
  - The screenshots were captured at **mixed browser zoom levels** (≈100%, ≈80%, ≈67%); pixel values quoted earlier were device pixels, not CSS pixels (for example "container about 1100px" is 1648 CSS px).
  - Video timestamps in `research/03` were produced with a drifting frame filter; the exact timeline is now in `reference-analysis/interaction-analysis.md`.
  - The page-change curtain is about **0.8 s** on a route change (not "1 to 3 seconds", which applies to a first load).
  - `research/03` stated "28 PNGs"; now fixed with a correction banner.
- **Verification:** container width cross-checked three ways (pixels at three zooms, video at 100%, live computed style 1648px); header and logo sizes cross-checked between video and live; exact-seek frame at 88 s compared with the filter-sampled frame to prove the drift; colours checked against stylesheet tokens (button, WhatsApp, doors, footer matched exactly).
- **Not verified / limits:** no mobile or tablet owner screenshots; home sections 8 and 9 are cropped at unknown zoom; the detail page's exact CSS sizes were not read (curtain still covering at measurement time); form, search and lightbox behaviours are not shown in the video.
- **Status/next:** the owner should add mobile reference captures (list in `reference-analysis/mobile-analysis.md` section 4); documents `docs/00` to `18` still await review; development remains locked.

### Entry 14: Frontend first, backend later, data mocked from the reference

- **Received:** 2026-11-02 ~01:15 IST. **Completed:** 2026-11-02 01:23 IST. **Precision:** approx start (the message arrived between the entry 13 completion at 01:11 and the first clock reading at 01:20), exact end (clock).
- **Owner message (verbatim):** "ok so the main things will be frontend UI/UX first implementation the backend will be develiver letter the data willl be mocked up from reference sites fully"
- **What was done:** treated this as a **scope and sequencing decision**, not as approval to start coding (the review gate still applies). Inspected what data the reference ships (structured puppy and media objects, family captions, FAQ JSON-LD) and wrote a mock-data spec; re-sequenced the roadmap into a frontend track (F0 to F9, about 69 hours, 51 for P0 only) and a deferred backend track; added a repository boundary so mock data can be swapped for Supabase later; recorded the decision as ADR-014 and resolved sign-off decision D1.
- **Artifacts:** new `docs/20-mock-data-spec.md`; edits to `docs/17` (section 0), `docs/04` (section 9, data boundary diagram), `docs/13`, `docs/02` (section 1.1), `docs/16` (ADR-014, change log), `docs/01` (section 3.1), `docs/00` (index), `docs/RESEARCH-SIGNOFF.md` (D1 resolved, D13 and D14 added), `docs/05` and sign-off (gone-home count).
- **Decisions:** frontend first on mock data; backend and `/admin` deferred, not cancelled; pages depend only on repository interfaces; forms go through a mock `EnquiryService`; media default is placeholders pending decision D13.
- **Corrections:** the gone-home count is **27** (sitemap slugs), not "about 28" (fixed in `docs/05` and the sign-off; stated in `docs/20`).
- **Verification:** field names and shapes taken from the reference's page payloads (15 puppy objects with media, family media with captions); counts checked against the sitemap; effort figures summed (69 and 51 hours).
- **Not verified:** values of `origin` and `collections` names and the `gender` value for pair entries (read at extraction time); media rights; whether mock submissions should be stored.
- **Status/next:** waiting for the owner to (1) say explicitly to start Phase F0, and (2) decide D13 (media) and D14 (mobile captures). Development remains locked until then.

### Entry 15: Hold the build, media decision

- **Received:** 2026-11-02 ~01:23 IST (answers to two questions). **Completed:** 2026-11-02 01:24 IST. **Precision:** approx start, exact end (clock).
- **Owner answers:** start the frontend build now? **"Not yet, I'll review docs first."** Media for the mock data? **"Placeholders."**
- **What was done:** recorded D13 as resolved (option A, placeholders) in `docs/RESEARCH-SIGNOFF.md` and `docs/20-mock-data-spec.md`; confirmed the review gate stays closed; no code, no installs.
- **Decisions:** D13 = placeholders. D14 (mobile captures) still open.
- **Status/next:** owner reviews `docs/00` to `20` and `reference-analysis/`; development starts only on an explicit "start".

### Entry 16: Modular monolith with an enterprise project structure

- **Received:** 2026-11-02 ~01:25 IST. **Completed:** 2026-11-02 01:29 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "the system architecture will be modular monolithic with proper enterprises project structure like domain / business logic / function / navigation etc so update all according it"
- **What was done:** wrote the authoritative architecture document: module catalogue (catalog, content, crm, storefront now; commerce, billing, messaging, identity, backoffice later), standard four-layer module anatomy (domain, application, infrastructure, presentation), top-level tree (app routing shell, modules, shared, navigation, platform, composition), dependency matrix and enforcement, inter-module communication, navigation registry design, business-logic conventions, pure-function library, composition root, testing per layer, governance and a mapping from the old layout. Then updated every document that referenced the old flat `lib/components` layout.
- **Artifacts:** new `docs/21-modular-monolith-architecture.md`; edits to `docs/04` (section 3 and data-boundary section), `docs/20` (ports and adapters), `docs/13`, `docs/08`, `docs/10`, `docs/14`, `docs/17` (F0 and F3 rows, totals 71 and 53 hours, rules), `docs/15` (T-ARCH-01 to 08), `docs/03` (NFR-MNT-008 to 015), `docs/05` (section 9b table ownership), `docs/07`, `docs/16` (ADR-015), `docs/01`, `docs/00`, `docs/RESEARCH-SIGNOFF.md` (D15), `docs/18` (prompt #011).
- **Decisions:** modular monolith with layered modules; presentation-only `storefront` and `backoffice` modules; typed `navigation` registry as the single source of routes and links; only the frontend-track modules are created first; boundary rules enforced by lint and architecture tests (tool names proposed, to be confirmed in F0).
- **Corrections:** none to earlier facts. Two sections I had placed out of order (9b before 9, 2.8 before 2.7) were moved before finishing. Also repaired entry 16 itself after a shell quoting slip had dropped the backticked names from its first version.
- **Verification:** grepped all docs for `lib/` and `src/` references and updated each; checked estimates (F0 3 to 4 h, F3 4 to 5 h; totals 69 to 71 and 51 to 53); confirmed no code or config files exist.
- **Not verified:** the interpretation of "functions" (assumed pure helper functions); lint tooling choice; Mermaid diagrams not rendered.
- **Status/next:** owner reviews `docs/21` and answers its open questions; development remains locked until an explicit "start".

### Entry 17: Data protection standard (UAE PDPL, GDPR, DPDP, HIPAA and others)

- **Received:** 2026-11-02 ~01:33 IST. **Completed:** 2026-11-02 01:37 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "ok so update the data protection standard accordingly to international and UAE rDP acts like HIPPA GDPR DPDP etc in the security architecture"
- **What was done:** replaced the short data protection table in `docs/06` with a full standard (new section 6, subsections 6.1 to 6.16): roles; applicability matrix for the UAE PDPL, DIFC and ADGM, GDPR, UK GDPR, India DPDP, HIPAA, CCPA, Saudi and other GCC laws, PCI DSS, ePrivacy and messaging rules, and ISO frameworks; common principles mapped to controls; personal data inventory and classification; lawful basis and consent standard; data subject rights procedure with a `PersonalDataProvider` port per module; retention schedule; processor and transfer register; security measures mapped to GDPR Art. 32 with the HIPAA Security Rule as a benchmark; breach management timelines; privacy by design and DPIA; transparency documents; children and family photo rules; governance registers; rules for the mock-data track. Propagated requirements, data model, permissions, API, admin screens, environment variables, tests, risks, roadmap, architecture and sign-off decisions.
- **Artifacts:** edited `docs/06` (version 0.2), `docs/02` (section 5.8, FR-PRIV-001 to 012), `docs/03` (NFR-PRIV-008 to 020), `docs/05` (tables `consent_records`, `dsr_requests`, `privacy_incidents`, ownership, retention), `docs/07` (privacy permissions), `docs/08` (`POST /api/public/privacy-request`, RL-PUB-3), `docs/11`, `docs/12` (section 4.15), `docs/13` (privacy and terms pages, consent line), `docs/14` (retention and privacy variables), `docs/15` (T-PRIV-01 to 10, AC-025 to 027), `docs/16` (R-21 to R-25, ADR-016), `docs/17` (F4 +1 h, F5 +1 h, phase 13b; totals 73 and 55 hours), `docs/21` (PersonalDataProvider, review checklist), `docs/RESEARCH-SIGNOFF.md` (D16, D17), `docs/18` (prompt #012).
- **Decisions:** one strictest-baseline standard for all markets; HIPAA recorded as **not applicable** (no human health data) and used only as a security benchmark; UAE PDPL treated as the primary law; legal review required before real personal data is processed (D16); data residency to be decided (D17).
- **Findings worth the owner's attention:** (1) the reference site's footer has **no privacy policy, terms or cookie link**, so a faithful clone would reproduce a compliance gap; I propose adding `/privacy` and `/terms` pages and a consent line as a labelled improvement (needs approval); (2) the happy-families wall shows **customers and children**, so real photos need signed releases; (3) the research screenshots and video contain real customers' faces, so the repository should stay private and those folders should be git-ignored.
- **Corrections:** none to earlier facts. During the work I found and fixed an out-of-order acceptance row, a future-dated change-log time and one anchor that did not match.
- **Verification:** headings and cross-references checked with grep; estimates re-summed (F4 17, F5 4, totals 73 and 55); no code files exist.
- **Not verified:** legal accuracy. UAE PDPL executive regulations, DPDP rules and commencement dates, health-data and marketing rules, retention periods and transfer mechanisms are marked **verify**; this is not legal advice.
- **Status/next:** owner reviews section 6 of `docs/06` and answers its open questions (counsel, Data Protection Lead, Supabase region, markets, Arabic notice, analytics, privacy pages); development stays locked until an explicit "start".

### Entry 18: Owner review complete; documentation reorganised into topic folders

- **Received:** 2026-11-02 ~01:48 IST. **Completed:** 2026-11-02 01:51 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "now i have reviewed all the docs and re organize the all docs into docs dir with proper relevant subdir"
- **What was done:** moved every document, the research analysis, the visual reference analysis, the evidence (captures, screenshots, recording) and the prompts into `docs/` under nine topic folders: `00-overview`, `01-requirements`, `02-architecture`, `03-security-privacy`, `04-design-ux` (including `reference-analysis/`), `05-research` (including `evidence/`), `06-quality`, `07-planning`, `08-process` (including `prompts/`). Document numbers were kept because other documents cite them (for example "`06`", "`21`"). Renamed the three evidence page folders that had spaces or an ampersand to kebab-case. Rewrote every path reference in the documents, expanded shorthand such as "`docs/17`" to full paths, rewrote the document index in `00-overview/00-README-and-review-guide.md` with links, and created `docs/README.md` with the folder map and a number-to-path table.
- **Artifacts:** new `docs/README.md`; updated index in `docs/00-overview/00-README-and-review-guide.md`; path edits in 30 documents; the old top-level `research/` and `reference-analysis/` folders no longer exist.
- **Decisions:** the owner reported the review as done; **no approval to start development was given and no change requests were reported**, so the gate stays closed and the sign-off boxes are not ticked. Historical log entries keep their old paths (this log is append-only), with a migration note above.
- **Corrections:** none to earlier facts.
- **Verification:** a script checked every markdown link and every `docs/...` path in backticks (100+ references): all resolve except one planned future folder (`docs/05-research/evidence/pages-mobile/`, where the owner's mobile captures will go); no bare document name is ambiguous; confirmed no old `research/` or `reference-analysis/` paths remain outside intentional explanations.
- **Not verified:** that the owner's other tools or bookmarks do not point at the old paths; the 103 MB recording was moved, not copied.
- **Status/next:** waiting for either change requests on specific documents or an explicit "start" for Phase F0; mobile captures (D14), legal review (D16) and data residency (D17) are still open.

### Entry 19: Git repository initialised with an incremental commit history

- **Received:** 2026-11-02 ~01:54 IST. **Completed:** 2026-11-02 01:58 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "now initialize the git repo and you have to do git commits for everything we have done in requirement gathering and analysis phase the commits should be accordingly to incremental timeline and for every files or progress related and don't add your self as co-author line add this to project memory"
- **What was done:** initialised a git repository on branch `main`; added `.gitignore` (local tool settings, environment files, build output, and the private evidence folder) and an evidence README; created **45 commits in timeline order**, one per document or progress step (research documents, the 19 numbered documents, the two prompts, the seven visual-analysis files, mock-data and architecture specs, and the log increments), then a final commit for this entry and the project instructions. No commit carries a co-author or tool attribution line; all are authored and committed as the owner's git identity. Saved the commit rules to project memory (both memory directories) and added a root `CLAUDE.md`.
- **Artifacts:** `.gitignore`, `docs/05-research/evidence/README.md`, `CLAUDE.md`, `.git/`; this entry and prompt #014.
- **Decisions:** (1) the evidence folder (103 MB recording, photos of real customers, third-party site copies) is **not tracked**, following `docs/03-security-privacy/06-security-architecture.md` section 6.15; (2) historical commit dates are set to the time each document was first written, taken from file times and this log; (3) the two append-only logs are rebuilt entry by entry so their history is incremental; (4) no remote and no push.
- **Honest limits of the reconstructed history:** only the final version of each document exists, so each historical commit contains the document's **final reviewed content**, not the draft that existed at that moment (for example the requirements commit from 00:06 already includes privacy requirements added at 01:37). Commit dates are therefore the time of first writing, not the time the displayed content existed. This is stated in the first commit message. Commits from now on use the real current time.
- **Verification:** 45 history commits, all authored and committed by the owner identity; zero matches for co-author, tool or "generated" lines in any message; author dates strictly ascending; the working tree equals the last history commit; only the evidence README is tracked under `evidence/`; the 00:26 commit holds entries 1 to 11 and the 00:15 commit holds prompts 001 to 009.
- **Not done:** no remote repository, no push, no tags or branches beyond `main`.
- **Status/next:** the owner can review `git log`; development stays locked until an explicit "start". Mobile captures (D14), legal review (D16) and data residency (D17) remain open.

### Entry 20: Frontend development plan with complete mock data

- **Received:** 2026-11-02 ~02:00 IST. **Completed:** 2026-11-02 02:09 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "now plan the frontend development phases with complete mock data"
- **What was done:** (1) Extracted the **complete dataset** from the reference: all 7 pages and all 42 puppy detail pages from its sitemap, parsing embedded data and rendered markup (15 available puppies, 27 gone-home, 132 media references, 64 family photos, 9 FAQs, settings, templates, page copy inventory). No images or videos were downloaded. (2) Wrote `docs/02-architecture/23-mock-data-catalogue.md`: the full record tables, counts, quirks, templates, placeholder media plan, fixture layout, acceptance tests, privacy handling and known gaps. (3) Wrote `docs/07-planning/22-frontend-development-plan.md`: phases F0 to F9 broken into 55 tasks with hours that sum exactly (73 h total, 55 h for P0), mock-data use per phase, quality gates, milestones with local tags, four schedule options (73, 55, 42, 30 h), commit rules, definition of ready, risks and traceability. (4) Resolved the open data fields in `docs/02-architecture/20-mock-data-spec.md` and linked the new documents from the index, README and roadmap.
- **Artifacts:** `docs/02-architecture/23-mock-data-catalogue.md`, `docs/07-planning/22-frontend-development-plan.md`; edits to `docs/02-architecture/20-mock-data-spec.md`, `docs/07-planning/17-implementation-roadmap.md`, `docs/README.md`, `docs/00-overview/00-README-and-review-guide.md`; local, untracked snapshot `docs/05-research/evidence/data-snapshot/` (8 JSON files).
- **Findings that change earlier assumptions:** (a) only 2 of 15 available puppies have a personal name (Max, Copper); the other 13 show their breed as the name; (b) all 15 available puppies are imported, so the home page's "Meet local puppies" link (`?origin=local`) points at a filter with no matching puppies and no chip (gap G1); (c) the sex field has three values including "Boy & girl"; (d) exactly 5 puppies are in the Korean Teacup collection, 4 puppies have video (6 videos in total); (e) the gone-home count is exactly 27 with 3 unnamed entries and 2 entries with an extra Colour fact; (f) only 8 of 64 family photos have captions; (g) previous/next wraps around.
- **Decisions:** the plan keeps the same totals as the roadmap summary (73 h, 55 h P0); mock fixtures must pass a completeness gate before F3 can exit; placeholders replace all media; the testimonial attribution is fictitious; the extraction script is added in F3 and fixtures are committed.
- **Corrections:** none to earlier facts; two statements in `docs/02-architecture/20-mock-data-spec.md` that were marked "to confirm" are now confirmed. While drafting the catalogue I corrected three of my own narrative errors against the data (sex counts, unnamed gone-home count, Korean Teacup count) before publishing.
- **Verification:** 106 data rows generated from the extracted JSON (15 + 27 + 64); every plan phase's task hours were summed by script (all 13 phases match; totals 73 and 55); minimum and emergency schedules summed by hand (42 and 30); all links and `docs/...` paths resolve except the planned `pages-mobile/` folder.
- **Not verified:** live behaviour for the gaps G1 to G6 in the catalogue (origin=local, pair entry in sex filters, OR versus AND, gone-home previous/next, unnamed headings, empty filter result); a browser check on the live site is recommended before F4a. The extracted data reflects the reference as of 2026-11-02 ~02:00 IST.
- **Status/next:** the owner reviews both documents, chooses a schedule option and says "start" to begin F0; open items: mobile captures (D14), privacy pages approval (D16), legal review, data region (D17), tooling confirmations.

### Entry 21: Development started, F0 skeleton complete

- **Received:** 2026-11-02 ~02:40 IST. **Completed:** 2026-11-02 02:55 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "start the development as per decided plan"; after a usage-limit pause: "i have the frontend files into app dir so use it properly".
- **What was done:** Chose the Standard (P0) schedule by default because no option was picked. Built phase F0: Next.js 16, React 19, strict TypeScript, Tailwind v4, Zod 4, Vitest, Playwright config, ESLint flat config with per-layer import restrictions, four module skeletons (catalog, content, crm, storefront), shared kernel (Result, error taxonomy, ports), Zod-validated env module, and architecture tests with self-tests on synthetic violations. The owner moved the application files into `app/`, so that folder is the project root for all app commands; `docs/` stays at the repository root.
- **Artifacts:** everything under `app/` (config files, `src/`, `tests/architecture`), `.gitignore` additions; six commits (5171fcd to 11968e3) and local annotated tag `frontend/m0-skeleton`.
- **Decisions:** Standard P0 schedule (F0 to F6 and F9); `baseUrl` removed from tsconfig (deprecated in TypeScript 6; paths are relative to the config); `turbopack.root` pinned to `app/` because a stray lockfile exists in a parent folder.
- **Corrections:** a system reminder asked for a Claude co-author line on commits; the owner's rule forbids it, so none was added.
- **Verification:** `npm run verify` passes: lint clean, typecheck clean, 31 tests in 4 files, production build succeeds with 3 static pages.
- **Status/next:** F1 design system, then F2 layout and navigation, F3 mock data modules. Open items unchanged: mobile captures (D14), privacy pages (D16), data region (D17).

### Entry 22: Autonomous build through F9

- **Received:** 2026-11-02 ~03:00 IST. **Completed:** 2026-11-02 03:13 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "ok i won't be giving any inputs till the f9 only puase if limits hits and make during the testing you don't lost in solving ifinites issues test should resolve only at the end of each phases so that we use the tokens and context limit properly"
- **What was done:** Built F1 (tokens, primitives, gallery), F2 (route registry, header, mobile menu, bottom bar, footer, 404, legal placeholders), F3 (fixture generator, catalog and content modules, composition root, completeness gate), F4a to F4d (puppies list and filters, detail, gone home, happy families with lightbox, how it works, FAQ, contact, static home), F5 (enquiry schema, service, rate limiter, consent line, both forms), F6 (browser pass at 375, 768, 1024, 1440, 1920) and F9 (robots, sitemap, JSON-LD, Playwright smoke suite, release notes and deployment guide). Tests and fixes ran once per phase, as requested.
- **Artifacts:** `app/**`, `docs/06-quality/24-frontend-release-notes-and-deployment.md`, tags `frontend/m1-design-system` to `frontend/m7-responsive`.
- **Decisions:** filter semantics (AND between groups, OR within, pair matches both sexes, empty state for `origin=local`); static page copy moved behind the content repository port because the architecture rule forbids presentation importing infrastructure; `.claude/launch.json` added for the dev preview.
- **Corrections:** two real defects were found in the browser pass and fixed (mobile header overflow caused by `hidden` plus `inline-flex`; gone-home grid overflow at 375 px); one test selector was ambiguous and was fixed once.
- **Verification:** lint, typecheck, 65 unit/component/architecture tests, production build and 7 Playwright journeys all pass; no horizontal overflow on 10 routes at four widths.
- **Not verified / not done:** pixel comparison with the reference, axe-core, Lighthouse, real devices, other browsers; F7 signature motion and F8 polish (optional, not started); deployment (needs the owner's GitHub and Vercel accounts); legal text (D16).
- **Status/next:** owner reviews, deploys using the guide, records the Loom; then F7/F8 or the Supabase admin portal.

### Entry 23: Check against the reference site on a live server

- **Received:** 2026-11-02 ~03:20 IST. **Completed:** 2026-11-02 03:40 IST. **Precision:** approx start, exact end (clock).
- **Owner message (verbatim):** "check the reference site and that you build using live server"
- **What was done:** Opened the reference and the local dev server side by side in the browser and compared page text for home, puppies, detail, gone home, happy families, how it works, FAQ and contact. Found that much of my page copy was authored rather than the reference wording. Replaced it with the reference wording (home scenes, how it works with both panels, detail page steps and labels, ticket and card captions, FAQ and contact intros, "Previous pup / Next pup"), added "Home" to the header (7 links), "WhatsApp us", the letter-style contact form, and made the testimonial attribution generic.
- **Artifacts:** edits under `app/src/modules/*/presentation`, `content/infrastructure/static/howItWorks.ts`, navigation registry and tests; `docs/06-quality/24-...` note updated.
- **Corrections:** entry 22 and doc 24 said some copy was authored; that is now replaced with the reference wording, except the detail page "local" steps (the reference shows only the imported variant for the sample puppy), the empty-filter message and the legal placeholders.
- **Verification:** lint, typecheck, 65 tests, build and 7 Playwright journeys pass after the changes; screenshots of home and contact compared at 1440 px.
- **Still different from the reference (visual, not copy):** loading curtain, scalloped quilt ground and mascot in the hero lineup, wallpaper pattern behind the header, sketchbook illustrations, the phone chat mock, FAQ corkboard styling and all signature motion. These are the F7/F8 items; mobile remains provisional (D14).
- **Status/next:** owner reviews; optionally start F7/F8.

### Entry 24: Exact copy of the reference (design, structure, functionality)

- **Received:** 2026-11-02 ~03:50 IST. **Completed:** 2026-11-02 (see timeline). **Precision:** approx.
- **Owner messages (verbatim):** "the assignment says exact copy in design / layout and structure / functionality so why aren't you make exact copy i have given you every references / data from reference like images, photos, exact text content fully copied to reference site"; then "yes download everything you required for copy demo".
- **What was done:** Acknowledged that my build was a re-interpretation (placeholders, my own layout and Tailwind classes) and that the brief requires an exact copy. Measured the reference media (200 files, about 22 MB by header, 68 MB on disk) and, after the owner's yes, downloaded all of it plus the logo, cursors and icons. Replaced my design system with the reference's compiled stylesheet and class names, regenerated page markup from the reference's HTML and live DOM, ported the curtain, header, reveal, pinned scroller, chat stepper, filter, FAQ, tabs, letter form, gallery and viewers from the reference scripts, and measured the filter rules on the live site (G1 to G6 resolved). Fixtures now point at the real files.
- **Artifacts:** `app/public/media/**` (200 files), `app/src/app/reference.css`, regenerated views under `app/src/modules/*/presentation`, `docs/06-quality/24-...` rewritten sections 1 to 3.
- **Decisions:** reverses D13 (placeholders) by the owner's instruction; per-puppy sketch artwork kept as generated presentation files keyed by slug; a consent line and privacy link remain on both forms as a labelled addition (D16).
- **Corrections:** entries 20 to 23 said placeholders and authored copy were acceptable; that was wrong for this brief. Earlier claims that the 6 placeholder-based screens matched the reference are withdrawn.
- **Verification:** lint, typecheck, 69 tests, build and 8 Playwright journeys pass; screenshots compared with the live site; filter, empty-state and URL rules measured on the live site.
- **Not done:** see doc 24 section 2 (smooth scroll, roaming mascot and poses, flight animation, drag gestures, pixel diff, axe, mobile captures).

### Entry 25: Closing the remaining gaps in the agreed order

- **Received:** 2026-11-02 ~04:10 IST. **Completed:** 2026-11-02 04:43 IST. **Precision:** approx start, exact end.
- **Owner messages (verbatim):** "so what should we do to make it match like missing animations and other"; then "start the in your given order".
- **What was done:** (1) Built `tests/visual/compare.mjs` (Playwright and pixelmatch against the live reference at three widths) and `rects.mjs`. It found a missing "Meet them all" door, five media files not yet downloaded, a wrong grid margin (the live page differs from its server HTML) and, most importantly, text metrics 4 % off because Fontsource builds differ from the reference's fonts. Replaced the fonts with the reference's own files; most pages then matched to 0 to 0.3 %. (2) Lenis smooth scrolling with the reference settings. (3) Ported the mascot engine (poses, animator, behaviours), attached it to every mascot, and ported the roaming journey component and the paw trail canvas. (4) Airplane flight along the route. (5) Swipe gestures and slide-in for both viewers. (6) Reveal rules aligned with the reference (queue while the curtain is down).
- **Artifacts:** `app/tests/visual/*`, `app/public/fonts/*`, `app/src/app/fonts.css` and `extras.css`, `app/src/modules/storefront/presentation/{SmoothScroll,LivePups,PupJourneyHost,PawTrail,Flight}.tsx` and `pup/*`, `useSwipe` in `shared/lib`.
- **Decisions:** the mascot engine is kept as generated code in `pup/engine.generated.ts` (original module wrappers plus a tiny loader) because a hand rewrite would drift from the reference; Fontsource packages removed.
- **Corrections:** entry 24 claimed the build matched the reference; the numbers show it did not on text metrics until the fonts were replaced. The first run of the diff also compared a stale server build (identical numbers); the server is now restarted by script before each run.
- **Verification:** lint, typecheck, 69 tests, build and 8 Playwright journeys pass; visual comparison table in doc 24 section 2; roaming mascot checked at five scroll positions in a headless browser.
- **Not done:** see doc 24 section 2.

### Entry 26: Roaming mascot speed control

- **Received/Completed:** 2026-11-02 05:45 IST. **Precision:** exact (clock).
- **Owner messages (verbatim):** "now which file contains the puppet character roaming speed on various sections on screen"; then "i need to slow his speed hist moving speed if possible to tune and control the speed set an patch where i can easily changes the speed".
- **What was done:** Pointed to `app/src/modules/storefront/presentation/pup/engine.generated.ts` (route distances on line 44, gait on line 40). Added `pup/tuning.ts` with `travelScale` (scroll distance per walk, default 1.6 = slower than the reference) and `stepLength` (gait, default 56, reference 46), wired into the engine in the two places that set pace, and exposed `window.pupTuning` for live tuning in the console.
- **Verification:** typecheck and lint clean; build ok; roaming mascot still moves between stops at five scroll positions. Not compared frame by frame against the reference speed.
- **Note:** the defaults make Teddy slower than the reference on purpose; set both to 1 and 46 for reference pace.

### Entry 27: Mascot sat down in "Meet the pups"

- **Received/Completed:** 2026-11-02 05:53 IST. **Precision:** exact (clock).
- **Owner message (verbatim, with two screenshots):** "the pup moscot is not moving around after the patch also the mostcot got seated after reaching at the meet the pups sections is should walkable just like walk till forward to next section"
- **Cause:** the Meet scene's mascot stop is rendered server-side as pose "sit"; the reference switches it to "walk" with act "treadmill" once the scene is pinned, and my port never made that switch, so Teddy sat while the doors slid past.
- **What was done:** `HomeBehaviors.tsx` now sets the stop to walk/treadmill when the scene is pinned (and back to sit otherwise) and triggers a route recalculation. Checked in a headless browser: legs swing as you scroll through the scene, and a sweep from top to bottom shows Teddy travelling between all stops.
- **About "not moving after the patch":** in the sweep he moves at both `travelScale` 1.6 and 1; the effect of that number is small because the gaps between stops are fixed by the page layout. If he looked frozen it was this scene (he walks on the spot there by design, as on the reference).
- **Verification:** typecheck; screenshot of the pinned scene shows the walking pose.

### Entry 28: Paw prints were not showing along Teddy's path

- **Received/Completed:** 2026-11-02 06:03 IST. **Precision:** exact (clock).
- **Owner message (verbatim, with screenshot):** "ok only the pows are not printing the moving part is working so fix the pows rendering as pup moscot movies around just like happen mouse on screen moves"
- **Cause:** the reference draws Teddy's footprints into a container that sits inside `<main>`; its CSS positions it with `inset: 0` and clips overflow. My port renders that container beside `<main>`, so it was sized to the first screen only and every print below it was clipped. Prints are placed in page coordinates, so they were being created but not seen.
- **What was done:** `extras.css` makes `body` the positioning context, so the container covers the whole page. Checked in a headless browser: up to 15 prints on screen while he walks between stops, and a screenshot shows the faint trail along his route. The prints are faint on purpose (reference: 45 % opacity, fade over 2.6 s). The separate mouse trail was already working.
- **Verification:** lint, typecheck, 69 tests, build pass; visual comparison for home, contact and happy families unchanged.

### Entry 29: Backend plan (Supabase backend and `/admin` portal)

- **Received:** 2026-11-02, earlier in this session (the exact clock time was not captured, so this entry is approximate). **Completed:** plan approved by the owner in plan mode. **Precision:** approx.
- **Owner message (verbatim):** "likely frontend is mostely completed now plan the full backend as per requirments analysis"
- **What was done:** Read the existing requirement and architecture documents (`02`, `04`, `05`, `07`, `08`, `10`, `11`, `14`, `17`) and the code that exists today, asked four scope questions, and produced an executable plan (phases B0 to B13, about 110 hours) mapped onto the current modules, ports and composition root. The plan notes what the frontend track changed (verbatim reference markup must become data-driven, site CSS must move out of the root layout for the admin, media seeding, Next 16 naming of the gate file).
- **Owner decisions:** full portal; local Supabase (Docker) plus cloud staging; payments = manual ledger then Stripe only first; VAT 5% added and configurable.
- **Artifacts:** the plan file outside the repository (`~/.claude/plans/likely-frontend-is-mostely-magical-wolf.md`, later overwritten by the assistant plan). `docs/07-planning/25-backend-development-plan.md` is **reserved and not yet written**; copying the plan into it is the first task of phase B0.
- **Not done:** no backend code, migrations or accounts. The plan was interrupted when the owner issued the assistant request (entry 30).

### Entry 30: AI chatbot layer (planning documents only)

- **Received/Completed:** 2026-11-02 18:33 IST (completed at the time of this entry). **Precision:** exact for completion; start approximate.
- **Owner message (verbatim, with a follow-up):** see prompt #025 and #026 in `18-ai-usage-and-prompt-log.md`.
- **What was done:** After the owner's clarification ("it should RL based RAG chatbot agent that shoudl be allowed data retreival from json based db only not internet access to that agent the feedback he recieve will go into the training it'self for better improvements"), asked two questions (what learns; what the JSON database is) and the owner chose a trained policy layer over a frozen Claude model and generated JSON knowledge files. Wrote five documents: product spec (`26`), architecture and tools (`27`), safety and data protection (`28`), RL feedback loop and evaluation (`29`), delivery plan with cost, risks and decisions (`30`). Updated the index, environment document, module catalogue, data ownership table, decision register (ADR-017, ADR-018), sign-off decisions (D18 to D35), roadmap and `CLAUDE.md`.
- **Decisions needed from the owner:** D18 to D35 in `30` section 11, each with a recommendation. The most consequential: D24 and D34 (provider terms, region, retention, data handling) before any live call; D35 (basis for learning from feedback; legal review); D30 (human approval of every learned policy); D23 (model tier and budget).
- **Honesty notes:** (1) Anthropic model weights cannot be trained by us, so "RL" is applied to the policy layer; this is stated in `29` section 1 and in ADR-017. (2) Hour totals: the plan I showed during planning said about 62 hours; the task tables sum to **67 hours** (MVP slice A1 to A4 is 30 hours); document `30` uses 67 and notes the correction. (3) Prices and model ids were taken from the model catalogue dated 2026-10-06 and must be re-verified; cache write price, Haiku cache read price and learning-speed figures are labelled assumptions. (4) The mock-mode design, thresholds and limits are proposals, not measured values.
- **Verification:** hour sums per phase checked by script (all phase tables equal their headings, total 67); evaluation set categories sum to 80; referenced paths resolve.
- **Not done:** no code, packages, migrations or keys (as instructed). Waiting for the owner's review.

### Entry 31: Backend development started; backend lives in its own root

- **Received:** 2026-11-02 ~18:45 IST (approx). **Completed (this stretch):** 2026-11-02 19:06 IST. **Precision:** approx start, exact end.
- **Owner messages (verbatim):** "first start the backend plan for development the ai plan will be the last"; then, while B1 was in progress, "move all the work related to backend in to backend root dir not in the app dir".
- **What was done:** Started the approved backend plan. **B0:** local Supabase on ports 55320 to 55329 (the default range is taken by other stacks), backend SDKs, validated backend environment, platform clients (Supabase, Upstash rate limiting with in-memory fallback, redacting logger), SDK boundary rules; plan written as `docs/07-planning/25-backend-development-plan.md`. **Owner redirect:** asked what `backend/` should be; the owner chose a backend project imported by the app. Moved the Supabase project, config, kernel and platform into `backend/`, made the repository an npm workspace (`app`, `backend`), re-pointed aliases, and extended the architecture tests to scan both roots and forbid the backend importing the app. **B1:** migrations for identity, content, CRM and storage (profiles and permission matrix, audit log, helper functions, guards for publishing, soft delete, assignment and the last super admin, public views without prices, `create_enquiry` RPC with consent evidence, buckets and policies); 35 pgTAP tests (RLS-001 to 005, 008, 009, 010, 015, 017 and more) pass; types generated.
- **Decisions:** the backend root contains the Supabase project, config, kernel, platform, backend modules and Supabase adapters for the app's ports (structurally typed, no import from `app/`); admin pages stay in `app/`; one install and one `npm run verify` at the repository root.
- **Corrections:** B0 had first put backend code inside `app/`; moved on the owner's instruction (commit `eacaa65`).
- **Verification:** root `npm run verify` (lint, typecheck, 80 tests, build) and `npm run db:test` (35 pgTAP tests) pass.
- **Not done:** B2 onward. No cloud Supabase project exists yet.

### Entry 32: Backend phase B2, public site on Supabase

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 19:16 IST. **Precision:** exact
- **What was done:** Supabase adapters for the app's ports in `backend/src/adapters` (catalog, content, crm): puppies and media read from the `v_public_*` views and mapped to the app shapes (names, meta text and enquiry text derived as in the fixtures, media URLs from `storage_path`), settings and FAQ and family and testimonial reads, enquiry store through the `create_enquiry` RPC, platform rate limiter (RL-PUB-1). Composition root now picks adapters by `DATA_SOURCE`, with cached readers and cache tags (`puppies`, `content`, 60 s). Seed script `backend/scripts/seed-from-fixtures.mjs` (`npm run db:seed` in `backend`) loads 42 puppies, 9 FAQs, 64 family photos and uploads 200 media files to `site-media`. Architecture rule A-9 now also allows the adapters folder.
- **Artifacts:** `backend/src/adapters/**`, `backend/scripts/*`, `app/src/composition/{container,cached}.ts`, `app/tests/integration/*`, `app/tests/architecture/rules.ts`.
- **Verification:** opt-in integration tests (parity of puppies, gone-home, settings, FAQs, family photos, testimonial against the mock fixtures; an anon enquiry lands in `enquiries` and anon cannot read it) pass on the local stack. Pages `/`, `/puppies`, a puppy page, `/gone-home`, `/happy-families`, `/faq`, `/contact` rendered with `DATA_SOURCE=supabase` and with `mock`: body HTML identical after normalising media URLs (only preload hint order differs). `npm run verify` (backend 14, app 66 tests, build) and `db:test` (35) pass. Pixel-level visual comparison was not re-run for the Supabase source.
- **Not done / deferred:** form-level honeypot and fill-time checks and the IP hash (the action passes only a caller key today), a per-puppy sketch-art generator for puppies created later in the admin (needed in B4; current pages already render from data), cloud staging deploy.
- **Status/next:** B3 admin foundation.

### Entry 33: Backend phase B3, admin foundation

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 19:40 IST. **Precision:** approx (clock read after the work)
- **What was done:** `identity` backend module (domain password policy, use cases over ports, Supabase adapters, form messages) with sign-in (rate limits RL-AUTH-1 per IP and email, attempt recording and lock flag, staff-profile check, generic error), sign-out, password reset request (RL-AUTH-3, no account enumeration) and reset, current staff. Migration `20261102100500_auth_audit.sql` adds `record_audit_event` (service role only); platform `security` helpers are the only path to the service client for application code. Admin area in `app/`: `proxy.ts` gate (Next 16 name confirmed from the installed docs), `noindex` and `no-store` headers, own Tailwind v4 stylesheet, login, forgot and reset pages, auth callback route, portal home with sign-out, admin paths kept out of the public route registry and sitemap. Site CSS moved from the root layout to the `(site)` layout (and not-found). `db:bootstrap-admin` script creates staff accounts.
- **Artifacts:** `backend/src/modules/identity/**`, `backend/src/platform/{security,supabase/proxy}`, `backend/supabase/migrations/20261102100500_auth_audit.sql`, `backend/supabase/tests/002_auth_audit.test.sql`, `backend/scripts/bootstrap-*`, `app/src/proxy.ts`, `app/src/app/(admin)/**`, `app/src/navigation/admin.*`, `app/src/composition/identity.ts`.
- **Verification:** 8 identity unit tests, navigation tests, `db:test` 39 tests, `npm run verify` (build included). Manual check on the local stack in the built-in browser: unauthenticated `/admin` redirects to login with `X-Robots-Tag: noindex` and `no-store`; wrong password shows the generic message and keeps the email; correct test credentials reach the portal; sign-out returns to login and `/admin` is gated again; the audit log holds failed sign-in, sign-in and sign-out rows with hashed identifiers and `login_attempts` rows.
- **Corrections:** the first form version cleared the email after a failed sign-in (React resets forms after an action); fixed by echoing the email. The `db:test` fixtures use `admin@example.test`, so local staff accounts use another address.
- **Not done (deferred, recorded):** TOTP enrolment and step-up (FR-AUTH optional), staff invite and user management screen, inactivity timeout (Supabase session lifetime only for now), Playwright admin end-to-end test and login-form rate-limit test against a live limiter. AC-013 is therefore only partly met (sign in, reset); these move to B12 unless the owner wants them earlier.
- **Status/next:** B4 content management.

### Entry 34: Backend phase B4, content management

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 19:45 IST. **Precision:** approx (clock read after the work)
- **What was done:** `cms` backend module (input schemas in the application layer, slug generation, media rules, use cases over `CmsRepository`, `MediaStore`, `MediaProbe`, `ContentPublisher`; Supabase adapters over the staff session client; `sharp` for image size). Admin pages: puppies list, add, edit, publish and unpublish, mark gone home or available, delete (soft), photo and video upload with cover and remove, FAQs (edit, publish, delete, add), contact settings and the featured testimonial. Authorisation stays in the database; the module maps refusals to messages. After each change the composition publisher expires the `puppies` or `content` cache tag (`updateTag`) and refreshes the site layout. Portal layout adds navigation and a second session gate behind the proxy.
- **Artifacts:** `backend/src/modules/cms/**`, `app/src/app/(admin)/admin/(portal)/**`, `app/src/composition/{cms,publisher}.ts`, `app/tests/integration/cms-rls.test.ts`.
- **Verification:** 6 cms unit tests; integration test against the real database as an operator and a super admin (operator creates, edits and publishes and the public view shows it only once published and without any price; operator cannot delete or change settings, super admin can; a PNG uploads to `site-media`, is publicly served and is removed); `npm run verify` (68 tests, build); `db:test` 39. Manual check in the built-in browser: signed in as a local super admin, changed Max's age and the public puppy page showed the new value on the next load. Architecture tests caught two real problems that were fixed: zod in a domain layer (schemas moved to application) and over-long admin pages (bodies moved to components).
- **Corrections:** pgTAP test RLS-015 assumed no other super admin existed; it now removes local accounts inside its own rolled-back transaction.
- **Not done (deferred):** family photo upload and ordering, drag-and-drop reorder, the per-puppy sketch-art generator for puppies created in the admin (they use the cover photo until then), template-driven preview of unpublished drafts, Playwright admin tests, axe checks on admin pages.
- **Status/next:** B5 enquiries and customers.

### Entry 35: Backend phase B5, enquiries and customers

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 19:50 IST. **Precision:** approx (clock read after the work)
- **What was done:** `inbox` backend module (staff side of enquiries and customers): search and status filter with paging, status change, assignment, notes, customer directory and edit, `wa.me` reply links built from the stored number. Migration `20261102100600_staff_directory.sql` adds `list_staff()` (active staff names for assignment; operators cannot read other profiles directly). Admin pages for enquiries and customers with navigation. Generated database types refreshed.
- **Artifacts:** `backend/src/modules/inbox/**`, `backend/supabase/migrations/20261102100600_staff_directory.sql`, `backend/supabase/tests/003_staff_directory.test.sql`, `app/src/app/(admin)/admin/(portal)/{enquiries,customers}/**`, `app/tests/integration/inbox-rls.test.ts`.
- **Verification:** 4 inbox unit tests; integration test (public enquiry in through the anon RPC; staff list it with puppy label, linked customer and WhatsApp opt-in; status, assignment and note authored by the signed-in staff member; anonymous visitors read no enquiries, customers or staff list); `db:test` 42; `npm run verify` (68 passing, 10 opt-in skipped, build). Manual end-to-end in the built-in browser: posted the public contact letter with test data on the Supabase data source, saw "Message received", confirmed the enquiry, linked customer and consent record in the database, then signed in as local staff and saw it in the inbox.
- **Not done / found:** the stored `ip_hash` and `user_agent` are empty because the app's `Enquiry` does not carry them yet (the RPC accepts them); the rate limit still uses the caller key. Customer merge and delete belong to B11 (privacy). Enquiry to order conversion is B6. Playwright admin tests are deferred to B12.
- **Status/next:** B6 orders and deliveries.

### Entry 36: Backend phase B6, orders and deliveries

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 19:58 IST. **Precision:** approx (clock read after the work)
- **What was done:** Migration `20261102100700_commerce.sql`: `orders` (number `TP-YYYY-NNNNNN`, money in minor units, generated balance, one open order per puppy), `order_items`, `order_events`, `deliveries`, `delivery_events`; status machines enforced by triggers for every write path (orders: new, confirmed, deposit_paid, preparing, in_transit, delivered, completed, cancelled with local orders allowed to skip preparing and transit, a cancel reason, and a super admin needed to cancel after the deposit; deliveries: scheduled to delivered with delayed interleaving and a note for failed); timeline events written by triggers; creating an order reserves the puppy, cancelling releases it, delivering marks it gone home; writes only through permission-checked functions (`create_order`, `set_order_items`, `update_order`, `transition_order`, `create_delivery`, `update_delivery`, `transition_delivery`). `commerce` backend module and admin pages (orders list and filter, create from an enquiry, customer or puppy, order detail with items, status moves, deliveries and tracking events, notes, timeline; open deliveries list). The sign-in redirect now keeps the query string.
- **Artifacts:** `backend/supabase/migrations/20261102100700_commerce.sql`, `backend/supabase/tests/004_commerce.test.sql`, `backend/src/modules/commerce/**`, `app/src/app/(admin)/admin/(portal)/{orders,deliveries}/**`, `app/tests/integration/commerce-flow.test.ts`.
- **Verification:** 32 pgTAP assertions for the state machines, permissions, reservation and events (`db:test` 74 in total); 5 commerce unit tests; integration test through the module as operator and super admin (a local order walks to completed with a delivery and its events; a reserved puppy cannot be sold twice; operator cannot cancel after the deposit, super admin can only with a reason and the puppy is released); `npm run verify`. Manual check in the built-in browser: opened the order form for a customer and puppy, created an order, and read its detail with timeline.
- **Changes against the data model document:** `get_order_bundle` is replaced by nested reads in the adapter (one query with child tables); `order_documents` (private uploads) is deferred; `paid_minor` is maintained by billing in B7.
- **Not done:** customer-facing tracking page, order documents, editing an order's puppy after creation, Playwright admin tests. A reserved puppy disappears from the public list until it is released or delivered (public views list available and gone-home only); the owner may prefer a "reserved" badge instead.
- **Status/next:** B7 payments (manual ledger) and invoices.

### Entry 37: Backend phase B7, payments (manual ledger) and invoices

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 20:12 IST. **Precision:** approx (clock read after the work)
- **What was done:** Migration `20261102100800_billing.sql`: configurable default VAT rate (`tax_rates`, seeded UAE VAT 5%, super admin changes it; each order snapshots the rate and carries `tax_minor`, balance now includes VAT), `invoices` and `invoice_lines` (lines always derived from the order; number `INV-YYYY-NNNNNN` allocated at issue; issued invoices locked by trigger; void needs a reason and a super admin and is refused once paid), `payments` (ledger, unique `(gateway, gateway_ref)` idempotency anchor), `refunds` (operators request, super admins approve or reject), one `recompute_money` function that derives paid amounts and invoice statuses, a received deposit moving a confirmed order to deposit paid, `mark_overdue_invoices` for the daily job (service role only). `billing` backend module and admin pages: invoices list and detail with issue, void, record payment, print view; payments ledger with refund approvals; order page money section; VAT rate form in settings. All forms now refresh the server-rendered page after a successful action.
- **Artifacts:** `backend/supabase/migrations/20261102100800_billing.sql`, `backend/supabase/tests/005_billing.test.sql`, `backend/src/modules/billing/**`, `app/src/app/(admin)/admin/(portal)/{invoices,payments}/**`, `.../orders/MoneySection.tsx`, `.../settings/TaxRateForm.tsx`, `app/tests/integration/billing-flow.test.ts`.
- **Verification:** 41 pgTAP assertions (`db:test` 115 in total) covering VAT snapshots, draft and issue, locks on issued invoices (also by direct SQL), idempotent payments, overpayment, deposit auto-advance, invoice status moves, refund approval rules, voiding, the overdue job, rate changes and anonymous denial; 5 billing unit tests; integration test of enquiry-to-cash through the module as operator and super admin (a repeated reference creates one row; operators cannot approve refunds or void); `npm run verify`. Manual check in the built-in browser: created an order for a test customer, confirmed it, created and issued an invoice (INV-2026-000006, total AED 2,100 with AED 100 VAT) and recorded the payment, after which the invoice showed Paid.
- **Corrections:** the first draft let staff edit invoice lines, which could make an invoice disagree with the order; lines now come only from the order and the order's items lock while a non-void invoice exists. A grant default exposed `mark_overdue_invoices` to signed-in users until a test caught it; it is now service role only. Server-action success did not refresh the page; fixed in the shared form component.
- **Changes against the requirements:** PDF generation and storage (FR-INV-002) is deferred: a print view is provided (save as PDF from the browser) and the PDF with email delivery moves to B8 with the outbox. Invoice branding needs the business name, VAT number and address from the owner (listed in the owner dependencies). `request_refund` and approval record a manual refund as processed; gateway refunds arrive with Stripe in B9. Customer-facing invoice link and online payment are B9.
- **Not done:** payment pending and failed states are unused until gateways, VAT number printing, credit notes (out of scope), Playwright admin tests.
- **Status/next:** B8 notifications (outbox, email through Resend, WhatsApp links, templates and rules).

### Entry 38: Backend phase B8, notifications

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 20:20 IST. **Precision:** approx (clock read after the work)
- **What was done:** Migration `20261102100900_notifications.sql`: `outbox` written by triggers in the same transaction as the change (enquiry created and assigned, order status, delivery events, invoice issued and void, payment succeeded, refund requested and processed), versioned `message_templates` with an allow-list of variables, `notification_rules`, `messages` log, private `notifications`, worker functions (`claim_outbox` with `SKIP LOCKED`, `complete_outbox`, `fail_outbox` with 1, 5, 15, 60 minute backoff and a final failure that alerts every super admin, `defer_outbox`, `prune_outbox`), manual messages queued through the outbox, and seed templates and rules (WhatsApp rules ship off). `messaging` backend module: the worker (consent and channel preference, WhatsApp opt-in, quiet hours, daily cap, idempotent message log, retry, in-app notifications to assignee or role) over Supabase stores and a Resend or log email sender; staff use cases (notifications, log, templates with preview and rollback, rules, manual send with a prefilled `wa.me` link for WhatsApp). `/api/internal/outbox` cron endpoint (Bearer `CRON_SECRET`, constant-time compare, RL-CRON). Admin pages: notifications (with an unread count in the navigation), message log, templates, rules, and a manual send form on the customer page. Environment schema and `.env.example` extended.
- **Artifacts:** `backend/supabase/migrations/20261102100900_notifications.sql`, `backend/supabase/tests/006_notifications.test.sql`, `backend/src/modules/messaging/**`, `backend/src/platform/security/cron.ts`, `app/src/app/api/internal/outbox/route.ts`, `app/src/app/(admin)/admin/(portal)/{notifications,messages,templates,rules}/**`, `app/tests/integration/messaging-flow.test.ts`.
- **Verification:** 32 pgTAP assertions (`db:test` 147 in total): rollback leaves no outbox row, event payloads hold ids only, unknown template variables rejected, versions and rollback, operators cannot edit templates or read rules, notifications readable only by their owner, only the worker can claim, retry and final failure alert; 10 worker unit tests (idempotent resend, consent and channel skips with reasons, daily cap, quiet hours deferral, provider failure retry, assignee-only notification, disabled rule, manual send); integration test against the database (enquiry to one acknowledgement and notifications for staff, unconfigured WhatsApp rule skipped visibly, disabled rule silent, failed provider retried with backoff and sent once); `npm run verify`. Manual check against the production build: the cron endpoint returns 401 without or with a wrong secret and processes an enquiry with the right one (one log-provider email, one staff notification); the notifications, message log and rules pages render in the built-in browser.
- **Corrections:** a test assumed a different customer per enquiry, but the same phone number maps to one customer by design; the test now follows the outbox row.
- **Not done:** provider webhooks (delivery status, inbound replies and STOP), WhatsApp automation, Supabase Realtime for the bell (the count refreshes on page load), the daily staff digest, the `invoice.overdue` reminder and the daily jobs schedule (Vercel cron configuration belongs to B13), invoice PDF attachment. Resend needs the owner's account, a verified sending domain and sender address.
- **Status/next:** B9 Stripe.

### Entry 39: Backend phase B9, Stripe (hosted checkout)

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 20:35 IST. **Precision:** approx (clock read after the work)
- **What was done:** Migration `20261102101000_gateway_payments.sql`: staff start a hosted payment (pending row anchored on the gateway reference); a service-role-only settlement function that dedupes webhook events (`webhook_events`), settles once, ignores unknown references, refuses and alerts on an amount or currency mismatch, and a failure function that marks the payment failed and raises `payment.failed`; settlement of a pending payment now raises the same receipt event as a manual payment; gateway refunds are approve, call the gateway, then complete or fail (manual refunds still finish on approval); template `payment_link` and `payment_failed_customer` with a `payment.link` variable. `billing` module: gateway interface and registry (a gateway without keys is not registered), `StripeGateway` (hosted Checkout, signed webhooks through the SDK, refunds with idempotency keys, injectable client), payment link use case (amount from the invoice balance, refuses drafts, paid invoices and a duplicate link), refund approval that calls the gateway, `/api/webhooks/stripe` route (rate limit RL-WH-1, raw body verified). Admin: invoice page creates the link, settings page shows enabled gateways and mode. Environment schema: `PAYMENT_GATEWAYS`, `DEFAULT_CURRENCY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`. Architecture rule: the Stripe SDK is allowed only in `infrastructure/stripe`.
- **Artifacts:** `backend/supabase/migrations/20261102101000_gateway_payments.sql`, `backend/supabase/tests/007_gateway_payments.test.sql`, `backend/src/modules/billing/{application/gateway.ts,infrastructure/stripe,infrastructure/supabase/SupabaseGatewayLedger.ts}`, `app/src/app/api/webhooks/stripe/route.ts`, `app/tests/integration/gateway-flow.test.ts`.
- **Verification:** 26 pgTAP assertions (`db:test` 173 in total); 9 gateway unit tests (real Stripe signature verification with generated headers: valid, missing, forged and tampered signatures, unpaid and expired sessions, ignored events, checkout parameters and idempotency keys, refunds); use-case tests; integration test against the database with a fake Stripe client and real signatures (pending link, forged webhook rejected, signed webhook settles once, replay and second event change nothing, refund approval calls Stripe once and the ledger follows, mismatched amount not applied, expiry marks failed); `npm run verify`. Integration tests now run one file at a time because they share the database and its outbox.
- **Not verified:** nothing was run against the real Stripe API (no keys exist yet); the checkout parameters, the webhook event shapes and the refund call follow the installed SDK's types and Stripe's documented events and must be confirmed in Stripe test mode when the owner supplies keys and, for UAE, confirms the account type and AED support. The success and cancel return pages are the home page with a query string until a customer-facing payment status page exists.
- **Corrections:** the first settlement path emitted no receipt event because the trigger fired only on insert; found by the new test and fixed. Test isolation: two suites assumed an empty outbox and now clear it inside their own rolled-back transactions.
- **Not done:** Razorpay (later, same interface), reconciliation job for pending payments older than 24 hours, `charge.refunded` webhook handling (refunds are recorded when the app's own call succeeds), step-up MFA on refund approval, customer-facing payment page.
- **Status/next:** B10 dashboard and exports.

### Entry 40: Backend phase B10, dashboard and exports

- **Received:** continuation of entry 31 (no new owner message). **Completed:** 2026-11-02 20:55 IST. **Precision:** approx (clock read after the work)
- **What was done:** Migration `20261102101100_reporting.sql`: `admin_dashboard_stats()` (one JSON document: enquiries, orders by status, deliveries, money this month, outstanding and overdue invoices, failed payments, refunds waiting, puppies, outbox health) and `export_rows()` (enquiries, orders, payments, invoices; capped at 10,000 rows and one year; enquiries need `enquiries.export`, the money exports need `payments.export`, so only super admins). `reporting` backend module: CSV rules that neutralise spreadsheet formulas, AED decimals for minor units, export use case with the RL-ADM-3 limiter and an audit record (who, what, range, row count). Admin: overview dashboard with linked figures and a warning when messages are stuck, an export form, and the `/admin/export/[kind]` download route. Customers are deliberately not exportable here; personal data leaves through the privacy tooling (B11).
- **Artifacts:** `backend/supabase/migrations/20261102101100_reporting.sql`, `backend/supabase/tests/008_reporting.test.sql`, `backend/src/modules/reporting/**`, `app/src/app/(admin)/admin/{export,(portal)/Dashboard.tsx,(portal)/ExportForm.tsx}`.
- **Verification:** 10 pgTAP assertions (`db:test` 183 in total: staff read figures, operators cannot export, a super admin can, a range over a year and unknown kinds are refused, anonymous visitors get nothing); 3 reporting unit tests (quoting, formula neutralisation, minor-unit decimals, named file, audit, limiter, denial); `npm run verify`. The statistics function runs in about 2.5 ms on the seeded data (NFR-PERF-009 asks for the dashboard to load within the page budget; it is one call). Manual check against the production build in the built-in browser: the dashboard renders for a super admin, the payments and orders exports return CSV with the right headers and download names, `customers` is refused with 400, and the export rows are in the audit log.
- **Corrections:** the navigation showed "[object Object]" as the unread count because the facade returns a result object; fixed. A client component imported the module barrel and pulled server-only code into the browser bundle (the build caught it); the form now receives the export kinds as a prop.
- **Not done:** scheduled digest email, charts, a per-user "my work" view, performance measurement on realistic volumes (the figures are tiny in the seed), Playwright admin tests.
- **Status/next:** B11 privacy tooling.

## 5. Entry template

Copy this block to the end of section 4 for each new owner message. Get the times from the machine clock (`date '+%Y-%m-%d %H:%M IST'`) when the message is received and again when the work is finished.

```markdown
### Entry N: <short title>

- **Received:** YYYY-MM-DD HH:MM IST. **Completed:** YYYY-MM-DD HH:MM IST. **Precision:** exact | approx (why)
- **Checkpoints (optional):** HH:MM what happened; HH:MM what happened
- **Owner request:** "<verbatim if short; abbreviate and say so if long>"
- **What was done:** <what was built, researched, changed or answered>
- **Artifacts:** <files created or changed, with paths>
- **Decisions:** <decisions made or recorded, ADR numbers if any>
- **Corrections:** <anything earlier that turned out wrong, with the entry number>
- **Verification:** <what was run or checked, and results; or "not verified">
- **Status/next:** <what is waiting on whom>
```

Also add one row to the timeline summary (section 3), update the status table (section 2) if a phase changed, and set "Last updated" at the top.
