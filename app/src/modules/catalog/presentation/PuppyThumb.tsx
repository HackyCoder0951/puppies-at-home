import Link from 'next/link';
import { cover, objectPosition, type Puppy } from '../domain';

/** Previous / next pup card at the foot of a puppy page. */
export function PuppyThumb({ puppy, label }: { puppy: Puppy; label: string }) {
  const m = cover(puppy);
  return (
    <Link className="group flex items-center gap-5 rounded-[2rem] border-[3px] border-cocoa bg-milk p-4 transition-transform duration-500 hover:-rotate-1 sm:last:flex-row-reverse sm:last:text-right" href={`/puppies/${puppy.slug}`}>
      <span className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[999px_999px_0.6rem_0.6rem] border-[3px] border-cocoa bg-honey-soft">
        {m && (
          // eslint-disable-next-line @next/next/no-img-element -- static file copied from the reference
          <img alt={m.alt} loading="lazy" src={m.src} style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, objectFit: 'cover', objectPosition: objectPosition(m), color: 'transparent', backgroundColor: m.color }} />
        )}
      </span>
      <span>
        <span className="font-scrawl block text-sm text-cocoa-soft">{label}</span>
        <span className="font-plush text-[1.6rem]">{puppy.name}</span>
      </span>
    </Link>
  );
}
