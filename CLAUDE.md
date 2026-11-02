# Project instructions

TeddyPups clone (frontend first, on mock data) with a later Supabase-backed admin portal, built as a modular monolith. Documentation lives in `docs/` (start at `docs/README.md`).

## Status

- **Repository layout:** `app/` (Next.js UI, frontend modules, composition) and `backend/` (Supabase project, platform clients, backend modules and adapters) are npm workspaces under the repository root; all backend work goes in `backend/`, never in `app/`. Plan: `docs/07-planning/25-backend-development-plan.md`.
- Requirements and analysis are complete. **Frontend development is in progress** in `app/` (the Next.js project root; docs stay in `docs/`). The owner started F0 on 2026-11-02 and asked for autonomous work through F9 (Standard P0 schedule, `docs/07-planning/22-frontend-development-plan.md`); run tests and fix failures once at the end of each phase, and do not loop on fixes. No backend, migrations or Supabase project until the frontend track is done.
- The AI assistant (RL-based RAG chatbot) is planned only: documents `docs/04-design-ux/26` to `docs/07-planning/30`. **No assistant code, packages, migrations or API keys until the owner approves them and decisions D18 to D35 are settled.**
- Follow `docs/02-architecture/21-modular-monolith-architecture.md` (layered modules, public APIs between modules, `navigation` for all links, only `shared/config` reads the environment) and `docs/03-security-privacy/06-security-architecture.md` section 6 (data protection; no real personal data in the mock track).

## Git rules

- **Never add a `Co-Authored-By:` line or any Claude, Anthropic or "generated with" attribution to commit messages or pull request descriptions.** Commits are authored as the owner.
- Make incremental commits, one per document or progress step, using Conventional Commit subjects (`docs(...)`, `feat(...)`, `fix(...)`, `test(...)`, `chore:`), with a short body saying what and why.
- Commit and push only when the owner asks. No remote is configured.
- `docs/05-research/evidence/` is private and untracked (large recording, photos of real customers, third-party content); `.claude/settings.local.json` is ignored.

## Working agreement

- After every owner message, append a timestamped entry (IST, from the machine clock) to `docs/08-process/19-development-progress-log.md` and the exact prompt to `docs/08-process/18-ai-usage-and-prompt-log.md`.
- Record corrections honestly; state what was not verified.
