import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getIdentity } from '@composition';
import { adminPaths } from '@nav';
import { ConfirmTotpForm, DisableTotpForm } from '../../AuthForm';

/** Two-step sign-in set-up. Starting the set-up (a GET with ?setup=1) creates a new unverified factor. */
export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const identity = await getIdentity();
  const state = await identity.mfaState();
  const enrolled = state.factors.length > 0;
  const setup = !enrolled && (await searchParams).setup ? await identity.startTotp() : null;
  if (!(await identity.currentStaff())) redirect(adminPaths.login());
  return (
    <>
      <h2 className="text-lg font-semibold">Two-step sign-in</h2>
      {enrolled ? (
        <>
          <p className="text-sm">An authenticator app is protecting this account.</p>
          <DisableTotpForm />
        </>
      ) : setup?.ok ? (
        <>
          <p className="text-sm">Scan this code with an authenticator app (or type the key), then enter the code it shows.</p>
          <div className="adm-card grid gap-2" role="img" aria-label="QR code for your authenticator app" dangerouslySetInnerHTML={{ __html: setup.value.qrSvg }} />
          <p className="break-all text-sm">Key: <code>{setup.value.secret}</code></p>
          <ConfirmTotpForm factorId={setup.value.factorId} />
        </>
      ) : (
        <Link href={`${adminPaths.security()}?setup=1`} className="adm-btn justify-self-start">Set up an authenticator app</Link>
      )}
      <Link href={adminPaths.home()} className="adm-link text-sm">Back to the portal</Link>
    </>
  );
}
