# Task Template

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu: Dọn regression shell state sau login/logout để không tự mở lại drawer/modal/tab state cũ.
- Bối cảnh/ngữ cảnh: User báo task gần nhất làm xong nhưng test lại thấy shell UI còn state bẩn; các overlay như import panel / drawer / change-password có thể tự mở lại sau khi login lại.

## Goal

Đảm bảo login/logout reset sạch state UI tạm thời của shell, không kéo theo overlay cũ sang session tiếp theo trong cùng SPA runtime.

## Scope

- In-scope:
  - Reset shell-level ephemeral UI state tại auth transition.
  - Verify build, deploy ERP Web staging, smoke login sạch.
- Out-of-scope:
  - Không đổi DB schema.
  - Không đổi ERP API contract/business logic.
  - Không refactor page-level local modal state ngoài shell store hiện tại.

## Relevant Files

- `src/core/config/uiStore.ts` - shell UI store chứa panel/import modal state.
- `src/modules/auth/domain/authStore.ts` - login/logout transition, chỗ cần reset shell state.
- `src/App.tsx` - shell mount path, xác nhận regression nằm ở UI state chứ không phải API/DB.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - Không có collection/field DB mới.
  - Smoke các endpoint runtime đang dùng: `journal-entries`, `payment-vouchers`, `employees`.
- Data nền cần có:
  - Tài khoản test đăng nhập hợp lệ trên staging.
- Constraint/index/default cần có:
  - Không áp dụng; scope là UI shell state.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [ ] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result:
  - Login lấy token staging thành công với tài khoản test.
  - Smoke API:
    - `/api/v1/journal-entries?page=1&pageSize=1` -> `200`
    - `/api/v1/payment-vouchers?page=1&pageSize=1` -> `200`
    - `/api/v1/employees?page=1&pageSize=1` -> `200`
- `npx tsc --noEmit`:
  - PASS (`exit_code=0`)
- Smoke test:
  - `npm run build` PASS.
  - Runtime smoke/deploy và login-cleanliness: pending cập nhật sau deploy.

## Lessons Learned

- Link entry: `docs/lessons-learned/20260524-shell-state-login-regression.md`

## Commit/Push Status

- Web repo: pending
- API repo: không thay đổi
- DB/directus staging: apply+verify+document (no code push required) — không thay đổi DB; Gate 0 runtime/API smoke PASS
