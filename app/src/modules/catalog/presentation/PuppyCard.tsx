import Link from 'next/link';
import { paths } from '@nav';
import { PlaceholderImage, StatusTag } from '@shared/ui';
import { SEX_LABEL, cover, type Puppy } from '../domain';

export function PuppyCard({ puppy, index = 0 }: { puppy: Puppy; index?: number }) {
  const img = cover(puppy);
  const hasVideo = puppy.media.some((m) => m.kind === 'video');
  return (
    <li className="list-none" style={{ marginTop: index % 2 ? '1.5rem' : 0 }}>
      <Link href={paths.puppy(puppy.slug)} className="group block text-center no-underline">
        <span className="relative mx-auto block aspect-square w-full overflow-hidden rounded-full border-[3px] border-cocoa bg-honey-soft shadow-(--shadow-card) transition-transform duration-300 ease-(--ease-bounce) group-hover:-rotate-2">
          {img && <PlaceholderImage width={img.width} height={img.height} color={img.color} alt={img.alt} className="size-full" />}
          {hasVideo && <span className="absolute bottom-3 right-3 rounded-full border-2 border-cocoa bg-milk px-2 text-sm" aria-label="Has video">▶</span>}
        </span>
        <span className="mt-3 flex justify-center">
          <StatusTag tone={puppy.status === 'available' ? 'available' : 'home'}>
            {puppy.status === 'available' ? 'Available' : 'Gone home ♥'}
          </StatusTag>
        </span>
        <span className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-extrabold text-cocoa">{puppy.name}</span>
        <span className="block text-base text-cocoa-soft">{SEX_LABEL[puppy.sex]} · {puppy.age}</span>
      </Link>
    </li>
  );
}
