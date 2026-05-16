# Task — Refactor trang Đối tác sử dụng AppTabs

## Request Input
- Type: REFACTOR
- Mục tiêu: Chuyển đổi trang Đối tác (`DoiTac.tsx`) sang sử dụng component chung `AppTabs` để đồng bộ UI với trang Hóa đơn điện tử.
- Bối cảnh/ngữ cảnh: User hỏi trang Đối tác và Hóa đơn điện tử có đang dùng chung tab bar không, và muốn reuse nếu chưa. Hiện tại Đối tác đang dùng `TabHeader` riêng.

## Goal
- Cập nhật `src/pages/DoiTac.tsx`:
  - Loại bỏ `TabHeader` và state `activeTab`.
  - Sử dụng `AppTabs` với `variant="line"`.
  - Truyền mảng `tabs` chứa `PartnersTab`, `ContactsTab`, `PartnerBankTab`, `PartnerRolesTab`.

## Scope
- In-scope:
  - Refactor `DoiTac.tsx`.
- Out-of-scope:
  - Không thay đổi logic bên trong các tab con.

## Relevant Files
- `src/pages/DoiTac.tsx`
- `src/shared/components/AppTabs/index.tsx`

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan: N/A
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`

## Checklist (bắt buộc cập nhật realtime)
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A)
- [ ] 3.0 UI gate done
  - [x] 3.1 Refactor `DoiTac.tsx` sang dùng `AppTabs`
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
