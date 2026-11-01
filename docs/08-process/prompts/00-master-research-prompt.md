# MASTER PROMPT — WEBSITE CLONE RESEARCH & REQUIREMENTS ENGINEERING

You are acting as a **Senior Frontend Architect, Product Analyst, UX Researcher, QA Engineer, and Reverse-Engineering Specialist**.

I have received a technical assignment from **Insta Biz Web**.

The assignment is:

> Clone the complete reference website:
> https://puppy.instabizweb.com/
>
> The clone must match the reference website's:
> - Design
> - Layout
> - Responsiveness
> - Functionality
> - User experience
> - Content structure
>
> The final submission will include:
> 1. Live deployed website
> 2. GitHub repository
> 3. Loom video explaining:
>    - Development process
>    - Project structure
>    - Technologies/tools
>    - AI tools and exact prompts
>    - Implementation decisions
>    - Challenges
>    - Testing
>    - Deployment

## CRITICAL OPERATING RULE

DO NOT START IMPLEMENTING THE WEBSITE YET.

This phase is ONLY:

1. Research
2. Reverse engineering
3. Website analysis
4. Requirement gathering
5. Functional analysis
6. UX/UI analysis
7. Responsive analysis
8. Content analysis
9. Technical analysis
10. Risk identification
11. Implementation planning

Do NOT generate the production React application yet.

Do NOT create components yet.

Do NOT invent functionality that cannot be observed or reasonably inferred from the reference.

The goal of this phase is to produce a **complete engineering specification** from which another developer could build the clone without repeatedly returning to the reference website.

---

# PHASE 1 — REFERENCE WEBSITE RECONNAISSANCE

Open and thoroughly inspect:

https://puppy.instabizweb.com/

Explore the website as a real user would.

Do not only inspect the homepage.

Identify and document:

- All accessible pages
- All navigation links
- All buttons
- All CTAs
- All forms
- All cards
- All image galleries
- All sliders/carousels
- All accordions
- All modals
- All dropdowns
- All filters
- All search functionality
- All contact mechanisms
- All WhatsApp links
- All external links
- All social links
- All footer links
- All mobile-specific interactions
- All visible animations
- All hover interactions
- All scrolling behavior
- All redirects
- All dynamic-looking content

For every interaction, determine:

- What happens when the user interacts?
- Is it internal navigation?
- Is it an external URL?
- Is it a WhatsApp action?
- Is it a form submission?
- Is it an accordion?
- Is it a modal?
- Is it a carousel?
- Is it simply visual?

Record evidence rather than assumptions.

---

# PHASE 2 — INFORMATION ARCHITECTURE

Construct the complete website information architecture.

Create a sitemap such as:

```text
Website
│
├── Home
│
├── Puppies
│   ├── Puppy listing
│   └── Puppy details
│
├── Happy Families
│
├── How It Works
│
├── FAQ
│
└── Visit & Contact
```

IMPORTANT:

Do not assume this structure.

Derive the actual structure from the website.

For each page document:

| Page | URL | Purpose | Main Sections | Primary CTA | Secondary CTA |
|------|-----|---------|---------------|-------------|---------------|

---

# PHASE 3 — PAGE-BY-PAGE ANALYSIS

For EVERY discovered page, create a detailed section.

Use this structure:

## Page: [PAGE NAME]

### URL
[URL]

### Purpose

Explain what business/user objective this page serves.

### Target User

Who is likely to use this page?

### Sections

For every section:

```text
Section:
Purpose:
Visual structure:
Content:
CTA:
Interaction:
Responsive behavior:
Priority:
```

### User Journey

Explain how a user enters this page and where they are expected to go next.

### Conversion Goal

Identify the primary business conversion.

---

# PHASE 4 — HOMEPAGE DECOMPOSITION

Analyze the homepage from top to bottom.

Create a section hierarchy:

```text
HOME
│
├── Header
├── Hero
├── Section 01
├── Section 02
├── Section 03
├── ...
├── CTA
└── Footer
```

For every section document:

### Visual hierarchy

- Heading
- Subheading
- Body text
- CTA
- Image
- Background
- Cards
- Decorative elements

### Layout

Determine:

- Full width / constrained width
- Number of columns
- Grid/flex behavior
- Alignment
- Spacing
- Image positioning
- Text positioning
- Section height

### Responsive behavior

Determine how it changes across:

- Mobile
- Tablet
- Laptop
- Desktop

---

# PHASE 5 — UI DESIGN SYSTEM EXTRACTION

Reverse engineer the visual design system.

Document:

## Colors

Identify approximate:

- Primary
- Secondary
- Accent
- Background
- Surface
- Text
- Muted text
- Border
- CTA
- Hover states

Provide HEX values where reasonably determinable.

Do NOT pretend precision if the value cannot be reliably determined.

---

## Typography

Identify:

- Font family
- Heading font
- Body font
- Font weights
- Heading sizes
- Body sizes
- Button text size
- Line heights
- Letter spacing

Create a typography scale.

Example:

```text
H1:
Desktop:
Tablet:
Mobile:

H2:
Desktop:
Tablet:
Mobile:

Body:
Desktop:
Mobile:
```

---

## Spacing

Infer the spacing system:

- Section padding
- Container width
- Card gap
- Grid gap
- Button padding
- Text spacing
- Header spacing

Identify recurring spacing patterns.

---

## Border Radius

Document:

- Buttons
- Cards
- Images
- Inputs
- Containers

---

## Shadows

Document:

- Card shadows
- Button shadows
- Floating elements
- Navigation shadows

---

# PHASE 6 — COMPONENT IDENTIFICATION

DO NOT IMPLEMENT COMPONENTS.

Only identify reusable components.

Create a component inventory:

```text
Global Components
├── Header
├── MobileNavigation
├── Footer
├── Button
├── Container
├── SectionHeader
├── WhatsAppButton

Content Components
├── PuppyCard
├── TestimonialCard
├── FAQItem
├── FamilyStoryCard
└── ...

Page Components
├── Hero
├── PuppyListing
├── HowItWorks
└── ...
```

For every component determine:

```text
Component:
Purpose:
Where used:
Inputs/data required:
Variants:
Responsive behavior:
Interactive behavior:
Reusable?:
```

---

# PHASE 7 — CONTENT MODEL

Identify all recurring content entities.

For example:

## Puppy

Possible attributes:

```text
id
name
breed
age
gender
price
location
availability
image
gallery
description
vaccination
health information
```

Do NOT assume fields that do not exist.

Instead classify:

- Observed fields
- Strongly inferred fields
- Unknown fields

Repeat for:

- Testimonials
- FAQs
- Family stories
- Contact information
- Navigation
- Social links

---

# PHASE 8 — FUNCTIONAL REQUIREMENTS

Create a formal Functional Requirements Specification.

Use IDs:

```text
FR-001
FR-002
FR-003
...
```

Format:

| ID | Requirement | Source | Priority | Acceptance Criteria |
|----|-------------|--------|----------|---------------------|

Example:

```text
FR-001
Requirement:
The website shall provide responsive navigation.

Priority:
P0

Acceptance:
Desktop navigation is visible on desktop.
Mobile navigation is accessible through the mobile menu.
All navigation links route to the correct destination.
```

Cover:

- Navigation
- Routing
- Puppy listings
- Puppy details
- FAQ
- Contact
- WhatsApp
- Forms
- Galleries
- Testimonials
- Mobile menu
- External links
- Any other observed functionality

---

# PHASE 9 — NON-FUNCTIONAL REQUIREMENTS

Create:

```text
NFR-001
NFR-002
...
```

Cover:

### Performance

- Fast initial load
- Optimized images
- Lazy loading where appropriate
- Minimal unnecessary JavaScript

### Responsiveness

Support:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px+
```

### Accessibility

Analyze:

- Semantic HTML
- Keyboard navigation
- Focus states
- Alt text
- Button accessibility
- Contrast

### Browser Compatibility

At minimum:

- Chrome
- Firefox
- Edge
- Safari where practical

### SEO

Analyze:

- Page titles
- Meta descriptions
- Heading hierarchy
- Image alt text
- URLs
- Open Graph where appropriate

### Maintainability

- Reusable components
- Data-driven rendering
- Clear folder structure
- Separation of content and presentation

---

# PHASE 10 — RESPONSIVE REVERSE ENGINEERING

This is HIGH PRIORITY.

Analyze how the original site behaves at different viewport sizes.

Create:

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Header | | | |
| Hero | | | |
| Navigation | | | |
| Puppy grid | | | |
| Testimonials | | | |
| FAQ | | | |
| Footer | | | |

Pay particular attention to:

- Breakpoints
- Grid columns
- Font scaling
- Image cropping
- Section ordering
- Horizontal scrolling
- Navigation changes
- CTA behavior

---

# PHASE 11 — USER EXPERIENCE ANALYSIS

Act as a UX researcher.

Identify:

### Primary user

Who is the website designed for?

### User goals

What does the user want to accomplish?

### Primary conversion

What action does the business want?

### Secondary conversions

Identify secondary actions.

### Trust mechanisms

Look for:

- Testimonials
- Reviews
- Guarantees
- Certifications
- Experience claims
- Photos
- Family stories
- Contact information
- Social proof

### Friction points

Identify anything that could make the user hesitate.

### UX strengths

Identify what the original website does well.

### UX weaknesses

Identify areas that could be improved WITHOUT changing the clone's visual/functional fidelity.

IMPORTANT:

Separate:

```text
REFERENCE BEHAVIOR
```

from:

```text
OUR POSSIBLE IMPROVEMENT
```

The clone should reproduce the reference first.

---

# PHASE 12 — ASSET ANALYSIS

Inventory the visual assets.

For each asset identify:

```text
Asset:
Type:
Used on:
Purpose:
Approximate dimensions:
Aspect ratio:
Can be reused:
Optimization needed:
```

Categorize:

```text
Logo
Hero images
Puppy images
Family images
Icons
Decorative assets
Backgrounds
Social icons
```

Identify potential issues such as:

- oversized images
- inconsistent aspect ratios
- missing assets
- duplicate assets
- low resolution
- external image dependencies

Do not download copyrighted assets unless their use is permitted.

If an asset cannot legally or technically be reused, clearly mark it as:

REPLACEMENT REQUIRED.

---

# PHASE 13 — TECHNICAL RECONNAISSANCE

Determine what can be reasonably inferred about the original implementation.

Analyze:

- Frontend framework if detectable
- CSS approach
- CMS if detectable
- External services
- Analytics
- Forms
- CDN
- image hosting
- embedded widgets
- third-party scripts

Do not claim certainty unless evidence exists.

Classify findings as:

```text
CONFIRMED
LIKELY
UNKNOWN
```

---

# PHASE 14 — CLONE SCOPE

Create three categories.

## MUST HAVE

Everything required to satisfy the assignment.

## SHOULD HAVE

Features that significantly improve fidelity or engineering quality.

## NICE TO HAVE

Features that should only be implemented if time remains.

Example:

```text
P0 — Must Have
- All pages
- Responsive layout
- Navigation
- Main CTAs
- Puppy cards
- FAQ
- Contact
- Mobile layout

P1 — Should Have
- Animations
- Filtering
- Detailed puppy pages
- Advanced loading states

P2 — Nice to Have
- Additional micro-interactions
- Advanced SEO
- Performance optimization beyond baseline
```

Do NOT let P2 work consume time needed for P0.

---

# PHASE 15 — ACCEPTANCE CRITERIA

Create a complete acceptance checklist.

Example:

```text
AC-001
Home page visually matches reference.

AC-002
Desktop navigation matches reference.

AC-003
Mobile navigation matches reference.

AC-004
All visible CTAs work.

AC-005
Puppy cards render correctly.

AC-006
FAQ interaction works.

AC-007
Website works at mobile breakpoints.

AC-008
Website builds successfully.

AC-009
Production deployment succeeds.

AC-010
No critical console errors.
```

Continue until the complete website is covered.

---

# PHASE 16 — TEST PLAN

Create a QA matrix.

## Functional Testing

| Test | Expected | Status |
|------|----------|--------|

## Responsive Testing

| Device Width | Expected |
|--------------|----------|

## Visual Testing

Compare:

```text
Reference
vs
Clone
```

for:

- spacing
- typography
- colors
- images
- alignment
- card dimensions
- section heights
- navigation
- footer

## Interaction Testing

Test:

- links
- buttons
- menus
- accordions
- forms
- WhatsApp
- external links

## Deployment Testing

Test:

- production URL
- refresh on routes
- asset loading
- HTTPS
- mobile
- desktop
- console errors

---

# PHASE 17 — RISK REGISTER

Create:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|

Consider:

- 48-hour deadline
- asset availability
- unknown functionality
- responsive complexity
- deployment problems
- image optimization
- routing
- external links
- AI-generated code quality
- scope creep

---

# PHASE 18 — IMPLEMENTATION PLAN

Only AFTER completing all analysis, create an implementation plan.

Break it into:

```text
Phase 1 — Project setup
Phase 2 — Global design system
Phase 3 — Layout/navigation
Phase 4 — Homepage
Phase 5 — Puppy pages
Phase 6 — Supporting pages
Phase 7 — Interactions
Phase 8 — Responsive optimization
Phase 9 — QA
Phase 10 — Deployment
Phase 11 — Loom preparation
```

For each phase specify:

```text
Tasks
Dependencies
Estimated time
Priority
Definition of Done
```

---

# PHASE 19 — 48-HOUR TIME BUDGET

We have a strict 48-hour deadline.

Create a realistic schedule.

Do NOT assume all 48 hours can be used for coding.

Reserve time for:

```text
Research
Implementation
Debugging
Responsive testing
Visual comparison
Deployment
GitHub cleanup
Documentation
Loom recording
Final submission
Buffer
```

Provide:

1. Ideal schedule
2. Minimum viable schedule
3. Emergency schedule if implementation falls behind

---

# PHASE 20 — AI DEVELOPMENT STRATEGY

Create a recommended AI workflow for this assignment.

Separate AI usage into:

```text
Research
Architecture
Implementation
Debugging
Testing
Code review
Documentation
Loom preparation
```

For each stage provide:

- Objective
- Recommended AI role
- Prompt strategy
- What AI should NOT be trusted to decide
- Human verification required

The AI must NOT become the decision-maker.

---

# PHASE 21 — AI PROMPT LOG STRUCTURE

Create a template that I can maintain throughout development:

```markdown
## AI Prompt #001

### Date
YYYY-MM-DD

### Tool
Claude Code / ChatGPT / Cursor

### Objective
...

### Exact Prompt
...

### Output
...

### Human Verification
...

### Changes Made
...

### Result
...
```

This is important because the interviewer explicitly requested the exact prompts used.

---

# PHASE 22 — FINAL RESEARCH REPORT

At the end, produce:

```text
01-executive-summary.md
02-site-map.md
03-page-analysis.md
04-ui-design-system.md
05-component-inventory.md
06-content-model.md
07-functional-requirements.md
08-non-functional-requirements.md
09-responsive-analysis.md
10-ux-analysis.md
11-asset-inventory.md
12-technical-analysis.md
13-scope.md
14-acceptance-criteria.md
15-test-plan.md
16-risk-register.md
17-implementation-plan.md
18-ai-development-strategy.md
19-ai-prompt-log-template.md
```

Also produce a final:

```text
RESEARCH-SIGNOFF.md
```

containing:

### What we know with confidence

### What is inferred

### What remains unknown

### What must be verified during implementation

### Final approved scope

### Recommended technology stack

### Estimated implementation time

### Highest-risk areas

---

# FINAL RULES

1. Do not start coding.
2. Do not invent requirements.
3. Do not assume functionality without evidence.
4. Clearly distinguish observed behavior from assumptions.
5. Prioritize visual and functional fidelity.
6. Treat mobile responsiveness as a first-class requirement.
7. Identify reusable components before implementation.
8. Keep the 48-hour deadline in mind.
9. Avoid unnecessary backend development unless the reference actually requires it.
10. Do not over-engineer.
11. Record every important implementation decision.
12. Prepare the documentation so it can later be used directly in the Loom presentation.
13. AI-generated recommendations must be reviewed critically.
14. Do not sacrifice P0 requirements for P1/P2 improvements.
15. The final goal is not merely to make a website that looks similar; it is to produce a defensible engineering implementation that I can confidently explain during the technical interview.

START NOW WITH PHASE 1.

Do not proceed to implementation.

First inspect the reference website and produce the reconnaissance findings.