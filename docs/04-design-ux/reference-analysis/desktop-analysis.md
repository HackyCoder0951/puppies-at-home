# Desktop Analysis (27 screenshots)

| | |
|---|---|
| **Protocol** | The 23 attributes in `docs/08-process/prompts/01-master-reference-analysis-prompt.md`, applied per screenshot |
| **Zoom** | Each image's zoom is in `screenshot-inventory.md` section 2. Pixel figures below are **device px as seen**; "→ CSS" shows the converted value (÷0.667 for 67% images, ÷0.8 for 80% images). Do not read font sizes from images (see `visual-design-analysis.md` section 2). |
| **Tags** | **Obs** observed, **Est** estimated, **Unk** unknown |

Shared facts (not repeated per screenshot): the container is 1648 CSS px; display type is Fraunces 800 in cocoa `#2a170e`; kickers and labels are Shantell Sans in toffee-ink `#8e3f15`; body is Figtree in `#5a3a28`; every outlined object has a cocoa outline (3px; 2px on chips and ghost buttons) and hard offset shadows; brand colours and per-page backgrounds are in `visual-design-analysis.md` section 3.

Attribute key used in each entry: **Layout** (structure, container, columns), **Spacing**, **Type**, **Colour**, **Images**, **UI** (buttons, cards, icons, borders, radius, shadows, backgrounds), **Align**, **Interactive**, **Components**, **Unknown**.

---

## A. Home

### A1. `Home_section1.png`: header and hero (≈80% zoom)

- **Layout (Obs):** transparent header (logo + wordmark left, 6 centred links, green WhatsApp pill right) over a centred hero stack: kicker, two-line H1, two-line lede, two buttons side by side. Bottom: a row of 7 arched photos with the mascot between them, standing on a scalloped quilt ground. Container 290 to 1610 (1320 device = 1648 CSS).
- **Spacing (Obs):** kicker y=124, H1 y=165 to 365, lede y=380 to 410, buttons y=441 to 483, arches begin y≈695, scallop line y≈840, quilt diamonds below.
- **Type (Obs):** kicker handwritten with a wavy underline; H1 huge, tight, two lines (≈718px wide); lede two centred lines; nav 16px-class links with active "Home" in toffee and a tiny paw below it.
- **Colour (Obs):** background gradient `#fffdf8 → #fff1d8` (sampled), soft honey radial glow behind the buttons, primary button `#a24a1a`, WhatsApp pill `#1f7a4d`.
- **Images (Obs):** 6 photo arches with different heights (≈90 to 135px visible) plus the mascot (≈160px wide); one arch shows an unloaded grey circle. Arch outline 3px cocoa.
- **UI (Obs):** primary button 181×42 device (pill, hard base shadow), ghost button 178×42 (2px outline), header pill with base shadow.
- **Align (Obs):** all hero content centred on the page axis x=950; arches distributed across the full width, mascot at the centre.
- **Interactive:** nav links, WhatsApp pill, two CTAs. Hover and press states from the CSS (`interaction-analysis.md`).
- **Components:** Header, NavLink (with paw), Button (primary, ghost, WhatsApp), HeroLineup, Mascot, QuiltGround.
- **Unknown:** the width at which the arches disappear (hidden on small screens); which arch image is the blank one.

### A2. `Home_section2.png`: "Meet the pups" start state (≈80%)

- **Layout (Obs):** left-aligned title block (title x=290, lede below) with a primary button at the far right (x 1417 to 1608). The lower part is a scene: closed doors on a wooden floor, the mascot at the far left with a "coming?" speech bubble.
- **Spacing (Obs):** four visible doors at x=722, 1017, 1311, 1606 (width ≈205 device = 256 CSS; pitch ≈294.5 device = 368 CSS). Names sit about 12px above each door; the floor starts y≈915.
- **Type:** door names Fraunces (bold, 1 to 2 lines, centred; longer names wrap), detail line in small Figtree (centred, 2 lines).
- **Colour (Obs):** door fills `#a24a1a`, `#5a3a28`, `#d4893f`, `#b8644a` (sampled); floor `#e4a963`; background `#fff1d8`.
- **Images:** none yet (photos appear when a door opens).
- **UI:** door = arch (4:5.2) with 3px outline, inset lighter arch line, vertical plank lines, paw print near the top, round honey knob, a tilted white "Available" tag overlapping the top-right of the arch.
- **Align:** doors bottom-aligned on the floor line; names top-aligned at slightly different heights (long names push up).
- **Interactive:** each door is a link (target shown in the status bar in the video); hover opens the leaf.
- **Components:** DoorLink/DoorCard, StatusTag, Floor, Mascot (walker), SpeechBubble, PinnedStage.
- **Unknown:** the exact scroll distance consumed by the pinned stage.

### A3. `Home_section3.png`: "Two ways to meet your puppy" (≈80%)

- **Layout (Obs):** centred two-line H2; a vertical wooden signpost in the centre with two arrow signs ("Puppies in Dubai" left, "Imported for you" right); two scenes under the arrows: left a showroom (awning photo + skyline outline), right a plane over a dotted arc between Korea and Dubai. Texts and buttons under each scene. Mascot sits at the base of the post.
- **Spacing (Obs):** H2 y=65 to 215, signs y≈270 to 325, post x≈950 from y=240 to 840, left text right-aligned against the post, right text left-aligned.
- **Type:** H2 two centred lines; sign titles Fraunces on wood; body Figtree small.
- **Colour:** background `#fbe2b1 → #f7d18d`; sign wood `#9c4531`-toned with lighter edge, post `#c28039`; skyline line art `#b8996a`-toned; plane cream with toffee wings.
- **Images:** showroom window with awning (striped toffee and white), photo ≈150×175 device; plane window shows a circular puppy portrait.
- **UI:** primary buttons under both texts; dotted arc with two end dots labelled "Korea" and "Dubai" in handwriting.
- **Align:** symmetrical about the post; text columns about 330 device wide.
- **Interactive:** two buttons ("Meet local puppies", "See imported puppies"), likely signs not clickable.
- **Components:** Signpost, ShowroomScene, FlightScene, Button, Mascot.
- **Unknown:** whether the signs are links.

### A4. `Home_section4.png`: Journey, step 1 (≈80%)

- **Layout (Obs):** two columns: left heading, lede and three steps; right a tilted phone mock (x≈1265 to 1570) with the mascot at its foot. Steps 2 and 3 are faded.
- **Spacing:** step discs 46 device; step titles and text offset 58px from the disc; steps are far apart vertically (≈420px each) so the sticky phone can change between them.
- **Type:** H2 "Your puppy journey" (≈640px wide); step titles Fraunces (≈29px class); step text Figtree small (max ≈40ch).
- **Colour:** background `#f7d08c → #f3c377`; active disc toffee-deep with milk numeral; inactive disc outlined and pale; faded step text at ≈45% opacity; phone body cocoa with a 3px frame, screen with paw-print wallpaper in honey-soft; user bubble `#f2be6b`; assistant bubble milk with a 2px outline.
- **Images:** header avatar (logo), none else in state 1.
- **UI:** phone radius ≈ 2.7rem with a hard offset shadow, tilt about 1.5°; chips (Maltipoo, Pomeranian, Poodle, Cavapoo, Shih Tzu) as small outlined pills; compose bar "Say hello on WhatsApp" with a green circular send button.
- **Align:** left column left-aligned; phone right-aligned with a slight tilt.
- **Interactive:** breed chips look like links (`/puppies?breed=…`); step highlighting follows scroll.
- **Components:** StepList (with active state), PhoneMock, ChatBubble, Chip, TypingIndicator, Mascot.
- **Unknown:** step trigger scroll positions.

### A5. `Home_section5.png`: Journey, step 2 (≈80%)

- Same layout as A4. Step 1 becomes inactive, step 2 active. The phone screen has scrolled: a 2×2 grid of square puppy photos in one bubble (bubble ≈155 device), a video bubble (portrait ≈4:5 with a round play button) and a text bubble ("Our team will share real photos…").
- **Unknown:** autoplay behaviour of the video bubble.

### A6. `Home_section6.png`: Journey, step 3 and passport edge (≈80%)

- Step 3 active; the phone shows the video tile, the previous text bubble and a new bubble with a dotted paw-trail from a dot to a house icon. A "How it works" ghost button sits under step 3 (x=290 to 415). The top edge of the passport book (brown, tilted) enters at the bottom. Background `#f5c379 → #e5aa5e`.
- **Components added:** Button (ghost), PawTrail illustration.

### A7. `Home_section7.png`: Passport and sunset (zoom 80% or 100%)

- **Layout (Obs):** a tilted open book (x 353 to 1551, y≈130 to 780) with a brown cover and cream pages. Left page: kicker "puppy passport", H2 in three lines ("Why / families trust / TeddyPups"), mascot sitting bottom-left. Right page: 2×2 stamps with a caption under each. A city skyline silhouette and a glowing sun sit below the book.
- **Type:** H2 very large, three lines, cocoa; stamp titles Fraunces on the stamp; captions Figtree small.
- **Colour:** background `#f1b967 → #ab6033`; cover toffee-deep `#a24a1a` with a 3px outline and soft highlight; pages `#fff8ea` with a faint scalloped pattern; stamp inks: toffee (round), green `#2f8f5b`-toned (rectangular, dashed), brown-grey (oval), toffee dotted (circle).
- **Images:** line icons inside stamps (heart-pulse, plane, chat bubble, globe).
- **UI:** stamps are rotated (-6° to +8°) with `multiply`-style ink look; book shadow offset right-down.
- **Align:** the left page content sits top-left, right page grid centred; sun at the right, behind the skyline.
- **Interactive:** none except scroll animations (stamps thump in; sun sets).
- **Components:** PassportBook, Stamp (4 shapes), Skyline, Sun.
- **Unknown:** exact page grid gaps.

### A8. `Home_section8.png`: Happy families (cropped 1008×844, unknown zoom)

- **Layout (Obs):** two-line title and paragraph at the left, speech-bubble testimonial at the right with a tail pointing down-left. Below: a wooden house facade with a dark cap strip across the top, 8 polaroids in two rows of four (each slightly rotated, with a taped top), a glowing lamppost on the left, an arched door in the bottom centre with the mascot beside it, and "See every happy family" button bottom-right. A dark floor strip along the bottom.
- **Colour:** background `#a2582f → #4f2c19`; facade wall darker brown with horizontal plank lines; lamp glow warm honey; paper `#fffefb`.
- **Images:** 8 family photos, portrait-ish (≈4:4.6 with a caption strip), captions in handwriting with emoji.
- **Type:** title milk, paragraph milk at ≈80%; testimonial serif-looking quote with a handwritten author line in toffee.
- **Unknown:** CSS sizes (crop); wall grid gap.

### A9. `Home_section9.png`: FAQ and CTA house (cropped 1584×974, unknown zoom)

- **Layout (Obs):** two columns at the top (title + ghost button + floating "?" at the left; three star-bulleted Q&As on the right), then a centred CTA: two-line H2, centred paragraph, a house illustration (wall, arched door with a round window, lamp, two potted plants, doormat "welcome home", mascot at the roof corner), then two buttons (green WhatsApp, ghost "Visit & contact").
- **Colour:** background `#4a2a18 → #24130b`; text milk; star bullets honey; ghost button outline milk; stars scattered in honey.
- **UI:** Q in Fraunces bold (white), A in small Figtree (milk 80%); no accordion on home (always open).
- **Interactive:** "Read all questions", WhatsApp, "Visit & contact" buttons; the door opens on scroll in the video.
- **Components:** FAQPreview (open items), CTAHouse, Plants, Lamp, Doormat.

### A10. `Home_section10.png`: footer (≈100%)

- **Layout (Obs):** buttons row at the top, then footer: left column heading "Home, at last." (cream Fraunces) + blurb + basket mascot (x 130 to 335); centre "Explore" column (x=977) with 7 links; right "Say hello" column (x=1401) with WhatsApp number, email, address and three pill-shaped social links (Instagram, TikTok, Facebook); a crescent moon top-right; stars; a thin divider at y=875 (x 73 to 1833); bottom row with a small logo and ©, tagline in handwriting on the right.
- **Colour:** `#24130b`; link text milk; labels honey; social pills 1px milk-toned outline.
- **Type:** link text Figtree ≈16px class; labels Shantell Sans 18px honey.
- **Components:** Footer, FooterColumn, SocialPill, BasketMascot, Moon, Stars.

---

## B. Puppies

### B1. `Puppies_1.png`: header, intro, filters (100%)

- **Layout (Obs):** solid milk header with scalloped bottom; kicker "from Teddy's sketchbook"; one-line H1 156px with a thick wavy toffee underline across the full H1 width; two-line intro (649px); right: circular mascot "self-portrait" (≈210px) with an outer thin ring and handwritten caption; filter pad full container width (x 129 to 1775) with three labelled rows; count line; the first row of puppy cards starts below.
- **Spacing (Obs/CSS):** kicker y=140, H1 y=168 (h=172), intro y=364, filter pad y≈475 to 700, count y=739, grid y=799. Chips 45 to 49px tall, padding 7.2×16, row gap ≈ 12px.
- **UI:** pad = 3px cocoa outline, radius ≈ 22px, hard shadow, a translucent honey tape strip across the top-left corner (≈90×30). Row labels in handwriting at x=160. Selected chip cocoa fill; the others milk with outline.
- **Colour:** page milk with a faint dot grid; underline `#c2622b`.
- **Interactive:** 10 chips (toggle), hover honey-soft fill (see video).
- **Components:** PageHeader (sketchbook), Underline, SelfPortrait, FilterPad, Chip, CountLine.

### B2. `Puppies_2.png`: cards grid (≈67%)

- **Layout (Obs):** 6 columns × 3 rows (6, 6, 3 = 15). Container 403 to 1503 device (1648 CSS), column pitch ≈186 device (≈279 CSS), gaps ≈ 40 CSS column / 52 CSS row (CSS-confirmed).
- **Cards (Obs):** circular photo ≈145 device (≈217 CSS) with a pastel ring (peach, blue, pink variants) and thin ink arcs; doodles around (paw, heart, sparkle, spiral, dots, dashes); white outlined "Available" tag top-right, tilted; "▶ video" dark pill bottom-left on 4 cards; Fraunces name (1 to 2 lines, centred), small Figtree detail line under it ("girl · 2 months"; long ones wrap to 2 lines).
- **Rhythm (Obs):** vertical staggering (centres differ by up to ≈27 device) because long names push text down and photos have individual offsets.
- **Colour:** milk background; name cocoa; detail `#5a3a28`.
- **Interactive:** whole card is a link; hover tilts the frame (CSS).
- **Components:** PuppyCard (sketch), StatusTag, VideoBadge, Doodle set, RingWash.

### B3. `Puppies_3.png`: gone-home strip and footer (≈67%)

- **Layout (Obs):** "Already gone home" band: honey-soft background, H2 (64 CSS) with a small text line and a primary button at the left, 5 circular avatars (≈80 device = 120 CSS) with "gone home ♥" stickers and names at the right. The band top edge is flat; its bottom edge is a wave into the night footer; footer layout as in A10.
- **Colour:** band `≈ #f9e0ae`; wave and footer `#24130b`.
- **Components:** GoneHomeStrip, Avatar (circle + sticker), Wave divider.

### B4. `Puppies_4.png`: puppy detail, top (≈67%)

- **Layout (Obs):** left vertical scroll-progress ribbon (x≈12 to 25, toffee, ends in a notch); breadcrumb "Available puppies / Max" with a toffee underlined link; number disc "1" and handwriting "hello, it's me"; two columns: gallery (403 to 1030 device ≈ 940 CSS) and info card (1067 to 1503 device ≈ 654 CSS), gap ≈ 55 CSS; under them a second card.
- **Gallery (Obs):** frame with 3px outline and a stacked paper effect (two extra outlines offset right and down by ≈6px); photo fills; centred counter pill "1 / 2" (dark, milk text); round white 2px-outlined arrow buttons at left and right bottom (≈32px device); thumbnails row (≈65 device) below: the active thumb has a toffee border, the video thumb shows a play icon.
- **Info card (Obs):** tilted ≈ -1°, dashed inner border, a pin-hole circle at top-left, mascot sitting on the top-right corner; "Available" pill (honey-soft, paw icon); name "Max" in Fraunces; breed; 2×2 facts (Breed, Boy or girl, Age, Where) with handwriting labels; green full-width button "Ask about Max on WhatsApp" with base shadow; ghost button "Send an enquiry".
- **Checklist card (Obs):** tilted ≈ +0.5°, honeycomb faint pattern, disc "2" + handwriting "what comes with Max", title "Every Teddy Pup comes", four rows with toffee line check icons.
- **Colour:** page tint from milk to grey-beige `≈ #e7dfd5`.
- **Components:** ProgressRibbon, Breadcrumb, SectionNumber, Gallery (stack frame, counter, arrows, thumbs), InfoCard, FactGrid, ChecklistCard.

### B5. `Puppies_5.png`: puppy detail, lower (≈67%)

- **Layout (Obs):** disc "3" + "the way home"; H2 "Coming home from abroad"; 4 steps in a row, each a numbered outlined circle joined to the next by a dotted line of paw prints, with a Fraunces step title and small text; enquiry form card (403 to 1503): left block (disc "4", "dear TeddyPups…", H2 "Ask about Max", help text), right 2-column inputs (Your name*, Phone or WhatsApp* with helper text, Email, Your area, full-width Message with a prefilled sentence), primary "Send enquiry" button; a taped paw "stamp" on the card's top-right corner; below two equal cards "Previous pup" and "Next pup" each with an arched thumbnail (left card thumb on the left, right card thumb on the right).
- **UI:** inputs 2px cocoa outline, radius ≈ 10px, label above in small Figtree; the form card has the standard 3px outline and hard shadow.
- **Interactive:** form fields, button, two links.
- **Components:** StepsRow (paw connectors), EnquiryForm, PawStamp, PrevNextCard.

---

## C. Gone home

### C1. `gona-home-1.png`: listing (≈67%)

- **Layout (Obs):** H1 "Gone home" over two lines with an outlined heart icon (toffee) beside the second line; two-line intro; primary button; right: a ticket kiosk (striped awning toffee/white, cream "tickets home" sign) with the mascot standing on top; below a **4-column** ticket grid (container 403 to 1501), shown 4 rows.
- **Ticket (Obs):** 261 device ≈ 392 CSS wide × ≈115 device ≈ 172 CSS tall (CSS-confirmed 395×175); slight tilt ±1°; left circular avatar ≈ 70 device (108 CSS) with 3px outline; handwriting label "one ticket home" in toffee; name in Fraunces; "Breed, sex" in small Figtree; source line "TEDDYPUPS" or "DUBAI SHOWROOM" in small caps with a dotted arrow to "HOME ♥"; right vertical stub in honey with rotated "admit one", separated by a perforation (notched semicircles top and bottom).
- **Colour:** page milk; ticket fill `#fffdf8`/cream; stub honey; outlines cocoa.
- **Interactive:** each ticket links to its detail page.
- **Components:** TicketCard, TicketGrid, Kiosk (illustration).

### C2. `gone-home-2.png`: gone-home **detail** page, Leo (≈67%)

- Same structure as B4 with these differences (Obs): breadcrumb "Gone home / Leo", section tag "the day they went home", status pill **"GONE HOME ♥"** (outlined pill, handwriting, tilted ≈ -4°) instead of "Available"; button text "Ask about a puppy like this"; counter "1 / 4" with 4 thumbnails; page tint is lighter (≈ `#fefaf6`). Info values: Poodle, Boy, 3 months, "Imported for you".
- **Components:** same as B4 with a `gone` variant.

---

## D. Happy families

### D1. `happy-families-1.png` (≈67%)

- **Layout (Obs):** kicker "our wall of happy endings"; H1 "Happy families" with an outlined heart at its end; 3-line intro (≈460px device); count line "64 moments and counting" (handwriting); right: a taped lined-notebook note (≈300 device wide) with the quote and "Sarah M., Dubai, UAE"; wall: first row of 4 polaroids from y≈395.
- **UI:** note = ruled paper with blue tape strip at the top centre, slight tilt, soft shadow; polaroids with different tape colours (yellow, pink, blue).
- **Colour:** background peach gradient with faint vertical stripes (wallpaper).
- **Components:** PageHeader, NotebookNote, PolaroidWall.

### D2. `happy-families-2.png` (≈67%)

- Wall mid-scroll: 4 columns, polaroid frames ≈ 246 device (≈ 367 CSS) wide, columns ≈ 281 device apart (≈ 423 CSS), photos with a 4:4.6 ratio and a white caption strip (some have handwriting captions with emoji, some are blank), tilts ±2.5°, tape strips (pastel; a few polaroids have two corner tapes), uneven vertical offsets per column.
- **Colour:** background `#fef0d9`; paper `#fffefb`.

### D3. `happy-families-3.png` (≈67%)

- Last rows (a column ends earlier, so the wall bottom is ragged), then the mascot sitting at x≈775 to 860 with the handwritten sign-off "every one of them was a Teddy Pup once", then the dark wave. Background darkens toward the bottom (`#f8e3c2 → #f7e0bd`).

---

## E. How it works

### E1. `how-1.png`: **In Dubai** state (≈67%)

- **Layout (Obs):** H1 "How it works" left, intro paragraph in a right column (1057 to 1475); 4 outlined anchor pills below the H1 (2px outline, small numerals in toffee); "choose your way" kicker and H2 "Two ways home"; segmented toggle on the right (283×64 device = ≈ 424×96 CSS, pill with 3px outline, inner active segment filled toffee-deep with milk text "In Dubai / meet in person") and the mascot sitting beside it; content row: H3 "Meet your puppy in person" + paragraph (left) and a tilted illustration card (right, 1008 to 1503 × 410 to 700 device) with a skyline line drawing, a honey sun and a handwritten "Downtown Dubai" label; four step cards in a row (each 262 device ≈ 393 CSS wide, gap ≈ 26 CSS) with a 40px pastel disc icon, "Step n" label, title, text.
- **UI:** cards 3px outline, radius ≈ 18px, hard shadow, milk fill.
- **Interactive:** toggle (2 states), 4 anchor links.
- **Components:** AnchorPills, SegmentedToggle, IllustrationCard, StepCard.

### E2. `how-2.png`: **Imported** state (≈67%)

- Toggle active segment moves to "Imported / order upon request". H3 becomes "Order upon request"; paragraph about Europe, Korea and beyond; an extra handwritten toffee line "From Korean teacup poodles to rare Maltese, Pom, and Yorkie lines…". The illustration card becomes a pale blue sky (`#e6f1f9`) with an outlined plane flying along a dotted arc from "Europe · Korea" (bottom-left) to "Dubai" (bottom-right). Step cards change content (Reserve your puppy, Personalized consultation, Import and arrival, Welcome home) and icons (calendar-check, chat, plane, house-heart).
- **Unknown:** transition animation between states (not captured in stills).

### E3. `how-3.png`: promise and delivery (≈67%)

- **Promise card (Obs):** full-width tilted card (≈ -0.3°) with a scalloped pattern fill, 3px outline, kicker "puppy passport", two-line H2 "Our premium puppy promise", and **three** stamps (round "Hand-selected breeders", rectangular green dashed "Full transparency", oval "Safe, stress-free delivery") with captions, spaced unevenly.
- **Delivery (Obs):** H2 "Delivery & collection" (2 lines, large ampersand glyph), lede, 2×2 text blocks (Fraunces ≈ 16px-class titles, small body) in the left half; right: skyline line art (taupe) with a large plane (cream body, toffee wings, 3px outline) rotated over a dotted arc between Korea and Dubai dots.
- **Colour:** page honey gradient `#fbe6c2 → #f8d9a4`.

### E4. `how-4.png`: why choose us and CTA card (≈67%)

- **Layout (Obs):** H2 "Why choose us" + paragraph (left, 403 to 830); right: three items (International cargo, Support 24/7, Health guarantee) each with a toffee line icon at x≈970 to 1000 and a Fraunces title + small text; below a bordered CTA card (403 to 1503 × 325 to 590) with a dashed inner border, H3-level title "Unique and high quality puppies", paragraph, buttons "Ask us on WhatsApp" (green) and "See available puppies" (ghost), mascot lying down at the right; then the wave and footer.
- **Components:** FeatureList (icon rows), CTACard.

---

## F. FAQ

### F1. `faq-1.png` (≈67%)

- **Layout (Obs):** brown gradient page (`#a45b31 → #532e1a`), milk H1 on two lines ("Questions / & answers"), intro (2 lines); left sidebar 403 to 627 device (≈ 336 CSS = 21rem, CSS-confirmed max) with the handwritten "sniff out a question", a white pill search field with a magnifier icon and placeholder, "9 notes on the board", the mascot with an "!" bubble and a green "Ask your own question" button; right: the corkboard (672 to 1503 device ≈ 1247 CSS): a 3px cocoa outer frame, dark wooden border, cork fill `#c99a62` with a dot texture; 9 notes alternating offsets (x 822 to 1318 and 855 to 1345), each with a coloured pin (orange, blue, yellow, pink repeating), a chevron at the right and a folded corner at the bottom-right.
- **State (Obs):** note 1 is open (shows a dashed rule and the answer in small text); the folded corner disappears when open; notes tilt ±1° when closed and straighten when open.
- **Interactive:** search input, 9 accordion buttons, one WhatsApp button.
- **Components:** SearchField, Corkboard, Note (open/closed), Pin.

### F2. `faq-2.png` (≈67%)

- Lower board: "Which breeds do you usually have?" open (other notes closed, so one open at a time is likely), the board ends, the page darkens toward `#24130b`, a wave and the moon begin. Confirms the accordion shows only one answer at a time in these two screenshots (Est).

---

## G. Contact

### G1. `contact.png` (≈67%)

- **Layout (Obs):** H1 "Get in touch with us" on two lines (left); intro paragraph in the right column (1053 to 1495); two columns below: left stack (green button "WhatsApp +971 54 167 6733", "call us" label + underlined phone link, "email" label + underlined link, shop-front card 403 to 838 × 505 to 732), right letter form (877 to 1503 × 318 to 688) with the mascot sitting under its bottom-right corner; wave and footer below.
- **Shop-front card (Obs):** striped toffee/white awning across the top (≈ 20px tall), 3px outline, H3 "Visit us in Downtown Dubai", text, paw-pin address, outline button "Open in Google Maps", an arched photo of a puppy (≈120×155 device) at the right and a skyline outline behind.
- **Letter form (Obs):** ruled paper with a thin vertical margin line, "Dear TeddyPups," in handwriting (toffee), sentence with inline fields that have dotted underlines (name, phone, email "optional", area, a select "any puppy (not sure yet)" with a caret), a ruled textarea ("Anything else you'd like to tell us…"), "with love, a future puppy parent" handwriting, primary pill "Post my letter", and a taped paw stamp rotated at the top-right corner.
- **Colour:** page gradient `#fffdf8 → #fce9c5 → #f9e0ae`.
- **Interactive:** WhatsApp, tel, mailto, Maps link, 6 form controls, submit.
- **Components:** ContactStack, ShopfrontCard, LetterForm (inline fields), PawStamp.
- **Unknown:** validation and success visuals (not captured).

---

## H. Summary of what the 27 desktop images establish

| Topic | Result |
|---|---|
| Grids | Puppies 6 cols; tickets 4; step cards 4; polaroids 4; doors visible 4 to 5; stamps 2×2 (home) and 3 in a row (how it works) |
| Page containers | 1648 CSS px; sidebars and cards defined by columns above |
| Header | Home: transparent; inner pages: solid with scalloped edge |
| Footer | Identical on every page (night, 3 columns, basket mascot) |
| Mixed zoom | Counts, order and proportions are reliable; font sizes are not |
| Missing | Mobile, tablet, hover, focus, pressed, loading and error states |
