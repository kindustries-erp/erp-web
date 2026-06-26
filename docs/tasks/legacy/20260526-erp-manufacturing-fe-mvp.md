# Task: ERP Manufacturing FE MVP

## Request Input

- Type: FEATURE
- Mục tiêu: Thêm module FE cho manufacturing MVP — PO mua linh kiện có download template + upload Excel, nhập kho, xe (VIN/frame/engine), xuất kho, bảo hành.
- Bối cảnh/ngữ cảnh: BE gate đã xong. DB xong trước đó.

## Goal

Màn hình Manufacturing trong FE: item master, PO mua linh kiện (có download template + import Excel), receipts, xe (VIN), issues, warranties.

## Scope

- In-scope:
  - PageKey mới: `mfg-items`, `mfg-purchase-orders`, `mfg-vehicles`
  - API client `src/modules/manufacturing/api/manufacturingApi.ts`
  - Pages: MfgItems, MfgPo, MfgVehicles
  - Sidebar section MFG
  - appStore SECTION_ROOTS + BREADCRUMBS
  - i18n keys vi/en
  - App.tsx routing
  - pageUrl.ts ALL_PAGE_KEYS
- Out-of-scope:
  - Detail pages
  - Receipt/Issue/Warranty full forms (ComingSoon placeholder)

## Relevant Files

- `src/shared/types/index.ts` - thêm PageKey
- `src/shared/utils/pageUrl.ts` - thêm ALL_PAGE_KEYS
- `src/core/config/appStore.ts` - thêm SECTION_ROOTS + BREADCRUMBS
- `src/core/locale/vi.ts` - thêm nav keys
- `src/core/locale/en.ts` - thêm nav keys
- `src/core/components/layout/Sidebar.tsx` - thêm MFG section
- `src/App.tsx` - thêm page routing
- `src/modules/manufacturing/api/manufacturingApi.ts` - api client
- `src/pages/Mfg*.tsx` - page components

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: erp_inventory_items, erp_purchase_orders, erp_vehicle_vins
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: DB_READY
- `npx tsc --noEmit`:
- Smoke test:

## Lessons Learned

- Không có issue

## Commit/Push Status

- Web repo:
- API repo: pending commit
- DB/directus staging: done
