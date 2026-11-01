# Responsive Analysis (measured live, 375 / 768 / 1024 / 1100+ px)

Method: the live site was resized in a browser pane and measured with scripts (computed grid columns, visibility of header parts, document height, horizontal overflow, pinned-scroll flag), plus screenshots at each width. Evidence tags: **[L]** measured, **[S]** seen in a screenshot, **[CSS]** from the stylesheet, **[I]** inferred.

Limits of this pass:
- Tablet 768 is the only tablet width fully covered. 640 and 900 were probed only for the layout switches in section 2.
- Pages were captured after the loading curtain finished. Content is **hidden until revealed on scroll**, so instant jumps with a script show blank areas for about a second. This is a property of the reference, not a capture error, and the clone should copy it.
- Mobile measurements are 375px wide. 320, 390 and 430px were not tested.

---

## 1. No horizontal overflow at any tested width

| Width | `scrollWidth - innerWidth` | Result |
|---|---|---|
| 375 | 0 | no overflow |
| 768 (753 usable with scrollbar) | -15 | no overflow |
| 1024 | -15 | no overflow |
| 1100 to 1680 | none seen | |

## 2. Layout switch points (measured)

| Behaviour | Switches at | Evidence |
|---|---|---|
| Header: inline nav replaces the Menu button | **≥ 1024px** (false at 1000, true at 1024) | [L] |
| Header: "WhatsApp us" pill in the bar | Absent at 375, present at 768. Switch is between them, most likely **640px** | [L][CSS: `min-width:40rem`] |
| Mobile bottom bar (WhatsApp + Call) | Present at 375, **absent at 768**. Switch is below 768, most likely **767px** (`max-width:767px` exists in CSS) | [L][S][CSS] |
| Passport book 1 column → 2 columns | **≥ 900px** (1 col at 800, 2 col at 900) | [L][CSS: `min-width:900px`] |
| Journey, Two ways, Dusk, Night: 1 → 2 columns | **≥ 1024px** (1 col at 1000, 2 col at 1024 and 1100) | [L] |
| "Meet the pups": grid → pinned horizontal scroll | **≥ 1024px**, set when the page loads (needs a reload after resizing) | [L][JS] |
| Journey phone becomes sticky | **≥ 1024px** | [L: `position:sticky` at 1024] |
| H1 size | 41.6px at 375 → about 49.6px (puppies page) → 69 to 71px at 768 → 84.5px at 1024 and up | [L] |
| Hero arched-photo lineup | See hero row below | [S] |

Everything else follows the clamp()-based fluid sizing in `04-ui-ux-animation-effects-color-layout.md`.

## 3. Home page, scene by scene

| Scene | Mobile 375 | Tablet 768 | Desktop 1024 to 1680 |
|---|---|---|---|
| Header | Logo + wordmark left, "Menu" pill right. No WhatsApp pill. | Logo left; WhatsApp pill and Menu pill right | Logo, 6 inline links, WhatsApp pill |
| Hero | Total 748 tall. Centered H1 (41.6px), lede, **two stacked full-width buttons**, then the mascot alone peeking over the quilt ground with a "peekaboo!" bubble. **No photo arches.** | 948 tall. H1 about 69px, buttons side by side, mascot alone, **no photo arches** | 692 tall at 1024 (arches not visible at 1024x768 in the capture), 824 at 1440 with **8 arched photos** around the mascot. The arch lineup appears only at wide viewports [S] |
| Meet the pups | **2-column grid of doors, 3036 tall.** Doors are already ajar showing the photo (not closed). Names are above, detail text centred. | **3-column grid**, 2678 tall. Doors ajar. Mascot appears over a card as a floating overlay | **Pinned horizontal scroller** with the walking mascot, 768 to 900 tall plus scroll length |
| Two ways | Stacked: title, a single signpost arrow ("Puppies in Dubai"), showroom skyline card, text, button; then a second arrow ("Imported for you"), plane route, text, button. **The signpost post is dropped**, each way carries its own arrow. 1281 tall | Same stacking, wider illustrations, 1513 tall | Two columns with the centred signpost post, 942 tall |
| Journey | Heading, then 3 steps stacked (all visible, step 3 highlighted), then the phone below at full width with all chat bubbles shown; mascot overlaps the last step. 1516 tall | Same as mobile with the phone centred below steps | 2-col: steps left, phone **sticky** right; step highlight and chat content change with scroll |
| Passport | Single column, the stamps stacked one per row, mascot overlapping. 1257 tall | Single column: title top, stamps in a 3-column row (+1 below) with the mascot beside the title. 1087 tall | 2-col book (title page + 2x2 stamps), 797 tall at 1024 |
| Dusk (families) | Header text stacked, speech-bubble note, polaroids in a **single column** (very tall, 1707) with the sunset illustration behind | Note beneath text, polaroids in **3 columns** (1384 tall) | 2-col header, 4-column wall inside the house facade |
| Night (FAQ) | Single column; always-open Q&A with large Fraunces questions; mascot with "?" under the button | Single column, smaller type | 2-col (5fr / 7fr) |
| CTA house | Stacked, house scales down | Stacked | Centred house with plants |
| Footer | Stacked | Stacked | 3 columns |
| Total page height | 12,834 | 12,031 | 8,158 (1024), 9,450 (1440) |

## 4. Inner pages

| Page | Mobile 375 | Tablet 768 | Desktop |
|---|---|---|---|
| Puppies | Total 5,640. H1 49.6px, intro text left with the **self-portrait circle at right** (it does not drop below), filter pad full width with chips wrapping to several lines, **2-column** puppy grid, gone-home strip 2 columns | Total 5,671. H1 70.8px, filter pad full width with each filter row on **one line**, 2-column puppy grid (cards larger, ring frames and doodles visible), gone-home strip **3 columns** | 4 to 5 columns (see 1900px screenshots) |
| Puppy detail | Total 2,017. Section tag "1 hello, it's me", gallery full width (stacked paper effect), circular prev/next buttons inside the photo, thumbnails below, then info card, checklist card, steps list **vertical with paw-print connectors** (1 column), then form, then prev/next | Total 1,607. Gallery full width with buttons; remaining blocks likely 1 column | 2-column: gallery + tilted info card; 4-column steps |
| Gone home | Total 7,253. One ticket per row, tickets about 340px wide, stub stays on the right edge ("admit one"); kiosk illustration with the mascot floats right of the intro | Wider tickets, likely 2 per row [I] | 3 per row |
| Happy families | Total 32,335 (very tall). H1 + note full width; first polaroid is **full width**; CSS says `columns: 2` at this size so I cannot confirm 1 or 2 columns from one screenshot | Total 8,558 (CSS: 3 columns) | 4 columns |
| How it works | Total 7,978. Anchor pills **wrap to 3 rows**; toggle (In Dubai / Imported) full width; illustration card; step cards stacked 1 column | Total 5,733. Intro text moves **right of the H1** (2-col header); "choose your way" and H2 stacked in a narrow left column with the toggle at right and the mascot; step cards likely 2 columns | H1 left, intro right; 4 step cards in a row |
| FAQ | Total 3,088. H1, intro, search (full width), counter, mascot + "?" bubble **side by side**, green button, then the corkboard full width with notes | Total 2,294. H1 on one line, search field wide, mascot at right, board full width; notes 1 column. `.tp-notes` is 1 column (692px) | 2-col: sticky left sidebar (search, mascot) + board |
| Contact | Total 3,580. **Order: H1, intro, the letter form, WhatsApp button, call/email, then the "Visit us" card.** The form fields wrap inside sentences. | Total 2,521 | Left: WhatsApp, call, email, visit card; right: letter form (2-col) |

## 5. Motion differences by device [L][JS][CSS]

| Feature | Mobile | Tablet | Desktop |
|---|---|---|---|
| Pinned horizontal scroll | Off (grid) | Off (grid) | **On** at ≥1024 (and motion allowed) |
| Door opening | Static "ajar" with photo showing | Static "ajar" | Driven by the walker (pinned mode) |
| Sticky journey phone | Off | Off | On |
| Roaming mascot overlay | **Present** as a fixed mascot with a "peekaboo!" bubble that sits above the bottom bar and follows scroll | Present (seen over doors) | Present, positioned per section |
| Custom paw cursor | N/A (touch) | N/A | Fine pointer + hover only |
| Hover effects | None (guarded by `hover:hover`) | None | Yes |
| Page curtain | Yes (as measured on mobile load) | Yes | Yes |
| Scroll-reveal | Yes | Yes | Yes |

The roaming mascot on small screens is easy to miss and affects layout: it can overlap text (seen over the Journey step 3 and the Happy-families paragraph).

## 6. Mobile-specific UI elements [S]

- **Bottom bar:** full-width, white with a top border, left "WhatsApp us" (green, flex-grow, 2.75rem+ high), right "Call" (ghost). It reserves space above the footer and is always visible. Not present at 768.
- **Menu overlay:** full-screen honey panel, handwriting title "where to, friend?", Close button, links in 40px Fraunces (active in toffee), green WhatsApp button and phone number at the bottom.
- **Tap targets:** buttons are at least 52px tall (3.25rem), chips 44px (2.75rem), nav pill 40px. Compliant with the usual 44px guidance.
- **Self-portrait** stays at the right of the intro on the puppies page at 375px.
- **Gallery buttons** move inside the photo as 44px circles on mobile.
- **Filter chips** wrap, and the panel grows in height; there is no collapse or "filters" button on mobile.

## 7. Differences from the desktop-only captures

1. The **hero photo arches only exist on wide screens**. On mobile and tablet the hero shows just the mascot.
2. The home page is about **50% taller** on mobile (12.8k vs 8.2 to 9.5k px).
3. The signpost is **split in two** on small screens.
4. Meet-the-pups doors are **open by default** (photo visible) when not pinned, so mobile users see every puppy without any scroll trick.
5. The Journey phone shows the **full conversation at once** on small screens.
6. On contact, the **form comes before the contact details** on mobile.
7. On puppies, filter rows sit in **one line each at 768** but wrap on 375.

## 8. Requirements this adds

| ID | Requirement | Priority |
|---|---|---|
| RESP-01 | Inline nav at ≥1024px, menu overlay below. | P0 |
| RESP-02 | Bottom bar (WhatsApp + Call) at <768px; WhatsApp pill in header at ≥640px. | P0 |
| RESP-03 | Passport book becomes 2 columns at ≥900px. | P0 |
| RESP-04 | Two-column scenes (Two ways, Journey, Dusk, Night) at ≥1024px; single column below. | P0 |
| RESP-05 | Meet-the-pups: grid of ajar doors below 1024px (2 columns at 375, 3 at 768); pinned scroller at ≥1024px with reduced-motion fallback to the grid. | P0 |
| RESP-06 | Hero photo arches shown only at wide widths (verify the exact cut-off, between 1024 and 1440). | P1 |
| RESP-07 | Signpost split into two arrows below 1024px. | P1 |
| RESP-08 | Journey phone sticky only at ≥1024px. | P1 |
| RESP-09 | Contact page order on mobile: form, then contact details, then visit card. | P0 |
| RESP-10 | Puppy grid columns: 2 at 375 and 768; wider at desktop (find the exact count at 1024, 1280 and 1440). | P0 |
| RESP-11 | Zero horizontal overflow from 320 to 1920px. | P0 |
| RESP-12 | Mobile roaming mascot must not block taps or cover primary text for long. | P1 |

## 9. Still unmeasured

- 320, 390, 430, 640, 900 and 1280px for the inner pages.
- Exact puppy-grid column counts at ≥1024px (derive from `repeat(auto-fill, minmax(min(14.5rem, 40vw), 1fr))`, so about 4 columns at 1024 and 5 at 1440 inside the content width, but not measured).
- The exact width where the hero arches appear.
- Gone-home ticket columns at 768 and 1024.
- Happy-families column count at 375 (1 or 2).
- Detail-page two-column switch point (likely 768 or 1024).
- How the FAQ sidebar becomes sticky (likely 1024).
