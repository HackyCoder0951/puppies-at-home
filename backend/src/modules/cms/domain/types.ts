export interface PuppyAdminRow {
  readonly id: string;
  readonly slug: string;
  readonly name: string | null;
  readonly breed: string;
  readonly sex: 'male' | 'female' | 'male-female';
  readonly ageText: string;
  readonly origin: 'local' | 'imported';
  readonly status: 'available' | 'reserved' | 'gone_home';
  readonly publishedAt: string | null;
  readonly coverUrl: string | null;
  readonly deleted: boolean;
}

export interface MediaAdminRow {
  readonly id: string;
  readonly kind: 'photo' | 'video';
  readonly url: string;
  readonly alt: string;
  readonly isCover: boolean;
  readonly sortOrder: number;
}

export interface PuppyAdminDetail extends PuppyAdminRow {
  readonly breeds: readonly string[];
  readonly collections: readonly string[];
  readonly colour: string | null;
  readonly priceAed: number | null;
  readonly goneHomeSource: string | null;
  readonly media: readonly MediaAdminRow[];
}

export interface FaqAdminRow {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly publishedAt: string | null;
}

export interface TestimonialAdmin {
  readonly id: string;
  readonly quote: string;
  readonly author: string;
  readonly location: string | null;
  readonly publishedAt: string | null;
}
