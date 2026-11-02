import Link from 'next/link';
import { adminPaths } from '@nav';

export default function AdminNotFound() {
  return (
    <main className="adm-card mx-auto my-16 grid max-w-md gap-3 text-center">
      <h1 className="adm-title">That page does not exist</h1>
      <Link href={adminPaths.home()} className="adm-link">Back to the overview</Link>
    </main>
  );
}
