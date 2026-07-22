# Task: Goods issue draft create and MO warehouse lock hotfix

> **Created:** 2026-06-20
> **Lane:** erp-master
> **Repo:** `liouni-erp-web`
> **Status:** IN_PROGRESS

## Scope

- Align goods-issue drawer payload/UX with API hotfix for production draft/new save.
- Surface production warehouse lock states clearly in GI/GR/MO-linked warehouse UI.
- Disable edit path for warehouse export vouchers attached to a production order when API rule locks them.

## UI target

- Reconcile create/update payload with real API contract.
- Prevent or message forbidden edit/post actions for MO-linked warehouse vouchers.
- Keep reuse-first approach with existing hooks/components.

## Evidence target

- Production GI create/draft no longer 400s on blank-number create flow.
- User cannot re-enter edit mode on locked MO-linked export voucher.
- User sees clear blocker when trying to receipt finished goods before material export completion.

## Verification

- Pending
