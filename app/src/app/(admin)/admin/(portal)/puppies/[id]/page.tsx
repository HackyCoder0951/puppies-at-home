import { notFound } from 'next/navigation';
import { cmsMessage } from '@backend/modules/cms';
import { getCms } from '@composition';
import { PuppyEditor } from './PuppyEditor';

export default async function PuppyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await (await getCms()).getPuppy(id);
  if (!result.ok) {
    if (result.error.code === 'not-found') notFound();
    return <p role="alert" className="adm-error">{cmsMessage(result.error)}</p>;
  }
  return <PuppyEditor puppy={result.value} />;
}
