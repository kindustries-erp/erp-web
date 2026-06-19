# Task — Mock payment voucher approval history UI

> **HISTORICAL REFERENCE ONLY**
> Task này thuộc payment-voucher / approval-history finance flow cũ. Không dùng làm default implementation guidance cho lane `erp-master` hiện tại nếu user không mở lại scope finance legacy.

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu: Giữ nguyên layout UI approval history anh vừa sửa, bỏ dependency vào API approval log cũ, chuyển sang mock data local.
- Bối cảnh/ngữ cảnh: DB + API approval log đã bị decommission. User yêu cầu lấy đúng layout UI hiện tại và đổi data source sang mock local, rồi push cả web + xác nhận API đã push.

## Goal

Preserve current `ApprovalHistory` layout while removing HTTP dependency on `/api/v1/payment-voucher-approval-logs`, using local deterministic mock data keyed by voucher id.

## Scope

- In-scope:
  - `ApprovalHistory` data source mock local
  - remove approval log API function/type usage from UI path
  - keep current drawer layout intact
  - build, deploy ERP Web, smoke route/asset markers
- Out-of-scope:
  - redesign approval history UI
  - restore backend approval log
  - change cash/bank business actions outside history display

## Relevant Files

- `src/modules/finance/components/ApprovalHistory/index.tsx` - current approval history layout + loader
- `src/modules/finance/api/financeApi.ts` - legacy approval log type/API call
- `src/modules/finance/components/BankDeposit/BankVoucherDrawer.tsx` - current mount point
- `src/modules/finance/components/CashVoucherDrawer/index.tsx` - current mount point

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: `payment_voucher_approval_logs` đã bị hard-remove khỏi DB/runtime; UI này không còn được phép phụ thuộc collection đó.
- Data nền cần có: không cần DB data live; mock local deterministic theo `voucherId`.
- Constraint/index/default cần có: no schema change.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `ops/tasks/2026-05-24-decommission-payment-voucher-approval-log-db-be.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` — approval log DB/API đã decommission; UI must be mock-only.
- `npx tsc --noEmit`: PASS
- Smoke test:
  - `npm run build` PASS
  - web image rebuild PASS
  - `liouni-erp-web` container Up after deploy
  - startup logs Nginx sạch
  - bundle verify: marker `/payment-voucher-approval-logs` absent
  - bundle verify: marker `mock-user-` present in `/usr/share/nginx/html/assets/index-DTfQ_KRV.js`

## Lessons Learned

- Không có issue / hoặc link entry:

## Commit/Push Status

- Web repo:
- API repo: already pushed separately in approval-log decommission task
- DB/directus staging: apply+verify+document (no code push required)
