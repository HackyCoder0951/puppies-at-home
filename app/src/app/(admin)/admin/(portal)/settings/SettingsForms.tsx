import type { TestimonialAdmin } from '@backend/modules/cms';
import { saveSettingsAction, saveTestimonialAction } from '../actions';
import { ActionForm, TextField } from '../ActionForm';

export function SettingsForms({ settings: s, testimonial: t }: { settings: Record<string, string>; testimonial: TestimonialAdmin | null }) {
  return (
    <main className="grid gap-6">
      <section className="adm-card grid gap-4" aria-labelledby="contact">
        <h1 id="contact" className="text-lg font-semibold">Contact details</h1>
        <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Shown on the public site. Only a super admin can save changes.</p>
        <ActionForm action={saveSettingsAction} submitLabel="Save contact details">
          <TextField name="whatsapp_number" label="WhatsApp number (digits, with country code)" defaultValue={s.whatsapp_number} />
          <TextField name="whatsapp_text" label="Prefilled WhatsApp message" defaultValue={s.whatsapp_text} />
          <TextField name="phone_href" label="Phone link" defaultValue={s.phone_href} hint="For example tel:+971541676733" />
          <TextField name="email" label="Email" type="email" defaultValue={s.email} />
          <TextField name="address" label="Address" defaultValue={s.address} />
          <TextField name="maps_href" label="Maps link" type="url" defaultValue={s.maps_href} />
          <TextField name="instagram" label="Instagram link" type="url" defaultValue={s.instagram} />
          <TextField name="tiktok" label="TikTok link" type="url" defaultValue={s.tiktok} />
          <TextField name="facebook" label="Facebook link" type="url" defaultValue={s.facebook} />
        </ActionForm>
      </section>
      <section className="adm-card grid gap-4" aria-labelledby="testimonial">
        <h2 id="testimonial" className="text-lg font-semibold">Featured testimonial</h2>
        <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Use a real family&apos;s words only with their written permission; do not add names beyond what they approved.</p>
        <ActionForm action={saveTestimonialAction} submitLabel="Save testimonial">
          <div className="grid gap-1">
            <label htmlFor="quote" className="text-sm font-medium">Quote</label>
            <textarea id="quote" name="quote" defaultValue={t?.quote} required rows={4} className="adm-input" />
          </div>
          <TextField name="author" label="Attribution" defaultValue={t?.author} />
          <TextField name="location" label="Place" defaultValue={t?.location} required={false} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="publish" defaultChecked={Boolean(t?.publishedAt)} /> Show on the public site</label>
        </ActionForm>
      </section>
    </main>
  );
}
