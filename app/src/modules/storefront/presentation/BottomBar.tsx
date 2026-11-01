import { Button } from '@shared/ui';
import { siteSettings } from '../domain';

/** Contact bar fixed to the bottom below 768px. */
export function BottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-3 border-t-2 border-cocoa bg-milk p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <Button href={siteSettings.whatsappUrl} variant="whatsapp" className="h-12 flex-1 text-base" target="_blank" rel="noopener noreferrer">WhatsApp</Button>
      <Button href={siteSettings.phoneHref} variant="ghost" className="h-12 flex-1 text-base">Call</Button>
    </div>
  );
}
