'use client';

import { useState } from 'react';

type Mode = 'light' | 'dark' | 'system';
const NEXT: Record<Mode, Mode> = { system: 'light', light: 'dark', dark: 'system' };

/** Cycles system, light, dark. The choice is stored in a cookie so the server renders the right theme on first paint. */
export function ThemeToggle({ initial }: { initial: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const change = () => {
    const next = NEXT[mode];
    setMode(next);
    if (next === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', next);
    document.cookie = `adm-theme=${next}; path=/admin; max-age=31536000; samesite=lax`;
  };
  return (
    <button type="button" onClick={change} className="adm-btn adm-btn-secondary adm-btn-small" aria-label={`Colour mode: ${mode}. Change`}>
      {mode === 'dark' ? 'Dark' : mode === 'light' ? 'Light' : 'Auto'}
    </button>
  );
}
