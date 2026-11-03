import type { ReactNode } from 'react';

/** Safe light formatting for model text: **bold** becomes bold, "* " bullets become dots, a half-typed ** is hidden while streaming. Never HTML. */
export function formatted(text: string): ReactNode[] {
  return text.replace(/^(\s*)[*-] /gm, '$1• ').split('\n').flatMap((line, i, all) => {
    const marks = line.split('**').length - 1;
    const clean = marks % 2 ? `${line.slice(0, line.lastIndexOf('**'))}${line.slice(line.lastIndexOf('**') + 2)}` : line;   // an unfinished bold marker is hidden
    const parts = clean.split(/\*\*([^*]+)\*\*/g).map((part, j) => (j % 2 ? <strong key={j}>{part}</strong> : part));
    return i < all.length - 1 ? [...parts, '\n'] : parts;
  });
}
