# Mobile Analysis (Desktop to Mobile)

| | |
|---|---|
| **Protocol** | `docs/08-process/prompts/01-master-reference-analysis-prompt.md`, "Responsive comparison" |
| **Important limit** | **The owner supplied no mobile or tablet screenshots, and the recording is desktop only.** The prompt's source of truth for responsive presentation is screenshots, and they do not exist for mobile. |
| **Evidence used instead** | My own live captures of the reference at **375×812** and **768×1024** (`docs/05-research/05-responsive-analysis.md` and this session's 375 screenshots), computed layout measurements, and the stylesheet's media queries. This is **secondary evidence**, not the visual source of truth. |
| **Tags** | **Obs-S** observed in my own live screenshot or measurement (secondary), **CSS** from stylesheet or computed style, **Est** estimated, **Unk** unknown |

**Decision needed (also in `visual-qa-checklist.md`):** before building the mobile layouts, capture the reference at 375×812 (and ideally 390, 430, 768×1024) at **100% zoom** and place the files in `docs/05-research/evidence/pages-mobile/`. Until then, treat every statement below as provisional.

---

## 1. Transformation summary (Desktop → Mobile)

Format from the protocol. Desktop values are from `desktop-analysis.md` (100% reference); mobile values are 375px unless a column says 768.

```text
Header:
  Desktop (≥1024): transparent on home, solid with scalloped edge on inner pages; logo 48px + wordmark left,
                   6 inline links centred, green "WhatsApp us" pill right; 76px tall.            [CSS/Obs]
  Tablet 768:      logo + wordmark left; "WhatsApp us" pill AND "Menu" pill on the right.          [Obs-S]
  Mobile 375:      logo + wordmark left; only a "Menu" pill (paw icon, 2px outline) on the right;
                   no WhatsApp pill. Inner pages keep the scalloped solid edge.                    [Obs-S]

Navigation:
  Desktop: inline links, active link in toffee-deep with a small paw glyph under it.              [Obs]
  Mobile:  "Menu" opens a full-screen honey (#f2be6b-toned) overlay that reveals as a circle growing
           from the Menu button; heading "where to, friend?" (handwriting) at top-left, a Close pill
           (cocoa fill, milk text) at top-right; six links in large Fraunces (about 40px), active
           link in toffee; a green full-width "WhatsApp us" button and the phone number at the bottom. [Obs-S/CSS]
           The menu is a native dialog; links stagger in (rise and rotate slightly).               [CSS]

Hero (home):
  Desktop: centred stack, H1 118.8px at 1905×1080 (≈84px in shorter windows), buttons side by side,
           7 arched photos around the centre mascot on a scalloped quilt ground.                  [CSS/Obs]
  Mobile:  748px tall; H1 41.6px, centred; lede centred; two buttons STACKED and full width;
           the photo arches are NOT shown, only the mascot peeking over the quilt with a
           "peekaboo!" bubble. At 768 the buttons are side by side and the H1 is about 69px.        [Obs-S]

Grid (puppy lists):
  Desktop: puppies 6 columns (gap 40/52px); tickets 4 columns; polaroids 4 columns; step cards 4.  [CSS/Obs]
  Mobile:  puppies 2 columns; gone-home strip 2 columns; tickets 1 per row; step cards 1 column;
           polaroid wall CSS `columns: 2` (first polaroid seen full width, count unconfirmed);
           home "Meet the pups" = grid of doors, 2 columns, 3036px tall.                            [Obs-S/CSS]
  Tablet 768: puppies 2 columns (larger cards); gone-home strip 3; doors 3 columns; polaroids 3 columns
           (CSS).                                                                                   [Obs-S]

Typography:
  Desktop: H1 118.8 / 156px, scene H2 100px, body 17px.                                            [CSS]
  Mobile:  H1 41.6px (home), 49.6px (puppies page), 41.6px (detail); body 17px (unchanged);
           same three families and tight tracking. Large display type scales with viewport.       [Obs-S]

Images:
  Desktop: hero arches, 6-column circular puppy photos, doors with photos revealed by scroll.      [Obs]
  Mobile:  arches removed; puppy photos remain circular, 2 per row; doors are static and already
           ajar so the photo is visible without any scroll interaction; detail gallery is full
           width with the arrow buttons INSIDE the photo and thumbnails below.                     [Obs-S]

CTA:
  Desktop: header WhatsApp pill; section buttons; no persistent bar.                                [Obs]
  Mobile (<768): fixed bottom bar with "WhatsApp us" (green, expands) and "Call" (ghost); it stays
           above content on every page; buttons inside sections stack full width. Not present
           at 768.                                                                                  [Obs-S]

Footer:
  Desktop: 3 columns (blurb + basket mascot | Explore | Say hello), moon and stars, bottom rule.  [Obs]
  Mobile:  stacked columns (expected); details at 375 not individually inspected.                  [Est/Unk]
```

## 2. Page-by-page mobile composition (375 unless noted)

All Obs-S unless tagged otherwise.

| Page / section | Mobile composition |
|---|---|
| **Home: Two ways** | Single column. Each way gets its own arrow sign ("Puppies in Dubai", then "Imported for you"): showroom card, text, button, then the plane scene, text, button. The shared signpost post is not shown. 1281px tall (1513 at 768). |
| **Home: Journey** | Heading, lede, three steps all visible (step 3 highlighted), then the phone below at full width showing the entire conversation; the mascot overlaps the last step. 1516px tall. Phone not sticky. |
| **Home: Passport** | Single column; title page then stamps stacked one per row (each with its caption); at 768 the stamps sit in a 3-column row. 1257px tall. |
| **Home: Families** | Heading text, testimonial bubble, polaroids in a single column (very tall, 1707px); sunset skyline behind; at 768 three columns. |
| **Home: FAQ** | Single column, Q and A always visible, large Fraunces questions; mascot under the "Read all questions" button. |
| **Home: CTA house + footer** | Stacked; house scales down. |
| **Puppies** | H1 49.6px (wraps to two lines), intro text left with the self-portrait circle still at its right, filter pad full width with chips wrapping (at 768 each row fits on one line), 2-column grid, gone-home strip, footer. |
| **Puppy detail** | Single column: breadcrumb, gallery (stacked-paper frame, counter, round arrows inside photo, thumbnails below), info card, checklist card, steps list vertical with paw-print connectors (instead of horizontal), form, previous/next cards. Page height 2017px (1607 at 768). |
| **Gone home** | H1 + intro + button, kiosk illustration right of the intro, then tickets one per row (≈340px wide, stub still at the right edge). |
| **Happy families** | H1, intro, testimonial note full width, then the wall (page 32,335px tall at 375, 8,558px at 768). |
| **How it works** | H1, intro, anchor pills wrapped on three lines, toggle full width with both labels, illustration card, step cards stacked. |
| **FAQ** | H1, intro, full-width search, counter, mascot and "?" bubble beside it, green button, then the full-width board with notes. |
| **Contact** | Order changes: H1, intro, **letter form first**, then WhatsApp button, call and email, then the "Visit us" card. |

## 3. Behaviour that changes on small screens

| Behaviour | Desktop | Mobile and tablet | Tag |
|---|---|---|---|
| Meet the pups | Pinned horizontal scroll, walking mascot, doors open when reached | No pinning; static grid of ajar doors | CSS/Obs-S |
| Journey phone | Sticky; content changes per active step | Static, all messages shown | Obs-S |
| Hover effects | Tilts, lifts, door opening | None (guarded by `hover:hover`) | CSS |
| Custom paw cursor | Fine pointer only | Not applicable | CSS |
| Roaming mascot | Section mascots | A fixed mascot with a "peekaboo!" bubble follows scroll and can overlap text | Obs-S |
| Page curtain | Runs on route change | Runs on route change | Obs |

## 4. Gaps the owner needs to close

| Needed capture | Why |
|---|---|
| 375×812 full-page screenshots of all 8 routes at 100% | The visual source of truth for the mobile layout and spacing |
| 390×844 and 430×932 for the home page | Check the 2-column grids and bottom bar at wider phones |
| 768×1024 for home, puppies, detail, how it works | The only tablet width seen; 1024 and 1100 transitions are known from CSS |
| Open menu overlay at 375 | Confirm colour, type size and spacing |
| Footer at 375 | Not inspected |
| 320×568 for the worst-case wrapping | Not measured |

Until these exist, implementation decisions for mobile should follow `docs/05-research/05-responsive-analysis.md` and the values here, and each decision should be flagged **provisional** in the visual QA record.
