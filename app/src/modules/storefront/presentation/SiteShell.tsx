import type { ReactNode } from 'react';
import { BottomBar } from './BottomBar';
import { Footer } from './Footer';
import { Header } from './Header';

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
      <BottomBar />
    </div>
  );
}
