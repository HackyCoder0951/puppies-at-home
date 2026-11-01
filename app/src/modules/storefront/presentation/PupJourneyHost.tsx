'use client';

import { journeyModule } from './pup/engine.generated';

/** The roaming mascot that travels between stops as you scroll (ported from the reference; see pup/engine.generated.ts). */
export function PupJourneyHost() {
  const { PupJourney } = journeyModule;
  return <PupJourney />;
}
