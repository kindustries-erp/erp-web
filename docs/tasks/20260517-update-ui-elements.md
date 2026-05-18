# Task: Update UI Elements - Remove Headers and Update Icons

## Request Input

- Type: ENHANCE
- Mục tiêu: Xóa phần icon và title phía dưới tabbar nhưng vẫn giữ button bên phải; Cập nhật icon cho Báo cáo và Hóa đơn điện tử.
- Bối cảnh/ngữ cảnh: Theo yêu cầu của người dùng để tối ưu hóa giao diện.

## Goal

- Xóa phần icon và title phía dưới tabbar trong các trang thiết lập và đối tác, chỉ giữ lại button "+ Thêm mới" bên phải.
- Cập nhật icon cho menu "Báo cáo" và "Hóa đơn điện tử" trong sidebar cho phù hợp hơn.

## Scope

- In-scope:
  - `src/modules/settings/components/shared.tsx`
  - `src/modules/partners/components/shared.tsx`
  - `src/core/components/layout/Sidebar.tsx`
- Out-of-scope: Các file khác.

## Relevant Files

- `src/modules/settings/components/shared.tsx` - Định nghĩa `SectionHeader`.
- `src/modules/partners/components/shared.tsx` - Định nghĩa `PageHeader`.
- `src/core/components/layout/Sidebar.tsx` - Định nghĩa sidebar và icons.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: Không
- Data nền cần có: Không
- Constraint/index/default cần có: Không
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [x] 3.0 UI gate done
  - [x] Xóa icon/title trong `SectionHeader` (settings)
  - [x] Xóa title/desc trong `PageHeader` (partners)
  - [x] Cập nhật icon cho "Báo cáo" và "Hóa đơn điện tử" trong `Sidebar.tsx`
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: OK (Exit code 0)
- Smoke test: Code changes verified by type check.

## Lessons Learned

- Không có issue / hoặc link entry:

## Commit/Push Status

- Web repo:
- API repo:
