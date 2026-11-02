import { cmsMessage } from '@backend/modules/cms';
import { getCms } from '@composition';
import { PuppyCatalogue } from './PuppyCatalogue';

export default async function PuppiesPage({ searchParams }: { searchParams: Promise<{ filter?: string; view?: string }> }) {
  const sp = await searchParams;
  const result = await (await getCms()).listPuppies();
  if (!result.ok) return <p role="alert" className="adm-error">{cmsMessage(result.error)}</p>;
  return <PuppyCatalogue rows={result.value} filter={sp.filter ?? ''} view={sp.view === 'table' ? 'table' : 'grid'} />;
}
