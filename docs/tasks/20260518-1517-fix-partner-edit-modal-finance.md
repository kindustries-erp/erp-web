# Task: Fix Partner Edit Modal in Finance Module

## Request Input

- Type: FIX
- Mục tiêu: Sửa lỗi modal đối tác bị lệch layout và không hiện thông tin cũ khi bấm edit từ modal UNT/UNC.
- Bối cảnh/ngữ cảnh: Trong phần Tiền gửi (UNT/UNC), khi bấm nút ✎ (Sửa đối tác), modal hiện ra bị lệch và các trường thông tin bị trống mặc dù đã chọn đối tác.

## Goal

Đảm bảo modal chỉnh sửa đối tác hiển thị đúng vị trí (centered/stacked correctly) và load đầy đủ dữ liệu của đối tác hiện tại (bao gồm cả contacts/banks) để người dùng có thể chỉnh sửa ngay lập tức.

## Scope

- In-scope:
  - Cập nhật CSS/Class của `PartnerDrawer` để xử lý layout.
  - Thêm logic load data đối tác trong `BankVoucherDrawer`.
  - Đồng bộ state giữa modal cha và modal con.
- Out-of-scope:
  - Thay đổi API endpoint của Partners.
  - Sửa các module tài chính khác ngoài Tiền gửi.

## Relevant Files

- `/opt/repos/liouni-erp/liouni-erp-web/src/modules/partners/components/PartnerDrawer.tsx` - Sửa layout modal.
- `/opt/repos/liouni-erp/liouni-erp-web/src/modules/finance/components/TienGui/BankVoucherDrawer.tsx` - Thêm logic load data khi bấm edit.
- `/opt/repos/liouni-erp/liouni-erp-web/src/modules/finance/hooks/useBankVoucherHandlers.ts` - (Nếu cần) để xử lý logic state phức tạp.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: `business_partners`, `business_partner_contacts`, `business_partner_bank_accounts`.
- Data nền cần có: Dữ liệu đối tác đã tồn tại trong DB.
- Constraint/index/default cần có: N/A.
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A - No API changes required)
- [x] 3.0 UI gate done
  - [x] 3.1 Cập nhật CSS cho `PartnerDrawer.tsx` để chống lệch layout.
  - [x] 3.2 Implement `handleEditPartner` trong `BankVoucherDrawer.tsx`.
  - [x] 3.3 Fetch và map contacts/banks của đối tác vào state modal con.
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test: Mở UNT/UNC -> Chọn đối tác -> Bấm ✎ -> Kiểm tra modal hiện đúng chỗ và có data.
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` (Thông tin đối tác đã sẵn sàng trong DB).
- `npx tsc --noEmit`: Pending.
- Smoke test: Pending.

## Lessons Learned

- Pending.

## Commit/Push Status

- Web repo: Pending.
- API repo: N/A.
- DB/directus staging: N/A.

---
## Sẵn sàng thực thi
A/C vui lòng xác nhận kế hoạch trên để em bắt đầu triển khai code.
