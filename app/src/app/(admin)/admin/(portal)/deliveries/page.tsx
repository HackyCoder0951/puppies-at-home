import Link from 'next/link';
import { commerceMessage, DELIVERY_METHOD_LABEL, DELIVERY_STATUS_LABEL } from '@backend/modules/commerce';
import { getCommerce } from '@composition';
import { adminPaths } from '@nav';

export default async function DeliveriesPage() {
  const result = await (await getCommerce()).listOpenDeliveries();
  if (!result.ok) return <p role="alert" className="adm-error">{commerceMessage(result.error)}</p>;
  return (
    <main className="grid gap-4">
      <h1 className="text-lg font-semibold">Open deliveries</h1>
      {result.value.length === 0 ? <p className="adm-card text-sm">Nothing is waiting for delivery.</p> : null}
      <ul className="grid gap-3">
        {result.value.map((d) => (
          <li key={d.id} className="adm-card grid gap-1">
            <Link href={adminPaths.order(d.orderId)} className="adm-link font-medium">{d.orderNumber} · {d.customerName}</Link>
            <span className="text-sm" style={{ color: 'var(--adm-muted)' }}>{DELIVERY_METHOD_LABEL[d.method]} · {DELIVERY_STATUS_LABEL[d.status]}{d.eta ? ` · ETA ${d.eta}` : ''}{d.carrier ? ` · ${d.carrier}` : ''}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
