# Task: FIX missing i18n keys (breadcrumb + settings headers + modal labels)

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu:
  - Fix các key chưa dịch:
    - `breadcrumb.catalogFunds`
    - `breadcrumb.catalogBank`
    - `settings.tk.headers.accountingAccount`
    - `settings.tk.headers.currency`
    - `settings.tk.headers.status`
  - Fix text/modal của page Quỹ tiền mặt và Tài khoản ngân hàng còn hiện key thô.
- Bối cảnh/ngữ cảnh:
  - Sau refactor settings pages, một số key i18n chưa được khai báo đầy đủ trong locale hoặc component đang tham chiếu sai namespace.

## Goal

Khôi phục đầy đủ hiển thị i18n cho breadcrumb, table headers và modal labels/messages ở các page Thiết lập liên quan, không còn key thô xuất hiện trên UI.

## Scope

- In-scope:
  - `src/core/locale/vi.ts`
  - `src/core/locale/en.ts`
  - `src/core/config/appStore.ts` (breadcrumb map nếu cần)
  - `src/modules/settings/components/QuyTab.tsx`
  - `src/modules/settings/components/NHTab.tsx`
  - `src/modules/settings/components/TKTab.tsx` (nếu liên quan header keys dùng chung)
- Out-of-scope:
  - DB schema/data changes
  - API contract changes

## Relevant Files

- `src/core/locale/vi.ts` - thêm/fix key tiếng Việt
- `src/core/locale/en.ts` - thêm/fix key tiếng Anh
- `src/modules/settings/components/QuyTab.tsx` - modal/header labels đang dùng key thiếu
- `src/modules/settings/components/NHTab.tsx` - modal/header labels đang dùng key thiếu
- `src/core/config/appStore.ts` - breadcrumb keys tham chiếu

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `cash_funds`, `bank_accounts`, `chart_of_accounts`
- Data nền cần có:
  - Có thể rỗng
- Constraint/index/default cần có:
  - Không có thay đổi
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `npx tsc --noEmit`: pending
- Smoke test: pending

## Risk + Rollback

- Risk: sửa key i18n có thể làm mismatch namespace ở component khác.
- Rollback: revert commit fix i18n nếu phát sinh regression.

## Danh sách evidence cần thu thập

1. Diff `vi.ts`, `en.ts` có đủ các key thiếu.
2. Diff các component settings không còn tham chiếu key thiếu.
3. `npx tsc --noEmit` pass.
4. Smoke test: breadcrumb + header + modal hiển thị đúng text.
5. Commit hash + push + deploy logs.

## San sang thuc thi

Da co plan day du theo ERP PLAN mode. Cho xac nhan "Thuc thi" de bat dau fix code.
