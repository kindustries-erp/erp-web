# Task — Hotfix vị trí highlight của TabBar khi scroll ngang

## Request Input
- Type: BUGFIX
- Mục tiêu: Sửa lỗi background pill bị lệch vị trí khi cuộn ngang TabBar.
- Bối cảnh/ngữ cảnh: User đang ở page Nhân sự nhưng pill lại nhảy sang Tài khoản khi scroll. Lý do là dùng `getBoundingClientRect()` bị phụ thuộc vào viewport thay vì dùng tọa độ tương đối trong container.

## Goal
- Cập nhật `src/core/components/layout/TabBar.tsx`:
  - Thay đổi cách tính `left` và `width` trong `useEffect` từ `getBoundingClientRect()` sang dùng `offsetLeft` và `offsetWidth` của element.
  - Cách này giúp tọa độ luôn cố định so với container kể cả khi scroll.

## Scope
- In-scope:
  - Sửa logic tính toán trong `TabBar.tsx`.
- Out-of-scope:
  - Không đổi giao diện.

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
  - [x] 3.1 Cập nhật logic tính vị trí dùng `offsetLeft`
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
