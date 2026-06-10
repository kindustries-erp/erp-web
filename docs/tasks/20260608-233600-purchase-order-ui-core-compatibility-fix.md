# Purchase UI -> ERP core purchase-orders compatibility fix

## Scope

Make FE purchase flow usable on `erp-core` with core DB Neon and current backend contracts.

## Problem

Purchase UI (`variant="purchase"`) still builds legacy operational payload fields (`purchase_no`, `document_date`, `supplier_id`, `qty`, `unit_price`, recurrence fields, etc.) and posts them to `/api/v1/purchase-orders`. Current backend core rejects them.

## Planned FE changes

- For purchase variant only, map purchase form payload to core contract or new compatibility contract.
- Keep sales/expenses flows unchanged.
- Ensure purchase list/create/edit UX still works in current operational screen.

## Verification target

- Create purchase order from UI succeeds
- Edit purchase order from UI succeeds
- Purchase list reloads correctly
- Goods receipt page can still lookup purchase orders after create
- Build passes and smoke create flow works
