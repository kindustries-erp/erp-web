# Task: ERP Manufacturing full flow FE — PO/receipt/production/BOM/vehicle/warranty

## Request Input (bạn chỉ cần điền phần này)

- Type: FEATURE
- Mục tiêu: Bổ sung form/modal/button thật cho create/edit PO, receipt nhập kho, production theo BOM, issue xuất kho, vehicle, warranty và mock/QC support.
- Bối cảnh/ngữ cảnh: manufacturing FE MVP mới chỉ có list/shell, chưa có business forms.

## Goal

Hoàn tất UI gate cho manufacturing full flow theo contract DB/API mới.

## Scope

- In-scope:
  - manufacturing module API client/types/hooks/components/pages
  - create/edit PO modal
  - receipt modal
  - BOM list/create/edit modal
  - production order modal (chọn BOM + qty + VIN/frame/engine)
  - issue/warranty/vehicle actions
  - route smoke and authenticated flow support
- Out-of-scope:
  - advanced costing dashboard
  - routing/work center UI

## Relevant Files

- `src/modules/manufacturing/api/manufacturingApi.ts`
- `src/modules/manufacturing/**`
- `src/pages/MfgItems.tsx`
- `src/pages/MfgPurchaseOrders.tsx`
- `src/pages/MfgVehicles.tsx`
- `src/App.tsx`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: manufacturing existing tables + BOM/production tables from DB task
- Data nền cần có: branch/supplier/items/BOM test data
- Constraint/index/default cần có: API contract and status gates from backend
- Kết quả: `DB_GAP_FOUND` -> chờ DB+API contract xong rồi chuyển `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260526-2333-erp-manufacturing-bom-production-db.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `bunx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: DB_GAP_FOUND (pending DB/API apply)
- `bunx tsc --noEmit`:
- Smoke test:

## Lessons Learned

- Không có issue

## Commit/Push Status

- Web repo:
- API repo: pending
- DB/directus staging: apply+verify+document (no code push required)
