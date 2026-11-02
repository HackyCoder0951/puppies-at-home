import { billingMessage } from '@backend/modules/billing';
import { cmsMessage } from '@backend/modules/cms';
import { getBilling, getCms } from '@composition';
import { SettingsForms } from './SettingsForms';
import { TaxRateForm } from './TaxRateForm';

export default async function SettingsPage() {
  const cms = await getCms();
  const [settings, testimonial, rates] = await Promise.all([cms.getSettings(), cms.getTestimonial(), (await getBilling()).taxRates()]);
  if (!settings.ok) return <p role="alert" className="adm-error">{cmsMessage(settings.error)}</p>;
  if (!rates.ok) return <p role="alert" className="adm-error">{billingMessage(rates.error)}</p>;
  return (
    <div className="grid gap-6">
      <SettingsForms settings={settings.value} testimonial={testimonial.ok ? testimonial.value : null} />
      <TaxRateForm rates={rates.value} />
    </div>
  );
}
