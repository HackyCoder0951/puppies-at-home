export const slugify = (value: string): string =>
  value.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const SEX_SLUG = { male: 'male', female: 'female', 'male-female': 'pair' } as const;

/** Slug candidate for a puppy: breed, personal name when present, sex (`maltipoo-max-male`). */
export function puppySlug(input: { name: string | null; breed: string; sex: keyof typeof SEX_SLUG }): string {
  return slugify([input.breed, input.name, SEX_SLUG[input.sex]].filter(Boolean).join(' ')) || 'puppy';
}
