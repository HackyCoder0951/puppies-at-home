import type { ReactNode } from 'react';
import { ChatWidget } from '@modules/assistant';
import { Behaviors } from './Behaviors';
import { BottomBar } from './BottomBar';
import { Flight } from './Flight';
import { Footer } from './Footer';
import { PawTrail } from './PawTrail';
import { PupJourneyHost } from './PupJourneyHost';
import { LivePups } from './LivePups';
import { RouteCurtain } from './RouteCurtain';
import { SiteHeader } from './SiteHeader';
import { SmoothScroll } from './SmoothScroll';

export function SiteShell({ children, assistant = false }: { children: ReactNode; assistant?: boolean }) {
  return (
    <>
      <RouteCurtain />
      <a href="#main" className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-full bg-cocoa px-5 py-3 font-semibold text-milk">
        Skip to content
      </a>
      <SiteHeader />
      {children}
      <Footer />
      <BottomBar />
      <Behaviors />
      <SmoothScroll />
      <LivePups />
      <PupJourneyHost />
      <PawTrail />
      <Flight />
      {assistant ? <ChatWidget /> : null}
    </>
  );
}
