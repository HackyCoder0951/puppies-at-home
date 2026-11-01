/** Temporary inline settings (F2). Replaced by the content module's settings fixture in F3. */
export interface SiteSettings {
  readonly phoneDisplay: string;
  readonly phoneHref: string;
  readonly whatsappUrl: string;
  readonly email: string;
  readonly address: string;
  readonly instagram: string;
  readonly tiktok: string;
}

export const siteSettings: SiteSettings = {
  phoneDisplay: '+971 54 167 6733',
  phoneHref: 'tel:+971541676733',
  whatsappUrl: "https://wa.me/971541676733?text=Hi%20TeddyPups!%20I'd%20love%20to%20know%20more%20about%20your%20puppies.",
  email: 'teddypupsadmin@gmail.com',
  address: 'Downtown Dubai, United Arab Emirates',
  instagram: 'https://www.instagram.com/teddypups.worldwide/',
  tiktok: 'https://www.tiktok.com/@teddypupsuae',
};
