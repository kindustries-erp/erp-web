# Task: Production start/complete UI flow with auto GI/GR

## Request Input (bạn chỉ cần điền phần này)
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
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging):

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 `bun run lint:check`
  - [ ] 4.2 `bunx tsc --noEmit`
  - [ ] 4.3 `bun run test`
  - [ ] 4.4 `bun run build`
  - [ ] 4.5 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result: `DB_READY`
- `bun run lint:check`:
- `bunx tsc --noEmit`:
- `bun run test`:
- `bun run build`:
- Smoke test:

## Lessons Learned
- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status
- Web repo:
- API repo:
- DB/directus staging: apply+verify+document (no code push required)
