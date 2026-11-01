'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isActive, menus, paths } from '@nav';
import { Button, Logo, PawIcon, Scallop } from '@shared/ui';
import { cn } from '@shared/lib';
import { siteSettings } from '../domain';
import { MobileMenu } from './MobileMenu';

export function Header() {
  const pathname = usePathname();
  const home = pathname === '/';
  return (
    <header className={cn('sticky top-0 z-40 w-full', home ? 'bg-transparent' : 'bg-milk')}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-full focus:bg-cocoa focus:px-4 focus:py-2 focus:text-milk">
        Skip to content
      </a>
      <div className="mx-auto flex h-[4.75rem] max-w-[110rem] items-center justify-between px-[clamp(1rem,4vw,3.5rem)]">
        <Link href={paths.home()} aria-label="TeddyPups home"><Logo /></Link>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {menus.header.map((m) => {
            const active = isActive(pathname, m.href);
            return (
              <Link
                key={m.key}
                href={m.href}
                aria-current={active ? 'page' : undefined}
                className={cn('group flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold no-underline transition-colors', active ? 'text-toffee-deep' : 'text-cocoa hover:bg-honey-soft')}
              >
                {active && <PawIcon className="size-4" />}
                {m.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block">
            <Button href={siteSettings.whatsappUrl} variant="whatsapp" className="h-11 px-5 text-base" target="_blank" rel="noopener noreferrer">
              WhatsApp us
            </Button>
          </span>
          <MobileMenu />
        </div>
      </div>
      {!home && <Scallop color="var(--color-milk)" className="absolute inset-x-0 top-full" />}
    </header>
  );
}
