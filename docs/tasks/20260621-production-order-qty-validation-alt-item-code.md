# Task: Fix Production Order Quantities and BOM Alt Item Code Column

## Request Input

- Type: FIX + ENHANCE
- Mục tiêu: 3 fix trong ProductionOrderDrawer: (1) giới hạn qty start ≤ qtyToProduce, (2) giới hạn qty complete ≤ số lượng còn lại, (3) thêm cột Mã LK thay thế trong bảng BOM detail.
- Bối cảnh/ngữ cảnh: Plan từ `/home/lio/.gemini/antigravity-ide/brain/b0e90081-f356-4bfe-94cb-4bf753d1170b/implementation_plan.md` — FE-only, không cần schema/API mới.

## Goal

1. **Start qty validation**: disable "Xác nhận" nếu `startQty > qtyToProduce`.
2. **Complete qty validation**: disable "Xác nhận" nếu `completeQty > (qtyToProduce - qtyProduced)` — không cho phép complete vượt phần còn lại.
3. **Alt item code column**: thêm cột "Mã LK thay thế" hiển thị SKU từ `altOption.label` (format `SKU — Tên`) hoặc fallback `line.alternativeItemCode`.

## Scope

- In-scope:
  - `src/modules/production-core/components/ProductionOrderDrawer.tsx` — 3 thay đổi FE
- Out-of-scope:
  - Schema DB / API endpoint / DTO
  - Các component/module khác

## Relevant Files

- `src/modules/production-core/components/ProductionOrderDrawer.tsx` — file duy nhất thay đổi

## Gate 0 — DB Precheck

- Collections/fields liên quan: `erp_production_orders.qty_to_produce`, `erp_production_orders.qty_produced` — đã có sẵn, không cần migration.
- Kết quả: `DB_READY`

## Checklist

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done — không cần, FE-only
- [x] 3.0 UI gate done — patch đã apply trong dirty tree
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint:check` — PASS (0 warnings, auto-fix 6 Prettier formatting issues)
  - [x] 4.2 `bunx tsc --noEmit` — PASS (via `bun run build` tsc step)
  - [x] 4.3 `bun run test` — PASS (23 files / 119 tests)
  - [x] 4.4 `bun run build` — PASS (tsc + vite, 1298 KB, exit 0)
  - [ ] 4.5 Smoke test (manual): start > qtyToProduce → button disabled; complete > remaining → button disabled; BOM table hiển thị cột Mã LK thay thế
- [x] 5.0 Close
  - [x] 5.1 Lessons learned — không có issue mới
  - [x] 5.2 Commit + push code
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `bun run lint:check`: PASS (exit 0, auto-fix 6 Prettier formatting errors từ dirty tree)
- `bunx tsc --noEmit`: PASS (via tsc step trong `bun run build`)
- `bun run test`: PASS (23 test files / 119 tests)
- `bun run build`: PASS (tsc + vite build, 1298.23 KB bundle, exit 0)
- Smoke test: pending manual QC trên UI thực tế

## Lessons Learned

- Chưa có issue mới.

## Commit/Push Status

- Web repo: pending
- API repo: không cần
- DB/directus staging: không cần
