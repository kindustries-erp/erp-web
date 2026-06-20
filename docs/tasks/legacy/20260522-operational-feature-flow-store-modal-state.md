# Operational Feature Flow Store / Modal State Stabilization

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Ưu tiên feature flow store cho operational pages để modal/detail/settlement/posting giữ state parent-child đúng nhưng không bị stale overlay khi navigation hoặc mở child flow.
- Bối cảnh/ngữ cảnh: `OperationalListPage.tsx` hiện giữ nhiều local boolean/state rời rạc (`detailOpen`, `settlementOpen`, `postingDrawerOpen`, `activeDocument`, `detailDocument`, `postingDocument`, drafts...) dẫn tới stale modal state, child flow tách context khỏi parent, và khó QC mobile.

## Goal

Chuẩn hóa luồng operational theo mô hình feature flow store: 1 root document context + 1 active step (`detail` / `settlement` / `posting`) + draft/cache liên quan, để hỗ trợ modal 2 mở nhưng modal 1 vẫn giữ state, đồng thời route/page khác không bị rò overlay/action context.

## Scope

- In-scope:
  - `src/modules/operational/**`
  - operational detail / settlement / posting flow state
  - route/page isolation cho operational flow
  - preserve parent state khi mở child flow
- Out-of-scope:
  - refactor toàn bộ modal global toàn app
  - redesign Sidebar / Auth modal / Import modal shell
  - thay đổi API hoặc DB schema

## Relevant Files

- `src/modules/operational/components/OperationalListPage.tsx` - nguồn stale state hiện tại
- `src/modules/operational/api/operationalApi.ts` - API detail/settlement/posting
- `src/modules/operational/**` - nơi đặt flow store/types helpers mới
- `src/shared/components/DrawerModal.tsx` - stack behavior tham chiếu
- `src/pages/Sales.tsx`
- `src/pages/OperatingExpenses.tsx`
- `src/pages/Receivables.tsx`
- `src/pages/Payables.tsx`
- `src/pages/Purchasing.tsx`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - Không đổi DB/schema
  - Reuse `sales_service_orders`, `purchase_orders`, `operating_expenses`, operational payment links hiện có
- Data nền cần có:
  - API detail trả `lines/payments`
  - API posting/settlement routes đang PASS trên staging
- Constraint/index/default cần có:
  - Không phát sinh DB constraint mới
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB/Scope precheck done
- [ ] 2.0 Feature flow store implemented
- [ ] 3.0 UI migration completed
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Chạy `npm run build`
  - [ ] 4.3 Smoke detail -> child modal -> close/back -> route isolation
- [ ] 5.0 Close
  - [ ] 5.1 Commit + push web code
  - [ ] 5.2 Tổng kết evidence

## Validation Evidence

- Pending

## Lessons Learned

- Pending

## Commit/Push Status

- Pending
