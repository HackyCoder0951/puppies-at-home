import './fonts.css';
import './reference.css';
import './extras.css';
import { NotFound, SiteShell } from '@modules/storefront';

export default function NotFoundPage() {
  return (
    <SiteShell>
      <NotFound />
    </SiteShell>
  );
}
