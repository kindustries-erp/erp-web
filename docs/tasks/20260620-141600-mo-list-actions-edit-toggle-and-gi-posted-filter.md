# Task: Fix MO default filter, action semantics, edit toggle, and GI posted-MO lookup

> **Created:** 2026-06-20
> **Lane:** erp-master
> **Repo:** `liouni-erp-web`
> **Status:** DONE

## Scope

- Remove default date filter from MO list page.
- Show `Delete` for draft MO and `Cancel` for posted/non-draft MO.
- Add top-right edit toggle button in MO detail modal.
- Restrict GI production-order lookup to posted/confirmed MO only.

## Result

- MO list page no longer applies date filter by default and loads all production orders.
- Action dropdown now routes draft MO to delete flow and non-draft MO to cancel flow.
- MO drawer now exposes top-right `Chỉnh sửa` button when opened in view mode with valid update state.
- GI form now loads only confirmed/postable production orders and excludes draft/cancelled entries.

## Evidence target

- Initial MO list loads without dateFrom/dateTo.
- Draft row shows delete behavior; non-draft row shows cancel behavior.
- MO view modal has top-right edit enable action.
- GI production lookup excludes draft MO.

## Verification

- PASS: `bunx tsc --noEmit`
- PASS: `bun run lint:check`
