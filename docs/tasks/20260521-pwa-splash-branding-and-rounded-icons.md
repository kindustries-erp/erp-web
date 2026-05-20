# Task — Bỏ chữ Liouni ở splash/startup và bo góc icon app

## Request Input

- Type: ENHANCE
- Mục tiêu: Bỏ chữ "Liouni" ở màn hình khởi động app và thay icon app theo style bo góc.
- Bối cảnh/ngữ cảnh: User thấy startup screen hiển thị "Liouni ERP", muốn branding gọn hơn và icon đồng bộ bo góc.

## Goal

- Cập nhật PWA manifest để startup label không còn chữ "Liouni".
- Tạo lại icon app 192/512 có bo góc từ icon hiện tại.
- Giữ tương thích Android homescreen / splash rendering.

## Scope

- In-scope:
  - `vite.config.ts` (manifest name/short_name/icon purpose)
  - `public/icon-192.png`, `public/icon-512.png` (asset bo góc)
- Out-of-scope:
  - Không đổi logo thương hiệu trong nội dung app.

## Relevant Files

- `vite.config.ts` - cấu hình PWA manifest
- `public/icon-192.png` - icon launcher
- `public/icon-512.png` - icon launcher/splash

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Cập nhật manifest name/short_name bỏ Liouni
  - [x] 3.2 Tạo lại icon bo góc 192/512
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Build và verify output manifest/icons
- [ ] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: Pending
- Build/manifest smoke: Pending

## Lessons Learned

- Chưa có issue

## Commit/Push Status

- Web repo: Pending
- API repo: N/A
- DB/directus staging: N/A
