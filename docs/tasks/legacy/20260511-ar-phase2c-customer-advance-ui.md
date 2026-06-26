# Task — AR Phase 2C Customer Advance UI

## Request Input (bạn chỉ cần điền phần này)

- Type: FEATURE
- Mục tiêu: Thêm UI AR Workbench cho use case #3 Khách đặt cọc trước.
- Bối cảnh/ngữ cảnh: User xác nhận execute sau ERP PLAN mode. DB/API Phase 2C thêm customer advance receipt.

## Goal

Cho phép người dùng tài chính xem và tạo/post/reverse customer advance receipts trong AR Workbench, hiển thị balance cọc còn lại.

## Scope

- In-scope:
  - API client contract cho customer advances.
  - AR Workbench tab/card/form/table cho Đặt cọc.
  - Build + route smoke.
- Out-of-scope:
  - Cấn trừ advance vào invoice (UC #4).
  - Suspense/refund/COD/gateway/FX.

## Relevant Files

- `src/modules/finance/api/financeApi.ts` - API client functions/types.
- `src/modules/finance/components/ArWorkbenchPanel/index.tsx` - AR Workbench UI.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `payment_vouchers` with customer advance fields.
  - `journal_entries`, `journal_entry_lines` for post/reverse evidence.
- Data nền cần có:
  - customer/business partner and accounts 111/112/113/131.
- Constraint/index/default cần có:
  - DB guardrails and API endpoints ready before UI smoke.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260511-ar-phase2c-customer-advance.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npm run build` (`tsc && vite build`)
  - [x] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- Build/typecheck: `npm run build` PASS in `/opt/repos/liouni-erp-web` (`tsc && vite build`). Docker image rebuild PASS; container `liouni-erp-web` recreated and started.
- Runtime: local web route `http://127.0.0.1:8808/` returned HTTP `200`.
- API-backed smoke: customer advance create/post/reverse smoke PASS through protected API; UI client contract matches endpoints.
- Note: earlier type union used `OPEN/PARTIAL`; corrected to actual DB/API values `UNAPPLIED/PARTIALLY_APPLIED`.

## Lessons Learned

- Actual Phase 2C advance status values are `UNAPPLIED`, `PARTIALLY_APPLIED`, `FULLY_APPLIED`, `REVERSED`; keep Web type union aligned with DB trigger output.

## Commit/Push Status

- Web repo: committed and pushed to `master` (`0dd450f`)
- API repo: committed and pushed to `master` (`d40c206`)
- DB/directus staging: apply+verify+document done in Directus task
