import { getIdentity, getStaffAdmin } from '@composition';
import { StaffList } from './StaffList';

export default async function StaffPage() {
  const [list, me] = await Promise.all([getStaffAdmin().then((a) => a.list()), getIdentity().then((i) => i.currentStaff())]);
  if (!list.ok) return <p role="alert" className="adm-error">Only a super admin can manage staff.</p>;
  return <StaffList rows={list.value} self={me?.userId ?? ''} />;
}
