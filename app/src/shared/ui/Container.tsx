import type { ElementType, ReactNode } from 'react';
import { cn } from '@shared/lib';

export function Container({ as: Tag = 'div', className, children }: { as?: ElementType; className?: string; children: ReactNode }) {
  return <Tag className={cn('mx-auto w-full max-w-(--container-site) px-5 md:px-10 xl:px-16', className)}>{children}</Tag>;
}
