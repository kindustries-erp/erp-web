# Task — Mobile tabbar long-press drag không đụng context menu

## Request Input

- Type: ENHANCE
- Mục tiêu: Cho phép drag tabbar trên mobile nhưng không xung đột với long-press mở context menu.
- Bối cảnh/ngữ cảnh: User yêu cầu mobile drag cho tabbar, đồng thời cảnh báo long-press không được đụng thao tác mở context menu.

## Goal

- Mobile: long-press trên label tab để vào drag mode.
- Mobile: context menu chỉ mở qua nút riêng trên tab, không dùng long-press.
- Desktop: giữ right-click context menu và drag hiện có.

## Scope

- In-scope:
  - `src/core/components/layout/TabBar.tsx`
  - `src/shared/components/ContextMenu.tsx`
  - `src/core/config/appStore.ts` (nếu cần hỗ trợ action menu/reorder hiện có)
- Out-of-scope:
  - Không thêm thư viện drag-drop mới.
  - Không đổi routing/tab contract ngoài tabbar.

## Relevant Files

- `src/core/components/layout/TabBar.tsx` - touch long-press drag, menu button mobile
- `src/shared/components/ContextMenu.tsx` - mở menu chủ động từ nút mobile, giữ right-click desktop
- `src/core/config/appStore.ts` - reuse action reorder/close-right hiện có

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Tách gesture mobile: long-press drag vs menu button riêng
  - [x] 3.2 Giữ right-click desktop + drag desktop không regress
  - [x] 3.3 Chặn xung đột move threshold / cancel timer / stop propagation
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Chạy `npm run build`
  - [x] 4.3 Smoke logic mobile/desktop gesture (code-path review + build PASS)
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: PASS (exit code 0)
- `npm run build`: PASS
- Smoke test: PASS mức code-path review — mobile dùng long-press 300ms trên label tab để drag; menu mở qua nút riêng `⋯`; desktop giữ right-click + HTML5 drag hiện có; move threshold/cancel timer/stopPropagation đã tách để tránh đụng gesture

## Lessons Learned

- Chưa có issue

## Commit/Push Status

- Web repo: Pending
- API repo: N/A
- DB/directus staging: N/A
