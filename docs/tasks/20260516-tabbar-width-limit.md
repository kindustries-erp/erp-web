# Task — Giới hạn width của TabBar để hỗ trợ scroll ngang

## Request Input
- Type: BUGFIX
- Mục tiêu: Giới hạn chiều rộng của TabBar không vượt quá `right-panel` và cho phép cuộn ngang khi có nhiều tab.
- Bối cảnh/ngữ cảnh: TabBar đang dùng `max-w-[90vw]`, trên màn hình lớn có thể rộng hơn `right-panel` (do bị trừ phần sidebar). Khi có nhiều tab, nó kéo dài tràn ra ngoài thay vì cuộn ngang.

## Goal
- Cập nhật `src/core/components/layout/TabBar.tsx`:
  - Thêm `max-w-[90%]` (hoặc tương đương) vào container để giới hạn theo chiều rộng của `right-panel`.
  - Đảm bảo `overflow-x-auto` hoạt động đúng để cuộn ngang.

## Scope
- In-scope:
  - Sửa CSS class trong `TabBar.tsx`.
- Out-of-scope:
  - Không đổi logic chuyển tab.

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
  - [x] 3.1 Cập nhật `TabBar.tsx` để giới hạn width và hỗ trợ scroll
- [ ] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code

## Validation Evidence
- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: OK (Exit code: 0)

## Lessons Learned
- Không có issue

## Commit/Push Status
- Web repo:
- API repo:
- DB/directus staging: N/A
