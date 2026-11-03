# Performance and load measurements

**Measured:** 2026-11-03, on the development machine, production build served by `next start` against the local Supabase stack. These are not Vercel numbers: the network is local, so Lighthouse's simulated mobile throttling is the only network cost. Repeat on the deployed site before quoting them.

## Lighthouse 12.6.1 (mobile profile, one run per page)

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home | 66 | 100 | 93 | 66 | 3.2 s | 8.3 s | 80 ms | 0.002 |
| Puppies list | 85 | 100 | 100 | 66 | 1.7 s | 4.0 s | 110 ms | 0.04 |

- **SEO 66 is expected here:** the local environment serves `noindex` (`is-crawlable` fails on `robots.txt`). It must be measured again with `APP_ENV=production`.
- **Home best practices 93** came from the Content-Security-Policy blocking local-storage images: the policy is built when the app is built and that build used the cloud project's address, while the data came from the local stack. A build with the matching `NEXT_PUBLIC_SUPABASE_URL` does not show this.
- **Main causes of the slow LCP on the home page** (from the audit details, not yet fixed): the LCP element is the hero text, delayed by render-blocking CSS and fonts; `brand/logo.png` is 174 KB and should be a smaller or modern format; several hero photos waste 80 to 235 KB each (modern formats, responsive sizes); total page weight 2.1 MB; DOM size is large.
- Accessibility is 100 on both pages. CLS is near zero.

## Load (ApacheBench, 300 requests, 20 concurrent, local)

| Page | Requests per second | Median | 99th percentile | Failures |
|---|---|---|---|---|
| Home | 232 | 81 ms | 143 ms | 0 |
| Puppies list | 72 | 270 ms | 366 ms | 0 |
| FAQs | 767 | 24 ms | 38 ms | 0 |
| Contact | 641 | 28 ms | 53 ms | 0 |

The puppies list is the slowest because it reads the catalogue per request; it is the first candidate for caching if traffic grows.

## Not measured

Admin screens, authenticated flows, the Stripe and Resend paths, any load from more than one machine, and the deployed Vercel site (cold starts, regions).
