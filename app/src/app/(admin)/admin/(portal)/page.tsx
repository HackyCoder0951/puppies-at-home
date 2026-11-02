import { reportingMessage } from '@backend/modules/reporting';
import { getReporting } from '@composition';
import { Dashboard } from './Dashboard';

export default async function AdminHome() {
  const result = await (await getReporting()).stats();
  if (!result.ok) return <p role="alert" className="adm-error">{reportingMessage(result.error)}</p>;
  return <Dashboard stats={result.value} />;
}
