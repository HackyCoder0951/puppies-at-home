import { placeholderSrc } from '@shared/lib';

interface Props {
  width: number;
  height: number;
  color: string;
  alt: string;
  video?: boolean;
  /** Small marker for thumbnails. */
  compact?: boolean;
  className?: string;
}

/** Stand-in for photos and videos in the mock track; keeps the real aspect ratio so layouts match. */
export function PlaceholderImage({ width, height, color, alt, video = false, compact = false, className }: Props) {
  return (
    <span className={`relative block ${className ?? ''}`} style={{ aspectRatio: `${width} / ${height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL, nothing to optimise */}
      <img src={placeholderSrc({ width, height, color, label: video ? 'video' : '' })} alt={alt} width={width} height={height} className="size-full object-cover" loading="lazy" />
      {video && (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className={compact ? 'grid size-6 place-items-center rounded-full border-2 border-cocoa bg-milk text-[10px]' : 'grid size-14 place-items-center rounded-full border-2 border-cocoa bg-milk text-xl'}>▶</span>
        </span>
      )}
    </span>
  );
}
