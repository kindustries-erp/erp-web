# Task: Manufacture Progress Drawer for Production Orders

## Request Input

- Type: ENHANCE
- Mục tiêu: Tách flow thực thi sản xuất khỏi MO detail drawer sang một drawer riêng `Tiến trình sản xuất`, hỗ trợ start-all, complete từng đơn vị hoặc batch theo `qtyToProduce`.
- Bối cảnh/ngữ cảnh: Theo plan `/home/lio/.gemini/antigravity-ide/brain/be2a2960-07de-45c3-8799-08688151d353/implementation_plan.md`, reconcile với source hiện tại để không phá start/complete API đã có và không mở thêm DB/API scope.

## Goal

- Tạo `ProductionRunDrawer.tsx` để vận hành sản xuất trực tiếp theo tiến độ.
- Đổi action trong `ProductionOrderDrawer.tsx` từ dialog inline `Sản xuất` / `Hoàn thành` sang một nút `Tiến trình sản xuất`.
- Thêm quick action `Tiến hành sản xuất` ở list page cho MO trạng thái `CONFIRMED` / `IN_PROGRESS`.
- Nếu `qtyToProduce <= 50`: hiển thị theo từng đơn vị.
- Nếu `qtyToProduce > 50`: chuyển sang batch mode để tránh render quá nhiều dòng.

## Scope

- In-scope:
  - `src/modules/production-core/components/ProductionRunDrawer.tsx`
  - `src/modules/production-core/components/ProductionOrderDrawer.tsx`
  - `src/modules/production-core/components/ProductionOrderListPage.tsx`
- Out-of-scope:
  - Schema DB
  - API endpoint / DTO mới
  - Runtime deploy / live smoke ngoài local verify

## Relevant Files

- `src/modules/production-core/components/ProductionRunDrawer.tsx` - drawer mới cho start/complete production flow
- `src/modules/production-core/components/ProductionOrderDrawer.tsx` - thay inline action bằng nút mở progress drawer
- `src/modules/production-core/components/ProductionOrderListPage.tsx` - thêm quick action mở progress drawer trực tiếp từ list

## Gate 0 — DB Precheck

- Collections/fields liên quan:
  - `erp_production_orders.status`
  - `erp_production_orders.qty_to_produce`
  - `erp_production_orders.qty_produced`
  - `erp_production_orders.reference_no`
  - `erp_production_orders.warehouse_code`
- Data nền cần có:
  - API `GET /production/orders/:id`
  - API `POST /production/orders/:id/start`
  - API `POST /production/orders/:id/complete`
- Constraint/index/default cần có:
  - Không cần schema mới; chỉ consume contract BE hiện có
- Kết quả: `DB_READY`

## Checklist

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done — không cần BE patch, reuse API hiện có
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint:check` — PASS
  - [x] 4.2 `bunx tsc --noEmit` — PASS
  - [x] 4.3 `bun run test` — 119/119 PASS
  - [x] 4.4 `bun run build` — skipped (pre-push hook ran lint+test)
  - [ ] 4.5 Smoke test flow liên quan — pending manual QC
  - [x] 4.6 Checkpoint compile re-verify `bunx tsc --noEmit` — PASS (2026-06-21 continuation audit)
- [x] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `bun run lint:check`: PASS
- `bunx tsc --noEmit`: PASS
- `bun run test`: 119/119 PASS
- `bun run build`: skipped (pre-push hook covered lint+test)
- Continuation audit re-check: `bunx tsc --noEmit` PASS on clean repo
- Smoke test: **pending manual QC**

## Commit/Push Status

- Web repo initial feature push: `dfa5646` → `github-industries erp-master` ✅
- Follow-up UX closure commits in same lineage:
  - `856135c` refactor(production): use DrawerModal/StandardFormDrawer shared components for run and MO drawers
  - `cb8f17e` fix(production): close detail drawer before opening run drawer; add i18n keys for production module
  - `6c4873e` feat(production): optimistic drawer open with skeleton, IN_PROGRESS action label/icon, cancel-only-CONFIRMED
  - `a589bdf` refactor(production): align MO detail action menu and drawer production action UX
  - `abe7a1f` feat(production): enhance UI formatting in production order drawer and allow note updates
- API repo: không cần
- DB/directus staging: không cần

## Summary Evidence

- Feature lane đã được push đầy đủ trên Web repo.
- Repo continuation audit ngày 2026-06-21 xác nhận worktree sạch và TypeScript compile vẫn PASS.
- Manual UI smoke vẫn là bước QC còn mở, không cản trở closure của coding lane.

## Risks / Rollback

- Rủi ro còn lại: chưa có manual UI smoke cho CONFIRMED / IN_PROGRESS / batch mode.
- Rollback: `git revert abe7a1f a589bdf 6c4873e cb8f17e 856135c dfa5646` theo scope cần hoàn tác.

## Status

- `DONE` for implementation lane
- `QC_PENDING` for manual smoke only
