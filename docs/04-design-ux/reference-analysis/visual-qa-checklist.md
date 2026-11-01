# Visual QA Checklist

| | |
|---|---|
| **Protocol** | `docs/08-process/prompts/01-master-reference-analysis-prompt.md`, "Screenshot comparison requirement" |
| **Use during implementation** | For every major page: reference screenshot → implementation → screenshot of implementation → side-by-side comparison → differences → fix → repeat |
| **Priority order** | 1 Overall layout, 2 section structure, 3 typography hierarchy, 4 spacing, 5 images, 6 component dimensions, 7 colours, 8 buttons, 9 responsive behaviour, 10 micro-interactions. Do not polish animation while a higher item still differs. |

## 1. Why a capture protocol is needed

The owner's screenshots were taken at **mixed browser zoom levels** (100%, ≈80%, ≈67%) and the viewport widths differ, and fluid type depends on viewport width. A side-by-side of an implementation capture against those images would show false differences in size. So compare in two ways:

1. **Composition comparison** (works with the existing screenshots): section order, columns, proportions, alignment, colours, shapes, counts, wording. Use the owner's images as they are.
2. **Pixel and size comparison** (needs new reference captures at 100%): capture the reference again with the protocol in section 2, then compare against the implementation captured the same way.

## 2. Capture protocol (do this for both reference and implementation)

| Setting | Value |
|---|---|
| Browser | Same browser, same version, same profile (no extensions altering layout) |
| Zoom | **100%** (reset with Ctrl+0); verify the logo is **48px** tall at desktop sizes |
| Viewports | **1920×1080** (primary), 1440×900, 1024×768, 768×1024, 375×812 (plus 390, 430, 320 for mobile) |
| Scrollbar | Same (record whether overlay or classic) |
| Wait | Until the curtain has finished (≈1 s on first load) and reveal animations have settled (≈2 s) |
| Motion | For stills, use the same state in both: either all animations on after settling, or `prefers-reduced-motion` on in both |
| Scroll positions | Scroll to the top of each section (use the section ids or fixed pixel offsets) and capture; use the same offsets in both |
| Full-page captures | Use the browser's full-page capture for static pages; for the pinned scroller capture the start, middle and end states |
| File naming | `qa/<page>/<viewport>/ref-<n>.png` and `qa/<page>/<viewport>/clone-<n>.png` |
| Source of reference | Live reference site first; owner screenshots as backup |
| Mobile | **Owner-supplied mobile screenshots do not exist yet** (`mobile-analysis.md`). Capture the reference at the mobile viewports above before implementing mobile layouts. |

## 3. Tolerances

| Aspect | Tolerance | Method |
|---|---|---|
| Section order and content structure | exact | visual |
| Number of columns and items per row | exact | visual |
| Container width | exact (1648px at ≥1730px viewports) | devtools |
| Section heights (home scenes) | ±24px at 1920×1080 against the CSS values in `visual-design-analysis.md` §6 | devtools |
| Font family, weight | exact | computed style |
| Font size and line-height (CSS) | exact for fixed values; ±1px for fluid values at the same viewport | computed style |
| Colours | exact hex for brand tokens; ±3 per channel for sampled pixels | eyedropper |
| Spacing between items (grids) | ±4px | devtools |
| Component dimensions (cards, tickets, buttons, chips) | ±6px | devtools |
| Image shape and crop | same shape and aspect, same focal area (replacement assets accepted) | visual |
| Animation duration | ±15% of the measured value | video |

Differences caused only by replacement photos or artwork are recorded as "asset difference" and are not failures.

## 4. Per-capture comparison procedure

1. Capture the reference and the clone with the same viewport and scroll position.
2. Put them side by side (or overlay with 50% opacity or a difference blend).
3. Record every difference in the defect log (section 8) with the aspect, the size of the gap and a screenshot reference.
4. Fix in priority order (section 0 list). Re-capture and repeat until no open item in the top six priorities remains.
5. Save the final pair and mark the page row in section 6.

## 5. Master checklist (apply to every page)

Tick per page and viewport.

### Overall composition

- [ ] Section order matches the reference.
- [ ] Page background colour or gradient matches (see `visual-design-analysis.md` §3.2).
- [ ] Container is 1648px wide and centred; no horizontal overflow (check 320 to 1920).
- [ ] Mixed-density rhythm preserved (staggered cards, tilted items).
- [ ] Footer is the same on every page.

### Header

- [ ] Height 76px (CSS), logo 48px, wordmark Fraunces.
- [ ] Home: transparent over the hero; inner pages: solid milk with scalloped bottom edge.
- [ ] Six links in order (Home, Puppies, Happy families, How it works, FAQ, Visit & contact); active link toffee with a paw glyph.
- [ ] WhatsApp pill 136×44 with hard base shadow; hidden below the pill breakpoint; "Menu" pill below 1024.
- [ ] Inline nav at ≥1024; overlay menu below; bottom bar below 768 (secondary evidence).

### Hero (home) and page headers (inner)

- [ ] Home hero: kicker with wavy underline, H1 two lines (max 15ch), lede, two buttons, arched photos only at wide widths, mascot, quilt ground.
- [ ] Inner headers: kicker + H1 + intro on the left, themed art on the right (self-portrait, kiosk, notebook note, paragraph, mascot).
- [ ] H1 sizes: puppies and gone-home 156px; home 118.8px at 1905×1080 (viewport dependent); detail name 73.6px.

### Typography

- [ ] Three families only: Fraunces 800 (display), Figtree (UI, body), Shantell Sans (handwriting).
- [ ] Scene H2 100px, passport H2 62.4px, inner H2 64px, signpost H3 37.6px; display tracking tight (-0.025em) and line-height ≈0.92.
- [ ] Body 17px; lede 22px; button 17px/650; chip 15.2px/650; nav 16px/620.
- [ ] Colours of text: cocoa headings, `#5a3a28` body, `#8e3f15` kickers, milk on dark scenes, honey labels in the footer.

### Images

- [ ] Arches, circles, polaroids, tickets, doors and gallery frames use the right shapes and aspect ratios (`visual-design-analysis.md` §4).
- [ ] Cropping keeps the subject (object-fit cover); blur-up placeholders present.
- [ ] Alt text and dimensions set (no layout shift).

### Cards

- [ ] Cards, tickets, polaroids, notes: 3px cocoa outline, correct radius, hard offset shadow, correct tilt direction.
- [ ] Grids: puppies 6 columns (gap 40/52), tickets 4, step cards 4, polaroids 4, doors visible 4 to 5.
- [ ] Ticket 395×175 with honey stub and perforation; step card with 40px pastel icon disc.

### Buttons

- [ ] Primary: toffee-deep `#a24a1a`, 52px, pill, base shadow `0 8px 0 -2.4px`; ghost: 2px outline; WhatsApp: `#1f7a4d` and only for WhatsApp.
- [ ] Hover (lift, rotate), press (scale .96), focus ring (3px toffee-deep, 3px offset).
- [ ] Chip: selected cocoa fill; hover honey-soft.

### Section spacing

- [ ] Scene heights and paddings (hero 1004, meet 1080, paths 1167, chat 1888, passport 953, dusk 1717, night 686, home 1150 at 1905×1080).
- [ ] Scene gradients join without a visible seam.
- [ ] Space between header and H1 on inner pages ≈ 90 to 140px.

### Footer

- [ ] Night `#24130b`, 3 columns, basket mascot, moon, stars, bottom rule, handwriting tagline.
- [ ] Links, contact details and socials come from site settings.

### Mobile layout (provisional)

- [ ] Hero stacks the buttons and drops the arches.
- [ ] Doors become a 2-column grid of ajar doors (3 at 768).
- [ ] Two ways splits the signpost into two arrows; journey shows the whole chat; stamps stack.
- [ ] Puppies grid 2 columns; tickets 1 per row; step cards stack; polaroid wall columns per CSS.
- [ ] Bottom bar (WhatsApp + Call) below 768; contact page order: form first.
- [ ] No horizontal overflow at 320, 375, 390, 430, 768.

## 6. Page-by-page record

Replace the status cells with Pass, Fail (with defect IDs) or N/A. Source screenshot keys refer to `desktop-analysis.md`.

| Page | Section | Reference source | Desktop 1920 | 1440 | 1024 | 768 | 375 | Defects |
|---|---|---|---|---|---|---|---|---|
| Home | Header and hero | A1, video 0:00 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | Meet the pups (pinned and grid) | A2, video 0:15 to 0:35 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | Two ways | A3 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | Journey (3 states) | A4 to A6 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | Passport and sunset | A7 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | Happy families | A8 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | FAQ + CTA house | A9 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Home | Footer | A10 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Puppies | Header + filters | B1 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Puppies | Grid + gone-home strip | B2, B3 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Puppy detail | Top (gallery, info, checklist) | B4 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Puppy detail | Steps, form, prev/next | B5 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Gone home | Listing | C1 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Gone home | Detail variant | C2 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Happy families | Header + wall + lightbox | D1 to D3, video 3:50 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| How it works | In Dubai state | E1 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| How it works | Imported state | E2 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| How it works | Promise, delivery | E3 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| How it works | Why choose us + CTA card | E4 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| FAQ | Header + board (open/closed) | F1, F2 | ☐ | ☐ | ☐ | ☐ | ☐ | |
| Contact | Header, shopfront, letter form | G1 | ☐ | ☐ | ☐ | ☐ | ☐ | |

## 7. Interaction visual checks (after layout passes)

| Check | Reference | Result |
|---|---|---|
| Curtain ≈0.8 s: cover, runner, lift, no layout jump | `interaction-analysis.md` §3 | ☐ |
| Door opening, photo reveal, "Meet them all" end door | video 0:15 to 0:35 | ☐ |
| Journey states 1 to 3 | A4 to A6 | ☐ |
| Filter chip states, count line, "Clear filters" | video 1:50 | ☐ |
| Gallery counter, arrows, thumbnails, video | B4, C2 | ☐ |
| Lightbox layout | video 3:50 | ☐ |
| Toggle swaps content | E1, E2 | ☐ |
| FAQ single-open notes and corner behaviour | F1, F2 | ☐ |
| Text selection colour honey with dark text | video 1:15 | ☐ |
| Button hover and press | CSS | ☐ |

## 8. Defect log (template)

| ID | Page / section / viewport | Aspect (priority 1 to 10) | Reference vs clone | Gap | Status | Evidence file |
|---|---|---|---|---|---|---|
| VQ-001 | | | | | Open | |

## 9. Exit criteria for the visual phase

- Every row in section 6 has Pass for 1920, 1440, 1024 and 375 (768 where applicable), or a documented accepted difference (replacement assets, owner-approved deviations).
- No open defect in priorities 1 to 6.
- Section 7 interaction checks are done for items the owner marked P0 or P1 in `docs/07-planning/17-implementation-roadmap.md`.
- Mobile rows are marked "provisional" until the owner supplies mobile reference captures.
