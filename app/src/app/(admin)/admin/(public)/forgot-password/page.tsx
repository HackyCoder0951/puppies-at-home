import Link from 'next/link';
import { adminPaths } from '@nav';
import { ForgotPasswordForm } from '../../AuthForm';

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordForm />
      <Link href={adminPaths.login()} className="adm-link text-sm">Back to sign in</Link>
    </>
  );
}
