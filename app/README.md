# TeddyPups U.A.E. — frontend app

Next.js application for the puppies-at-home project. Documentation lives in `../docs` (start at `../docs/README.md`).

```bash
npm install
npm run dev        # http://localhost:3000
npm run verify     # lint + typecheck + tests + build
npm run test:arch  # architecture boundary tests
```

Structure: `src/app` (thin routing), `src/modules/*` (domain / application / infrastructure / presentation),
`src/shared`, `src/navigation`, `src/platform`, `src/composition`. Rules are in
`../docs/02-architecture/21-modular-monolith-architecture.md` and enforced by ESLint and `tests/architecture`.
