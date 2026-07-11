# Task: Enhance Accounting Flow — Remove POSTED UI, Add Edit Journal Button

- Type: ENHANCE
- Mục tiêu: Xóa POSTED khỏi UI, thêm nút "Sửa hạch toán" khi phiếu đã có journal_entry_id
- Bối cảnh: Backend không còn set POSTED sau khi hạch toán. Frontend cần dùng `journal_entry_id` làm cờ.

## Goal

- Xóa nhãn/badge "Đã hạch toán" (POSTED) khỏi toàn bộ UI
- Nút hành động khi APPROVED:
  - `!journal_entry_id` → "Ghi sổ"
  - `!!journal_entry_id` → "Sửa hạch toán"
- Modal hạch toán khi sửa: load dữ liệu từ bút toán cũ (debit/credit account, số tiền, ngày)

## Relevant Files

- `src/shared/components/badges.tsx`
- `src/modules/finance/components/CashVoucherDrawer/index.tsx`
- `src/modules/finance/components/TienGui.tsx` (TienGui page)
- `src/modules/finance/components/TienMat/TienMatView.tsx`
- `src/modules/finance/components/PaymentVoucherAccountingModal.tsx`
- `src/modules/finance/api/financeApi.ts`

## Checklist

- [x] Xóa POSTED khỏi badges.tsx
- [x] Cập nhật CashVoucherDrawer: nút action APPROVED split theo journal_entry_id
- [x] Cập nhật BankVoucherDrawer (TienGui): tương tự
- [x] Cập nhật PaymentVoucherAccountingModal: nhận thêm prop `existingEntry` để prefill
- [x] Cập nhật TienMatView + TienGui: truyền existingEntry vào modal
- [x] Build & deploy
