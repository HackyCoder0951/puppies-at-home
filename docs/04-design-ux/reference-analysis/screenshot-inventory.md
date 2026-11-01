# Screenshot and Video Inventory

| | |
|---|---|
| **Protocol** | `docs/08-process/prompts/01-master-reference-analysis-prompt.md` (screenshot-based visual reference protocol) |
| **Analysed** | 2026-11-02, 00:48 to 01:15 IST |
| **Sources** | 27 desktop screenshots in `docs/05-research/evidence/pages/`, one screen recording in `docs/05-research/evidence/video-recording/`, supporting live measurements |
| **Status** | Analysis only. No implementation. |

## 0. Read this first: three corrections to earlier work

1. **There are 27 screenshots, not 28.** I miscounted earlier in `docs/05-research/03-screenshots-and-video-review.md` and in the conversation.
2. **The screenshots were captured at different browser zoom levels.** The same page container measures about 1100px, 1320px or 1648px in the images. Pixel values in an image are therefore **not** CSS pixels. Section 3 gives the conversion. Earlier statements such as "inner-page container about 1100px" and "tickets about 261px wide" were device pixels at 67% zoom, not CSS values.
3. **The video timestamps in `docs/05-research/03-screenshots-and-video-review.md` were slightly off.** The contact sheets used a frame-sampling filter that drifted from source time. The timeline in `interaction-analysis.md` section 2 was rebuilt from exact frame numbers (every 5 seconds, verified against an exact-seek filter) and replaces it. Also corrected: the page-change curtain lasts about **0.8 seconds**, not "1 to 3 seconds" (that longer figure applies only to a first full load).

## 1. Confidence legend

Used in every file in this folder.

| Tag | Meaning |
|---|---|
| **Observed** | Clearly observable in the image or video, or measured from pixels. Zoom-corrected if converted to CSS px. |
| **Estimated** | Reasonably estimated from proportions, or from a measurement with an assumption (stated). |
| **Unknown** | Not determinable from the supplied material. Do not invent a value. |
| **CSS** | Read from the reference site's stylesheet (`docs/05-research/evidence/captures/reference-site.css`) or a live computed style. Authoritative for values; not from the screenshots. |

## 2. Screenshot inventory

Capture times are the files' modification times (IST, 2026-11-01). "Zoom" is estimated in section 3.

### 2.1 Home (10)

| File | Size | Captured | Zoom | Shows | Notes |
|---|---|---|---|---|---|
| `home/Home_section1.png` | 1900×970 | 22:06 | ≈80% | Header (transparent), hero: kicker, H1, lede, two buttons, 7 arched photo cut-outs with the mascot peeking, scalloped quilt ground | One arch shows a blank grey circle (image not loaded when captured) |
| `home/Home_section2.png` | 1900×970 | 22:08 | ≈80% | "Meet the pups" start: title, button, 4 closed doors, mascot with "coming?" bubble, wooden floor | Pinned-scroller start state |
| `home/Home_section3.png` | 1900×970 | 22:08 | ≈80% | "Two ways to meet your puppy": signpost, showroom skyline card, plane route, two buttons, mascot at post | |
| `home/Home_section4.png` | 1900×970 | 22:09 | ≈80% | Journey, step 1 active: heading, lede, three steps (2 and 3 faded), phone with greeting and breed chips, mascot | Sticky phone state 1 |
| `home/Home_section5.png` | 1900×970 | 22:09 | ≈80% | Journey, step 2 active: phone shows 2×2 photo grid, video bubble, text bubble | State 2 |
| `home/Home_section6.png` | 1900×970 | 22:09 | ≈80% | Journey, step 3 active: delivery bubble with paw trail to house; "How it works" button; passport book top edge | State 3 |
| `home/Home_section7.png` | 1900×970 | 22:10 | 80% or 100% (uncertain) | Passport book with four stamps, mascot, setting sun over skyline | No logo to calibrate |
| `home/Home_section8.png` | 1008×844 | 22:11 | Unknown | Happy families: title, speech-bubble testimonial, house facade with 8 polaroids, lamp, door, mascot, button | **Cropped capture** (different size) |
| `home/Home_section9.png` | 1584×974 | 22:11 | Unknown | FAQ (3 open Q&As), "Ready to meet your new best friend?", lit house with welcome mat, two buttons | **Cropped capture** |
| `home/Home_section10.png` | 1901×974 | 22:12 | ≈100% | CTA buttons, footer (basket mascot, moon, links, socials, copyright) | Footer left edge x=129 equals the 100% video |

### 2.2 Puppies (5)

| File | Size | Captured | Zoom | Shows |
|---|---|---|---|---|
| `puppies/Puppies_1.png` | 1901×963 | 22:12 | **100%** | Header (solid, scalloped), "from Teddy's sketchbook" kicker, H1 with orange underline, intro, mascot self-portrait, filter pad (where, breed, boy or girl), count line, first row of cards |
| `puppies/Puppies_2.png` | 1901×963 | 22:12 | ≈67% | Filter pad bottom, "15 puppies looking for a home", 6-column grid of 15 puppies (rows of 6, 6, 3) |
| `puppies/Puppies_3.png` | 1901×963 | 22:13 | ≈67% | End of grid, "Already gone home" honey band with 5 round avatars, wave, footer |
| `puppies/Puppies_4.png` | 1901×963 | 22:13 | ≈67% | **Detail page**, Max: scroll ribbon, breadcrumb, gallery, info card, "what comes with" card |
| `puppies/Puppies_5.png` | 1901×963 | 22:14 | ≈67% | Detail page lower: "Coming home from abroad" steps, enquiry form, previous/next cards, wave |

### 2.3 Gone home (2)

| File | Size | Captured | Zoom | Shows |
|---|---|---|---|---|
| `gone-home/gona-home-1.png` (sic) | 1901×963 | 22:20 | ≈67% | **Listing**: H1 with heart, intro, button, kiosk mascot, 4×4 ticket grid |
| `gone-home/gone-home-2.png` | 1901×963 | 22:21 | ≈67% | **Detail** page for Leo (not a second listing screen): "GONE HOME ♥" pill, "Ask about a puppy like this" |

### 2.4 Happy families (3)

| File | Size | Captured | Zoom | Shows |
|---|---|---|---|---|
| `happy-families/happy-families-1.png` | 1901×963 | 22:14 | ≈67% | Kicker, H1 + heart, intro, "64 moments and counting", taped notebook testimonial, first polaroid row |
| `happy-families/happy-families-2.png` | 1901×963 | 22:14 | ≈67% | Mid wall: four columns of tilted polaroids, tape strips, captions |
| `happy-families/happy-families-3.png` | 1901×963 | 22:14 | ≈67% | End of wall, mascot with "every one of them was a Teddy Pup once", wave |

### 2.5 How it works (4)

| File | Size | Captured | Zoom | Shows |
|---|---|---|---|---|
| `how-it-works/how-1.png` | 1901×963 | 22:15 | ≈67% | H1, intro, anchor pills, "Two ways home" with toggle **In Dubai** active, skyline card, 4 step cards |
| `how-it-works/how-2.png` | 1901×963 | 22:15 | ≈67% | Toggle **Imported** active: "Order upon request", plane route card, 4 step cards |
| `how-it-works/how-3.png` | 1901×963 | 22:19 | ≈67% | "Our premium puppy promise" passport card (3 stamps), "Delivery & collection" with plane over skyline, 2×2 text |
| `how-it-works/how-4.png` | 1901×963 | 22:19 | ≈67% | "Why choose us" (text left, three items right), "Unique and high quality puppies" card, wave, footer |

### 2.6 FAQ (2)

| File | Size | Captured | Zoom | Shows |
|---|---|---|---|---|
| `faq/faq-1.png` | 1901×963 | 22:19 | ≈67% | H1, intro, search, "9 notes on the board", mascot, "Ask your own question", corkboard with first note **open** |
| `faq/faq-2.png` | 1901×963 | 22:20 | ≈67% | Board lower: "Which breeds do you usually have?" **open**, others closed |

### 2.7 Contact (1)

| File | Size | Captured | Zoom | Shows |
|---|---|---|---|---|
| `visit-contact/contact.png` | 1901×963 | 22:20 | ≈67% | H1, intro, WhatsApp button, call, email, shop-front "Visit us" card, letter form, mascot, wave and footer |

## 3. Zoom and CSS pixel conversion

**Method.** (1) The logo is 48 CSS px tall at wide viewports. In `Puppies_1.png` it measures 48px, so that image is at 100%. In the inner-page screenshots it measures 32px (y-extent 9 to 40), so 32/48 ≈ 0.67. In `Home_section1.png` it measures 39px, so ≈ 0.81. (2) The page container's left edge is x≈129 at 100% (confirmed in the video at 100%), x≈290 for the home screenshots and x≈403 for the inner pages. The container is about 1648 CSS px (103rem) wide in all three, so 1648 × zoom gives 1648, 1320 and 1100 device px. The two methods agree.

| Group | Estimated zoom | Evidence | CSS px = device px ÷ |
|---|---|---|---|
| `Puppies_1`, `Home_section10` | 100% | Logo 48px; container 129 to 1777 | 1.00 |
| `Home_section1` to `6` | ≈80% | Logo 39px; header 290 to 1610 (1320); kicker and buttons 0.8× the 100% video | 0.80 |
| `Home_section7` | 80% or 100% | No logo; passport book width 1198 | uncertain |
| All other inner-page screenshots | ≈67% | Logo 32px; container 403 to 1503 (1100) | 0.667 |
| `Home_section8`, `Home_section9` | Unknown | Cropped, different sizes, no calibration | do not convert |

**Consequences**

- Container: **about 1648 CSS px** at wide viewports (observed at three zooms, consistent). It is `103rem` if the base is 16px (Estimated; the stylesheet also defines a `110rem` header bar).
- Fluid sizes (`vw`-based type) depend on the CSS viewport width, which differs per screenshot: about 1900 CSS px for the 100% image, about 2375 for the 80% home set, about 2850 for the 67% set. So a headline can look the same size in two screenshots yet have different CSS values. **Do not read font sizes from these screenshots.** Use the stylesheet values or measure live at a known viewport. The hero H1 in `Home_section1` (718px wide) equals the 100% video's H1 (716px wide) even though the zoom differs: that is this effect.
- Counts (columns, items per row, order, composition, proportions, colours) are unaffected by zoom and are reliable.

## 4. Video inventory

| Property | Value |
|---|---|
| File | `docs/05-research/evidence/video-recording/puppies-at-home-reference-demo.mp4` (103.7 MB, **do not commit to git**) |
| Format | H.264 1920×1080, 60 fps, constant; audio AAC (no narration was analysed) |
| Duration | 7:11.78 (431.78 s, 25,907 video frames) |
| Zoom | 100% (logo 48px; container 129 to 1777) |
| Browser chrome | Absent until about 3:28, then a browser tab bar, address bar and bookmarks bar appear (recording changed to a window capture) |
| Viewport | Desktop only; the window is never resized to tablet or mobile |
| Timeline | Exact timeline in `interaction-analysis.md` section 2 |

## 5. Coverage gaps (what the owner material cannot tell us)

| Gap | Impact | Handling |
|---|---|---|
| **No mobile or tablet screenshots or video** | The prompt's responsive comparison cannot be made from owner material | `mobile-analysis.md` uses my own live captures at 375 and 768 and labels them **secondary evidence** (not the visual source of truth) |
| Mixed zoom levels | Pixel measurements need conversion; fluid type unreadable from images | Section 3; recapture protocol in `visual-qa-checklist.md` section 2 |
| Home sections 8 and 9 are crops of unknown zoom | Their pixel sizes cannot be converted | Use for composition only |
| No hover, pressed or focus screenshots | Interaction states known only from the video and CSS | `interaction-analysis.md` |
| One recording, no tablet width, no slow-motion captures of animations | Animation timing only partly measurable | Curtain measured (about 0.8 s); others from CSS |
| Photos in screenshots are third-party | Cannot be reused | Placeholders (see `docs/04-design-ux/13-public-site-spec.md`, `docs/00-overview/01-executive-summary.md` risk R-02) |

## 6. Output files in this folder

| File | Purpose |
|---|---|
| `screenshot-inventory.md` | This file |
| `visual-design-analysis.md` | Design system attributes with confidence tags |
| `desktop-analysis.md` | Per-screenshot analysis (all 27) |
| `mobile-analysis.md` | Desktop to mobile transformation (secondary evidence) |
| `interaction-analysis.md` | Video timeline, measured interactions, states |
| `component-mapping.md` | Reusable components mapped to screenshots and docs |
| `visual-qa-checklist.md` | Procedure and checklist for implementation comparison |
