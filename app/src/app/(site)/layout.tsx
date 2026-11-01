import type { ReactNode } from 'react';
import { SiteShell } from '@modules/storefront';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
