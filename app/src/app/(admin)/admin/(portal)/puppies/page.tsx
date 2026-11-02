import Link from 'next/link';
import { cmsMessage } from '@backend/modules/cms';
import { getCms } from '@composition';
import { adminPaths } from '@nav';

const STATUS = { available: 'Available', reserved: 'Reserved', gone_home: 'Gone home' } as const;

export default async function PuppiesPage() {
  const result = await (await getCms()).listPuppies();
  if (!result.ok) return <p role="alert" className="adm-error">{cmsMessage(result.error)}</p>;
  return (
    <main className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Puppies</h1>
        <Link href={adminPaths.newPuppy()} className="adm-btn">Add a puppy</Link>
      </div>
      <ul className="grid gap-3">
        {result.value.map((p) => (
          <li key={p.id} className="adm-card flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.coverUrl ? <img src={p.coverUrl} alt="" width={56} height={56} className="size-14 rounded-lg object-cover" /> : <span className="size-14 rounded-lg" style={{ background: 'var(--adm-line)' }} />}
            <div className="grid flex-1 gap-1">
              <Link href={adminPaths.puppy(p.id)} className="adm-link font-medium">{p.name ?? p.breed}{p.name ? ` (${p.breed})` : ''}</Link>
              <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{STATUS[p.status]} · {p.ageText} · {p.publishedAt ? 'Published' : 'Draft'}</span>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
