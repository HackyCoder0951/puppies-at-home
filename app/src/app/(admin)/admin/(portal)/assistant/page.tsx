import { reportingMessage } from '@backend/modules/reporting';
import { getReporting } from '@composition';
import { AssistantOverview } from './AssistantOverview';

export default async function AssistantPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const days = [7, 30, 90].includes(Number(((await searchParams).days))) ? Number((await searchParams).days) : 30;
  const result = await (await getReporting()).assistant(days);
  if (!result.ok) return <p role="alert" className="adm-error">{result.error.code === 'forbidden' ? 'Only a super admin can review the assistant.' : reportingMessage(result.error)}</p>;
  return <AssistantOverview data={result.value} />;
}
