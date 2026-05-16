# Task — Tạo TabBar nổi (Floating) với hiệu ứng Glassmorphism và sliding background

## Request Input
- Type: ENHANCE
- Mục tiêu: Biến TabBar thành thanh nổi (floating), bo tròn, có hiệu ứng kính và background trượt mượt mà cho tab được chọn.
- Bối cảnh/ngữ cảnh: User gửi ảnh minh họa một thanh điều hướng nổi, bo tròn mạnh, có hiệu ứng kính và muốn tab được chọn có background bo tròn chạy qua lại mượt mà.

## Goal
- Cập nhật `src/core/components/layout/TabBar.tsx`:
  - Biến container thành `fixed bottom-4 left-1/2 -translate-x-1/2` (floating).
  - Thêm `backdrop-blur-md`, `bg-white/70`, `rounded-full`, `shadow-lg`.
  - Thêm một div tuyệt đối (absolute) làm background cho tab active, dùng JS để tính toán vị trí và chiều rộng để tạo hiệu ứng trượt.
  - Cập nhật `TabItem` để hiển thị đẹp trên nền mới (không dùng border top nữa).

## Scope
- In-scope:
  - Thay đổi giao diện và thêm logic tính toán vị trí trong `TabBar.tsx`.
- Out-of-scope:
  - Không cài thêm thư viện mới (như framer-motion), tự xử lý bằng JS thuần và CSS transition.

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
  - [x] 3.1 Refactor `TabBar.tsx` sang dạng floating và thêm hiệu ứng trượt
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
- Web repo: Committed & Pushed (Commit: 8c15d3a)
- API repo: N/A
- DB/directus staging: N/A
