import { redirect } from 'next/navigation';
import { commerceMessage } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { adminPaths } from '@nav';
import { OrderForm } from '../OrderForm';

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ customer?: string; puppy?: string; enquiry?: string }> }) {
  const sp = await searchParams;
  if (!sp.customer) redirect(adminPaths.customers());
  const commerce = await getCommerce();
  const [customer, puppies] = await Promise.all([commerce.getCustomerOption(sp.customer), commerce.listSellablePuppies()]);
  if (!customer.ok) return <p role="alert" className="adm-error">{commerceMessage(customer.error)}</p>;
  return <OrderForm customer={customer.value} puppies={puppies.ok ? puppies.value : []} puppyId={sp.puppy} enquiryId={sp.enquiry} />;
}
