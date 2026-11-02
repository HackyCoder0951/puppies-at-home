import { notFound } from 'next/navigation';
import { getEnv } from '@shared/config';
import { Badge, DataTable, Kpi, PageHeader, Sparkline, type Tone } from '@shared/ui/admin';

const TOKENS: [string, string, string][] = [
  ['--bg', '#f7f3ec', 'App background'], ['--surface', '#ffffff', 'Cards'], ['--sidebar', '#2a170e', 'Rail (cocoa)'], ['--ink', '#2a170e', 'Text'], ['--ink-soft', '#6f5848', 'Secondary text'],
  ['--accent', '#a24a1a', 'Buttons, links (toffee)'], ['--accent-2', '#f2be6b', 'Highlights (honey)'], ['--success', '#1f7a4d', 'Paid, delivered'], ['--warning', '#8a5a0f', 'Pending'], ['--danger', '#b3261e', 'Failed'], ['--info', '#235a8a', 'Info'],
];
const TONES: Tone[] = ['neutral', 'info', 'success', 'warning', 'danger', 'accent'];

/** Development-only reference page: the tokens and components in one place, to compare with the public site. Not available in production. */
export default function GalleryPage() {
  if (getEnv().APP_ENV === 'production') notFound();
  return (
    <main className="grid gap-6" data-gallery>
      <PageHeader title="Design gallery" description="Tokens and components. Development only." actions={<button type="button" className="adm-btn">Primary</button>} />
      <section className="adm-card grid gap-3" aria-labelledby="tokens">
        <h2 id="tokens" className="font-semibold">Colour tokens</h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {TOKENS.map(([name, hex, use]) => (
            <li key={name} className="flex items-center gap-3 text-sm"><span aria-hidden="true" className="size-8 rounded-lg border" style={{ background: `var(${name})`, borderColor: 'var(--line)' }} /><span><code>{name}</code> <span className="adm-muted">{hex} · {use}</span></span></li>
          ))}
        </ul>
      </section>
      <section className="adm-card grid gap-3" aria-labelledby="type">
        <h2 id="type" className="font-semibold">Type</h2>
        <p className="adm-title">Fraunces for titles</p><p className="adm-figure">AED 12,345</p><p>Figtree for everything else, with <span className="num" style={{ textAlign: 'left' }}>1,234.50</span> tabular numbers.</p>
      </section>
      <section className="adm-card flex flex-wrap items-center gap-3" aria-labelledby="parts">
        <h2 id="parts" className="sr-only">Components</h2>
        <button type="button" className="adm-btn">Primary</button><button type="button" className="adm-btn adm-btn-secondary">Secondary</button>
        {TONES.map((t) => (<Badge key={t} tone={t}>{t}</Badge>))}
        <Sparkline values={[2, 4, 3, 6, 5, 8, 7, 9, 6, 10, 8, 12, 11, 13]} label="Sample trend" />
      </section>
      <div className="adm-kpis"><Kpi label="Sample figure" value="42" href="/admin" note="with a note" trend={[1, 3, 2, 5, 4, 6, 8]} /></div>
      <DataTable caption="Sample table" rows={[{ id: 'a', n: 'Max', p: 4500 }, { id: 'b', n: 'Copper', p: 3800 }]} rowKey={(r) => r.id} empty="none" columns={[{ key: 'n', header: 'Puppy', cell: (r) => r.n }, { key: 'p', header: 'Price (AED)', numeric: true, cell: (r) => r.p.toLocaleString('en-GB') }]} />
    </main>
  );
}
