import type { Metadata } from 'next';
import { NotFound, SiteShell } from '@modules/storefront';
import './fonts.css';
import './reference.css';
import './extras.css';

export const metadata: Metadata = { title: 'Page not found | TeddyPups U.A.E.', robots: { index: false } };

/** 404 for URLs that match no route. The site and the admin have separate root layouts, so this one stands alone. */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <SiteShell>
          <NotFound />
        </SiteShell>
      </body>
    </html>
  );
}
