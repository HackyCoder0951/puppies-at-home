export type Sex = 'male' | 'female' | 'male-female';
export type PuppyStatus = 'available' | 'gone-home';
export type Origin = 'local' | 'imported';
export type MediaKind = 'image' | 'video';

/** Media metadata only; the UI renders placeholders from `color`, size and `alt` (decision D13). */
export interface Media {
  readonly id: string;
  readonly kind: MediaKind;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
  readonly color: string;
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

export const cover = (p: Puppy): Media | undefined => p.media.find((m) => m.id === p.coverId) ?? p.media[0];
