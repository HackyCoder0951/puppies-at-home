import { redirect } from 'next/navigation';
import { getIdentity } from '@composition';
import { adminPaths } from '@nav';
import { signOutAction } from '../actions';

export default async function AdminHome() {
  const staff = await (await getIdentity()).currentStaff();
  if (!staff) redirect(adminPaths.login());
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">TeddyPups admin</h1>
        <form action={signOutAction}><button type="submit" className="adm-btn">Sign out</button></form>
      </header>
      <section className="adm-card">
        <p>Signed in as <strong>{staff.fullName}</strong> ({staff.role === 'super_admin' ? 'Super admin' : 'Operator'}).</p>
        <p className="mt-2 text-sm" style={{ color: 'var(--adm-muted)' }}>Content, enquiries, orders and payments arrive in the next phases.</p>
      </section>
    </main>
  );
}
