# Task — Fix context menu trên sidebar không hiện action đóng tab

## Request Input

- Type: FIX
- Mục tiêu: Khi mở context menu từ sidebar, bỏ các action đóng tab; chỉ giữ action phù hợp.
- Bối cảnh/ngữ cảnh: User phát hiện context menu mở từ sidebar đang hiện `Đóng tab bên phải` và `Đóng tất cả tab phụ`, gây sai ngữ cảnh.

## Goal

- Sidebar context menu chỉ hiển thị action phù hợp với sidebar item.
- Tabbar context menu vẫn giữ các action đóng tab hiện có.
- Không làm regress mobile menu button và desktop right-click.

## Scope

- In-scope:
  - `src/shared/components/ContextMenu.tsx`
  - nơi gọi `usePageContextMenu` từ sidebar/tabbar
- Out-of-scope:
  - Không đổi store tab action
  - Không đổi routing/menu tree

## Relevant Files

- `src/shared/components/ContextMenu.tsx`
- `src/core/components/layout/Sidebar.tsx`
- `src/core/components/layout/TabBar.tsx`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Xác định nguồn mở context menu từ sidebar/tabbar
  - [x] 3.2 Tách menu variant theo source/context
  - [x] 3.3 Giữ action đóng tab chỉ ở tabbar
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Chạy `npm run build`
  - [x] 4.3 Verify logic menu sidebar/tabbar (code-path review PASS)
- [x] 5.0 Close
  - [x] 5.1 Commit + push code
  - [x] 5.2 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: PASS (exit code 0)
- `npm run build`: PASS
- Verify logic: PASS — sidebar context menu chỉ render `Mở trong tab mới`; tabbar context menu mới render thêm `Đóng tab bên phải` và `Đóng tất cả tab phụ`
- Deploy/runtime: PASS — container `liouni-erp-web` recreate thành công và `Up` trên `0.0.0.0:8808->80`; `docker logs` xác nhận nginx worker start bình thường

## Lessons Learned

- Chưa có issue

## Commit/Push Status

- Web repo: PASS — `6c0fddf fix(ui): scope sidebar context menu actions` pushed `master`
- API repo: N/A
- DB/directus staging: N/A
