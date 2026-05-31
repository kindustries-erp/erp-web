# Task: ERP Manufacturing Components + Stock FE

## Request Input

- Type: FEATURE
- Mục tiêu: Thêm page danh mục linh kiện với table action-first, search/filter/dropdown reusable, modal create/edit/view, modal PO/VIN detail, và detail tồn kho + history.
- Bối cảnh: API gate sẽ expose component catalog + stock history drill-down.

## Goal

Triển khai UI lane manufacturing components theo pattern app hiện có (tham chiếu page Tiền gửi), dùng component sẵn có, không dựng widget bespoke nếu repo đã có reusable.

## Scope

- In-scope:
  - page `mfg-items`
  - action-first table
  - search/filter/dropdown reusable
  - create/edit/view component modal
  - item detail modal with stock summary + txn history
  - PO detail modal
  - VIN detail modal
- Out-of-scope:
  - redesign app shell
  - non-manufacturing pages

## Relevant Files

- `src/pages/MfgItems.tsx`
- `src/modules/manufacturing/api/manufacturingApi.ts`
- `src/modules/manufacturing/components/*`
- `src/modules/manufacturing/hooks/*`
- `src/modules/manufacturing/types/*`

## Gate 0 — DB Precheck

- Data source remains canonical `erp_*` manufacturing lane only
- Stock/history source of truth: API payload from `erp_inventory_txns` + enrich receipt/PO/VIN
- Result: `DB_READY` (UI depends on API contract; no FE-only schema gap)

## Checklist

- [x] 1.0 Gate 0 DB precheck done
- [ ] 2.0 Inspect and reuse existing table/filter/modal patterns
- [ ] 3.0 Extend manufacturing API client/types
- [ ] 4.0 Build MfgItems page UI with action-first table + filters
- [ ] 5.0 Implement create/edit/view/detail/PO/VIN modals
- [ ] 6.0 Validation (`bunx tsc --noEmit`, smoke)
- [ ] 7.0 Close with evidence

## Acceptance Criteria

- Action column is first column
- Search/filter/dropdown use existing app components/patterns
- User can create, view, edit component from modal
- User can open item detail and see stock summary + txn history
- Txn history row can open PO detail or VIN detail where relevant

## Risks

- Existing MfgItems page is placeholder; likely need module extraction
- Must avoid inventing custom table interaction inconsistent with app shell

## Rollback

- Revert FE page/module additions in web repo
- No DB rollback expected
