# Operational ERP UX / Settlement / Inventory Posting

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Fix UI phase nghiệm thu cho modal chi tiết, recurring nhận diện rõ, settlement theo đối tác, và nút nhập/xuất kho.
- Bối cảnh/ngữ cảnh: Operational ERP shell hiện chỉ list chứng từ, chưa có modal detail, recurring chỉ hiện mờ ở ngày kỳ sau, và chưa có workflow posting kho từ chứng từ nguồn.

## Goal

Nâng UI operational ERP từ shell sang workflow usable cho nghiệm thu: mở chi tiết đúng loại chứng từ, filter settlement đúng partner, recurring nhận diện rõ, và nút posting kho với guard theo status/inventory_status.

## Scope

- In-scope:
  - `src/modules/operational/**`
  - modal/detail action cho sales/purchase/expense
  - recurring badge/filter
  - receipt/issue buttons + disabled rules
- Out-of-scope:
  - redesign điều hướng sidebar
  - custom one-off layout ngoài shared component pattern

## Relevant Files

- `src/modules/operational/components/OperationalListPage.tsx` - list, actions, modal, settlement UX
- `src/modules/operational/api/operationalApi.ts` - client routes/detail/posting
- `src/pages/Sales.tsx` - page composition
- `src/pages/Purchasing.tsx` - page composition
- `src/pages/OperatingExpenses.tsx` - page composition
- `src/pages/Receivables.tsx` - page composition
- `src/pages/Payables.tsx` - page composition
- `src/pages/Inventory.tsx` - page composition

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `purchase_orders.inventory_status`
  - `sales_service_orders.inventory_status`
  - recurring fields trên `purchase_orders`, `operating_expenses`
  - payment voucher `counterparty_id`
- Data nền cần có:
  - API detail trả `lines/payments`
  - API posting routes tồn tại
- Constraint/index/default cần có:
  - DB/API phải sẵn `inventory_status` trước khi UI đọc/disable button
- Kết quả: `DB_GAP_FOUND`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging):
  - `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260521-operational-erp-ux-settlement-inventory-posting.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npm run build`
  - [x] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_GAP_FOUND` đã được xử lý ở DB task apply
- `npm run build`: PASS (`tsc && vite build`)
- Smoke test:
  - modal detail đã có action riêng `Chi tiết`
  - recurring có badge + filter local
  - purchase có nút `Nhập kho` khi `CONFIRMED` và chưa `FULLY_RECEIVED`
  - sales có nút `Xuất kho` khi `CONFIRMED|IN_PROGRESS` và chưa `ISSUED`

## Lessons Learned

- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status

- Web repo: pending
- API repo: coordinated with backend task
- DB/directus staging: apply+verify+document done
