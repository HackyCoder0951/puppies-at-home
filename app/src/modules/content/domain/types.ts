export interface Faq {
  readonly question: string;
  readonly answer: string;
}

/** Family photo metadata; the image itself is a placeholder in the mock track. */
export interface FamilyPhoto {
  readonly id: string;
  readonly width: number;
  readonly height: number;
  readonly alt: string;
  readonly caption?: string;
  readonly color: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly attribution: string;
}

export interface SiteSettings {
  readonly whatsappNumber: string;
  readonly whatsappHref: string;
  readonly whatsappText: string;
  readonly phoneHref: string;
  readonly email: string;
  readonly mapsHref: string;
  readonly instagram: string;
  readonly tiktok: string;
  readonly facebook: string;
  readonly address: string;
  readonly contactFormPuppyOptions: readonly string[];
}

/** Builds a WhatsApp link with a prefilled message for the business number. */
export function whatsappLink(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

/** Case-insensitive match over question and answer, used by the FAQ search. */
export function searchFaqs(faqs: readonly Faq[], term: string): Faq[] {
  const t = term.trim().toLowerCase();
  if (!t) return [...faqs];
  return faqs.filter((f) => f.question.toLowerCase().includes(t) || f.answer.toLowerCase().includes(t));
}

export interface Step { readonly title: string; readonly text: string }
export interface Way {
  readonly label: string;
  readonly sub: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly place: string;
  readonly steps: readonly Step[];
}

/** Copy for the How it works page (follows the reference wording). */
export interface HowItWorksCopy {
  readonly intro: string;
  readonly ways: Record<'dubai' | 'imported', Way>;
  readonly promise: readonly Step[];
  readonly deliveryIntro: string;
  readonly delivery: readonly Step[];
  readonly whyIntro: string;
  readonly whyUs: readonly Step[];
  readonly closing: Step;
}
