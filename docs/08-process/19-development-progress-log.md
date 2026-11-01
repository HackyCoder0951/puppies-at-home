# 19. Development Progress Log

| | |
|---|---|
| **Status** | Living document (append only) |
| **Started** | 2026-11-01 21:49 IST |
| **Last updated** | 2026-11-02 01:24 IST |
| **Time zone** | IST (UTC+05:30), the clock of the machine the work runs on |
| **Related** | `18-ai-usage-and-prompt-log.md` (exact prompts and verification), `17-implementation-roadmap.md` (planned phases) |


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
