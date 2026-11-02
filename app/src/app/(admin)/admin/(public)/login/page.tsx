import Link from 'next/link';
import { adminPaths, safeAdminNext } from '@nav';
import { SignInForm } from '../../AuthForm';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeAdminNext((await searchParams).next);
  return (
    <>
      <SignInForm next={next} />
      <Link href={adminPaths.forgotPassword()} className="adm-link text-sm">Forgot your password?</Link>
    </>
  );
}
