import type { ReactNode } from 'react';
import { SiteShell } from '@modules/storefront';
import '../fonts.css';
import '../reference.css';
import '../extras.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
