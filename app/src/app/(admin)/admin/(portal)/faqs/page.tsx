import { cmsMessage } from '@backend/modules/cms';
import { getCms } from '@composition';
import { faqStatusAction, saveFaqAction } from '../actions';
import { ActionForm, ChangeButton, TextField } from '../ActionForm';

export default async function FaqsPage() {
  const result = await (await getCms()).listFaqs();
  if (!result.ok) return <p role="alert" className="adm-error">{cmsMessage(result.error)}</p>;
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">FAQs</h1>
      {result.value.map((f) => (
        <section key={f.id} className="adm-card grid gap-3" aria-label={f.question}>
          <ActionForm action={saveFaqAction.bind(null, f.id)} submitLabel="Save">
            <TextField name="question" label="Question" defaultValue={f.question} />
            <div className="grid gap-1">
              <label htmlFor={`answer-${f.id}`} className="text-sm font-medium">Answer</label>
              <textarea id={`answer-${f.id}`} name="answer" defaultValue={f.answer} required rows={4} className="adm-input" />
            </div>
          </ActionForm>
          <ActionForm action={faqStatusAction.bind(null, f.id)} className="flex flex-wrap items-center gap-3">
            {f.publishedAt ? <ChangeButton value="unpublish">Unpublish</ChangeButton> : <ChangeButton value="publish">Publish</ChangeButton>}
            <ChangeButton value="delete" danger>Delete</ChangeButton>
          </ActionForm>
        </section>
      ))}
      <section className="adm-card grid gap-3" aria-labelledby="new-faq">
        <h2 id="new-faq" className="font-medium">Add a question</h2>
        <ActionForm action={saveFaqAction.bind(null, null)} submitLabel="Add (saved as a draft)">
          <TextField name="question" label="Question" />
          <div className="grid gap-1">
            <label htmlFor="answer-new" className="text-sm font-medium">Answer</label>
            <textarea id="answer-new" name="answer" required rows={4} className="adm-input" />
          </div>
        </ActionForm>
      </section>
    </main>
  );
}
