import { createPuppyAction } from '../../actions';
import { ActionForm } from '../../ActionForm';
import { PuppyFields } from '../PuppyFields';

export default function NewPuppyPage() {
  return (
    <main className="adm-card grid gap-4">
      <h1 className="text-lg font-semibold">Add a puppy</h1>
      <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>It is saved as a draft. Add photos, then publish.</p>
      <ActionForm action={createPuppyAction} submitLabel="Create draft"><PuppyFields /></ActionForm>
    </main>
  );
}
