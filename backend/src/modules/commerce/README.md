# commerce

Orders and deliveries for the staff portal. An order links a customer and (usually) one puppy, holds priced items, and
moves through `new, confirmed, deposit_paid, preparing, in_transit, delivered, completed` or `cancelled`. Deliveries
(showroom pickup, Dubai delivery, international cargo) move through their own states with a customer-facing event trail.

All writes go through database functions (`create_order`, `set_order_items`, `update_order`, `transition_order`,
`create_delivery`, `update_delivery`, `transition_delivery`) that check permissions; triggers validate every status move
and write the timeline, so no path can skip the state machine. Creating an order reserves the puppy, cancelling releases
it, delivering marks it gone home. Money is stored in minor units (fils); `paid_minor` is maintained by billing (B7).

- `domain`: statuses, UI transition hints, money helpers.
- `application`: input schemas, use cases over `CommerceRepository`.
- `infrastructure/supabase`: adapter over the staff session client.
- `presentation`: labels and messages.
