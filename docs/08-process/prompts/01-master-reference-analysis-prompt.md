# SCREENSHOT-BASED VISUAL REFERENCE PROTOCOL

I have provided screenshots captured directly from the reference website.

Treat these screenshots as the **visual source of truth** for the clone.

The reference website itself remains the source of truth for:

- Navigation
- URLs
- Interactions
- Functionality
- Content behavior
- Responsive behavior

The screenshots are the source of truth for:

- Visual layout
- Spacing
- Typography
- Colors
- Images
- Component proportions
- Alignment
- Section composition
- Card dimensions
- Button appearance
- Visual hierarchy
- Responsive presentation

## IMPORTANT

Do NOT immediately implement the website.

First analyze every screenshot.

For each screenshot identify:

1. Page/section
2. Viewport/device
3. Layout structure
4. Container width
5. Grid/flex structure
6. Number of columns
7. Horizontal and vertical spacing
8. Typography hierarchy
9. Font sizes/weights
10. Colors
11. Images
12. Image aspect ratios
13. Buttons
14. Cards
15. Icons
16. Borders
17. Border radius
18. Shadows
19. Backgrounds
20. Alignment
21. Responsive behavior
22. Interactive elements
23. Reusable components

For each visual measurement, distinguish between:

- Clearly observable
- Reasonably estimated
- Unknown

Do not fabricate exact values.

---

# SCREENSHOT COMPARISON REQUIREMENT

During implementation, the screenshots must be used for visual verification.

For every major page:

Reference screenshot
        ↓
Implementation
        ↓
Screenshot of implementation
        ↓
Side-by-side comparison
        ↓
Identify differences
        ↓
Fix
        ↓
Repeat

Create a visual QA checklist covering:

- Overall composition
- Header
- Hero
- Typography
- Images
- Cards
- Buttons
- Section spacing
- Footer
- Mobile layout

The goal is not merely functional similarity.

The goal is **high visual fidelity**.

---

# RESPONSIVE COMPARISON

When both desktop and mobile screenshots are available, infer the responsive transformation.

Document:

```text
Desktop → Mobile

Header:
...

Navigation:
...

Hero:
...

Grid:
...

Typography:
...

Images:
...

CTA:
...

Footer:
...
```

Do not simply shrink the desktop design.

Reproduce the actual responsive composition shown in the reference screenshots.

---

# VISUAL FIDELITY PRIORITY

When making implementation decisions, prioritize in this order:

1. Overall layout
2. Section structure
3. Typography hierarchy
4. Spacing
5. Images
6. Component dimensions
7. Colors
8. Buttons
9. Responsive behavior
10. Micro-interactions

Do not spend significant time on minor animations while major visual differences remain.

---

# FINAL VISUAL ANALYSIS OUTPUT

Create:

```text
reference-analysis/
├── screenshot-inventory.md
├── visual-design-analysis.md
├── desktop-analysis.md
├── mobile-analysis.md
├── interaction-analysis.md
├── component-mapping.md
└── visual-qa-checklist.md
```

Do not begin implementation until these analyses are complete.