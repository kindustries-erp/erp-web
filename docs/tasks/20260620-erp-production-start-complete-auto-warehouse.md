# Task: Production start/complete UI flow with auto GI/GR

## Request Input (bạn chỉ cần điền phần ini)

- Type: FEATURE
- Mục tiêu: Đổi MO drawer từ 2 action xuất/nhập kho thủ công sang flow `Sản xuất` / `Hoàn thành` có nhập số lượng partial.
- Bối cảnh/ngữ cảnh: Theo implementation plan `/home/lio/.gemini/antigravity-ide/brain/f2f914ad-a6b2-4f1f-923a-6d523dfd1593/artifacts/implementation_plan.md`, đã reconcile với source hiện tại để không phá alt-material, draft edit, inline GI, và warehouse prefill patterns cũ.

## Goal

Cung cấp flow UI rõ ràng cho MO execution:

- nhập `qtyToManufacture` để bắt đầu sản xuất
- nhập `qtyFinished` để báo hoàn thành từng phần
- hiển thị tiến độ `qtyProduced / qtyToProduce`
- parse rõ lỗi thiếu tồn kho từ API

## Scope

- In-scope:
  - add start/complete API calls cho production module
  - add modal nhập số lượng partial trong MO drawer
  - replace old buttons bằng action mới theo status
  - refresh detail sau thao tác thành công
- Out-of-scope:
  - redesign warehouse pages chung
  - thay đổi route/module ngoài production drawer

## Relevant Files

- `src/modules/production-core/api/productionCoreApi.ts` - API contract mới
- `src/modules/production-core/components/ProductionOrderDrawer.tsx` - action UI + modal + progress
- `src/modules/production-core/hooks/useProductionOrderDrawer.ts` - modal state + submit handlers

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `erp_production_orders.qty_to_produce`
  - `erp_production_orders.qty_produced`
  - `erp_production_orders.status`
  - `erp_production_order_materials.qty_issued`
- Data nền cần có:
  - API trả được detail MO hiện tại
  - API start/complete trả status/qty cập nhật
- Constraint/index/default cần có:
  - không cần schema mới
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done — API repo
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint:check` — PASS (0 warnings, 0 errors)
  - [x] 4.2 `bunx tsc` (via `bun run build`) — PASS
  - [x] 4.3 `bun run test` (vitest) — PASS (23 files / 119 tests)
  - [x] 4.4 `bun run build` — PASS (vite build exit 0, 1297 KB bundle)
  - [x] 4.5 Deploy confirmed live
- [x] 5.0 Close
  - [x] 5.1 Lessons learned — old buttons removed, state exposed from hook
  - [x] 5.2 Commit + push code
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `bun run lint:check`: PASS (exit 0)
- `bun run build`: PASS (tsc + vite, 1297.78 KB, exit 0)
- `bun run test`: 23 test files / 119 tests PASS
- Deploy: container up, health OK

## Lessons Learned

- Old manual GI/GR buttons đã bị remove khỏi destructure Drawer — nếu cần khôi phục manual flow, expose lại từ hook.
- `onIssueMaterial` / `onReceiveFinishedGood` vẫn còn trong hook return object để backward compat với test lớp ngoài.

## Commit/Push Status

- Web repo: `erp-master` @ `90f010a` → `github-industries` ✅
- API repo: `erp-master` @ `66efe94` → `github-industries` ✅
- DB/directus staging: không cần migration
