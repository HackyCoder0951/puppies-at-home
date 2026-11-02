import Link from 'next/link';
import { adminPaths, safeAdminNext } from '@nav';
import { SignInForm } from '../../AuthForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reason?: string }> }) {
  const sp = await searchParams;
  const next = safeAdminNext(sp.next);
  return (
    <>
      {sp.reason ? <p role="status" className="text-sm">{sp.reason === 'idle' ? 'You were signed out after a period of inactivity.' : 'Your session expired. Please sign in again.'}</p> : null}
      <SignInForm next={next} />
      <Link href={adminPaths.forgotPassword()} className="adm-link text-sm">Forgot your password?</Link>
    </>
  );
}
