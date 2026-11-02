import type { ReactNode } from 'react';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger' | 'accent';

/** Status chip: tone colour, a dot and the status text, so colour is never the only signal. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className="adm-badge" data-tone={tone}>{children}</span>;
}
