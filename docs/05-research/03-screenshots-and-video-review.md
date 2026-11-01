# Screenshots and Video Review

> **Corrections added 2026-11-02 01:10 IST (see `docs/04-design-ux/reference-analysis/screenshot-inventory.md` section 0):** (1) there are **27** screenshots, not 28; (2) the screenshots were captured at **mixed browser zoom levels** (100%, about 80%, about 67%), so pixel sizes quoted in this file are device pixels, not CSS pixels; (3) the video timestamps quoted below came from a drifting frame filter and can be off by several seconds; the exact timeline is in `docs/04-design-ux/reference-analysis/interaction-analysis.md` section 2; (4) the page-change curtain lasts about 0.8 s on a route change.

Sources reviewed: 27 PNGs in `pages/` (about 1900px wide, desktop) and `video-recording/puppies-at-home-reference-demo.mp4` (7:12, 1920x1080, 60fps, desktop browser, tour of the whole site).
Evidence tags: **[S]** screenshot, **[V]** video (timestamp), **[L]** live re-test, **[C]** earlier code analysis.

**Coverage gaps in the supplied material:** everything is desktop. There are no mobile or tablet screenshots, and the video never resizes the window. Mobile findings in this project still come only from my own 375px pass ([C]/[L]), and the 768 to 1100px range has not been seen at all.

---

## 1. Inventory

| Folder | Files | Notes |
|---|---|---|
| `pages/home/` | `Home_section1` to `10` | Section 8 is 1008x844 and section 9 is 1584x974, so they were cropped from a different window size than the rest. Good for layout detail, not for pixel comparison. |
| `pages/puppies/` | `Puppies_1` to `5` | Listing page |
| `pages/gone home/` | `gona-home-1` (sic), `gone-home-2` | |
| `pages/happy-families/` | 1 to 3 | |
| `pages/how it works/` | 1 to 4 | |
| `pages/faq/` | 1, 2 | |
| `pages/visit & contact/` | `contact.png` | |
| `video-recording/` | one 103 MB MP4 | **Do not commit to git.** Add `docs/05-research/evidence/video-recording/` to `.gitignore`, or use Git LFS. |

Folder names contain spaces and `&`. They work, but rename to `how-it-works`, `gone-home`, `visit-contact` before the repo is shared.

## 2. Corrections to my earlier analysis (important)

| Earlier claim | Reality | Evidence |
|---|---|---|
| "`/puppies` has no filter UI; `?breed` and `?origin` are dead" | **Wrong.** `/puppies` has a filter panel with three rows: **where** (Everywhere, Imported, Korean Teacup), **breed** (Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu), **boy or girl** (Boys, Girls). | [S] Puppies_1, [V] 1:44, [L] |
| (implied) filters are single-select | **Multi-select.** At 1:44 both "Imported" and "Korean Teacup" were active, and two breed chips were active. | [V] |

How the filters behave:

- The state lives in the URL and in the chips. Opening `/puppies?breed=maltipoo` highlights "Maltipoo" and shows **"6 puppies match"** with 6 available cards. [L]
- A **"Clear filters"** link appears once any filter is active, and the count line changes from "15 puppies looking for a home" to "N puppies match". [V][L]
- Chips are `aria-pressed` toggle buttons. [L]
- The 5 "gone home" cards under the grid stay visible even while filtering. [L]

Why I got it wrong: my first test ran while the loading splash was still covering the page, and I read the server-rendered HTML, which contains the same unfiltered list. Lesson recorded: **always test interactions after the splash finishes.**

Not yet seen: the empty state (zero matches) and exactly how "Korean Teacup" and "Imported" overlap. I have not confirmed whether `origin=local` exists as a chip; the visible chips are only Everywhere, Imported and Korean Teacup. Test these before building.

## 3. New findings by page

### Home [S]
- **Hero:** centered, tilted-free. H1 at about 84px, handwritten kicker with a hand-drawn underline, two buttons, a soft radial glow behind the buttons, and a row of 8 arched photo cut-outs peeking above a **scalloped quilted ground** with a dashed stitch line. The mascot is in the middle row, between photo arches (sheet 1 shows the mascot centered). One arch shows a blank grey circle in the screenshot, which is an unloaded image (lazy loading).
- **"Meet the pups":** mascot walks on a wood-plank floor; doors in 5 colours (rust, dark brown, orange, terracotta, brown) with a paw print and a round knob. Each has a tilted "Available" speech-bubble tag. Names are Fraunces; the details line is small Figtree. The mascot says "coming?" in a speech bubble at the start. [S][V 0:16 to 0:30]: doors **open and show the photo** as the mascot passes, and the link target appears in the browser status bar on hover.
- **Two ways:** signpost with two wooden arrows, a Dubai skyline line drawing with a striped-awning photo frame ("In our showroom"), a plane with a puppy portrait window flying a dotted arc Korea to Dubai, and two CTAs.
- **Journey:** a sticky phone mock. As steps 1, 2 and 3 become active (inactive steps are faded), the phone's chat changes: step 1 shows the greeting and breed chips (Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu); step 2 adds a 2x2 photo grid and a video bubble; step 3 adds a bubble with an animated paw trail to a house. A typing indicator ("...") appears between messages. The mascot sits beside the phone.
- **Passport:** open book on a tilted brown cover. Left page has "puppy passport" kicker, H2 and the mascot; right page has four **rubber-stamp** badges (round, rectangular green, oval, dotted circle) with icons. Below it, a skyline silhouette with a **setting sun** whose position follows scroll.
- **Happy families:** a wooden house front. Eight taped polaroids at slightly different tilts, a "gone home" lamppost on the left, a small door and mascot at the bottom, and the testimonial in a **speech bubble** at top right. (This screenshot is 1008px wide, so layout at 1440+ differs slightly.)
- **FAQ and CTA:** night sky with twinkling stars. The 3 FAQs are always open here (no accordion on home). The CTA is a **lit house** with a round window, a glowing lamp and potted plants; the door opens to show a puppy [V 6:32]. The "welcome home" doormat doubles as a label.
- **Footer:** mascot sitting in a **wicker basket**, a crescent moon, "Home, at last." in Fraunces, and a handwritten "Explore" and "Say hello". Links appear in 2 columns plus social pills.
- **Header:** transparent over the hero. On inner pages, and after scrolling, it has a **scalloped bottom edge** on a milk background [S Puppies_1, contact].

### Puppies [S]
- Kicker "from Teddy's sketchbook", then a giant H1 with a hand-drawn orange underline, and a circular **"self-portrait"** of the mascot at the top right (it says "Want one, please?" when interacted with [V 1:52]).
- Filter card: a taped note with a sketchy double-line border and handwritten row labels ("where", "breed", "boy or girl"). Selected chips are dark cocoa with milk text; hover gives a honey wash.
- Cards are arched or circular photos in coloured ring frames with doodles around them (hearts, sparkles, spirals, dots, paw prints), a tilted "Available" tag, a Fraunces name and small details text. Card rhythm is staggered vertically.
- Under the grid: **"Already gone home"** is a honey band with 5 round photos with "gone home ♥" stickers, then a **wave** divider into the dark footer.

### Puppy detail [S][V 2:00 to 2:30, 3:04 to 3:20]
- **Scroll-progress bar** on the far left edge: an orange ribbon-style vertical bar that fills as you scroll [S Puppies_5, V].
- Breadcrumb "Available puppies / Max" with a numbered "1 hello, it's me" section tag. Sections are **numbered**: 1 hello, 2 what comes with, 3 the way home, 4 dear TeddyPups.
- Photo area: a layered "stack" frame, a `1/2` counter, circular prev/next buttons, a video with a play marker, and a thumbnail row under the frame. The right card is tilted, with a pin-hole punch at top-left and a **mascot sitting on its top-right corner**.
- Card contents: a tiny "Available" pill, name in Fraunces, breed, and a four-cell grid (Breed, Boy or girl, Age, Where). Where is "Imported for you" or similar. Two buttons: green "Ask about Max on WhatsApp" and ghost "Send an enquiry".
- "what comes with Max" is a checklist card with four ticks.
- "Coming home from abroad" is a 4-step row joined by **dotted paw-print lines**. Local puppies likely show a different text (not seen).
- Enquiry form: "Ask about Max", two columns of inputs, a taped paw stamp in the corner, a prefilled message, and a "Send enquiry" button.
- Prev/next cards show the neighbouring pup's photo (arched) and name.
- **Gone-home variant** [V 3:04]: heading "Ace", a "gone home ♥" pill, the button says "Ask about a puppy like this", the form title says "Looking for a puppy like this?", and the breadcrumb reads "Gone home / Ace".

### Gone home [S]
- Ticket cards: a notched perforated edge, a "one ticket home" handwritten label, a round photo, name, breed and sex, source ("TeddyPups" or "Dubai showroom") and "home ♥" with an arrow, plus a vertical "admit one" stub on the right in honey.
- Some tickets show blurred photos while scrolling [S gone-home-2, V 2:56], which confirms a **blur-up image placeholder** rather than broken images.
- The header illustration is a striped-awning "tickets home" kiosk with the mascot.

### Happy families [S][V 3:28 to 3:52]
- Kicker "our wall of happy endings", H1, a heart outline, and "64 moments and counting". The testimonial is on a **taped lined-notebook sheet**, not a speech bubble as on the home page.
- Masonry-like **polaroid wall** (4 columns) with tape strips in pastel colours, alternating tilts, and emoji captions in handwriting. Some photos have no caption.
- **Lightbox** [V 3:52]: dark overlay, counter "60 / 64", the image, **Previous** and **Next** pills, and **Close**. (This corrects my earlier "lightbox or none" open item: it exists.)
- The page background has faint vertical stripes (wallpaper).

### How it works [S][V 4:00 to 4:30, 6:40 to 6:56]
- Giant H1, intro paragraph on the right, and **4 anchor pills** ("1 Two ways home", "2 Our premium puppy promise", "3 Delivery & collection", "4 Why choose us").
- "Two ways home" has a **segmented toggle** (In Dubai "meet in person" / Imported "order upon request") with the mascot beside it. The toggle swaps the illustration and the 4 step cards. Dubai shows a skyline with a sun; Imported shows a plane route. The step cards have pastel icon discs.
- "Our premium puppy promise" is a passport/stamp section.
- "Delivery & collection" has a plane flying over a Korea to Dubai skyline route and a 2x2 text grid.
- "Why choose us" is a list with small line icons, and a bordered card "Unique and high quality puppies" with two buttons (WhatsApp and See available puppies).

### FAQ [S][V 4:32 to 5:04]
- Dark brown scene with a **corkboard**. 9 questions are pinned **sticky notes** with coloured pins (orange, blue, yellow, pink), alternating tilt and horizontal offset, and a folded corner.
- **Search box** "sniff out a question" (placeholder "delivery, Korea, vaccinated…") with the live line "9 notes on the board". This is real functionality I had not found. Filtering behaviour and the empty state are unseen.
- A mascot with an exclamation bubble, plus a green "Ask your own question" button (WhatsApp).
- One note open at a time, as far as seen [V 4:48 shows one expanded]; this needs confirmation.

### Contact [S]
- H1 "Get in touch with us", a WhatsApp button, then "call us" and "email" as handwritten labels with underlined links.
- "Visit us in Downtown Dubai": a card with a striped awning, a photo in an arch, a skyline drawing, a paw-pin address line and an "Open in Google Maps" button.
- The letter form: notebook paper with a left margin line, "Dear TeddyPups," in handwriting, inline dotted-underline fields, a select for the puppy, and "Post my letter" with "with love, a future puppy parent". A paw stamp is taped to the corner, and the mascot sits under the card.

### External links [V 6:56 to 7:12]
Instagram (`teddypups.worldwide`) and Facebook open in a new tab. Facebook shows a login wall. The video confirms social links are normal external links.

## 4. Revised design-system notes

Additions to `02-design-pattern-analysis.md`:

- **Nav:** the wave/scallop header edge, the active-page paw glyph, and the scrolled-state change are all confirmed in screenshots.
- **Dividers:** scalloped (header, hero ground), wavy (before the footer), wooden floor planks (doors, house).
- **Motifs to produce as assets:** mascot (standing, sitting, walking, peeking, in basket, side view), 5 door colours, signpost, plane, skyline, passport book, 4 stamps, phone frame, house front, lamppost, welcome mat, potted plants, stars, moon, sun, corkboard and pins, tape strips, ticket shape, awning, paw prints. This list is the real asset budget.
- **Pill states** confirmed: default (cream + dark border), selected (cocoa fill), hover (honey fill).
- **Page-specific kickers** in handwriting: "from Teddy's sketchbook", "our wall of happy endings", "choose your way", "sniff out a question", "one ticket home".

## 5. Scope impact

| Area | Update |
|---|---|
| Puppies | Build **working multi-select filters** plus URL sync, count text, "Clear filters", and an empty state. This is P0 because the homepage links depend on it. |
| FAQ | Build **live search** plus accordion. P0 or P1. |
| Happy families | Build a **lightbox** with prev/next, counter and close, and keyboard support. P1. |
| How it works | Build the **segmented toggle** (2 views) and the in-page anchors. P0. |
| Detail pages | Two variants (available and gone-home), a scroll-progress bar, a gallery with a video item, and prev/next. P0, with the progress bar at P1. |
| Gone home | About 28 tickets, plus detail pages for each (the sitemap lists them). |
| Splash | Seen on every page load [V 5:20, 5:28]. Mention again as a decision. |

## 6. Remaining gaps (need your input or more capture)

1. **Mobile and tablet screenshots** (375, 768, 1024), or permission for me to capture them live. The video and screenshots are desktop only.
2. Filter edge cases: zero results, "Korean Teacup" semantics, and whether `?origin=local` is a chip.
3. FAQ search behaviour and whether multiple notes can stay open.
4. Which element in the hero is the "blank grey circle" (an unloaded image, or a placeholder by design).
5. Whether the contact and enquiry forms show a success state. I have not submitted them, and I won't send data to the live business without your OK.
6. A second pass on contrast ratios on the dark scenes.
