# UI/UX Deep Analysis: Animation, Effects, Colour and Layout Framing

Reference: https://puppy.instabizweb.com/ (TeddyPups U.A.E.)
Supersedes the visual sections of `02-design-pattern-analysis.md`; read together with `03-screenshots-and-video-review.md`.

**Evidence tags**
- **[CSS]** read directly from the reference stylesheet (`captures/reference-site.css`) and is exact.
- **[JS]** read from the shipped JS bundle.
- **[S]** seen in a supplied screenshot.
- **[V]** seen in the supplied video (timestamp given).
- **[L]** measured live in the browser.
- **[I]** inferred. Treat as a hypothesis and verify during build.

**Coverage warning.** Screenshots and video are desktop only. Mobile values come from my own 375px pass and the CSS media queries. Tablet (768 to 1100px) layouts have not been seen. Nothing here claims pixel accuracy at those sizes.

---

## PART A. Global systems

### A1. The one big idea: a day-to-night page

The home page is a single continuous gradient that goes from morning to night, sliced into 8 scenes [L]. Text and mascot treatment flip when the sky gets dark. Inner pages reuse the same idea in small: a light "page" with a dark wave and footer at the bottom, except FAQ, which is dark all the way (dusk brown).

| Scene | Class | Gradient start | Gradient end | Height @1440 | Text colour | Mood |
|---|---|---|---|---|---|---|
| 1 Hero | `tp-hero` | `#fffdf8` | `#fff1d8` | 824 | cocoa | morning |
| 2 Meet | `tp-meet` | `#fff1d8` | `#fbe3b4` | 900 (+ pin) | cocoa | late morning |
| 3 Paths | `tp-paths` | `#fbe3b4` | `#f7d18d` | 1106 | cocoa | midday |
| 4 Journey | `tp-chat` | `#f7d18d` | `#f0b866` | 1695 | cocoa | afternoon |
| 5 Passport | `tp-passport` | `#f0b866` | `#a65a30` | 922 | cocoa on cream pages | sunset begins |
| 6 Dusk | `tp-dusk` | `#a65a30` | `#4d2b19` | 1574 | milk and honey | dusk |
| 7 Night | `tp-night` | `#4d2b19` | `#2f1a10` | 634 | milk | night |
| 8 Home | `tp-home` | `#2f1a10` | `#24130b` | 1018 | milk | late night |
| Footer | `tp-footer` | `#24130b` solid | | about 700 | milk, honey headings | deep night |

Every scene ends with the next scene's starting colour, so there are **no visible seams**. A clone must keep these exact end/start pairs or you will see banding between sections. [CSS/L]

### A2. Colour palette

**Brand tokens [CSS]**

| Token | Hex | Where it is used |
|---|---|---|
| milk | `#fffdf8` | Page background, header fill, light-on-dark text, card fill |
| cocoa | `#2a170e` | All body headings, all outlines, hard shadows, primary text |
| cocoa-soft | `#5a3a28` | Body paragraphs (`--ink-soft`) |
| toffee | `#c2622b` | Brand accent, hand-drawn underline, FAQ pin |
| toffee-deep | `#a24a1a` | Primary button fill, active nav, focus ring, passport cover |
| toffee-ink | `#8e3f15` | Handwritten kickers, nav hover |
| honey | `#f2be6b` | Stars, dark-scene accents, "admit one" stub, ticket stub |
| honey-soft | `#fbe3b4` | Hover wash on chips and buttons, tags |
| sky / sky-deep | `#bfddf5` / `#2f6e9e` | Illustration accents (blue pin, window glass) |
| blush | `#f9cdbf` | Mascot cheeks, pink ring frames |
| WhatsApp green | `#1f7a4d` | **Only** WhatsApp actions, send button |

**Component-level hexes [CSS]**

| Item | Value |
|---|---|
| Polaroid paper | `#fffefb` |
| Tape strip base | `#f6d79a`, plus a white sheen overlay |
| Door frame fill | `#3b2215` |
| Door threshold step | `#dc9a52` |
| House wall | gradient `#5c3622` to `#4a2a19`, with plank lines |
| House base | `#3a2114` |
| Footer night | `#24130b` |
| Quilt lines | cocoa at about 7% alpha (`#2a170e12`) |
| Shadow tint | cocoa at 25 to 40% (`#2a170e40`) |

**Door colours [L, exact].** Five doors repeat in this order via the `--door` custom property: `#a24a1a` (rust, same as toffee-deep), `#5a3a28` (dark brown, same as cocoa-soft), `#d4893f` (orange), `#b8644a` (terracotta), `#7a4a2e` (brown). The door leaf also gets a vertical-line overlay: `repeating-linear-gradient(90deg, transparent 0 calc(25% - 1.5px), #2a170e2e ...)`. Scene text colours measured live: hero heading cocoa `#2a170e`, hero kicker toffee-ink `#8e3f15`, meet to chat body cocoa-soft `#5a3a28`, passport kicker toffee-ink, dusk to home headings milk `#fffdf8`, dusk and home body milk at 80% alpha.

**Colour rules observed**
1. Black is never used. Text is cocoa `#2a170e`.
2. Every outlined object has a **3px cocoa border**, buttons and small chips use 2px. This gives the "sticker" look.
3. Warm brown family dominates. Blue (sky) and green appear only in tiny illustration details.
4. Green is semantically reserved: if it is green, it opens WhatsApp.
5. Handwritten text is always toffee-ink on light scenes and honey on dark scenes.
6. Shadows are cocoa-tinted and hard (no grey).

### A3. Typography roles [CSS/L]

| Role | Font | Weight | Used for |
|---|---|---|---|
| Display | Fraunces | 800 | H1, H2, H3, names, nav in mobile menu, FAQ questions, form title |
| UI / body | Figtree | 400, 600, 620 (nav), 650 (buttons) | Paragraphs, buttons, nav |
| Handwriting | Shantell Sans | 500 | Kickers, labels, tags, filters row labels, "coming?" bubbles, form lines |

H1 about 84px at 1440 with tracking about -2.1px; H2 `clamp(2.6rem, 6.4vw, 6.25rem)`; lede `clamp(1.125rem, 1.4vw, 1.375rem)`; body base 17px. Headings are set tight and have `max-w-[Nch]` limits (hero 15ch, paths 13ch, book 12ch, home 15ch).

### A4. Surface and material effects (the "craft" look)

| Effect | Recipe [CSS] | Used on |
|---|---|---|
| **Hard offset shadow** | `0 8px 0 -2.4px cocoa` (button), `10px 14px` drop-shadow at 18% (book), `12px` offset on phone, `8px 14px #2a170e40` on an open FAQ note | Buttons, book, phone, notes |
| **Soft lifted shadow** | `0 1px 1px #2a170e1f, 0 18px 30px -14px #2a170e6b` | Polaroid on hover |
| **Quilt pattern** | Two crossed `repeating-linear-gradient` at 45 and -45deg, 46px clear plus 2px line, cocoa 7% | Hero ground, page-transition blanket |
| **Scallop edge** | Repeated round bumps, dashed stitch line inside | Header bottom (inner pages and scrolled home), hero ground |
| **Wave divider** | Smooth SVG/CSS wave into dark footer | Before footer on inner pages |
| **Paper dot grid** | Faint dot pattern on page background | `/puppies`, detail pages [S] |
| **Wallpaper stripes** | Faint vertical stripes | Happy families page [S] |
| **Tape strips** | Striped sheen gradient over pastel colour | Polaroids, filter panel, testimonial note |
| **Lined notebook** | Ruled lines, left margin line | Contact letter, happy-families note |
| **Cork texture** | Dotted tan board with dark wooden frame | FAQ board |
| **Rubber-stamp ink** | `mix-blend-mode: multiply`, 3px border, 90% opacity, tilted | Passport stamps and "gone home" stamps |
| **Radial glow** | Soft honey radial behind hero buttons; lamp glow in the CTA house | Hero, home CTA house, lamp |
| **Plank lines** | Repeating 30px/32px dark lines | House wall, floor |
| **Wood floor** | Tan strip with vertical plank dividers | Meet-the-pups floor |
| **Stars** | Tiny 4-point sparkles, `tp-twinkle` | Night scenes, footer |
| **Paw-print wallpaper** | Soft paw pattern | Phone chat background |
| **Blur-up images** | Blurred placeholder to sharp (`filter` transitions) | Gone-home tickets, lazy photos |

### A5. Shapes and framing language

- **Arch** (`border-radius: 999px 999px 0 0`): hero photo cut-outs, doors, puppy detail prev/next thumbs, "visit us" photo.
- **Circle**: puppy cards on `/puppies`, gone-home strip, tickets, mascot self-portrait.
- **Pill (999px)**: all buttons, chips, nav "WhatsApp us", tags.
- **Notched rectangle**: tickets.
- **Rounded card (0.75 to 1.5rem)**: FAQ notes, step cards, form card, info cards.
- **Tilt**: almost every object has a small rotation (about -3 to +3 degrees), stored as `--tilt`. It flips or resets to 0 on hover.
- **Scale hierarchy**: a very large display headline per page (up to 100px), then small text. There is **no mid-weight** headline tier, which gives a poster-like feel.

### A6. The mascot system ("pup-buddy" and "pup-actor") [CSS/JS]

A cream-gold poodle puppy with a red collar, drawn as layered SVG so that parts animate independently (legs, tail, ear, eyes-open and eyes-shut layers, mouth).

| Pose / context | Where | Behaviour |
|---|---|---|
| Peeking | Hero between photo arches | `tp-peek .75s pounce` slides up from below |
| Walking | Meet-the-pups floor | `runner-*` legs 0.32s alternate, body bob 0.16s, tail wag 0.22s; speech bubble "coming?" |
| Sitting by signpost | Paths | Idle; eyes closed in screenshots, blinks |
| Beside phone | Journey | Sits; faces phone |
| Sitting in passport | Passport left page | Idle |
| Peeking from heading | FAQ ("Questions, answered" with the mascot over the "ed") | Floats |
| Tiny at house door | Dusk and home | Moves with scroll |
| In basket | Footer | `tp-breathe 3.8s`, blink every 6.2s, ear twitch every 7.4s after 2.2s |
| Self-portrait | `/puppies` header | Interactive; says "Want one, please?" on interaction [V 1:52] |
| On card corner | Puppy detail info card | Static sitter |
| Running | Page-transition curtain | Full run cycle across the screen |
| Side view | Pixel-style version on loading screen [S/V] | Walking |

Interaction layer: a **fixed overlay layer** `.pup-layer` holds mascot actors and speech bubbles (`pup-bubble`), hearts (`pup-heart`), and footprints (`pup-prints`). `pup-probe` is a viewport-sized measuring element. `html[data-pup]` is a state flag; when set, the house door animation is skipped. `[data-live]` marks a mascot that can respond to clicks [CSS/JS]. A **paw cursor** replaces the arrow and switches to a "pressed paw" when over mascot parts (fine pointer, hover capable, motion allowed only) [CSS].

---

## PART B. Animation catalogue

46 keyframes, 5 timing curves. Every animation is listed by **trigger type** so a clone can be built system by system.

### B1. Timing curves [CSS]

| Name | Curve | Feel | Used for |
|---|---|---|---|
| `--ease-pounce` | `cubic-bezier(.34, 1.56, .64, 1)` | Overshoot spring | Almost all hover, pop, reveal, button movement |
| `--ease-silk` | `cubic-bezier(.22, 1, .36, 1)` | Soft ease-out | Shadows, large reveals, sunrise, clip-path wipes |
| `--ease-snap` | `cubic-bezier(.7, 0, .2, 1)` | Strong in-out | Menu clip-path, curtain, letter fold, envelope |
| Curtain cover | `cubic-bezier(.22,1,.36,1)` | | Page curtain |
| Curtain lift | `cubic-bezier(.65,0,.3,1)` | | Page curtain |

Default transition duration `.15s`; most UI transitions are `.25s` to `.35s`; spring transitions `.35s` to `.75s`.

### B2. Page-load and route transition: "the curtain" [CSS/JS/V]

A quilted "blanket" panel slides over the screen, a **running puppy** crosses the screen with paw prints stepping behind, then the blanket lifts off. This is used for first load and for in-app navigation.

| Phase (`data-state`) | Animation | Timing |
|---|---|---|
| `intro` (first load) | Blanket held, then lifts after a pause | Hidden after 1.04s; blanket lift `.48s` starting at `.56s`, curve snap-like `(.65,0,.3,1)` |
| `covering` (leaving a page) | Blanket rises from below (`translateY(100% + 44px)` to 0) | `.3s`, curve `(.22,1,.36,1)` |
| `lifting` (new page ready) | Blanket slides up and off (0 to `-100% - 44px`) | `.46s`, curve `(.65,0,.3,1)` |
| Runner | `tp-runner-x`: `translate -40%` to about `44rem/1.5625` (capped at 86vw) | `1.15s`, `cubic-bezier(.32,.1,.4,1)` |
| Paw prints | `tp-print-step`: opacity 0 to .7, scale .4 to 1.08 to 1, fade out | `1s` ease-out |
| Legs, body, tail, ear | Alternating loops | legs `.32s`, tail `.22s`, body and ear `.16s` |
| Scroll lock | `tp-hold-still` sets overflow hidden on `html` | `1.04s` at intro; **7s failsafe** if `data-curtain` is set |
| Caption | "every puppy is family" in handwriting | static |

Notes: **corrected 2026-11-02:** a first full load holds the curtain about 1 to 3 seconds (CSS intro `1.04s`), but on in-app route changes the curtain is visible for only about **0.8 s** (measured from the video at 0.2 s sampling, `docs/04-design-ux/reference-analysis/interaction-analysis.md` section 3). It also runs on route changes [V ≈2:24, ≈4:34]. It respects reduced motion (curtain animation set to none) [CSS: `prefers-reduced-motion` rules].

### B3. Scroll-linked (scrubbed) animations [CSS: `animation-timeline: view()`]

These advance with scroll position, not with time. They are written with `animation: linear both` and `animation-timeline: view()`, inside an `@supports` guard, so browsers without support show the end state or none.

| Element | Keyframes | Effect | Where |
|---|---|---|---|
| `.tp-door__leaf` | `tp-door-open`: `rotateY(0)` to `rotateY(var(--door-open))` | Door swings open as it moves through view | Meet the pups (non-pinned mode) |
| `.tp-horizon__sun` | `tp-sun-set`: `translate 0 -60%` to `0 40%` | Sun sinks behind the skyline | Passport to dusk transition |
| `.tp-house__door` | `tp-house-open`: `rotateY(0)` to `rotateY(-102deg)` | Final CTA house door swings open to reveal a puppy | Home CTA |
| `.tp-stamp` | `tp-stamp-in`: scale 1.7 to .93 to 1.03 to 1, rotate from tilt-16deg, opacity to .9 | Stamp "thumps" onto the page | Passport |
| `.tp-polaroid .tp-gone-stamp` | `tp-stamp-thump`: scale 1.25 to .94 to 1, rotate -22 to -10 | "gone home" stamp on photos | Gone-home/polaroids |

All have `none !important` fallbacks under reduced motion. [CSS]

### B4. Scroll-pinned horizontal section [JS/CSS/V]

"Meet the pups" has two modes:

| | Pinned mode | Non-pinned mode |
|---|---|---|
| When | JS flag `data-pinned` is set after a media check (desktop width, motion allowed) [JS: matchMedia `(min-width:1024px)` and reduced-motion] | Small screens or reduced motion |
| Layout | Stage `height:100vh`, `position:sticky`; wrapper height `calc(100vh + 0.8 x track overflow)`; the row of doors translates sideways as you scroll; `max-width:none` | A normal wrapped **grid** `repeat(auto-fill, minmax(min(11.5rem, 40vw), 1fr))` of doors, each door opening by the scroll timeline above |
| Mascot | Walks along the floor, legs animate while scrolling, speech bubble "coming?" at the start | Not pinned; mascot is a static element [I] |
| Door opening | **Driven by the walker's position** (JS sets `data-state`, `--door-open`), not by `view()`. The leaf's CSS animation is turned off (`.tp-meet[data-pinned] .tp-door__leaf{animation:none}`) | `view()` timeline |
| Photo reveal | When the dog reaches a door: `tp-pop-up .58s pounce` (photo pops up from `108%` with scale .92 to 1.04 to 1) | Photo behind the opening door |
| Hover on door | `.tp-lineup__photo` shifts `-12%` up; door leaf rotates; name colour to toffee-deep | Same |
| End | Dashed "Meet them all" door/arrow link | Same |

The hero's `tp-lineup` (arched photos) shares the idea: each arch **peeks up** on load with `tp-peek .75s pounce` (staggered) and "pops" on interaction (`data-state=pop`).

### B5. Reveal-on-enter (IntersectionObserver) [JS/CSS]

JS adds `data-armed` and then `data-revealed` as items enter view; CSS transitions or animations run on those attributes. Stagger uses `--i` (index) or `--d` (delay) custom properties.

| Component | Effect | Timing |
|---|---|---|
| Journey step (`tp-step`) | `tp-step-in`: opacity 0, translate y +1.25rem, rotate 1.5deg to rest | `.55s pounce` |
| Chat messages (`tp-msg-group > *`) | `tp-msg-in`: opacity 0, y +.8rem, scale .92 to rest | `.5s pounce`, sequential |
| Typing dots (`tp-typing`) | `tp-dot` bounce `-0.35rem` on three dots | `.9s` loop, staggered |
| Polaroids on wall | `tp-print-bound` ("prints" pop in, bounce, settle) with `--d` delay; paw prints pat on the wall via `tp-paw-pat` `.7s` at `delay + .2s` | `.62s` |
| Tickets (gone home) | `clip-path` wipe reveal plus `translate` plus blur-to-sharp `filter` | `.7s silk`, stagger `--i x 80ms`; filter `.45s` |
| "Available" tag | `tp-tag-swing 1.7s silk`: swings from -7deg, damped (4, -2.2, 1, -.4, 0) like a hanging tag | once on reveal; on hover `tp-tag-nudge 1.3s` |
| Puppy list items | opacity plus translate with stagger `min(var(--i), 6) x 70ms`, rotate and scale settle | `.5s` to `.7s` |
| Poster/header art | `tp-poster-in .9s pounce`: from y -1.5rem, rotate 3deg | |
| Hero sun | `tp-sunrise 2.6s silk`: opacity 0 and translate up from 16% | on load |

### B6. Idle / ambient loops [CSS]

| Element | Animation | Timing |
|---|---|---|
| Stars and sparkles (`tp-twinkle`) | opacity .35 to 1 to .35, scale .8 to 1.1, rotate 0 to 20deg | `3.2s ease-in-out infinite` |
| Night "?" and exclamation marks (`tp-night__wonder`) | `tp-float`: translateY 0 to -8px, rotate 0 to 8deg | `3.4s infinite` |
| Plane (`tp-postcard__plane`, paths plane) | `tp-plane-bob`: y -6px and rotate -3deg | `3.2s infinite` |
| Basket puppy | breathe `3.8s`, blink `6.2s`, ear twitch `7.4s` (delay 2.2s) | infinite |
| Mascot blink | two layers swap opacity at 94.5% | |
| Flag | `tp-flag` rotates flag up (mailbox) | once |
| Doodles on puppy cards | `tp-doodle-hop`: rotate 12deg, scale 1.35 at 40% | `.5s pounce` on hover/focus |

### B7. Menu (mobile) [CSS/V]

| Part | Animation |
|---|---|
| Open | `clip-path: circle(0% at calc(100% - 3rem) 2rem)` expanding to `circle(150% ...)` from the Menu button, `.5s snap` (circular reveal) |
| Close | Reverse circle shrink `.42s snap`; backdrop fades `.42s` |
| Links | `tp-menu-link`: each item rises 1.2rem, rotates -2deg to 0, `.55s pounce`, staggered |
| Element | Native `<dialog>`-style (`.tp-menu[open]`) using `::backdrop`. Honey background `#f2be6b`-like [S], handwriting heading "where to, friend?", Fraunces links at about 40px, active link in toffee |

### B8. Form submission: "post my letter" [CSS/JS]

A complete mini-story animation on successful submit:

1. `data-phase=posting`. The letter form folds in 3D: `tp-letter-fold` (perspective 1100px, `rotateX` to 62deg then 80deg, scale .8 to .35), `.65s snap`.
2. An envelope appears (`tp-env-in .45s` delayed `.3s`, scale .4 to 1) and the flap closes (`tp-flap .3s ease-in`, delay `.55s`, `scaleY(-1)` to 1).
3. Envelope flies to the postbox: `tp-env-post .85s snap` (up 1.2rem then down 12.5rem and scale .92 to .55).
4. The mailbox rises (`tp-box-up .5s pounce`), the flag lifts (`tp-flag .4s pounce`, delay `.75s`).
5. "Sent" message pops (`tp-sent-in .55s pounce`: y +1rem, scale .96).
6. All of this is skipped under reduced motion (`.tp-post * {animation:none}`) and the sent state is shown at once.

Not tested live: whether the enquiry form on detail pages uses the same sequence (likely, shared component [I]).

### B9. Hover / press / focus micro-interactions [CSS]

| Element | Hover | Active | Focus-visible |
|---|---|---|---|
| Primary button | Shadow grows to `0 .7rem 0 -.15rem`, `translateY(-2px) rotate(-1deg)` | `scale(.96)` | outline 3px toffee-deep, offset 3px, radius 6px |
| Ghost button | Fills cocoa, text milk | `scale(.96)` | same |
| WhatsApp button | `translateY(-2px) rotate(1deg)` | `scale(.96)` | same |
| Button transition | `transform .35s pounce`, `background-color .25s`, `box-shadow .35s silk` | | |
| Sticker chip (filters) | Fill honey-soft, `translate 0 -1px` | `translate 0 1px`, shadow removed | same |
| Nav link | Colour toffee-ink; paw glyph appears at 45% opacity and scale 1 | | active page: toffee-deep and a solid paw |
| Logo | Rotates -8deg | | |
| Puppy card (sketch) | Frame tilts to opposite tilt; doodle hops; ring brightens | frame scale .96 | same |
| Door | Leaf opens, photo lifts `-12%`, name to toffee-deep | | same |
| Polaroid | Lifts `-6px`, rotates to 0, soft deep shadow | lifts `-2px` | same |
| FAQ note | Tilt reduces; **opens**: `rotate 0`, `scale 1.015`, hard shadow `8px 14px`, folded corner shrinks (`:after` height to 0) | | |
| FAQ answer | `grid-template-rows` transition `.55s silk` (0fr to 1fr height animation) | | |
| Photo-wall print | Lifts, straightens | | |
| Social pills (footer) | `bg milk/10` hover, border honey | | |
| Links (`link-ink`) | Underline colour intensifies | | |

Hover effects are wrapped in `(hover:hover)`, so touch devices do not get sticky hovers.

### B10. State changes inside components

| Component | State animation |
|---|---|
| Journey phone | New chat bubbles appear as the active step changes (fade, slide, scale); typing dots in between |
| Journey steps | Inactive steps are faded (about 40 to 50% opacity); active step number circle turns filled toffee-deep |
| Filter chips | `aria-pressed` toggles fill; grid items filter in/out (animation not yet characterised) [I] |
| Gallery (detail) | Slide or fade between images with `1/2` counter [I, not captured] |
| Lightbox (happy families) | Overlay fade, image swap on prev/next [I, not captured] |
| Video clips | Play button toggles `aria-pressed`; button shrinks (`2.9rem` to `2.2rem`) when playing [CSS] |

### B11. Accessibility and performance of motion [CSS/JS]

- 20 CSS blocks and 5 JS checks respect `prefers-reduced-motion`. Reduced motion removes: curtain, door open, house open, stamps, sun, tag swing, letter animation, basket loops.
- Sticky hover guard `(hover:hover)`; custom cursor only for fine pointers.
- Scroll animations use `view()` timelines inside `@supports`, which limits cost.
- Heavy: paw-print and actor layers add about 11,500px of absolutely positioned content on mobile [L]; Lenis smooth scroll runs a `requestAnimationFrame` loop. Plan a performance budget.
- **Smooth scrolling library: Lenis** (28 references in JS). The curtain locks scroll for its duration.

---

## PART C. Layout framing

### C1. Global frame

| Item | Value |
|---|---|
| Header | Fixed, `z-index:50`, height 4.75rem (76px), inner `max-width:110rem` (1760px), 3 zones: logo+wordmark left, 6 links centred, "WhatsApp us" pill right |
| Header background | Transparent on hero; a milk layer (`:before`) fades in `.35s` once scrolled, with the scallop edge |
| Gutter | `clamp(1rem, 4vw, 3.5rem)` |
| Reading container | Inner pages in screenshots look about 1100px wide at 1900 viewport (content 403 to 1500px) [S]; tokens `max-w-5xl` to `7xl` exist |
| Home scenes | Content max about `110rem` for headers and grids (meet, chat, dusk, night), full-bleed backgrounds |
| Hero min height | `calc(100svh - header)` |
| Viewport units | `svh` and `lvh` used to avoid mobile browser UI jumps |
| Mobile bottom bar | Fixed, two buttons (WhatsApp flex-grow, Call ghost), shows only on small screens [S mobile, L] |
| Footer | Dark night scene, 3 columns: brand blurb plus basket mascot (left, about 5/12), Explore (centre), Say hello (right); bottom bar with logo + copyright left and handwritten tagline right |

### C2. Home page: section framing

| # | Section | Frame | Grid / alignment | Key sizes | Responsive notes |
|---|---|---|---|---|---|
| 1 | Hero | Full-bleed, min-height 100svh minus header, column flex | Centred stack: kicker, H1 (max 15ch), lede (max 46ch), two buttons; stage at bottom (`min-height clamp(14rem, 36 to 38vh, 19 to 25rem)`) with the arch lineup; quilt ground `--quilt-h` | H1 84px | Mobile: buttons stack full width, mascot with "peekaboo!" bubble, lineup shows fewer arches |
| 2 | Meet the pups | Header row (title + lede left, button right, `max 110rem`), stage below | Pinned: horizontal track, doors about 205px wide (aspect 4:5.2), spacing about 295px, floor strip at bottom. Non-pinned: auto-fill grid min `11.5rem` | Door frame 3px border, step 0.6rem | Pinned only at desktop widths and with motion |
| 3 | Two ways | Centre title (max 13ch), 3-column grid `1fr, clamp(8 to 10.5rem), 1fr` with the signpost in the centre column | Left scene: showroom skyline (`clamp(13rem, 22vw, 19rem)` tall), right: flight path scene; text max 40ch under each; text aligns right on left side, left on right side | Sign arrows 4.2rem tall | Stacks to one column on small screens (`tp-way` becomes column), signpost remains [I] |
| 4 | Journey | 2-column grid `minmax(0,1fr) minmax(0,30rem)`, max `110rem`; right column **sticky** | Left: heading, lede (max 42ch), then 3 steps each in a 2-col grid `3.4rem 1fr` (number circle plus text), step min-height 44vh (last 40vh); right: phone mock (`min(100%, 23rem)`, tilt 1.5deg, screen `clamp(23rem, 54vh, 32rem)`) with the mascot at its foot | Step titles 25.6px | On mobile the phone moves below or above and is no longer sticky [I] |
| 5 | Passport | Open book, `max-width:72rem`, tilt -0.35deg, 2-col grid `1fr 1.3fr` (left page title; right page 2x2 stamp grid `repeat(auto-fit, minmax(9.5rem, 1fr))`) | Stamps `clamp(8.5rem, 12vw, 10.5rem)`, different shapes and tilts | H2 max 12ch, body max 34ch | Becomes a single column; right grid 1fr 1fr [CSS] |
| 6 | Dusk (families) | 2-col header `minmax(0,1fr) minmax(0,31rem)` (title + text left, speech-bubble note right), then the **house facade** with 4-column polaroid grid (2 rows of 4 at wide sizes) | Facade has ground strip, lamp (height `clamp(9rem, 14vw, 12.5rem)`) and door (`clamp(8.5rem, 12vw, 11rem)`), button bottom right | Note max 34rem | Columns drop 4 to 3 to 2 in the photo wall (`columns:2/3/4`) |
| 7 | Night (FAQ) | 2-col grid `5fr 7fr`, max `110rem`; left title + button + floating "?"; right three Q&A | Q at display font, A max 58ch, a small star marks each Q | Always open on home | Single column on mobile |
| 8 | Home (CTA) | Centre stack: H2 (max 15ch), lede (max 52ch), **house** illustration (`clamp(21rem, 46vh, 29rem)`), two buttons | House: wall with planks, arched door (`aspect 1/1.62`), round peephole, knob, lamp, two plants, mat (1.9rem) | | |
| 9 | Footer | Night; hill divider top (`clamp(2.5rem, 5vw, 5rem)`), 3-col layout | Moon top right (`aspect 1`), basket (`300/240`) | | Columns stack on mobile |

### C3. Inner pages: section framing

**Shared page header (`tp-page-head`):** grid `minmax(0,1fr) auto`. Left: handwritten kicker, then giant Fraunces H1, then intro; right: a themed mini-illustration (mascot, note, heart or paragraph). Header sits under the scalloped fixed bar.

| Page | Background | Frame and grid | Distinctive components | Bottom |
|---|---|---|---|---|
| `/puppies` | Milk with paper dot grid | Head: H1 plus hand-drawn orange underline (`tp-sketchbook__underline`, 0.24em) plus a 1:1 circular self-portrait on the right. **Filter pad**: bordered card with a taped top (`tp-sketchpad:before` 1.5rem), 3 label rows (label column + chip row), chips are `tp-sticker-chip` min-height 2.75rem. Count line. **Grid**: `repeat(auto-fill, minmax(min(14.5rem, 40vw), 1fr))`, items 1:1 circular frames with ring wash and ink doodles, staggered vertical offset | Gone-home strip | "Already gone home" band (honey `#fbe3b4`) with 5 round avatars (`repeat(auto-fill, minmax(7.5rem, 1fr))`), title left, button, then wave into dark footer |
| `/puppies/[slug]` | Soft grey-beige page tint with a dotted body [S] | Left progress ribbon. Top: breadcrumb, numbered section "1 hello, it's me"; 2-col: gallery (about 60%) and info card (about 40%, tilt, pin hole). Then "what comes with" card. Then "the way home" full-width 4-step row (4 equal columns with dotted paw connectors). Then the enquiry form card (title left, 2x2 fields right, message full width). Then prev/next as two equal cards | Thumbnails row under the gallery, stacked-photo "paper pile" frame | Dark wave into footer |
| `/gone-home` | Milk | Head with a ticket-kiosk illustration, then **ticket grid** about 3 columns at 1900 [S] with fixed ticket aspect (about 2.6:1 incl. stub) | Ticket = left round avatar, name, breed line, source line, "home ♥" arrow, perforation, right stub "admit one" (vertical text) | Footer |
| `/happy-families` | Peach with stripes | Head: left title block, right taped notebook note; then **photo wall**: `tp-photowall__prints` grid `repeat(2 / 3 / 4, 1fr)` and the `columns` variant, `max 104rem`, items with `aspect 4/4.6` photos, polaroid frame, tape, caption | Lightbox on click | Footer |
| `/how-it-works` | Warm cream gradient | Head with 4 anchor pills; section 1: heading row with the toggle at right; panel: left text, right framed illustration card (tilt, border 3px, skyline + sun), below 4 equal step cards; section 2 passport book; section 3 delivery: head left, illustration right (plane over skyline), 2x2 text blocks; section 4 "why choose us": list left, right list; end CTA card with 2 buttons | Toggle swaps panel content | Footer |
| `/faq` | Brown dusk gradient (`#8a4a2c`-ish top [S]) | Head: H1 left, subtext. Then 2-col `minmax(15rem, 21rem) minmax(0, 1fr)`; left sticky: label, search input (max 26rem, height 3.5rem), counter, mascot with "!" bubble (`aspect 1`), "Ask your own question" button; right: corkboard frame (max 46rem list) with 9 notes each with pin, tilt, offset `--shift` | Open note straightens, scales 1.015, shows folded corner removal | Night footer; wave |
| `/contact` | Cream gradient | Head: big H1 left, paragraph right; 2-col: left stack = WhatsApp button, "call us", "email", **shop-front card** (striped awning `1.9rem`, skyline, arch photo, address, Maps button); right = **letter form** (notebook, margin line, inline blanks, select, ruled textarea, stamp, mascot beneath) | Posting animation (B8) | Wave to footer |

### C4. Breakpoint behaviour confirmed in CSS

| Width | Change [CSS] |
|---|---|
| < 640px | Mobile layout: stacked CTAs, grids single or double column, bottom contact bar; `columns:2 10.5rem` wall |
| 640 to 1023px | Tablet rules (`min 640 and max 1023`): intermediate column counts |
| < 768px | Reduced-motion-friendly motion modes; `max-width:767px` rules for pinned scenes and mascot behaviour |
| ≥ 768px | 2-col grids begin, `tp-photowall__prints` 3 columns |
| ≥ 900px | Specific scene rules |
| ≥ 1024px | Pinned meet scene, sticky journey phone and 4-col wall (`min-width:1024px` JS media query) |
| ≥ 1100px | Header and hero spacing refinements |
| ≥ 1280px, 1680px, 96rem, 112rem | Max-width relaxations and larger illustrations |

Exact per-breakpoint layouts for tablet are **not observed**, only inferred from these rules.

---

## PART D. UX behaviour and journey patterns

### D1. Persuasion pattern

Discover (hero, doors) → decide path (signpost: local or imported) → learn the process (phone chat) → build trust (passport, polaroids) → remove doubts (FAQ) → act (lit house CTA, WhatsApp).
Every section ends with a visible CTA to either WhatsApp or the listing. WhatsApp appears at least 9 times on home alone (header, hero, journey phone, passport, footer, sticky mobile bar, CTA, FAQ page button, detail buttons).

### D2. Conversion funnels

| Funnel | Steps |
|---|---|
| Primary | Any page → WhatsApp (wa.me link with prefilled text "Hi TeddyPups! I'd love to know more about your puppies.") |
| Per-puppy | Card → detail → "Ask about [Name] on WhatsApp" or "Send an enquiry" form (message prefilled with the puppy name) |
| Fallback | Phone `tel:` link, email, contact letter form, Google Maps to visit |

### D3. UX details that are easy to miss

1. Status words are made friendly: "Available", "gone home ♥", "home ♥", "admit one".
2. Humane microcopy everywhere ("where to, friend?", "sniff out a question", "Post my letter", "with love, a future puppy parent").
3. **Scroll progress** ribbon on detail pages.
4. Gone-home puppies are shown with the same care and keep a CTA to find "a puppy like this", turning a dead end into a lead.
5. Filters live in the URL, so a link from the home page ("Maltipoo" chip, "Imported") pre-selects them.
6. `Skip to main` link (`#main`) exists.
7. Focus ring is large and brand-coloured.
8. Honeypot field in forms rather than CAPTCHA.
9. Dialog menu uses native top-layer so focus is trapped by the browser.

### D4. UX risks of the reference (not to be copied silently)

| Risk | Detail |
|---|---|
| Loading curtain | About 0.8 s on each route change (measured; up to 1 to 3 s on a first full load) and a hard scroll lock (7s failsafe) |
| Scroll hijack | Pinned horizontal scroll can disorient; trackpad users may not see "Meet them all" |
| Motion volume | Constant micro-motion plus smooth-scroll library; battery and low-end device cost |
| Contrast | Faded inactive steps, `cocoa-soft` small text on orange, milk and honey on mid-brown gradient; needs measuring |
| Legibility | Handwriting font at small sizes in labels and tickets |
| No prices | Possible friction (business choice) |
| Heavy DOM | Decorative layers inflate document height on mobile |

---

## PART E. Build implications

### E1. Systems to build once and reuse

1. **Design tokens** (colours, fonts, radius, shadow, easing, gutter, header height) in Tailwind v4 `@theme`.
2. **Scene component** with gradient props (start, end, text tone) and `tone` switch for text colour.
3. **Reveal hook** (IntersectionObserver setting `data-armed`/`data-revealed` plus `--i`, `--d`).
4. **Scroll timeline CSS utilities** (`view()` animations with `@supports` fallback).
5. **Curtain/transition provider** (state machine: idle, covering, lifting, intro) with scroll lock and reduced-motion bypass.
6. **Mascot SVG with separable parts**, plus `Pup` actor layer (bubbles, hearts, prints).
7. **Sticker UI kit**: Button (3 variants), Chip, Tag, Polaroid, Ticket, Note, Stamp, Tape, Pin.
8. **Pinned horizontal scroller** with non-pinned grid fallback.
9. **Form letter** component with posting animation.
10. **Lightbox**, **Gallery**, **Accordion with search**, **Segmented toggle**.
11. **Lenis** provider with reduced-motion bypass.

### E2. Priority (animation work)

| Priority | Items |
|---|---|
| P0 | Tokens, fonts, buttons with hover/press, header (+scrolled state, scallop), mobile menu (circle reveal), scene gradients, all static layouts, reveal-on-enter basics, reduced-motion handling, focus states |
| P1 | Door-hallway pinned scroll plus fallback, journey phone chat, passport stamps, sun set, house door, polaroid wall reveal, ticket reveal, FAQ notes + search, lightbox, toggle, curtain transition, form letter animation, scroll progress ribbon |
| P2 | Mascot idle rig (blink, ear, breathe), paw cursor, paw-print trail, actor layer with speech bubbles, twinkle/float ambience, self-portrait interaction |

### E3. Asset production list (what must be drawn or sourced)

Mascot (7 poses), 5 door variants, floor, signpost with two arrows, showroom with awning, skyline (3 styles: line, silhouette, filled), plane, route dots, phone frame, paw wallpaper, chat bubbles, house facade + door + lamp + plants + mat, moon, sun, stars, passport book, 4 stamp shapes, 4 icons, tape strips (5 colours), polaroid frame, ticket shape, cork board, pins (4 colours), envelope, mailbox + flag, basket, quilt pattern, scallop and wave dividers, paw cursor (2), logo, favicon. Puppy photos and video clips come from the client or must be placeholders.

---

## PART F. Unverified items to close before building

1. Exact door colours (sample from screenshots).
2. Tablet layouts at 768 and 1024px for every page.
3. Mobile layout of Journey, Passport, Dusk, FAQ board and all inner pages (only the hero and menu were seen).
4. How filters animate when items leave or enter, and the empty state.
5. FAQ search behaviour, and whether several notes can be open at once.
6. Gallery transition, lightbox transition, and keyboard handling.
7. Whether the enquiry form on detail pages shares the posting animation.
8. Contrast ratios for all dark-scene text.
9. Whether the splash appears on every route change or only some (video suggests both).
10. Scroll lengths (pixel counts) for each pinned or sticky section at 1440 and 1920.
