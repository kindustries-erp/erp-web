# Task — Tinh chỉnh style cho Tabs và Content area

## Request Input

- Type: ENHANCE
- Mục tiêu: Thêm margin-bottom và shadow cho tabbar, tăng shadow cho vùng nội dung (table) theo yêu cầu của user.
- Bối cảnh/ngữ cảnh: User muốn tabbar có khoảng cách và đổ bóng nhẹ, còn vùng nội dung bên dưới có bóng đổ rõ ràng hơn.

## Goal

- Thêm `margin-bottom` (khoảng `mb-6` hoặc `25px`) cho `TabsList` trong variant line.
- Thêm shadow nhẹ cho `TabsList` hoặc border bottom đậm hơn chút để tạo hiệu ứng phân cách.
- Tăng shadow cho container nội dung trong `HoaDonDienTu.tsx` từ `shadow-sm` lên `shadow-md` hoặc `shadow-lg` (hoặc custom shadow như trong ảnh).

## Scope

- In-scope:
  - Cập nhật `src/shared/components/AppTabs/index.tsx` để hỗ trợ margin và shadow cho line variant.
  - Cập nhật `src/pages/HoaDonDienTu.tsx` để truyền containerClassName với shadow lớn hơn.
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
  - [x] 3.1 Cập nhật `AppTabs` (thêm `mb-6` và shadow cho variant line)
  - [x] 3.2 Cập nhật `HoaDonDienTu.tsx` (tăng shadow cho container)
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

- Web repo: Committed & Pushed (Commit: 520fcba)
- API repo: N/A
- DB/directus staging: N/A
