---
name: cash-vouchers-web
description: Tri thức frontend cho drawer tạo mới phiếu thu/chi tiền mặt (bản V2 trong src/v2/modules/cash-vouchers), được cầu nối V1 mở từ tab Sao kê tiền mặt.
---

# Phiếu thu/chi tiền mặt (erp-web, V2)

## Phạm vi
- Chỉ có drawer **tạo mới** (không sửa, không xem chi tiết, không xóa).
- Module V2 sinh bằng plop `v2-module` với `wire = false`: không có route `/v2`, không có mục menu.
  Sau đó đã xóa phần bảng, trang và CRUD không dùng (endpoint thật chỉ có `POST .../transactions/manual` và `GET .../cash-books`).
- Cầu nối V1: `src/pages/finance/components/CreateCashTransactionDrawer.tsx` giữ props cũ (`isOpen`, `onClose`, `onSuccess`), truyền `currentBranchId` làm `fallbackBranchId`. Được gọi từ `BankStatementDrawers.tsx` khi `type === "cash"`.

## Cấu trúc
- `api/cashVouchersApi.ts`: `listCashBooks`, `createManual` (HTTP client V2).
- `api/queries/useCashBooksQuery.ts`, `cashVouchersKeys.ts` (khóa `bank-transactions` dùng chung với V1 để làm mới danh sách sao kê).
- `api/mutations/useCreateCashVoucherMutation.ts`: toast thành công/lỗi, `DOCUMENT_IN_USE` do modal chung xử lý.
- `domain/rules/cashVoucherRules.ts`: `validateCashVoucherForm` (sổ quỹ → ngày → đúng một trong Thu/Chi), `resolveVoucherBranchId` (ưu tiên chi nhánh của sổ quỹ, rồi tới chi nhánh đang chọn), `isCashVoucherFormDirty`.
- `drawers/CashVoucherDrawer.tsx` + `.hook.ts`: `V2StandardDrawer` 1 cột, size `md`, `confirmOnClose` khi form bẩn.
- `components/organisms/cash-voucher-form/CashVoucherFormSections.tsx`: `V2Combobox` sổ quỹ, `V2DatePicker`, `V2Input`, `V2NumberInput` (Thu/Chi), `V2Textarea`.

## Ánh xạ Thu/Chi sang API (quan trọng)
- Trường form: `receiptAmount` (ô **Thu**), `paymentAmount` (ô **Chi**).
- Payload gửi `POST .../transactions/manual`: `creditAmount = receiptAmount`, `debitAmount = paymentAmount`.
- Lý do: backend coi thu = `credit_amount`, chi = `debit_amount` cho mọi nguồn (xem skill `bank-statement` của erp-api). Gán ngược sẽ lưu phiếu Thu thành chi và không cấn trừ được với hóa đơn bán ra.
- Không dùng tên `debitAmount`/`creditAmount` cho trường form để tránh nhầm lẫn.

## Quy tắc
- Chỉ import V2 (`@/v2/*`). Chi nhánh đang chọn của V1 đi qua prop `fallbackBranchId`, không import store V1 trong V2.
- Khóa i18n `v2.cashVouchers.form.*` (vi/en trong `cashVouchers.locale.ts`).
- Không dùng màu `blue-*`. Mỗi file dưới 180 dòng.

## Hành vi đã đổi so với V1
- Lỗi lưu: toast thay cho `alert()`.
- Thêm rule: phải nhập đúng một trong Thu/Chi (V1 cho nhập cả hai hoặc cả hai bằng 0).

## Còn lại
- Đã sửa đảo chiều Thu/Chi (xem mục ánh xạ). Chưa kiểm tra thủ công trên dev.
