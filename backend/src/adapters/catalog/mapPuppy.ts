import type { MediaView, PuppyView } from './readModel';

export interface PuppyRow {
  id: string;
  slug: string;
  name: string | null;
  breed: string;
  breeds: string[];
  collections: string[];
  sex: 'male' | 'female' | 'male-female';
  age_text: string;
  colour: string | null;
  origin: 'local' | 'imported';
  status: 'available' | 'reserved' | 'gone_home';
  gone_home_source: string | null;
  has_video: boolean;
}

export interface MediaRow {
  id: string;
  puppy_slug: string;
  kind: 'photo' | 'video';
  storage_path: string;
  poster_path: string | null;
  alt: string;
  caption: string | null;
  color: string;
  focal_x: number | string;
  focal_y: number | string;
  width: number | null;
  height: number | null;
  duration_s: number | string | null;
  sort_order: number;
  is_cover: boolean;
}

const SEX_WORD = { male: 'boy', female: 'girl', 'male-female': 'boy & girl' } as const;
export const DEFAULT_WHATSAPP_TEXT = "Hi TeddyPups! I'd love to know more about your puppies.";

export const mediaUrl = (base: string, path: string): string => `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export function mapMedia(row: MediaRow, base: string): MediaView {
  const video = row.kind === 'video';
  return {
    id: row.id,
    kind: video ? 'video' : 'image',
    src: mediaUrl(base, video ? (row.poster_path ?? row.storage_path) : row.storage_path),
    videoSrc: video ? mediaUrl(base, row.storage_path) : undefined,
    width: row.width ?? 1,
    height: row.height ?? 1,
    alt: row.alt,
    caption: row.caption ?? undefined,
    color: row.color,
    focalX: Number(row.focal_x),
    focalY: Number(row.focal_y),
    durationS: row.duration_s === null ? undefined : Number(row.duration_s),
  };
}

/** Maps a published puppy row and its media to the app's puppy shape, deriving the display strings the pages use. */
export function mapPuppy(row: PuppyRow, media: readonly MediaRow[], base: string): PuppyView {
  const named = Boolean(row.name && row.name.trim());
  const name = named ? (row.name as string) : row.breed;
  const gone = row.status === 'gone_home';
  const sex = SEX_WORD[row.sex];
  const ordered = [...media].sort((a, b) => a.sort_order - b.sort_order);
  const items = ordered.map((m) => mapMedia(m, base));
  const cover = ordered.find((m) => m.is_cover) ?? ordered[0];
  const place = row.origin === 'local' ? 'in Dubai' : 'imported';
  const hasVideo = row.has_video;
  return {
    id: row.id,
    slug: row.slug,
    name,
    hasPersonalName: named,
    breed: row.breed,
    sex: row.sex,
    age: row.age_text,
    colour: row.colour ?? undefined,
    where: row.origin === 'local' ? 'In Dubai' : 'Imported for you',
    origin: row.origin,
    collections: row.collections,
    breeds: row.breeds,
    status: gone ? 'gone-home' : 'available',
    source: gone ? (row.gone_home_source ?? 'TeddyPups') : undefined,
    coverId: cover?.id,
    media: items,
    metaTitle: named ? `${name}, ${row.breed} puppy | TeddyPups U.A.E.` : `${name} puppy (${sex}) | TeddyPups U.A.E.`,
    metaDescription: `Meet ${named ? name : `this ${row.breed}`}: ${row.breed}, ${sex}, ${row.age_text} old, ${place}. Real photos${hasVideo ? ' and video' : ''} from TeddyPups U.A.E.`,
    sectionTag: gone ? 'the day they went home' : undefined,
    enquiryTitle: gone ? 'Looking for a puppy like this?' : named ? `Ask about ${name}` : 'Ask about this puppy',
    enquiryPrefill: named ? `Hi! I'd love to know more about ${name} (${row.breed}).` : `Hi! I'd love to know more about ${name}.`,
    whatsappText: DEFAULT_WHATSAPP_TEXT,
  };
}
