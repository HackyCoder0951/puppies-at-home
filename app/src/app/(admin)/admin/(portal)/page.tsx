import { reportingMessage } from '@backend/modules/reporting';
import { getReporting } from '@composition';
import { Dashboard } from './Dashboard';

export default async function AdminHome() {
  const reporting = await getReporting();
  const [result, trends] = await Promise.all([reporting.stats(), reporting.trends(14)]);
  if (!result.ok) return <p role="alert" className="adm-error">{reportingMessage(result.error)}</p>;
  return <Dashboard stats={result.value} trends={trends.ok ? trends.value : null} />;
}
