# Project documentation

TeddyPups clone (frontend first, on mock data) with a later Supabase-backed admin portal, built as a modular monolith. **No application code exists yet; development starts only when the owner says "start".**

## Folder map

```
docs/
├─ README.md                      this file
├─ 00-overview/                   start here
│  ├─ 00-README-and-review-guide.md   index, review order, glossary, decisions
│  ├─ 01-executive-summary.md
│  └─ RESEARCH-SIGNOFF.md             confirmed / inferred / unknown, decisions D1 to D17, approvals
├─ 01-requirements/               what to build
│  ├─ 02-product-requirements.md      FR-xxx
│  └─ 03-non-functional-requirements.md   NFR-xxx
├─ 02-architecture/               how it is built
│  ├─ 04-system-architecture.md
│  ├─ 21-modular-monolith-architecture.md   modules, layers, navigation, composition
│  ├─ 05-data-model.md   08-api-and-rate-limiting.md   09-query-optimization-guide.md
│  ├─ 10-payments-architecture.md   11-notifications-and-messaging.md
│  ├─ 14-env-and-configuration.md   20-mock-data-spec.md
│  └─ 23-mock-data-catalogue.md      complete mock dataset (all records, counts, quirks)
├─ 03-security-privacy/           security and data protection
│  ├─ 06-security-architecture.md     includes the data protection standard (section 6)
│  └─ 07-rbac-and-rls-spec.md
├─ 04-design-ux/                  what it looks and behaves like
│  ├─ 12-admin-portal-ux-spec.md   13-public-site-spec.md
│  └─ reference-analysis/             screenshot-based visual analysis (7 files)
├─ 05-research/                   evidence and analysis of the reference site
│  ├─ 02-design-pattern-analysis.md   03-screenshots-and-video-review.md
│  ├─ 04-ui-ux-animation-effects-color-layout.md   05-responsive-analysis.md
│  └─ evidence/                       captures/  pages/  video-recording/   (large, private)
├─ 06-quality/
│  └─ 15-test-and-qa-plan.md
├─ 07-planning/
│  ├─ 16-risk-register-and-decisions.md
│  ├─ 17-implementation-roadmap.md
│  └─ 22-frontend-development-plan.md   task-level frontend plan with mock data
└─ 08-process/
   ├─ 18-ai-usage-and-prompt-log.md   19-development-progress-log.md
   └─ prompts/                        the owner's master prompts
```

## Document numbers

Documents keep the numbers they were created with. Other documents cite them as "`06`", "`21`" and so on, so use this table to find a document.

| # | Path |
|---|---|
| 00 | `00-overview/00-README-and-review-guide.md` |
| 01 | `00-overview/01-executive-summary.md` |
| 02 | `01-requirements/02-product-requirements.md` |
| 03 | `01-requirements/03-non-functional-requirements.md` |
| 04 | `02-architecture/04-system-architecture.md` |
| 05 | `02-architecture/05-data-model.md` |
| 06 | `03-security-privacy/06-security-architecture.md` |
| 07 | `03-security-privacy/07-rbac-and-rls-spec.md` |
| 08 | `02-architecture/08-api-and-rate-limiting.md` |
| 09 | `02-architecture/09-query-optimization-guide.md` |
| 10 | `02-architecture/10-payments-architecture.md` |
| 11 | `02-architecture/11-notifications-and-messaging.md` |
| 12 | `04-design-ux/12-admin-portal-ux-spec.md` |
| 13 | `04-design-ux/13-public-site-spec.md` |
| 14 | `02-architecture/14-env-and-configuration.md` |
| 15 | `06-quality/15-test-and-qa-plan.md` |
| 16 | `07-planning/16-risk-register-and-decisions.md` |
| 17 | `07-planning/17-implementation-roadmap.md` |
| 18 | `08-process/18-ai-usage-and-prompt-log.md` |
| 19 | `08-process/19-development-progress-log.md` |
| 20 | `02-architecture/20-mock-data-spec.md` |
| 21 | `02-architecture/21-modular-monolith-architecture.md` |
| 22 | `07-planning/22-frontend-development-plan.md` |
| 23 | `02-architecture/23-mock-data-catalogue.md` |
| sign-off | `00-overview/RESEARCH-SIGNOFF.md` |

Short references such as "`research/03`" in older text mean `05-research/03-screenshots-and-video-review.md`.

## Conventions

- Every document has a header block (status, version, date, related) and ends with open questions.
- IDs: `FR-` functional, `NFR-` non-functional, `AC-` acceptance, `T-` tests, `RLS-` policy tests, `RL-` rate limits, `R-` risks, `ADR-` decisions, `D` sign-off decisions.
- Paths in the documents are written from the repository root (for example `docs/03-security-privacy/06-security-architecture.md`).
- The progress log (`08-process/19-development-progress-log.md`) is append-only, so entries written before the 2026-11-02 reorganisation still use the old folder names; the mapping is in its path migration note.
- The git history of this repository was created after the analysis phase: commit dates are the times the documents were first written, and each commit holds the document's final content (details in the first commit message and in log entry 19). Commits made from now on use real time and carry no co-author lines.
- Keep `docs/05-research/evidence/` out of any public repository: it holds a 103 MB video and photos of real customers.
