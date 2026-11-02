'use client';

import { useState, type FormEvent } from 'react';
import { adminPaths } from '@nav';

/** Super admins download CSV through the export route (audited and rate limited there). */
/** The kinds arrive as a prop: a client component must not import the module barrel (it pulls in server-only code). */
export function ExportForm({ kinds, defaultFrom, defaultTo }: { kinds: readonly string[]; defaultFrom: string; defaultTo: string }) {
  const [kind, setKind] = useState<string>('payments');
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    window.location.assign(adminPaths.export(kind, from, to));
  };
  return (
    <section className="adm-card grid gap-3" aria-labelledby="export">
      <h2 id="export" className="font-medium">Export</h2>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>CSV for your accountant or records. Super admins only; every export is logged. Customer details are not exported here.</p>
      <form onSubmit={submit} className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1">
          <label htmlFor="kind" className="text-sm font-medium">What</label>
          <select id="kind" value={kind} onChange={(e) => setKind(e.target.value)} className="adm-input">
            {kinds.map((k) => (<option key={k} value={k}>{k}</option>))}
          </select>
        </div>
        <div className="grid gap-1"><label htmlFor="from" className="text-sm font-medium">From</label><input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} required className="adm-input" /></div>
        <div className="grid gap-1"><label htmlFor="to" className="text-sm font-medium">To</label><input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} required className="adm-input" /></div>
        <button type="submit" className="adm-btn">Download CSV</button>
      </form>
    </section>
  );
}
