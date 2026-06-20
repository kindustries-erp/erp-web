# Task — TabBar context menu đóng tab bên phải và kéo thả đổi vị trí

## Request Input

- Type: ENHANCE
- Mục tiêu: Thêm action đóng các tab bên phải trong context menu của tabbar và hỗ trợ drag để thay đổi vị trí tab.
- Bối cảnh/ngữ cảnh: User muốn tăng tốc thao tác quản lý tab trên ERP Web, đặc biệt ở desktop/mobile web có nhiều tab mở cùng lúc.

## Goal

- Bổ sung action **Đóng các tab bên phải** trong context menu tabbar.
- Bổ sung drag-and-drop để đổi vị trí các tab có thể kéo thả.
- Giữ nguyên rule tab không thể đóng (`STATIC_TABS`) và không làm vỡ active-tab behavior.

## Scope

- In-scope:
  - `src/core/config/appStore.ts`
  - `src/core/components/layout/TabBar.tsx`
  - `src/shared/components/ContextMenu.tsx`
- Out-of-scope:
  - Không thêm thư viện drag-drop mới.
  - Không đổi logic routing ngoài tabbar.

## Relevant Files

- `src/core/config/appStore.ts` - thêm action close-right / reorder tab
- `src/core/components/layout/TabBar.tsx` - UI drag/drop và wiring action
- `src/shared/components/ContextMenu.tsx` - thêm menu item close-right

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Thêm action close tabs to right trong app store + context menu
  - [x] 3.2 Thêm drag-and-drop reorder trong TabBar
  - [x] 3.3 Giữ behavior tab active/static tab an toàn
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test logic close-right + reorder (code-path review: static tab không drag/không close-right, current tab giữ an toàn khi đóng phải)
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: PASS (exit code 0)
- Smoke test: PASS mức code-path review — close-right chỉ đóng tab closable bên phải; drag chỉ áp dụng tab closable; static tab không bị reorder target/source; current tab được giữ an toàn khi close-right/close-all

## Lessons Learned

- Chưa có issue

## Commit/Push Status

- Web repo: Pending
- API repo: N/A
- DB/directus staging: N/A
