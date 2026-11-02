import { privacyMessage } from '@backend/modules/privacy';
import { getPrivacy } from '@composition';
import { IncidentList } from './IncidentList';
import { RequestList } from './RequestList';
import { currentTime } from './now';

export default async function PrivacyPage() {
  const privacy = await getPrivacy();
  const [requests, incidents] = await Promise.all([privacy.requests(), privacy.incidents()]);
  if (!requests.ok) return <p role="alert" className="adm-error">{privacyMessage(requests.error)}</p>;
  const now = currentTime();
  return (
    <main className="grid gap-8">
      <h1 className="text-lg font-semibold">Privacy</h1>
      <RequestList rows={requests.value} now={now} />
      {incidents.ok ? <IncidentList rows={incidents.value} now={now} /> : null}
    </main>
  );
}
