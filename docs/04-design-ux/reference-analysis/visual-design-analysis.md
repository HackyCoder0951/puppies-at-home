# Visual Design Analysis

| | |
|---|---|
| **Sources** | 27 screenshots, the 1920×1080 recording, and live computed styles measured at a **100% zoom, 1905×1080 viewport** (the "100% reference"). Hex values were sampled from pixels. |
| **Read with** | `screenshot-inventory.md` (confidence tags and the zoom warning) |
| **Tags** | **Obs** observed, **Est** estimated, **Unk** unknown, **CSS** read from stylesheet or live computed style (authoritative for values) |

Rule used throughout: CSS pixel values come from the live/CSS layer (tagged **CSS**). Screenshots supply composition, proportions, counts and colour. Where a number comes from a screenshot at 67% or 80% zoom it is converted (÷0.667 or ÷0.8) and tagged **Est**.

---

## 1. Global frame

| Attribute | Value | Tag |
|---|---|---|
| Page container | **1648 px**, centred (x=129 at a 1905px viewport; margins ≈128px) | CSS, confirmed in the 100% screenshot and video |
| Header bar | max **1760 px** (x=73 to 1833) with 56px inner padding, so content aligns to the 1648px container; height **76 px** | CSS |
| Header on home | Transparent over the hero; logo and WhatsApp pill align to the 1648px container | Obs |
| Header on inner pages | Solid milk `#fffdf8` with a **scalloped bottom edge** (≈12px scallops, dashed stitch visible), about 88px in total | Obs/Est |
| Side gutter | `clamp(1rem, 4vw, 3.5rem)` = 56px at wide sizes | CSS |
| Logo | 48×48 circle, x=129, y=14 | CSS |
| Main area background | Page-specific (see section 4); the footer is always night `#24130b` | Obs |
| Footer | 3 columns: brand blurb + basket mascot (left), Explore (≈ x 977), Say hello (≈ x 1401); thin rule and bottom row | CSS/Obs |
| Content text width limits | `ch`-based (hero H1 max 15ch, lede 46ch, section H2 13ch to 15ch) | CSS |

Proportion rule seen on every inner page: the container is used edge to edge for grids (tickets, puppies, polaroids, step cards) and text blocks are held to roughly the left 40 to 60% with an illustration or note on the right.

## 2. Typography hierarchy

All values are **CSS at 1905×1080, 100% zoom**. Fraunces = display, Figtree = body, Shantell Sans = handwriting.

| Role | Font | Size / line-height | Weight | Tracking | Colour | Where | Tag |
|---|---|---|---|---|---|---|---|
| Home H1 | Fraunces | **118.8 / 109.3 px** at 1905×1080 (≈84.5px observed at 1440×900, 1024×768 and in the video's shorter ≈955px-tall viewport; depends on viewport size) | 800 | -2.97px | cocoa `#2a170e` | Hero | CSS |
| Page H1 (Puppies, Gone home) | Fraunces | **156 / 143.5 px** (0.92) | 800 | -3.9px | cocoa | Inner page headers | CSS |
| Detail H1 (puppy name) | Fraunces | **73.6 / 67.7 px** | 800 | -1.84px | cocoa | Detail info card | CSS |
| Scene H2 | Fraunces | **100 / 92 px** | 800 | -2.5px | cocoa (light scenes), milk (dusk, night, home) | Meet, Two ways, Journey, Families, FAQ, CTA | CSS |
| Passport H2 | Fraunces | 62.4 / 57.4 px | 800 | -1.56px | cocoa | Home passport | CSS |
| Section H2 on inner pages | Fraunces | 64 / 58.9 px | 800 | -1.6px | cocoa | "Already gone home", "Coming home from abroad", "Ask about Max" | CSS |
| Signpost H3 | Fraunces | 37.6 / 37.6 px | 800 | -0.94px | cocoa | Signpost arrows | CSS |
| Journey step title | Fraunces | 36.8 / 38.6 px | 800 | -0.92px | cocoa | Journey | CSS |
| Card title (detail checklist) | Fraunces | 30.4 / 28 px | 800 | -0.76px | cocoa | "Every Teddy Pup comes" | CSS |
| Footer and form headings | Fraunces | not measured | 800 | | cream | "Home, at last." | Unk |
| Kicker (hero) | Shantell Sans | 23.2 / 37.1 px | 500 | normal | toffee-ink `#8e3f15` | "every puppy is family" with a hand-drawn underline | CSS |
| Kicker (other) | Shantell Sans | 18 / 28 px | 500 | normal | toffee-ink | "from Teddy's sketchbook", count line, labels | CSS |
| Footer column labels | Shantell Sans | 18 / 28 px | 500 | normal | honey `#f2be6b` | "Explore", "Say hello" | CSS |
| Lede | Figtree | 22 / 33 px (hero 20.48 / 30.7) | 400 | normal | cocoa-soft `#5a3a28` | Intros | CSS |
| Body | Figtree | 17 / 27.2 px | 400 | normal | cocoa-soft | Paragraphs | CSS |
| Button | Figtree | 17 / 18.7 px (header pill 15.2 / 16.7) | 650 | normal | milk or white | Buttons | CSS |
| Chip | Figtree | 15.2 / 24.3 px | 650 | normal | cocoa or milk | Filters | CSS |
| Nav link | Figtree | 16 / 25.6 px | 620 | normal | cocoa; active toffee-deep | Header | CSS |

Hierarchy pattern (Obs): one oversized Fraunces headline per section, a small handwriting kicker above or beside it, a medium Figtree lede, and small Figtree detail text. There is no mid-weight headline tier. Display type is always tightly tracked and set at line-height about 0.92.

**Why screenshot pixel sizes are not used for type:** fluid `vw`/`vh` sizing means each screenshot's CSS viewport differs (about 1900, 2375 and 2850 CSS px wide). Compare type only in captures made at the same viewport and 100% zoom (`visual-qa-checklist.md`).

## 3. Colour

### 3.1 Brand tokens (CSS) and sampled values (Obs)

| Role | Token / hex (CSS) | Pixel sample (Obs) | Notes |
|---|---|---|---|
| Page and card background | milk `#fffdf8` | `#fffdf8` at page margins and card fills | Header, ticket page, forms |
| Primary text and outlines | cocoa `#2a170e` | dark outline pixels | Borders and hard shadows use this |
| Body text | cocoa-soft `#5a3a28` | n/a | Also door 2 |
| Primary button, active nav | toffee-deep `#a24a1a` | `#a24a1a` button fill | Also door 1, toggle active |
| Kicker text | toffee-ink `#8e3f15` | | |
| Accent | toffee `#c2622b` | | Underline stroke, pins |
| Honey | `#f2be6b` | `#f2be6b` chat user bubble | Stars, ticket stub (≈ `#e2b164` at an edge sample) |
| Honey soft | `#fbe3b4` | | Chip hover, gone-home band |
| WhatsApp green | `#1f7a4d` | `#1f7a4d` | Only for WhatsApp actions |
| Door colours | `#a24a1a #5a3a28 #d4893f #b8644a #7a4a2e` | first four confirmed in pixels | Repeating order |
| Floor planks | | `#e4a963` | Meet the pups floor |
| Signpost wood | | arrow `#9c4531`, post `#c28039` | Two ways |
| Polaroid paper | `#fffefb` | `#fffefb` | |
| Cork board | | `#c99a62` | FAQ |
| Note paper | | `#fffbf2` | FAQ notes |
| Illustration sky (how it works) | | `#e6f1f9` (pale blue) | Imported route card, in addition to sky `#bfddf5` |
| Footer | night `#24130b` | `#24130b` | Solid |

### 3.2 Page backgrounds

| Page | Background (Obs) | Notes |
|---|---|---|
| Home | 8 scene gradients, morning to night (`#fffdf8 → #fff1d8 → #fbe3b4 → #f7d18d → #f0b866 → #a65a30 → #4d2b19 → #2f1a10 → #24130b`); sampled ends match | Confirmed by pixel samples at scene edges |
| Puppies | Milk with a faint dot grid | |
| Puppy detail | Vertical tint from milk at top to warm grey-beige (`≈ #e7dfd5` to `#f0ebe3`) below the header | Est (sampled at margins) |
| Gone home | Milk | |
| Happy families | Peach `≈ #fef0d9` to `#f7e0bd` darkening downward, with faint vertical wallpaper stripes | Obs |
| How it works | Milk to warm gradient (`#fffdf8 → #fbeacc → #f8d9a4`) then honey band, then wave into night | Obs |
| FAQ | Brown gradient `≈ #a45b31` top to `#532e1a` bottom, deeper to `#24130b` at the footer | Obs |
| Contact | Milk to honey (`#fffdf8 → #fce9c5 → #f9e0ae`) then wave to night | Obs |

### 3.3 Colour rules observed

1. No pure black or grey text: cocoa family only.
2. Every outlined object has a cocoa outline.
3. Green is used only for WhatsApp actions.
4. Light scenes use cocoa text; dusk, night and footer use milk text with honey accents and 80% milk for body copy.

## 4. Images and aspect ratios

| Item | Shape and ratio | Size | Tag |
|---|---|---|---|
| Hero photo arches | Arch (rounded top, flat bottom), cut by the quilt ground; heights vary (about 130 to 250px) | 7 arches across the container, one mascot among them | Obs |
| Door | Arch top, **4 : 5.2** frame; 256 × 333 px (door link 256 wide) | One per puppy | CSS |
| Puppy card photo (`/puppies`) | **Circle**, 1:1, inside a coloured ring and ink doodles; column width 206px; card 206×270 to 296 | 6 columns | CSS |
| Gone-home avatar (strip, tickets) | Circle, 108px on tickets | | CSS |
| Ticket | Landscape card 395×175 (≈2.26 : 1) including the stub | 4 per row | CSS |
| Detail gallery | Portrait frame, ≈ **5 : 6** (940 × ≈1125 CSS px at 100%); thumbnails ≈ 96px squares with a 3px outline | Est (from the 67% screenshot ÷0.667) |
| Polaroid | Paper frame, photo area **4 : 4.6** (portrait), plus caption strip; about 367px wide, columns about 423px apart | Est |
| Journey phone photos | 2×2 square grid + a 4:5 video tile | | Obs |
| Showroom window (two ways) | Tall rectangle `4 : 4.6` with an awning | | CSS |
| Photos overall | Mixed orientation; all cropped to the shape of the frame (`object-fit: cover`) | | Obs |
| Illustrations | Original SVG artwork (mascot, doors, signpost, plane, skyline, phone, passport, house, lamp, basket, moon) | **REPLACEMENT REQUIRED** for reuse | Obs |

Image issues seen: one hero arch and several gone-home avatars render blurred or blank until loaded (blur-up placeholders); third-party family photos cannot be reused.

## 5. Components: appearance summary

| Component | Observed appearance | Tag |
|---|---|---|
| Primary button | Pill, 52px tall, toffee-deep fill, milk text 17px/650, hard cocoa base shadow (`0 8px 0 -2.4px`), no border | CSS |
| Ghost button | Pill, transparent, 2px cocoa border | CSS |
| WhatsApp button | Same as primary in `#1f7a4d`; header version 136×44 | CSS |
| Chip (filters) | Pill 45 to 49px tall, padding 7.2×16px, 2px cocoa outline, small hard shadow; selected = cocoa fill with milk text; hover = honey-soft fill | CSS/Obs |
| Card (info, form, step) | Milk fill, 3px cocoa outline, radius ≈ 20 to 24px, hard offset shadow, small tilt on some | Obs/Est |
| Ticket | Notched perforated edge, 3px outline, cream body, honey vertical stub "admit one" | Obs |
| Polaroid | `#fffefb` paper, thin shadow, tape strip, slight rotation | Obs |
| FAQ note | Paper `#fffbf2`, 3px outline, coloured pin, folded corner, ±1° tilt and horizontal offset | Obs |
| Icon | Line icons in toffee (heart-pulse, plane, chat, house, calendar, magnifier, check) in 40px pastel discs on step cards; stamps use ink-coloured line icons | Obs |
| Mascot | Cream-gold poodle with red collar, several poses | Obs |
| Divider | Scallop (header, hero ground), wave (before footer), plank floor | Obs |

## 6. Spacing

| Pattern | Value | Tag |
|---|---|---|
| Puppies grid | 6 columns, **column gap 40px, row gap 52px**, grid width 1648 | CSS |
| Ticket grid | 4 columns, items 395 wide, grid width 1648, gap ≈ 22 to 27px | CSS/Est |
| Step cards (how it works) | 4 columns of ≈393px, gap ≈ 26px | Est |
| Detail layout | Gallery ≈ 940px and info card ≈ 654px with ≈ 55px between | Est |
| FAQ layout | Sidebar ≈ 336px (`21rem`), board ≈ 1247px, gap ≈ 65px | Est |
| Polaroid wall | 4 columns, pitch ≈ 423px | Est |
| Scene vertical padding | Top 53 to 85px, bottom 0 to 69px (illustrated scenes) | CSS |
| Header-to-content | H1 starts about 90 to 140px below the header on inner pages | Obs |
| Scene heights at 1905×1080 | hero 1004, meet 1080 (+pinned scroll), paths 1167, chat 1888, passport 953, dusk 1717, night 686, home 1150 | CSS |

## 7. Borders, radius, shadows

| Item | Value | Tag |
|---|---|---|
| Outline weight | 3px cocoa on cards, frames, doors, ticket; 2px on ghost buttons and chips | CSS |
| Radius | Pills 999px; cards ≈ 1.25 to 1.5rem; arches `999px 999px 0 0`; polaroid ≈ 0.2rem; phone 2.7rem | CSS |
| Shadows | Hard offset, no blur, cocoa-tinted (button base, card `8 to 12px` offset at 18 to 25%); soft lifted shadow only on polaroid hover | CSS |
| Texture | Quilt lines (cocoa 7%), dashed stitch, plank lines, paper dot grid, wallpaper stripes, tape sheen | CSS/Obs |

## 8. Alignment

- Headlines are left-aligned on inner pages and centred in the hero, "Two ways", FAQ title on home (centred in some scenes).
- Cards and grids align to the container edges; illustrations sit to the right of text blocks.
- Text and illustrations are vertically bottom-aligned in several scenes (mascot on the floor line).
- Mixed vertical rhythm on purpose: puppy cards are staggered (52px row gap with per-card offsets of about ±20px), polaroids and notes are tilted and offset.

## 9. Unknowns (do not invent)

| Item | Why unknown |
|---|---|
| Exact hex of every illustration fill | Not sampled; use eyedropper on the artwork when drawing replacements |
| Footer heading and form heading sizes | Not measured in this pass |
| Detail page exact CSS sizes (gallery, info card, thumbs) | Page was behind the curtain during the live measurement; derive from `visual-qa-checklist.md` capture at 100% |
| Hero arch cut-off width | Between 1024 and 1440 |
| Exact blur values for placeholders | Not visible |
| Shadow colours on dark scenes | Not isolated |
