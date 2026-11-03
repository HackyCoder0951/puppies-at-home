/** Shapes of the generated knowledge files (docs/02-architecture/27 section 6). Public facts only: no prices, no personal data. */
export interface PuppyDoc {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly hasPersonalName: boolean;
  readonly breed: string;
  readonly breeds: readonly string[];
  readonly sex: 'male' | 'female' | 'male-female';
  readonly age: string;
  readonly colour?: string;
  readonly where: string;
  readonly origin: 'local' | 'imported';
  readonly collections: readonly string[];
  readonly status: 'available' | 'gone-home';
  readonly reserved: boolean;
  readonly hasVideo: boolean;
  readonly pageUrl: string;
  readonly text: string;
}
export interface FaqDoc { readonly id: string; readonly question: string; readonly answer: string }
export type InfoTopic = 'delivery' | 'health' | 'process' | 'visit' | 'imports' | 'general';
export interface InfoDoc { readonly id: string; readonly topic: InfoTopic; readonly title: string; readonly text: string }
export interface SettingsDoc {
  readonly whatsappNumber: string;
  readonly whatsappUrl: string;
  readonly contactFormUrl: string;
  readonly phoneDisplay: string;
  readonly email: string;
  readonly address: string;
  readonly mapsUrl: string;
  readonly instagram: string;
  readonly tiktok: string;
}
export interface KnowledgeData {
  readonly version: string;
  readonly puppies: readonly PuppyDoc[];
  readonly goneHome: readonly PuppyDoc[];
  readonly faqs: readonly FaqDoc[];
  readonly info: readonly InfoDoc[];
  readonly settings: SettingsDoc;
}

export interface PuppyQuery {
  readonly breed?: string;
  readonly sex?: 'male' | 'female';
  readonly origin?: 'local' | 'imported';
  readonly collection?: 'korean-teacup';
  readonly text?: string;
}
/** Ranking weights the policy layer may tune later; defaults below. */
export interface RankingWeights { readonly filter: number; readonly bm25: number; readonly availability: number; readonly recency: number }
export const DEFAULT_WEIGHTS: RankingWeights = { filter: 1, bm25: 1, availability: 0.5, recency: 0.1 };

export interface InfoHit { readonly id: string; readonly kind: 'faq' | 'info'; readonly title: string; readonly text: string; readonly score: number }
