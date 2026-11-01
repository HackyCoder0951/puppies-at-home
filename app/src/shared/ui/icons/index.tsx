import type { ReactNode, SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { title?: string };

function Icon({ title, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} {...props}>
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export const PawIcon = (p: IconProps) => (
  <Icon {...p}><circle cx="6" cy="10" r="2" /><circle cx="10" cy="6" r="2" /><circle cx="14" cy="6" r="2" /><circle cx="18" cy="10" r="2" /><path d="M12 12c-3 0-5 3-5 5.5 0 1.6 1.4 2.5 3 2.5 1 0 1.3-.4 2-.4s1 .4 2 .4c1.6 0 3-.9 3-2.5C17 15 15 12 12 12z" /></Icon>
);
export const HeartIcon = (p: IconProps) => (<Icon {...p}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></Icon>);
export const ShieldIcon = (p: IconProps) => (<Icon {...p}><path d="M12 3l7 3v6c0 4.4-3 7.5-7 9-4-1.5-7-4.6-7-9V6l7-3z" /><path d="M9 12l2 2 4-4" /></Icon>);
export const TruckIcon = (p: IconProps) => (<Icon {...p}><path d="M3 6h11v10H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></Icon>);
export const ChatIcon = (p: IconProps) => (<Icon {...p}><path d="M4 5h16v11H9l-5 4V5z" /></Icon>);
export const CalendarIcon = (p: IconProps) => (<Icon {...p}><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></Icon>);
export const PinIcon = (p: IconProps) => (<Icon {...p}><path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z" /><circle cx="12" cy="10" r="2" /></Icon>);
