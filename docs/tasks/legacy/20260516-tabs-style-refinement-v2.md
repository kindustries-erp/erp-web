# Task — Tinh chỉnh style Tabs v2 (Shadow bottom và Card shadow)

## Request Input

- Type: ENHANCE
- Mục tiêu: Chỉ đổ bóng ở cạnh dưới của tabbar và dùng `card-shadow` cho vùng nội dung.
- Bối cảnh/ngữ cảnh: User muốn tabbar liền mạch với background và chỉ có bóng ở dưới, còn vùng nội dung dùng chung shadow với các card bên trên.

## Goal

- Cập nhật `AppTabs` để tabbar chỉ có bóng ở cạnh dưới (dùng shadow với âm spread hoặc offset phù hợp).
- Cập nhật `HoaDonDienTu.tsx` để container dùng class `card-shadow` thay vì `shadow-md`.

## Scope

- In-scope:
  - Thay đổi CSS classes trong `AppTabs` và `HoaDonDienTu.tsx`.
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
  - [x] 3.1 Cập nhật `AppTabs` (chỉ shadow bottom cho variant line)
  - [x] 3.2 Cập nhật `HoaDonDienTu.tsx` (dùng `card-shadow`)
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

- Web repo: Committed & Pushed (Commit: aae684d)
- API repo: N/A
- DB/directus staging: N/A
