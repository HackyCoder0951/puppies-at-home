/* eslint-disable @next/next/no-img-element */
'use client';
import type React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const WA = "https://wa.me/971541676733?text=Hi%20TeddyPups!%20I'd%20love%20to%20know%20more%20about%20your%20puppies.";
const PAW = "M32 30.5c-7.6 0-15.6 8.3-15.6 15.5 0 5.4 4.2 8.3 9.2 8.3 2.6 0 4.5-1.1 6.4-1.1s3.8 1.1 6.4 1.1c5 0 9.2-2.9 9.2-8.3 0-7.2-8-15.5-15.6-15.5zM19.28 26.71C21.07 30.08 20.42 33.92 17.84 35.29C15.25 36.67 11.71 35.05 9.92 31.69C8.13 28.32 8.78 24.48 11.36 23.11C13.95 21.73 17.49 23.35 19.28 26.71ZM29.62 15.64C30.32 19.62 28.46 23.26 25.47 23.79C22.48 24.32 19.48 21.53 18.78 17.56C18.08 13.58 19.94 9.94 22.93 9.41C25.92 8.88 28.92 11.67 29.62 15.64ZM45.22 17.56C44.52 21.53 41.52 24.32 38.53 23.79C35.54 23.26 33.68 19.62 34.38 15.64C35.08 11.67 38.08 8.88 41.07 9.41C44.06 9.94 45.92 13.58 45.22 17.56ZM54.08 31.69C52.29 35.05 48.75 36.67 46.16 35.29C43.58 33.92 42.93 30.08 44.72 26.71C46.51 23.35 50.05 21.73 52.64 23.11C55.22 24.48 55.87 28.32 54.08 31.69Z";
const NAV = [
  { href: '/', label: 'Home' },
  { href: '/puppies', label: 'Puppies' },
  { href: '/happy-families', label: 'Happy families' },
  { href: '/how-it-works', label: 'How it works' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Visit & contact' },
];

const Paw = () => (
  <svg viewBox="0 0 64 64" className="tp-nav-link__paw" aria-hidden="true" fill="currentColor"><path d={PAW}></path></svg>
);

/** Fixed header: hides on scroll down, shows a hem when scrolled; menu is a native dialog. */
export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const home = pathname === '/';
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/'));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let prev = scrollY;
    let queued = false;
    const tick = () => {
      const y = scrollY;
      el.dataset.scrolled = y > 8 ? 'true' : 'false';
      if (Math.abs(y - prev) > 6) { el.dataset.hidden = y > prev && y > 220 ? 'true' : 'false'; prev = y; }
      queued = false;
    };
    const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(tick); } };
    const show = () => { el.dataset.hidden = 'false'; };
    tick();
    addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('focusin', show);
    const close = () => dlg.current?.close();
    addEventListener('tp:navigate', close);
    return () => { removeEventListener('scroll', onScroll); el.removeEventListener('focusin', show); removeEventListener('tp:navigate', close); };
  }, []);

  const closeMenu = () => {
    const d = dlg.current;
    if (!d?.open || d.dataset.closing) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return d.close();
    d.dataset.closing = 'true';
    const done = () => { clearTimeout(t); d.removeEventListener('animationend', onEnd); if (d.dataset.closing) d.close(); };
    const onEnd = (e: Event) => { if (e.target === d) done(); };
    const t = setTimeout(done, 600);
    d.addEventListener('animationend', onEnd);
  };

  return (
    <header ref={ref} id="site-header" data-scrolled="false" data-hidden="false" data-home={home || undefined} className="tp-header fixed inset-x-0 top-0 z-50"><div className="tp-header__bar gutter"><Link className="tp-header__brand" aria-label="TeddyPups U.A.E. — home" href="/"><img alt="" width="56" height="56" className="tp-header__logo" style={{"color": "transparent"} as React.CSSProperties} src="/brand/logo.png" /><span className="font-plush tp-header__name">TeddyPups</span></Link><nav aria-label="Main" className="tp-header__nav"><ul>{NAV.map((n) => (<li key={n.href}><Link {...(isActive(n.href) ? { "aria-current": "page" as const } : {})} data-active={isActive(n.href)} className="tp-nav-link" href={n.href}><span>{n.label}</span><Paw /></Link></li>))}</ul></nav><div className="tp-header__end"><a href={WA} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp tp-header__wa">WhatsApp us</a><button type="button" className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-cocoa bg-milk px-4 text-[0.95rem] font-semibold lg:hidden" aria-haspopup="dialog" onClick={() => dlg.current?.showModal()}><svg viewBox="0 0 64 64" className="size-4" aria-hidden="true" fill="currentColor"><path d={PAW}></path></svg>Menu</button><dialog ref={dlg} onClick={(e) => e.target === dlg.current && closeMenu()} onCancel={(e) => { e.preventDefault(); closeMenu(); }} onClose={(e) => delete e.currentTarget.dataset.closing} aria-label="Site menu" className="tp-menu m-0 h-dvh max-h-none w-screen max-w-none bg-honey p-0 text-cocoa backdrop:bg-cocoa/40"><div className="flex h-full flex-col gutter pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-5"><div className="flex items-center justify-between"><span className="font-scrawl text-lg">where to, friend?</span><button type="button" onClick={closeMenu} className="h-11 rounded-full bg-cocoa px-5 font-semibold text-milk">Close</button></div><nav aria-label="Mobile" className="mt-10 flex-1"><ul className="space-y-1">{NAV.map((n) => (<li key={n.href}><Link {...(isActive(n.href) ? { "aria-current": "page" as const } : {})} data-active={isActive(n.href)} className="tp-menu-link font-plush block py-2 text-[clamp(2.4rem,11vw,3.4rem)]" href={n.href}><span>{n.label}</span><Paw /></Link></li>))}</ul></nav><div className="space-y-3"><a href={WA} className="btn btn-whatsapp w-full" target="_blank" rel="noopener noreferrer">WhatsApp us</a><p className="text-center text-sm font-medium">+971 54 167 6733</p></div></div></dialog></div></div><svg aria-hidden="true" className="tp-header__hem" width="100%" height="14" preserveAspectRatio="none"><defs><pattern id="tp-hem" width="44" height="14" patternUnits="userSpaceOnUse"><path d="M0 0H44V2A22 11 0 0 1 0 2Z" className="tp-header__hem-fill"></path><path d="M0 2A22 11 0 0 0 44 2" className="tp-header__hem-line"></path></pattern></defs><rect width="100%" height="14" fill="url(#tp-hem)"></rect></svg></header>
  );
}
