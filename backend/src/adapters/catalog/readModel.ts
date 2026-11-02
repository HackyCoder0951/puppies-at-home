/**
 * Read model returned to the app's `catalog` module. It mirrors the app's `Puppy` and `Media` shapes on purpose
 * (anti-corruption layer): the backend never imports from `app/`, and TypeScript checks the match structurally where
 * the app's composition root wires the adapter to its port.
 */
export interface MediaView {
  readonly id: string;
  readonly kind: 'image' | 'video';
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

export interface PuppyView {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly hasPersonalName: boolean;
  readonly breed: string;
  readonly sex: 'male' | 'female' | 'male-female';
  readonly age: string;
  readonly colour?: string;
  readonly where: string;
  readonly origin: 'local' | 'imported';
  readonly collections: readonly string[];
  readonly breeds: readonly string[];
  readonly status: 'available' | 'gone-home';
  readonly source?: string;
  readonly coverId?: string;
  readonly media: readonly MediaView[];
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly sectionTag?: string;
  readonly enquiryTitle: string;
  readonly enquiryPrefill: string;
  readonly whatsappText: string;
}
