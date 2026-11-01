# Interaction Analysis

| | |
|---|---|
| **Sources** | The 7:12 recording (1920×1080, 100% zoom), the screenshots, the reference stylesheet, and live checks |
| **Tags** | **Obs** seen in the video or images, **Meas** measured from frames, **CSS** from stylesheet, **Unk** not determinable |
| **Timestamps** | Exact. Frames were selected by source frame number (every 5 seconds, plus 0.2-second sampling around the curtain). The sampling interval means an event can be up to ±5 seconds from the time listed unless marked "Meas". These **replace** the video times in `docs/05-research/03-screenshots-and-video-review.md` (see `screenshot-inventory.md` section 0). |

## 1. How to read this

The video is a single scripted walkthrough by the owner: scroll the home page, visit Puppies, two detail pages, Gone home, Happy families, How it works, FAQ, Contact, return home, and open a social link. It shows what happens, not why. Anything it does not show is listed as unknown in section 8.

## 2. Exact timeline

| Time (m:ss) | Page and event | Notes |
|---|---|---|
| 0:00 to 0:07 | Home hero; arched photos and the mascot rise in ("peek") | Obs |
| 0:10 | Scroll into "Meet the pups"; the stage pins | Obs |
| 0:15 to 0:35 | **Door scroller**: the mascot walks along the floor; each door opens as it reaches it and the puppy photo appears; doors it has passed stay open; the last slot is a dashed arch "Meet them all" (at 0:30 to 0:35) | Obs |
| 0:35 | "Two ways" with the signpost and mascot at the post | Obs |
| 0:40 | Journey heading, phone appears | Obs |
| 0:45 | Journey step 2 active, phone shows photos | Obs |
| 0:50 | Journey step 3 active, "How it works" button | Obs |
| 0:55 | Passport scrolled past, sunset, families heading | Obs |
| 1:00 | Families facade with polaroids | Obs |
| 1:05 to 1:10 | Night FAQ and the "Ready to meet…" title | Obs |
| 1:15 | The owner **selects text** on the FAQ block: highlight is honey-yellow with dark text (custom selection colour) | Obs |
| 1:20 | CTA house with lit door | Obs |
| 1:25 | Footer | Obs |
| 1:28 to 1:40 | Navigates Home → Puppies; the hero is shown at 1:28 and 1:35 between visits to Puppies | Est (frames at 1:30 and 1:40 show Puppies; hero at 1:28 and 1:35) |
| 1:40 to 1:55 | **Filters**: chips toggled; at 1:50 "Imported", "Korean Teacup" and "Poodle" are selected, "1 puppy match" and "Clear filters" are visible; by 1:55 the filters are cleared and the count returns to 15 | Obs |
| 2:00 | Grid bottom; hovered card name turns toffee | Obs |
| 2:05 to 2:20 | Detail page: Max; gallery video plays in the main frame; scroll to steps and form | Obs |
| ≈2:24 | **Curtain** (route change to the next puppy) | Obs (frame at 2:25) |
| 2:30 to 2:40 | Detail page: Korean Teacup Pomeranian, 4 thumbnails | Obs |
| 2:45 to 2:55 | Puppies page bottom: gone-home strip, wave, footer | Obs |
| 3:00 to 3:05 | Gone-home listing with 4-column tickets | Obs |
| 3:10 to 3:25 | Gone-home detail: Ace (gallery 1/4, thumbnails, previous/next cards at 3:20) | Obs |
| **≈3:28** | The recording switches to a **browser window** (tab bar and bookmarks appear) | Obs |
| 3:35 to 3:45 | Happy-families wall scrolled | Obs |
| 3:50 to 4:00 | **Lightbox**: dark overlay, centred photo, counter, Close and two buttons; moves through photos (the counter at the top-left reads "xx / 64"; about "61 / 64" at 3:55, so the owner had jumped far along the wall) | Obs |
| 4:05 to 4:25 | How it works: toggle **In Dubai** (4:05), **Imported** (4:10 to 4:15, plane card), delivery section (4:20), toggled again (4:25) | Obs |
| 4:30 | How it works footer | Obs |
| ≈4:34 | **Curtain** to FAQ (measured in section 3) | Meas |
| 4:40 to 4:55 | FAQ: scrolls the board, opens and closes notes (4:50: "How does an imported puppy travel to Dubai?" open, the others closed) | Obs |
| 5:00 to 5:05 | FAQ top | Obs |
| 5:10 to 5:15 | Contact page and footer | Obs |
| 5:20 | Home hero again (return) | Obs |
| 5:25 to 5:30 | Scroll into Meet the pups, then hero | Obs |
| 5:35 | Detail: Toy Poodle (opened from a door) | Obs |
| 5:40 to 6:15 | Door scroller again; hovering a door turns its name toffee and the door leaf swings | Obs |
| 6:20 to 6:30 | Journey, families, footer | Obs |
| **6:35** | A browser prompt "Open xdg-open link?" with a checkbox appears after a WhatsApp link is clicked (the site hands the link to an external app) | Obs |
| 6:40 to 6:55 | Contact; How it works "Why choose us", footer | Obs |
| 7:00 | **Instagram** opens in a new tab (profile of teddypups.worldwide) | Obs |
| 7:05 to 7:11 | Back on the footer of the site tab | Obs |

## 3. Measured: page-change curtain

Frames sampled every 0.2 s around the route change at about 4:34 (sample start 4:33.0):

| Offset (s) | What is visible | Interpretation |
|---|---|---|
| 0.0 to 1.4 | The old page (How it works), unchanged | The click happens about 1.4 s into the slice |
| 1.6 | A cream blanket with a **scalloped top edge** has risen to the middle of the screen | Cover phase begins |
| 1.8 | Full-screen cream blanket with a radial light and the quilt pattern; a small pixel-art puppy runs across the screen with paw prints; handwritten "every puppy is family" below it | Fully covered |
| 2.0 | Same, puppy mid-screen | Runner crossing |
| 2.2 | The blanket slides **upward**; its scalloped lower edge is near the top; the FAQ page is already rendered underneath | Lift phase; new page is ready |
| 2.4 | New page fully visible, reveal animations already running | Curtain finished |

- **Meas:** visible duration ≈ **0.8 s** (about 1.55 s to 2.35 s), with ≈0.2 to 0.3 s of cover, ≈0.2 s of full cover and ≈0.3 to 0.4 s of lift.
- **CSS cross-check:** cover `.3s`, runner `1.15s` (runs across the covered period and beyond), lift `.46s`; a first full load holds the curtain `1.04s` ("intro").
- **Correction:** `docs/05-research/04-ui-ux-animation-effects-color-layout.md` and `docs/05-research/05-responsive-analysis.md` described the splash as "about 1 to 3 seconds". That applies to a first load; **route changes take about 0.8 s**.
- The scroll position is locked while the curtain is shown (CSS `hold-still`, with a 7 s failsafe).

## 4. Interaction catalogue (what the owner must see reproduced)

Priority from the protocol: reproduce layout first, micro-interactions last. Marked **V** if visible in the video, **C** if from CSS only.

| # | Interaction | Trigger | Result | Source |
|---|---|---|---|---|
| I-01 | Nav link hover and active | Pointer over link; current page | Hover: toffee-ink text, paw glyph appears at ≈45%; active: toffee-deep text with solid paw below | C, V |
| I-02 | Button hover and press | Hover; press | Hover: lift 2px and rotate -1° (WhatsApp +1°), base shadow deepens to `0 .7rem 0 -.15rem`; ghost fills cocoa with milk text; press: scale 0.96 | C |
| I-03 | Hero arches peek | Page load | Arched photos rise in with a bouncy ease (`.75s`) | V, C |
| I-04 | Door scroller | Scroll in the pinned section | Row scrolls sideways; mascot walks; doors open as reached (hinge on the left, leaf rotates) and show a photo; passed doors stay open; last slot "Meet them all" | V |
| I-05 | Door hover | Pointer over a door | Name turns toffee-deep; leaf swings; photo lifts slightly; status bar shows the target URL | V, C |
| I-06 | Door link | Click | Opens the puppy detail page (e.g. Toy Poodle at 5:35) | V |
| I-07 | Journey step change | Scroll | Active step number fills toffee-deep and its text becomes opaque; phone chat shows new messages (typing dots, bubbles slide in) | V |
| I-08 | Passport stamps | Scroll | Stamps thump in (scale and rotate) | C |
| I-09 | Sun set / house door | Scroll | Sun sinks behind the skyline; house door swings open to show a puppy at the end | V (door), C |
| I-10 | Text selection | Drag select | Honey-yellow highlight with dark text | V |
| I-11 | Filter chip toggle | Click | Chip toggles cocoa fill; list updates; count line changes "15 puppies looking for a home" → "N puppies match"; "Clear filters" appears at the right of the pad; hover = honey-soft fill with a paw cursor | V |
| I-12 | Clear filters | Click | All chips off, count returns to 15 | V |
| I-13 | Card hover | Pointer over card | Frame tilts the opposite way; name colour change; doodles hop | V (name), C |
| I-14 | Self-portrait | Pointer/click (Unk) | A speech bubble appears next to the mascot ("…please?") | Seen in a frame during the filters segment; exact trigger Unk |
| I-15 | Gallery arrows / thumbs | Click | Changes the main media and counter ("1 / 2", "1 / 4"); thumbnail border moves; the video thumbnail plays the clip in the main frame | V |
| I-16 | Prev/next pup | Click | Navigates to the neighbouring puppy; curtain plays | V |
| I-17 | Progress ribbon | Scroll on detail pages | A vertical toffee bar on the left edge grows with scroll (short at top, long at the bottom) | Seen in images |
| I-18 | Ticket and polaroid reveal | Scroll | Items appear with staggered clip and bounce; some tickets are blurred until loaded | V, C |
| I-19 | Polaroid hover | Pointer | Lifts about 6px, straightens, soft shadow | C |
| I-20 | Lightbox | Click a polaroid | Dark overlay, centred photo, counter "k / 64", Close pill (top-right), two bottom pills (Previous, Next) | V |
| I-21 | How it works toggle | Click segment | Active pill moves; illustration, H3, paragraph and four step cards swap | V |
| I-22 | Anchor pills | Click | Smooth scroll to the section (Unk exact) | C/Unk |
| I-23 | FAQ note | Click | Opens an answer panel; folded corner disappears; note straightens; other notes closed (one open at a time seen) | V |
| I-24 | FAQ search | Type | Notes filter, counter changes (field exists; not used in the video) | Unk behaviour |
| I-25 | Curtain | Route change | See section 3 | Meas |
| I-26 | Mobile menu | Tap Menu | Circular reveal overlay (secondary evidence) | `mobile-analysis.md` |
| I-27 | Social links | Click | Open in a new tab (Instagram at 7:00) | V |
| I-28 | WhatsApp links | Click | Browser prompts to open an external app (6:35) | V |
| I-29 | Contact and enquiry forms | Fill and submit | Fold, envelope, mailbox, "sent" sequence | C; success and error visuals Unk |
| I-30 | Mascot idle and cursor | Pointer | Custom paw cursor, mascot blinks, ear twitch, breathing | C |

## 5. State inventory

| Component | Default | Hover | Active/selected | Focus | Loading | Disabled/error |
|---|---|---|---|---|---|---|
| Primary button | toffee-deep pill, base shadow | lift, rotate, deeper shadow | scale .96 | 3px toffee-deep outline, 3px offset (CSS) | n/a | Unk |
| Ghost button | outlined | cocoa fill | scale .96 | same | n/a | Unk |
| Chip | milk, outlined | honey-soft | cocoa fill, milk text | outline | n/a | Unk |
| Door | closed | leaf swings; name toffee | open with photo | outline | n/a | n/a |
| Puppy card | circle with ring | tilt, doodle hop | n/a | outline | blur-up image | n/a |
| Ticket | tilted | Unk | n/a | outline | blurred avatar until loaded | n/a |
| Polaroid | tilted + tape | lifts, straightens | n/a | outline | Unk | n/a |
| FAQ note | closed, tilted, folded corner | tilt reduces (CSS) | open: straight, corner gone, answer shown | outline | n/a | empty state exists (CSS `tp-note--empty`) |
| Toggle | active segment filled | Unk | switched | outline | n/a | n/a |
| Journey step | faded | n/a | opaque, filled disc | n/a | n/a | n/a |
| Form field | outlined | Unk | Unk | outline | n/a | error style Unk |

## 6. Timing and easing (for later fidelity checks)

Measured here: curtain ≈0.8 s. From CSS (see `docs/05-research/04-ui-ux-animation-effects-color-layout.md` part B): spring ease `cubic-bezier(.34,1.56,.64,1)` for hover and reveal, silk `(.22,1,.36,1)`, snap `(.7,0,.2,1)`; tag swing 1.7 s; peek .75 s; door/stamp/house animations are scroll-linked (no duration); menu .5 s open, .42 s close.

## 7. Priority for implementation (per the protocol)

1. Layout and structure of every page.
2. Typography, spacing, images, component sizes, colours, buttons.
3. Responsive behaviour.
4. Micro-interactions: I-01 to I-02 first (cheap, visible), then I-11 to I-24 (functional), then I-04 to I-09 (signature scroll), then I-03, I-10, I-13 to I-19, I-25 to I-30 (polish).

Per the protocol, do not spend significant time on small animations while major visual differences remain.

## 8. Unknowns

| Item | Why unknown |
|---|---|
| Form submit, validation, success and error visuals | No submission in the video; not submitted live to avoid sending data |
| FAQ search behaviour and empty state visuals | Not used in the video |
| Lightbox keyboard support and animation | Only visuals captured |
| Gallery transition between media | Not slowed down |
| Whether gallery video autoplays and loops | Plays in the video; settings not visible |
| Door scroller scroll length and what happens scrolling back up | Not shown |
| Hover states of tickets, step cards and chips beyond the one frame | Not shown |
| Filter combination logic (OR within a row, AND across) | The 1:50 state (Imported + Korean Teacup + Poodle → 1 match) does not settle it |
| Empty result state of filters | Not shown |
| Trigger of the self-portrait bubble | Seen only in a frame |
| Tablet interactions | Desktop only |
