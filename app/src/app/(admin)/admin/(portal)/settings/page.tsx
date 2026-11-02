import { cmsMessage } from '@backend/modules/cms';
import { getCms } from '@composition';
import { SettingsForms } from './SettingsForms';

export default async function SettingsPage() {
  const cms = await getCms();
  const [settings, testimonial] = await Promise.all([cms.getSettings(), cms.getTestimonial()]);
  if (!settings.ok) return <p role="alert" className="adm-error">{cmsMessage(settings.error)}</p>;
  return <SettingsForms settings={settings.value} testimonial={testimonial.ok ? testimonial.value : null} />;
}
