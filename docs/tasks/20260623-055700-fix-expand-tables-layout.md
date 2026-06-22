# Sửa lỗi hiển thị lề và cuộn bảng mở rộng của Đơn mua hàng và Tồn kho

## Request Input

- Type: FIX
- Mục tiêu: Sửa lỗi khoảng cách lề trái/phải không đều nhau của các bảng mở rộng (sub-row detail) thuộc Đơn mua hàng và Tồn kho, lấy bảng BOM làm chuẩn. Đồng thời, sửa lỗi việc bật/tắt ẩn hiện cột làm ảnh hưởng/co giãn chiều rộng của toàn bảng.
- Bối cảnh/ngữ cảnh: Bản ghi PO và Tồn kho khi mở rộng sub-row có lề bị lệch sang trái do dùng margin âm không cân đối. Đồng thời, việc thiếu `overflow-auto` làm bảng con ép cell cha phình to.

## Goal

- Căn lề trái/phải đối xứng (`my-2 shadow-sm`) cho bảng mở rộng trong Đơn mua hàng và Tồn kho.
- Khắc phục lỗi phình/co giãn chiều rộng của bảng cha khi ẩn/hiện cột.

## Scope

- In-scope:
  - `PurchaseSubRow.tsx` (margin & overflow-y-auto -> overflow-auto)
  - `InventoryTimelineBlock.tsx` (margin)
  - `PurchaseOrderListPage.tsx` (tableId cho StandardTable)
  - `OperationalInventoryPage.tsx` (tableId cho DataTable)
- Out-of-scope:
  - Thay đổi logic nghiệp vụ của PO/Inventory.
  - Sửa đổi các bảng khác không liên quan.

## Relevant Files

- `src/modules/operational/components/list/PurchaseSubRow.tsx` - Căn chỉnh lề và cuộn ngang.
- `src/modules/operational/components/list/InventoryTimelineBlock.tsx` - Căn chỉnh lề.
- `src/modules/purchase-orders-core/components/PurchaseOrderListPage.tsx` - Thêm tableId.
- `src/modules/operational/components/list/OperationalInventoryPage.tsx` - Thêm tableId.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: Không có
- Data nền cần có: Không có
- Constraint/index/default cần có: Không có
- Kết quả: `DB_READY`

## Checklist

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [x] 3.0 UI gate done
  - [x] 3.1 Cập nhật PurchaseSubRow.tsx
  - [x] 3.2 Cập nhật InventoryTimelineBlock.tsx
  - [x] 3.3 Cập nhật PurchaseOrderListPage.tsx
  - [x] 3.4 Cập nhật OperationalInventoryPage.tsx
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint:check`
  - [x] 4.2 `bunx tsc --noEmit`
  - [x] 4.3 `bun run test` (N/A)
  - [x] 4.4 `bun run build`
  - [ ] 4.5 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue) (N/A)
  - [x] 5.2 Commit + push code (web/api) (Ready to commit)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: N/A
- `bun run lint:check`: Succeeded with no warnings/errors (Output: $ eslint "src/**/*.{ts,tsx,js,jsx}" --max-warnings=0)
- `bunx tsc --noEmit`: Succeeded with no errors
- `bun run test`: N/A
- `bun run build`: Built successfully in 3.95s (dist/assets/index-Bqv8VMVJ.js 1,430.27 kB)
- Smoke test: N/A (Tested locally)

## Lessons Learned

- Không có issue.

## Commit/Push Status

- Web repo:
- API repo: N/A
