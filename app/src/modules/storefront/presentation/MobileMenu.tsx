'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { menus } from '@nav';
import { Button } from '@shared/ui';
import { siteSettings } from '../domain';

/** Menu overlay below 1024px: native dialog gives the focus trap and Esc; the reveal is a CSS circle. */
export function MobileMenu() {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <Button variant="ghost" className="h-11 px-5 text-base" aria-haspopup="dialog" onClick={() => ref.current?.showModal()}>
        Menu
      </Button>
      <dialog
        ref={ref}
        aria-label="Site menu"
        className="m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-milk p-0 backdrop:bg-transparent open:animate-[menu-reveal_0.45s_var(--ease-out-soft)]"
        onClick={(e) => e.target === ref.current && ref.current?.close()}
      >
        <div className="flex h-full flex-col gap-6 p-6">
          <div className="flex justify-end">
            <Button variant="ghost" className="h-11 px-5 text-base" onClick={() => ref.current?.close()}>Close</Button>
          </div>
          <nav aria-label="Mobile">
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {[{ key: 'home', label: 'Home', href: '/' }, ...menus.header].map((m) => (
                <li key={m.key}>
                  <Link href={m.href} className="block py-2 font-[family-name:var(--font-display)] text-4xl font-extrabold text-cocoa no-underline">
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button href={siteSettings.whatsappUrl} variant="whatsapp" target="_blank" rel="noopener noreferrer">Chat on WhatsApp</Button>
        </div>
      </dialog>
    </div>
  );
}
