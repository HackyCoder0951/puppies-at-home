import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@shared/lib';

export type ButtonVariant = 'primary' | 'ghost' | 'whatsapp' | 'ghost-on-dark';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-toffee-deep text-milk shadow-(--shadow-button) hover:-translate-y-0.5',
  whatsapp: 'bg-whatsapp text-milk shadow-(--shadow-button) hover:-translate-y-0.5',
  ghost: 'bg-transparent text-cocoa border-2 border-cocoa hover:bg-honey-soft',
  'ghost-on-dark': 'bg-transparent text-milk border-2 border-milk hover:bg-milk/15',
};

const base =
  'inline-flex h-[52px] items-center justify-center gap-2 rounded-full px-7 text-[17px] font-[650] no-underline transition-transform duration-200 ease-(--ease-bounce) active:translate-y-1 active:shadow-none';

interface CommonProps {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

type AsLink = CommonProps & { href: string } & Omit<ComponentProps<typeof Link>, 'href' | 'className' | 'children'>;
type AsButton = CommonProps & { href?: undefined } & Omit<ComponentProps<'button'>, 'className' | 'children'>;

export function Button(props: AsLink | AsButton) {
  const { variant = 'primary', className, children, ...rest } = props;
  const classes = cn(base, variants[variant], className);
  if (typeof rest.href === 'string') {
    return (
      <Link {...(rest as Omit<AsLink, keyof CommonProps>)} className={classes}>
        {children}
      </Link>
    );
  }
  const buttonProps = rest as Omit<AsButton, keyof CommonProps>;
  return (
    <button type="button" {...buttonProps} className={classes}>
      {children}
    </button>
  );
}
