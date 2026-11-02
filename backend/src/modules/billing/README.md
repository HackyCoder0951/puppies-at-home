# billing

Invoices, payments and refunds for the staff portal. VAT is added on top of item prices at the default rate (UAE 5%,
configurable by a super admin) and snapshotted on each order, so an order's total, an invoice and the ledger always agree.

- Invoice lines always come from the order; a draft changes only its due date and notes. Issuing allocates `INV-YYYY-NNNNNN`
  and locks the invoice (a trigger rejects changes). Only a super admin can void, and never an invoice with payments.
- Payments are recorded in a ledger. Manual payments (cash, bank transfer, card machine) are idempotent on their reference,
  cannot exceed the balance, and a received deposit moves a confirmed order to `deposit_paid`. Gateway payments (B9) use the
  same table through a service-role function and the `(gateway, gateway_ref)` unique key.
- Refunds are requested by staff and decided by a super admin; an approved manual refund is recorded as processed and lowers
  the paid amounts and invoice status.
- All derived amounts and statuses come from one database function (`recompute_money`).

Layers: `domain` (types, money), `application` (schemas, use cases over `BillingRepository`), `infrastructure/supabase`, `presentation` (labels).
