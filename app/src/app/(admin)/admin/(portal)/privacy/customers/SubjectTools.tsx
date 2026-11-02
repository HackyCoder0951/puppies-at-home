import { CONSENT_LABEL, type SubjectInfo } from '@backend/modules/privacy';
import { adminPaths } from '@nav';
import { anonymiseAction, restrictAction, withdrawConsentAction } from '../../privacy-actions';
import { ActionForm, TextField } from '../../ActionForm';

export function SubjectTools({ subject: s }: { subject: SubjectInfo }) {
  return (
    <main className="grid gap-6">
      <section className="adm-card grid gap-2" aria-labelledby="who">
        <h1 id="who" className="text-lg font-semibold">Privacy tools: {s.fullName}</h1>
        <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>{s.anonymised ? 'This record is anonymised.' : s.restricted ? 'Processing is restricted: no messages are sent.' : 'Processing is normal.'}</p>
        {s.anonymised ? null : <a href={adminPaths.privacyExport(s.id)} className="adm-link">Download everything we hold (JSON, audited)</a>}
      </section>
      {s.anonymised ? null : (
        <>
          <section className="adm-card grid gap-3" aria-labelledby="restrict">
            <h2 id="restrict" className="font-medium">Restrict processing</h2>
            <ActionForm action={restrictAction.bind(null, s.id, !s.restricted)} submitLabel={s.restricted ? 'Lift the restriction' : 'Restrict processing'} className="grid"><span /></ActionForm>
          </section>
          <section className="adm-card grid gap-3" aria-labelledby="consents">
            <h2 id="consents" className="font-medium">Consents</h2>
            {s.consents.length === 0 ? <p className="text-sm">None recorded.</p> : null}
            {s.consents.map((c) => (
              <div key={`${c.purpose}-${c.givenAt}`} className="grid gap-2 text-sm">
                <span>{CONSENT_LABEL[c.purpose] ?? c.purpose}: given {new Date(c.givenAt).toLocaleDateString('en-GB')}{c.withdrawnAt ? `, withdrawn ${new Date(c.withdrawnAt).toLocaleDateString('en-GB')}` : ''}</span>
                {c.withdrawnAt ? null : <ActionForm action={withdrawConsentAction.bind(null, s.id, c.purpose)} submitLabel="Withdraw" className="grid"><span /></ActionForm>}
              </div>
            ))}
          </section>
          <section className="adm-card grid gap-3" aria-labelledby="erase">
            <h2 id="erase" className="font-medium">Erase (anonymise)</h2>
            <p className="text-sm" style={{ color: 'var(--adm-muted)' }}>Removes contact details, notes, message text, delivery addresses and order free text. Orders, invoices and payments stay because the law requires them. Super admins only. This cannot be undone: export first if the person asked for a copy.</p>
            <ActionForm action={anonymiseAction.bind(null, s.id)} submitLabel="Anonymise permanently" className="grid gap-3 sm:grid-cols-2">
              <TextField name="confirm" label={`Type "${s.fullName}" to confirm`} />
              <TextField name="requestId" label="Request id (to record the exception)" required={false} />
            </ActionForm>
          </section>
        </>
      )}
    </main>
  );
}
