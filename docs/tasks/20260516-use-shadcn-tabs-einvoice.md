# Task — Sử dụng Shadcn Tabs cho Hóa đơn điện tử và tạo component chung

## Request Input
- Type: ENHANCE
- Mục tiêu: Sử dụng Shadcn Tabs cho tab trong `src/pages/HoaDonDienTu.tsx` và tạo component chung để reuse.
- Bối cảnh/ngữ cảnh: User muốn chuẩn hóa UI bằng Shadcn Tabs và cần component có thể tái sử dụng.

## Goal
- Cài đặt `@radix-ui/react-tabs` (nếu chưa có).
- Tạo component `Tabs` chuẩn Shadcn trong `src/shared/components/ui/tabs.tsx`.
- Refactor `src/pages/HoaDonDienTu.tsx` để sử dụng component mới.
- Đảm bảo component có thể tái sử dụng dễ dàng.

## Scope
- In-scope:
  - Cài đặt thư viện cần thiết.
  - Tạo component primitives cho Tabs.
  - Cập nhật trang Hóa đơn điện tử.
- Out-of-scope:
  - Không thay đổi logic xử lý dữ liệu của trang Hóa đơn điện tử.

## Relevant Files
- `package.json` - check/add dependency
- `src/shared/components/ui/tabs.tsx` - file component mới
- `src/pages/HoaDonDienTu.tsx` - file cần refactor

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: N/A (Chỉ thay đổi UI)
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [x] 3.0 UI gate done
  - [x] 3.1 Cài đặt `@radix-ui/react-tabs`
  - [x] 3.2 Tạo `src/shared/components/ui/tabs.tsx`
  - [x] 3.3 Refactor `src/pages/HoaDonDienTu.tsx`
- [ ] 4.0 Validation
  - [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan (Skipped)
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue) - Không có issue
  - [x] 5.2 Commit + push code (web/api) - Done
  - [x] 5.3 Tổng kết evidence - Done

## Validation Evidence
- DB precheck result: `DB_READY` (UI task)
- `npx tsc --noEmit`: OK (Exit code: 0)
- Smoke test: Skipped (No visual environment)

## Lessons Learned
- Không có issue

## Commit/Push Status
- Web repo: Committed & Pushed (Commit: 1811d1c)
- API repo: N/A
- DB/directus staging: N/A
