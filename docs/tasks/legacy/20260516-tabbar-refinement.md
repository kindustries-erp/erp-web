# Task — Tinh chỉnh TabBar v2 (Center main body, ẩn scrollbar, nổi bật background)

## Request Input

- Type: ENHANCE
- Mục tiêu: Di chuyển TabBar vào giữa main body, ẩn scrollbar trên mobile, và làm nổi bật background được chọn.
- Bối cảnh/ngữ cảnh: User thấy TabBar đang căn giữa màn hình (lệch so với content do có sidebar), scrollbar vẫn hiện trên mobile, và background tab active hơi chìm.

## Goal

- Cập nhật `src/core/components/layout/TabBar.tsx`:
  - Đổi từ `fixed` sang `absolute` để căn giữa theo `right-panel` (cần đảm bảo `right-panel` có `relative`).
  - Thêm thẻ `<style>` để ẩn hoàn toàn scrollbar trên mọi trình duyệt cho class `scrollbar-none`.
  - Tăng shadow cho background trượt (`shadow-[0_2px_8px_rgba(0,0,0,0.1)]`).
- Cập nhật `src/App.tsx` (nếu cần):
  - Thêm `relative` vào `<div className="right-panel">` để `absolute` của TabBar hoạt động đúng.

## Scope

- In-scope:
  - Thay đổi CSS classes và thêm style trong `TabBar.tsx` và `App.tsx`.
- Out-of-scope:
  - Không thay đổi logic chuyển tab.

## Relevant Files

- `src/core/components/layout/TabBar.tsx`
- `src/App.tsx`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [ ] 3.0 UI gate done
  - [x] 3.1 Cập nhật `TabBar.tsx` (absolute, style ẩn scrollbar, shadow pill)
  - [x] 3.2 Cập nhật `App.tsx` (thêm `relative` cho right-panel)
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

- Web repo: Committed & Pushed (Commit: 84c457e)
- API repo: N/A
- DB/directus staging: N/A
