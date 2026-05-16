# Task — Cấu hình hiệu ứng Glassmorphism cho TabBar và tối ưu Mobile

## Request Input
- Type: ENHANCE
- Mục tiêu: Thêm hiệu ứng kính (glassmorphism) cho TabBar giống iOS và đảm bảo UI hiển thị đẹp trên mobile.
- Bối cảnh/ngữ cảnh: User muốn TabBar có hiệu ứng mờ nhòe (backdrop-blur) và bo tròn/đổ bóng nhẹ kiểu iOS, đồng thời kiểm tra tính thân thiện với mobile.

## Goal
- Cập nhật `src/core/components/layout/TabBar.tsx` để có hiệu ứng glassmorphism (dùng `backdrop-blur`, `bg-opacity`, border mờ).
- Đảm bảo TabBar có thể cuộn ngang trên mobile nếu có nhiều tab (`overflow-x-auto`).
- Kiểm tra lại giao diện `HoaDonDienTu` trên mobile (nếu cần điều chỉnh padding hoặc wrap).

## Scope
- In-scope:
  - Thay đổi CSS classes trong `TabBar.tsx`.
  - Đảm bảo responsive cho `TabBar`.
- Out-of-scope:
  - Không thay đổi logic chuyển tab.

## Relevant Files
- `src/core/components/layout/TabBar.tsx`

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [ ] 3.0 UI gate done
  - [x] 3.1 Thêm hiệu ứng glassmorphism và hỗ trợ scroll ngang cho `TabBar.tsx`
  - [x] 3.2 Kiểm tra/tối ưu mobile cho `HoaDonDienTu.tsx` (nếu cần)
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
- Web repo: Committed & Pushed (Commit: 0bfee68)
- API repo: N/A
- DB/directus staging: N/A
