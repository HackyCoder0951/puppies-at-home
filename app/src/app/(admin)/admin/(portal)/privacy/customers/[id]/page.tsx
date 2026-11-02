import { notFound } from 'next/navigation';
import { privacyMessage } from '@backend/modules/privacy';
import { getPrivacy } from '@composition';
import { SubjectTools } from '../SubjectTools';

export default async function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const result = await (await getPrivacy()).subject((await params).id);
  if (!result.ok) {
    if (result.error.code === 'rule') notFound();
    return <p role="alert" className="adm-error">{privacyMessage(result.error)}</p>;
  }
  return <SubjectTools subject={result.value} />;
}
