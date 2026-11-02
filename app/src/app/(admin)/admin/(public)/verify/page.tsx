import { safeAdminNext } from '@nav';
import { VerifyForm } from '../../AuthForm';

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <>
      <p className="text-sm">Open your authenticator app and enter the six-digit code.</p>
      <VerifyForm next={safeAdminNext((await searchParams).next)} />
    </>
  );
}
