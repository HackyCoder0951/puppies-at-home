import type { PuppyAdminDetail } from '@backend/modules/cms';
import { addMediaAction, mediaAction, puppyStatusAction, updatePuppyAction } from '../../actions';
import { ActionForm, ChangeButton, TextField } from '../../ActionForm';
import { PuppyFields } from '../PuppyFields';

export function PuppyEditor({ puppy: p }: { puppy: PuppyAdminDetail }) {
  const id = p.id;
  const gone = p.status === 'gone_home';
  return (
    <main className="grid gap-6">
      <h1 className="text-lg font-semibold">{p.name ?? p.breed} <span className="text-sm font-normal" style={{ color: 'var(--adm-muted)' }}>({p.slug})</span></h1>

      <section className="adm-card grid gap-3" aria-labelledby="status">
        <h2 id="status" className="font-medium">Status: {p.publishedAt ? 'Published' : 'Draft'}{gone ? ', gone home' : ''}</h2>
        <ActionForm action={puppyStatusAction.bind(null, id)} className="flex flex-wrap items-center gap-3">
          {p.publishedAt ? <ChangeButton value="unpublish">Unpublish</ChangeButton> : <ChangeButton value="publish">Publish</ChangeButton>}
          {gone ? <ChangeButton value="available">Mark available again</ChangeButton> : <ChangeButton value="gone-home">Mark gone home</ChangeButton>}
          <ChangeButton value="delete" danger>Delete</ChangeButton>
        </ActionForm>
      </section>

      <section className="adm-card grid gap-4" aria-labelledby="details">
        <h2 id="details" className="font-medium">Details</h2>
        <ActionForm action={updatePuppyAction.bind(null, id)} submitLabel="Save details"><PuppyFields puppy={p} /></ActionForm>
      </section>

      <section className="adm-card grid gap-4" aria-labelledby="media">
        <h2 id="media" className="font-medium">Photos and videos</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {p.media.map((m) => (
            <li key={m.id} className="grid gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt} className="aspect-square w-full rounded-lg object-cover" />
              <span className="text-xs" style={{ color: 'var(--adm-muted)' }}>{m.kind === 'video' ? 'Video' : 'Photo'}{m.isCover ? ' · cover' : ''}</span>
              <ActionForm action={mediaAction.bind(null, id)} className="flex gap-2">
                <input type="hidden" name="mediaId" value={m.id} />
                {m.kind === 'photo' && !m.isCover ? <ChangeButton value="cover">Make cover</ChangeButton> : null}
                <ChangeButton value="remove" danger>Remove</ChangeButton>
              </ActionForm>
            </li>
          ))}
        </ul>
        <ActionForm action={addMediaAction.bind(null, id)} submitLabel="Upload" encType="multipart/form-data">
          <div className="grid gap-1">
            <label htmlFor="file" className="text-sm font-medium">Photo (JPEG, PNG, WebP, AVIF) or video (MP4, WebM)</label>
            <input id="file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" required className="adm-input" />
          </div>
          <TextField name="alt" label="Describe it for people who cannot see it" hint="For example: Max, a cream Maltipoo, sitting on a sofa." />
        </ActionForm>
      </section>
    </main>
  );
}
