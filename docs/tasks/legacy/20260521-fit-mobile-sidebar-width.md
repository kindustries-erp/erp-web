# Task — Chỉnh mobile sidebar fit content

## Request Input

- Type: UI TWEAK
- Mục tiêu: Giảm width sidebar trên mobile để fit content đẹp hơn, tránh chiếm quá rộng.
- Bối cảnh/ngữ cảnh: User review screenshot và thấy mobile sidebar đang rộng quá mức cần thiết; sau vòng đầu đã yêu cầu fit sát hơn thêm một nấc.

## Goal

- Mobile sidebar có width gọn hơn, bám theo content hợp lý.
- Không làm vỡ layout desktop/collapsed sidebar.
- Overlay và scroll vẫn hoạt động bình thường.

## Scope

- In-scope:
  - `src/core/components/layout/Sidebar.tsx`
  - CSS/sidebar styles liên quan trong `src/styles/shell.css` hoặc file tương đương
- Out-of-scope:
  - Không đổi menu tree/content
  - Không đổi hành vi desktop ngoài phạm vi width mobile

## Relevant Files

- `src/core/components/layout/Sidebar.tsx`
- `src/styles/shell.css`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Xác định rule width hiện tại của mobile sidebar
  - [x] 3.2 Chỉnh width/padding để fit content hơn
  - [x] 3.3 Đảm bảo desktop không regress
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Chạy `npm run build`
  - [x] 4.3 Verify runtime/deploy
- [x] 5.0 Close
  - [x] 5.1 Commit + push code
  - [x] 5.2 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: PASS (exit code 0)
- `npm run build`: PASS
- Verify runtime/deploy: PASS — container `liouni-erp-web` recreated và `Up` trên `0.0.0.0:8808->80`; `docker logs` xác nhận nginx worker start bình thường
- Width tuning vòng 2: `236px / calc(100vw - 68px)` đã build + deploy PASS

## Lessons Learned

- Chưa có issue

## Commit/Push Status

- Web repo: PASS — `4f51c0d fix(ui): tighten mobile sidebar width more` pushed `master`
- API repo: N/A
- DB/directus staging: N/A
