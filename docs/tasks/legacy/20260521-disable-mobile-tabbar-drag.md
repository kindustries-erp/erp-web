# Task — Tắt drag drop tabbar trên mobile

## Request Input

- Type: FIX
- Mục tiêu: Bỏ drag/drop trên mobile vì hành vi nhảy không ổn định.
- Bối cảnh/ngữ cảnh: Sau khi thử nghiệm long-press drag mobile, user xác nhận interaction bị nhảy lung tung và yêu cầu tắt hẳn trên mobile.

## Goal

- Mobile: không còn drag/drop reorder tab.
- Mobile: vẫn giữ nút `⋯` để mở context menu.
- Desktop: vẫn giữ drag/drop reorder và right-click context menu.

## Scope

- In-scope:
  - `src/core/components/layout/TabBar.tsx`
  - `src/shared/components/ContextMenu.tsx` (chỉ nếu cần chỉnh tương thích)
- Out-of-scope:
  - Không thay đổi store reorder cho desktop.
  - Không thêm cơ chế reorder mobile thay thế trong task này.

## Relevant Files

- `src/core/components/layout/TabBar.tsx` - bỏ touch-drag logic mobile
- `src/shared/components/ContextMenu.tsx` - giữ menu mở từ nút mobile

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Gỡ long-press / touch drag mobile
  - [x] 3.2 Giữ menu `⋯` trên mobile
  - [x] 3.3 Giữ desktop drag/right-click không regress
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Chạy `npm run build`
  - [x] 4.3 Deploy + verify runtime
- [x] 5.0 Close
  - [x] 5.1 Commit + push code
  - [x] 5.2 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: PASS (exit code 0)
- `npm run build`: PASS
- Deploy/runtime: PASS — container `liouni-erp-web` recreated và `Up` trên `0.0.0.0:8808->80`; `docker logs` xác nhận nginx worker start bình thường

## Lessons Learned

- Chưa có issue

## Commit/Push Status

- Web repo: PASS — `a14aaaf fix(ui): disable mobile tab drag` pushed `master`
- API repo: N/A
- DB/directus staging: N/A
