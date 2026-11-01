# Design Pattern Analysis — puppy.instabizweb.com (TeddyPups U.A.E.)

Method: live DOM computed-style extraction, CSS/JS bundle inspection, scripted scroll-through at 1440×900, 1024 and 375px, and manual hover/focus rule review.
Evidence tags: **[C]** confirmed from code/DOM, **[O]** observed visually, **[I]** inferred.
Raw captures: `captures/` (reference HTML, CSS, sitemap, robots). Reference files are for analysis only; they are not to ship.

---

## 0. The headline finding

This is **not a template-style pet-shop site**. It is an illustrated, scroll-driven storytelling site. Every section ("scene") is a hand-drawn set piece with a mascot dog, and the whole home page is a single continuous **day-to-night colour journey**. Fidelity here depends on motion and illustration, not on cards and grids. The cloning effort should be sized accordingly (see section 12).

## 1. Narrative structure: "scenes" on a day-to-night gradient [C]

Home is 8 `.tp-scene` blocks. Their background gradients chain end-to-start, so the page reads as one sky going from morning to night:

| # | Scene class | Content | Gradient (top → bottom) | Height @1440 |
|---|---|---|---|---|
| 1 | `tp-hero` | H1, CTAs, arched puppy photos, mascot "peekaboo" | `#fffdf8 → #fff1d8` | 824 |
| 2 | `tp-meet` | "Meet the pups": hallway of doors | `#fff1d8 → #fbe3b4` | 900 (+ pinned scroll) |
| 3 | `tp-paths` | "Two ways": signpost, showroom vs plane | `#fbe3b4 → #f7d18d` | 1106 |
| 4 | `tp-chat` | Journey: steps + phone WhatsApp mock | `#f7d18d → #f0b866` | 1695 |
| 5 | `tp-passport` | Trust points in an open "puppy passport" | `#f0b866 → #a65a30` | 922 |
| 6 | `tp-dusk` | Happy families: skyline, setting sun, polaroids | `#a65a30 → #4d2b19` | 1574 |
| 7 | `tp-night` | FAQ, stars, lamppost | `#4d2b19 → #2f1a10` | 634 |
| 8 | `tp-home` | CTA house with glowing door, then footer | `#2f1a10 → #24130b` | 1018 |

Total document height at 1440 is about 9,450px. Theme text colour flips from cocoa on light scenes to milk and honey on dark scenes.

**Pattern:** progressive-disclosure storytelling, with metaphors that match the content: doors for puppies waiting for a home, signpost for a choice, phone for WhatsApp, passport for trust, sunset for happy endings, lit house for the final CTA.

## 2. Page-level pattern map

| Page | Metaphor | Layout pattern |
|---|---|---|
| Home | Day to night journey | 8 stacked scenes, with pinned horizontal scroll in scene 2 [O] |
| `/puppies` | "Teddy's sketchbook" | Grid of sketch cards, each a circular or arched photo with a tilting frame and an "Available" speech-bubble tag [O] |
| `/puppies/[slug]` | Polaroid or index card on a table | Left: tilted photo stack with `1/2` pager and thumbnails. Right: tilted info card (badge, name, breed, sex, age, origin, WhatsApp and "Send an enquiry" CTAs). Below: checklist card, 4-step "way home" row, enquiry letter form, prev/next pup [O] |
| `/gone-home` | Tickets | Admit-one ticket cards with a circular photo, name, breed, source, and a "home ♥" stub. Some photos blurred (loading placeholder or intentional) [O] |
| `/happy-families` | Wall of happy endings | Polaroid wall with tilt, a quote speech-bubble, and "64 moments" counter [O] |
| `/how-it-works` | Passport | Numbered sections, two-way split (In Dubai or Imported), step lists [O/C] |
| `/faq` | Note board | 9 notes, each an accordion button with `aria-expanded` [C] |
| `/contact` | Letter | Mad-libs form, "Post my letter" [C] |

## 3. Colour system [C]

Defined as Tailwind v4 theme tokens in CSS:

| Token | Hex | Role |
|---|---|---|
| `milk` | `#fffdf8` | Page background, light text on dark |
| `cocoa` | `#2a170e` | Primary text, outlines, hard shadows |
| `cocoa-soft` | `#5a3a28` | Body copy (`--ink-soft`) |
| `toffee` | `#c2622b` | Brand accent |
| `toffee-deep` | `#a24a1a` | Primary button bg, focus outline |
| `toffee-ink` | `#8e3f15` | Handwritten kicker, nav hover |
| `honey` | `#f2be6b` | Highlights, stars, dark-scene accent |
| `honey-soft` | `#fbe3b4` | Hover washes, tags |
| `sky` / `sky-deep` | `#bfddf5` / `#2f6e9e` | Illustration accents |
| `blush` | `#f9cdbf` | Illustration accents (mascot cheeks, etc.) |
| WhatsApp green | `rgb(31,122,77)` = `#1f7a4d` | WhatsApp CTAs only (own colour, not from the palette above) |
| `theme-color` | `#fffdf8` | Browser chrome |

Rule: **one warm brown family plus one green reserved for WhatsApp.** Text is never pure black. Outlines are cocoa, not grey.

## 4. Typography [C]

Three self-hosted families, via `next/font`:

| Role | Font | Used for |
|---|---|---|
| Display | **Fraunces** (800) | H1, H2, H3, nav on mobile menu, puppy names |
| Body / UI | **Figtree** (400, 600, 650) | Paragraphs, buttons, nav links |
| Handwriting | **Shantell Sans** (500) | Kickers like "every puppy is family", "where to, friend?", ticket labels |

Measured scale:

| Token | Size | Notes |
|---|---|---|
| H1 | 84.48px @1440, 41.6px @375 | Fraunces 800, tracking -2.1px, line-height about 0.92 |
| `.text-huge` (H2) | `clamp(2.6rem, 6.4vw, 6.25rem)` | 64.6px at 1008 to 1440 range |
| `.text-lede` | `clamp(1.125rem, 1.4vw, 1.375rem)`, lh 1.5 | Section intros |
| H3 (sign) | 24.2px, tracking -0.6px | Signpost labels |
| Step title | 25.6px | |
| Body | 17px / lh 27.2px | Base size is 17px, not 16px |
| Hero lede | 16.8px / 25.2px | |
| Button | 17px (header: 15.2px), weight 650 | |
| Nav link | 16px, weight 620 | |

Pattern: tight negative tracking on all display type, fluid `clamp()` sizing driven by `vw`, and vertical-height clamps (`vh`) in the illustrated scenes.

## 5. Shape, depth and borders [C]

- **Radius:** pills (`999px`) for all buttons and chips. Cards 0.75, 1 and 1.5rem. Photos use **arch** (`999px 999px 0 0`) and circle masks.
- **Outline:** 2px cocoa border on ghost buttons, cards and phone frame. This gives a consistent "sticker" look.
- **Shadows are hard, offset and unblurred**, not soft drop shadows:
  - Primary button: `0 8px 0 -2.4px #2a170e` (a physical "button base").
  - Hover: `0 .7rem 0 -.15rem cocoa` with `translateY(-2px) rotate(-1deg)`.
  - Sign: `0 7px 0 -3px rgba(42,23,14,.25)`.
- **Tilt:** many cards carry a small `rotate()` that flips on hover (`calc(var(--tilt) * -1)`).

## 6. Spacing and layout [C/I]

- Gutter: `--gutter: clamp(1rem, 4vw, 3.5rem)`.
- Header height: `--header-h: 4.75rem` (76px), fixed, transparent over the hero.
- Section padding is irregular because scenes are illustrated: top 53 to 85px, bottom 0 to 69px. Illustration, not padding, provides the rhythm.
- No fixed max-width container on the hero (copy block was 1425px wide at 1440); text widths are constrained by `ch` limits (`max-w-[44ch]`, `42ch`).
- Container tokens exist (`max-w-5xl` to `7xl`) for inner pages.
- Spacing base unit: `--spacing: .25rem` (Tailwind default).

## 7. Breakpoints [C]

Max-width: 639, 767, 1023. Min-width: 640, 768, 900, 1024, 1100, 1280, 1680, and `112rem`/`96rem`.
Practical tiers for the clone: **<640 mobile**, **640 to 1023 tablet**, **1024+ desktop**, with extras at 1100, 1280 and 1680.

## 8. Component patterns

| Pattern | Spec |
|---|---|
| **Primary button** `.btn-primary` | Pill, `min-height 3.25rem`, padding `.85rem 1.6rem`, bg toffee-deep, milk text, hard cocoa base shadow |
| **Ghost button** `.btn-ghost` | Pill, 2px cocoa border, transparent. Hover fills cocoa with milk text |
| **WhatsApp button** `.btn-whatsapp` | Same as primary but green; hover rotates +1deg |
| **Press feedback** | `:active` scales to .96 |
| **Transition** | `transform .35s var(--ease-pounce)` (overshoot bounce), `box-shadow .35s var(--ease-silk)` |
| **Nav link** | Fraunces-free, Figtree 620. Active = toffee-deep colour plus a small paw glyph beneath. Hover shows a paw at 45% opacity |
| **Logo** | Rotates -8deg on hover |
| **Mobile menu** | Fixed full-screen honey overlay, staggered link entrance (`tp-menu-link`), in/out keyframes, "where to, friend?" handwritten label |
| **Mobile sticky bar** | Fixed bottom bar: "WhatsApp us" (green, flex-grow) plus "Call" (ghost) |
| **Status tag** | "Available" pill in speech-bubble form, which swings (`tp-tag-swing`) |
| **Door card** | A `.tp-door` with a leaf that opens via a scroll timeline and reveals the photo |
| **Ticket card** | Notched edges, "admit one" stub, circular photo |
| **Polaroid** | White frame, caption in handwriting, tilt, optional "gone home" stamp |
| **FAQ note** | Button with `aria-expanded` and `aria-controls`, open and close animation |
| **Letter form** | Inline fields inside a sentence, plus select, textarea, honeypot named `website` |

## 9. Motion system [C]

Motion is a core design layer, not decoration.

- **Smooth scroll: Lenis** [C], 28 references in the JS bundle. No GSAP, Framer Motion, Lottie, Swiper or Embla.
- **CSS scroll-driven animations** [C]: `animation-timeline: view()` is used for `tp-door-open`, `tp-sun-set`, `tp-house-open`, `tp-stamp-in` and `tp-stamp-thump`. These are progressive enhancement that Safari and Firefox support unevenly.
- **46 named keyframes**, grouped:
  - Mascot: `blink-open/shut`, `ear-twitch`, `breathe`, `peek`, `runner-*` (legs, ear, wag, bob, x), `paw-pat`, `hold-still`
  - Scenery: `sunrise`, `sun-set`, `twinkle`, `float`, `plane-bob`, `flag`
  - UI: `menu-in/out/link/backdrop-out`, `msg-in`, `sent-in`, `step-in`, `pop-up`, `poster-in`, `box-up`
  - Letter: `letter-fold`, `env-in`, `env-post`
  - Stamps: `stamp-in`, `stamp-thump`
- **Pinned horizontal scroll** in "Meet the pups" [O]: the section stays fixed while vertical scroll moves the doors sideways under a walking mascot (`runner-*`). The final slot is a dashed "Meet them all" door.
- **Cursor:** custom paw cursor (`/cursor/paw.svg`, `paw-press.svg`) only for `(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)`.
- **Paw-print trail layer** (`.pup-prints`, `.pup-layer`, `.pup-probe`): decorative footprints and wandering mascots across the page. These layers add about 11,500px of absolutely positioned content on mobile, so check performance.
- **Page-load splash** [O]: every route first shows a pixel mascot walking across a quilted background with "every puppy is family". It lasts roughly 2 to 3 seconds per full load. It is a major UX cost and a candidate to shorten or skip on repeat visits.
- **Reduced motion:** 20 CSS rules and 5 JS checks honour `prefers-reduced-motion`.

## 10. Responsive behaviour [C/O]

| Element | Mobile (375) | Desktop |
|---|---|---|
| Header | Logo plus "TeddyPups" wordmark left, "Menu" pill right | Logo left, centre nav, WhatsApp pill right |
| Nav | Full-screen overlay | Inline links with paw marker |
| Hero | Centered stack, H1 41.6px, buttons stacked full-width, mascot with speech bubble | H1 84px, CTAs side by side, arched photo row with mascot |
| Contact CTAs | Sticky bottom bar (WhatsApp + Call) | Header WhatsApp only |
| Puppy listing | 20 cards (15 plus 5 gone-home) in a grid | Larger sketch grid |
| Detail | Single column | Two columns (photo left, card right) |
| Overflow | None: `scrollWidth == clientWidth == 375` | |

## 11. UX tool findings (heuristics and accessibility)

**Strengths**
- Strong, consistent brand voice and microcopy ("where to, friend?", "Post my letter").
- WhatsApp is reachable from every viewport; the mobile sticky bar is excellent for the primary conversion.
- Honest content: "real puppies, real photos".
- Good semantic base: `lang="en"`, one H1 per page, `aria-expanded` on accordions, breadcrumb JSON-LD, visible focus ring (`3px toffee-deep`, offset 3px), skip link `#main`, input `aria-label`s.
- Honeypot spam protection with no CAPTCHA friction.

**Weaknesses / risks (reference behaviour, not to be copied blindly)**
- Splash on every full load delays the first meaningful content.
- Scroll-jacked horizontal section plus Lenis can be disorienting and breaks native scroll expectations; keyboard-only and screen-reader users need an alternative path (puppy links exist in the DOM, which helps).
- ~~Dead filters~~ **CORRECTED:** an earlier version of this file said `?breed=`/`?origin=` do nothing. That was wrong; my first test ran during the splash screen, before the page had hydrated. The filters work (see `03-screenshots-and-video-review.md` section 2).
- Handwriting font at small sizes (ticket labels) has weak legibility.
- Contrast to verify: honey or milk text on the mid-brown gradient (scenes 5 and 6), small `cocoa-soft` copy on the orange scene 4, and the faded "inactive" journey steps.
- No prices anywhere, a notable friction point for buyers (this is a business choice; do not add).
- Photo blur on some gone-home tickets looks like a broken image.

**Contrast check still to run:** computed WCAG ratios for each scene's text colours (not completed in this pass).

## 12. Implications for the clone

1. **Effort is dominated by illustration and motion**, not data or routing. The site has about 46 animations, a mascot with a multi-part rig, and scene artwork (skyline, doors, signpost, plane, passport, lamppost, house).
2. **Asset risk:** the SVG illustrations and cursor files are original artwork. We should draw or source our own equivalents. The puppy photos are the client's property: use placeholders unless permission is given.
3. **Recommended stack still holds**: Next.js (App Router) + Tailwind v4 + `next/font` (Fraunces, Figtree, Shantell Sans) + Lenis, with CSS `animation-timeline` and a JS fallback. This matches the original, which makes the technical interview easier to defend.
4. **Prioritisation:** P0 is design tokens, global layout, header, mobile menu, sticky bar, all 8 routes, and data-driven puppy pages. P1 is the door-hallway pinned section, scroll gradient, and scene illustrations. P2 is the mascot rig details, paw trail, custom cursor and splash. Do not let P2 consume P0 time.
5. **Decisions needed from the owner**, since they change scope: (a) keep the splash? (b) ~~keep dead filters~~ (withdrawn: filters work and must be built), (c) what should form submit do? (d) are the original photos and illustrations reusable?

## 13. Open verification items

- Hover and focus states on desktop for door, ticket, polaroid and sketch cards (CSS rules found, not yet exercised live).
- 768px and 1024px screenshots of inner pages.
- Exact door-hallway scroll length and pin mechanics (`position: sticky` plus a tall wrapper is likely).
- Happy-families wall interaction (lightbox or none) and the 64-item loading strategy.
- Network behaviour of form POST (not submitted, to avoid sending data to the live business).
- Computed contrast ratios and a Lighthouse run.
