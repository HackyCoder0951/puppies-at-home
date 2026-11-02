import { reportingMessage } from '@backend/modules/reporting';
import { getReporting } from '@composition';
import { AuditList } from './AuditList';

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ action?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? '1', 10) || 1);
  const result = await (await getReporting()).audit(page, sp.action);
  if (!result.ok) return <p role="alert" className="adm-error">{result.error.code === 'forbidden' ? 'Only a super admin can read the audit log.' : reportingMessage(result.error)}</p>;
  return <AuditList rows={result.value.rows} total={result.value.total} page={page} action={sp.action} />;
}
