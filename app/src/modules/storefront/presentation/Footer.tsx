import Link from 'next/link';
import { menus } from '@nav';
import { Mascot, Wave } from '@shared/ui';
import { siteSettings } from '../domain';

export function Footer() {
  const link = 'text-milk/90 no-underline hover:text-honey hover:underline';
  const label = 'mb-3 font-[family-name:var(--font-hand)] text-lg font-medium text-honey';
  return (
    <footer className="mt-auto bg-night text-milk/80">
      <Wave color="var(--color-night)" className="-mt-14 md:-mt-20" />
      <div className="mx-auto grid max-w-[110rem] gap-10 px-[clamp(1rem,4vw,3.5rem)] pb-24 pt-6 md:grid-cols-3 md:pb-14">
        <div>
          <p className="font-[family-name:var(--font-display)] text-3xl font-black text-milk">TeddyPups U.A.E.</p>
          <p className="mt-3 max-w-sm">Premium teacup and teddy bear puppies, raised with love and brought home to you in Dubai.</p>
          <Mascot className="mt-4 size-24" title="Mascot with a basket" />
        </div>
        <nav aria-label="Explore">
          <p className={label}>Explore</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {menus.footerExplore.map((m) => (
              <li key={m.label}><Link href={m.href} className={link}>{m.label}</Link></li>
            ))}
          </ul>
        </nav>
        <div>
          <p className={label}>Say hello</p>
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            <li><a href={siteSettings.phoneHref} className={link}>{siteSettings.phoneDisplay}</a></li>
            <li><a href={`mailto:${siteSettings.email}`} className={link}>{siteSettings.email}</a></li>
            <li>{siteSettings.address}</li>
            <li className="flex gap-3 pt-1">
              <a href={siteSettings.instagram} className={link} target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href={siteSettings.tiktok} className={link} target="_blank" rel="noopener noreferrer">TikTok</a>
            </li>
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-milk/20 pt-6 md:col-span-3">
          <p className="font-[family-name:var(--font-hand)] text-honey">every puppy is family</p>
          <ul className="m-0 flex list-none gap-4 p-0 text-sm">
            {menus.legal.map((m) => (<li key={m.key}><Link href={m.href} className={link}>{m.label}</Link></li>))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
