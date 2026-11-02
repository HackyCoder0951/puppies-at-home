export type Sex = 'male' | 'female' | 'male-female';
export type PuppyStatus = 'available' | 'gone-home';
export type Origin = 'local' | 'imported';
export type MediaKind = 'image' | 'video';

/** `src` is always a still image (the poster for videos); `videoSrc` is the video file when kind is video. */
export interface Media {
  readonly id: string;
  readonly kind: MediaKind;
  readonly src: string;
  readonly videoSrc?: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
  readonly color: string;
  readonly focalX?: number;
  readonly focalY?: number;
  readonly durationS?: number;
}

export interface Puppy {
  readonly id: string;
  readonly slug: string;
  /** Display name: the personal name, or the breed when the puppy has none. */
  readonly name: string;
  readonly hasPersonalName: boolean;
  readonly breed: string;
  readonly sex: Sex;
  /** Free text exactly as shown, for example "3 months Maltipoo & 2 months Cavapoo". */
  readonly age: string;
  readonly colour?: string;
  readonly where: string;
  readonly origin: Origin;
  readonly collections: readonly string[];
  readonly breeds: readonly string[];
  readonly status: PuppyStatus;
  /** Available but held for an order (shown with a "reserved" label). */
  readonly reserved?: boolean;
  /** Gone-home puppies only: "TeddyPups" or "Dubai showroom". */
  readonly source?: string;
  readonly coverId?: string;
  readonly media: readonly Media[];
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly sectionTag?: string;
  readonly enquiryTitle: string;
  readonly enquiryPrefill: string;
  readonly whatsappText: string;
}

export const SEX_LABEL: Record<Sex, string> = { male: 'Boy', female: 'Girl', 'male-female': 'Boy & girl' };

export const SEX_WORD: Record<Sex, string> = { male: 'boy', female: 'girl', 'male-female': 'boy & girl' };

/** Short description used on cards and doors, for example "Maltipoo, boy, 3 months, with video". */
export const puppyCaption = (p: Puppy): string =>
  [p.hasPersonalName ? p.breed : null, SEX_WORD[p.sex], p.age, p.media.some((m) => m.kind === 'video') ? 'with video' : null, p.reserved ? 'reserved' : null]
    .filter(Boolean)
    .join(', ');

/** Pre-filled WhatsApp message for a puppy page (wording follows the reference). */
export function puppyWhatsappText(p: Puppy, url: string): string {
  if (p.status === 'gone-home') return `Hi TeddyPups! I loved ${p.hasPersonalName ? p.name : `the ${p.breed}`} (${url}). Do you have a puppy like them?`;
  return p.hasPersonalName
    ? `Hi TeddyPups! I'm interested in ${p.name}, the ${p.breed}: ${url}`
    : `Hi TeddyPups! I'm interested in the ${p.name} (${SEX_WORD[p.sex]}): ${url}`;
}

export const objectPosition = (m: Media): string => `${((m.focalX ?? 0.5) * 100).toFixed(1)}% ${((m.focalY ?? 0.5) * 100).toFixed(1)}%`;

export const cover = (p: Puppy): Media | undefined => p.media.find((m) => m.id === p.coverId) ?? p.media[0];
