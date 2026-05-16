# Task — Tinh chỉnh style Tabs v3 (Sửa shadow và xóa padding)

## Request Input
- Type: ENHANCE
- Mục tiêu: Sửa shadow tabbar chỉ ở bottom và xóa padding ngoài cùng của trang.
- Bối cảnh/ngữ cảnh: User cảm thấy vẫn còn shadow ở cạnh phải của tabbar và muốn xóa padding ngoài cùng để đồng nhất với các trang khác.

## Goal
- Cập nhật `AppTabs` để shadow thực sự chỉ xuất hiện ở bottom (dùng blur nhỏ hơn hoặc spread âm lớn hơn).
- Cập nhật `HoaDonDienTu.tsx` để xóa class `p-4 md:p-6` ở thẻ div ngoài cùng.

## Scope
- In-scope:
  - Thay đổi CSS classes trong `AppTabs` và `HoaDonDienTu.tsx`.
- Out-of-scope:
  - Không thay đổi cấu trúc dữ liệu.

## Relevant Files
- `src/shared/components/AppTabs/index.tsx`
- `src/pages/HoaDonDienTu.tsx`

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [ ] 3.0 UI gate done
  - [x] 3.1 Cập nhật `AppTabs` (sửa shadow bottom)
  - [x] 3.2 Cập nhật `HoaDonDienTu.tsx` (xóa padding)
- [ ] 4.0 Validation
  - [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue) - Không có issue
  - [x] 5.2 Commit + push code - Done

## Validation Evidence
- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: OK (Exit code: 0)
- Smoke test: Skipped (No visual environment)

## Lessons Learned
- Không có issue

## Commit/Push Status
- Web repo: Committed & Pushed (Commit: ec7a3f0)
- API repo: N/A
- DB/directus staging: N/A
