# Component Mapping

| | |
|---|---|
| **Purpose** | Map the reusable visual components found in the screenshots and video to the specification (`docs/01-requirements/02-product-requirements.md` FR-PUB IDs, `docs/04-design-ux/13-public-site-spec.md`), the data source and the responsive behaviour, so implementation can start from a component list instead of pages |
| **No implementation** | This is a mapping only |
| **Screenshot keys** | A1 to A10 home, B1 to B5 puppies, C1 to C2 gone home, D1 to D3 happy families, E1 to E4 how it works, F1 to F2 FAQ, G1 contact (see `desktop-analysis.md`) |
| **Priority** | P0 must for the clone, P1 should, P2 polish (`docs/07-planning/17-implementation-roadmap.md`) |

## 1. Global components

| Component | Where (screenshots) | Variants | Props / data | Responsive | Interactive | Prio |
|---|---|---|---|---|---|---|
| **Container** | All | Page (1648px), header (1760px bar) | `maxWidth` | Gutter `clamp(1rem,4vw,3.5rem)` | none | P0 |
| **Header** | A1, B1, C1, D1, E1, F1, G1 | `transparent` (home hero), `solid` with scallop | links, active route, WhatsApp URL (settings) | Inline ≥1024; "Menu" below; WhatsApp pill ≥640 | Hover and active link states | P0 |
| **NavLink** | Header | default, hover, active (paw glyph) | label, href | none | hover/active | P0 |
| **MobileMenu** | (secondary evidence) | open, closing | links, WhatsApp, phone | <1024 only | Circle reveal, Esc, focus trap | P0 |
| **BottomBar** | (secondary evidence) | none | WhatsApp URL, tel | <768 only | links | P0 |
| **Footer** | A10, B3, E4, G1 | none | links, contact, socials (settings) | 3 columns → stacked (Est) | links | P0 |
| **SocialPill** | A10 | Instagram, TikTok, Facebook | label, url | none | new tab | P0 |
| **Button** | Everywhere | `primary`, `ghost`, `whatsapp`, `ghost-on-dark` | label, href, size | 52px tall; stacked full width on mobile hero | hover lift, press scale | P0 |
| **Chip** | B1, A4 (breed chips) | `filter` (toggle), `link` (journey chips) | label, pressed | wraps | toggle, hover honey-soft | P0 |
| **StatusTag** | A2, B2 | `available`, `gone-home` | label | none | swing on reveal (P2) | P0 |
| **Kicker** | A1, B1, D1, E1, F1 | default, toffee on light, honey on dark | text | none | none | P0 |
| **HeadlineUnderline** | B1 | wavy toffee stroke | width | scales with H1 | none | P1 |
| **SectionNumber** | B4, B5, C2 | disc "1" to "4" + handwriting label | n, label | none | none | P1 |
| **Breadcrumb** | B4, C2 | available, gone | trail | none | links | P0 |
| **ProgressRibbon** | B4, B5, C2 | none | scroll progress | left edge, all sizes | scroll-driven | P1 |
| **Scallop / Wave / Quilt dividers** | A1, B1, B3, E4, G1 | scallop (header, hero ground), wave (pre-footer) | colour | scales with width | none | P0 |
| **Mascot** | A1, A2, A3, A4, A7, A8, A9, A10, B1, B4, C1, D3, E1, F1, G1 | peeking, walking, sitting, in basket, lying down, running (curtain) | pose, size | present on mobile (roaming) | idle loops, bubble | P1 (poses), P2 (rig) |
| **SpeechBubble** | A2 ("coming?"), B1 | small | text | none | appears on trigger | P2 |
| **Curtain** | (video, route changes) | intro, cover, lift | state | all sizes | route change | P2 |
| **ScrollSmoother (Lenis)** | all | none | enabled flag | disabled for reduced motion | none | P1 |

## 2. Layout and scene components

| Component | Where | Variants | Notes | Prio |
|---|---|---|---|---|
| **Scene** | A1 to A10 | gradient start/end, text tone (light, dark) | The day-to-night gradient pairs must match end to start (`docs/05-research/04-ui-ux-animation-effects-color-layout.md` table A1) | P0 |
| **PageHeader (sketchbook)** | B1, C1, D1, E1, F1, G1 | with right-side art (self-portrait, kiosk, note, paragraph, mascot) | Left kicker + H1 + intro; grid `1fr auto` | P0 |
| **PinnedStage** | A2 | `pinned` ≥1024, `grid` below or reduced motion | wrapper height = `100vh + 0.8×overflow` | P1 |
| **SplitSection** | A3, A4, A8, A9, E1, E3, G1 | 2-column (text + illustration), single below 1024 | | P0 |

## 3. Content components

| Component | Where | Variants | Data source | FR | Responsive | Interactive | Prio |
|---|---|---|---|---|---|---|---|
| **PuppyCard (sketch)** | B1, B2 | with video badge; doodle/ring colour variants | `v_public_puppies` | FR-PUB-010 | 6 cols desktop, 2 mobile | link, hover tilt | P0 |
| **DoorCard** | A2 | closed, ajar, open; 5 colours | `v_public_puppies` (first 15) | FR-PUB-007 | pinned ≥1024; grid 2 or 3 cols below | hover, link | P1 |
| **TicketCard** | C1 | with source "TeddyPups" or "Dubai showroom" | `v_public_gone_home` | FR-PUB-013 | 4 cols desktop, 1 mobile | link, reveal | P0 |
| **GoneHomeAvatar** | B3 | circle + sticker | `v_public_gone_home` (5) | FR-PUB-010 | wraps | link | P1 |
| **Polaroid** | A8, D1 to D3 | with/without caption; tape colours; tilt | `v_public_families` | FR-PUB-014 | 4 / 3 / 2 columns | hover lift, opens lightbox | P0 |
| **Lightbox** | video 3:50 | none | families list | FR-PUB-014 | full screen | prev/next/close/keys | P1 |
| **Gallery** | B4, C2 | photo and video items; stacked frame | `puppy_media` | FR-PUB-011 | full width on mobile | arrows, thumbs, video | P0 |
| **InfoCard** | B4, C2 | `available`, `gone` | `puppies` | FR-PUB-011/012 | stacks under gallery on mobile | two buttons | P0 |
| **FactGrid** | B4, C2 | none | breed, sex, age, origin | FR-PUB-011 | 2×2 | none | P0 |
| **ChecklistCard** | B4, C2 | none | static content | FR-PUB-011 | full width | none | P1 |
| **StepsRow** | B5 | paw-connected horizontal (≥ tablet) / vertical (mobile) | static or per origin | FR-PUB-011 | switches orientation | none | P1 |
| **PrevNextCard** | B5 | previous, next | neighbours by `sort_order` | FR-PUB-011 | 2 cards, stack on mobile (Est) | link | P1 |
| **EnquiryForm** | B5 | puppy-specific | writes `create_enquiry` | FR-PUB-018 | single column on mobile | submit, animation | P0 |
| **LetterForm** | G1 | inline fields | writes `create_enquiry` | FR-PUB-017/018 | mobile order: before contact stack | submit, animation | P0 |
| **PawStamp** | B5, G1 | none | decorative | | none | none | P2 |
| **AnchorPills** | E1 | 4 pills | static | FR-PUB-015 | wraps (3 rows on mobile) | smooth scroll | P1 |
| **SegmentedToggle** | E1, E2 | In Dubai / Imported | static content | FR-PUB-015 | full width on mobile | switches panel | P0 |
| **IllustrationCard** | E1, E2, E3 | skyline+sun; plane route | assets | FR-PUB-015 | scales | none | P1 |
| **StepCard** | E1, E2 | 4 icons per mode | static | FR-PUB-015 | 4 → 1 columns | none | P0 |
| **PassportCard / Stamp** | A7 (book), E3 (card) | 4-stamp book, 3-stamp card; shapes round, rectangular, oval, dotted | static | FR-PUB-006/015 | single column on mobile | stamp thump (scroll) | P1 |
| **FeatureList** | E4 | icon rows | static | FR-PUB-015 | stacks | none | P1 |
| **CTACard** | E4 | none | static | FR-PUB-015 | stacks | two buttons | P1 |
| **Corkboard / Note** | F1, F2 | open, closed; 4 pin colours | `v_public_faqs` | FR-PUB-016 | board full width on mobile | accordion | P0 |
| **SearchField** | F1 | none | filters notes | FR-PUB-016 | full width | type, counter | P0 |
| **PhoneMock + ChatBubble + Typing** | A4 to A6 | 3 content states | static | FR-PUB-008 | below steps on mobile | scroll-driven | P1 |
| **StepList (journey)** | A4 to A6 | active/inactive | static | FR-PUB-008 | all visible on mobile | scroll | P1 |
| **Signpost** | A3 | two arrows | static | FR-PUB-006 | split into two arrows on mobile | none | P1 |
| **ShowroomScene / FlightScene** | A3, E3 | skyline + awning; plane + arc | assets | FR-PUB-006 | stacks | none | P1 |
| **PassportBook** | A7 | tilted book | static | FR-PUB-006 | single column | none | P1 |
| **NotebookNote / SpeechNote** | D1 (notebook), A8 (speech bubble) | two styles of the same testimonial | `v_public_testimonial` | FR-PUB-014 | full width | none | P1 |
| **HouseFacade** | A8 | wall, cap, lamp, door | static | FR-PUB-006 | scales | door link | P1 |
| **CTAHouse** | A9 | door opens on scroll | static | FR-PUB-006 | scales | scroll | P1 |
| **ShopfrontCard** | G1 | awning, arch photo, skyline | settings | FR-PUB-017 | stacks | Maps link | P0 |
| **Kiosk** | C1 | "tickets home" | static | | none on small? (shown right of intro on mobile) | none | P2 |
| **FilterPad** | B1 | where, breed, sex rows; "Clear filters" | URL query | FR-PUB-009 | wraps | toggle | P0 |
| **CountLine** | B1, B2 | "N puppies looking for a home" / "N puppies match" | computed | FR-PUB-009 | none | none | P0 |

## 4. Illustration asset list (all REPLACEMENT REQUIRED)

Mascot poses (peek, walk, sit, basket, lie, run, self-portrait), 5 doors + floor, signpost, awning shopfront, skyline (line, silhouette), plane and route, phone frame and paw wallpaper, passport book and 4 to 5 stamp shapes, house facade with lamp, door, plants and mat, moon, sun, stars, kiosk, cork and pins, tape strips, tickets, polaroid frame, scallop and wave dividers, quilt pattern, 7 line icons, logo.

## 5. Shared design tokens used by the components

See `visual-design-analysis.md` sections 2, 3 and 7 for typography, colour, radius and shadow tokens. Keep one source of truth for tokens and make components consume them.

## 6. Build order suggested by the visual priority list

1. Container, Header, Footer, Button, Chip, Kicker, dividers (global frame and type).
2. PageHeader, PuppyCard grid with FilterPad and CountLine.
3. Detail page: Gallery, InfoCard, FactGrid, ChecklistCard, StepsRow, EnquiryForm, PrevNextCard.
4. TicketCard, Polaroid wall, SegmentedToggle and StepCard, Corkboard.
5. LetterForm, ShopfrontCard.
6. Home scenes as static compositions, then PinnedStage and scroll-linked pieces.
7. Mobile layouts (provisional until mobile captures exist).
8. Illustration rig, curtain, cursor.
