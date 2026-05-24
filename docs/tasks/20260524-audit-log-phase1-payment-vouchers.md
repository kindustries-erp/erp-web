# Task — UI Audit Timeline Phase 1 cho Payment Vouchers

## Request Input (bạn chỉ cần điền phần này)

- Type: FEATURE
- Mục tiêu: Đổi UI history payment voucher sang timeline API sanitized của audit backbone phase 1.
- Bối cảnh/ngữ cảnh: `CashVoucherDrawer` và `BankVoucherDrawer` đang render `ApprovalHistory` mock/flow-specific; cần chuyển sang timeline thật.

## Goal

Refactor `ApprovalHistory` để consume timeline endpoint mới của `payment_vouchers`, không phụ thuộc flow-specific approval log hay mock data.

## Scope

- In-scope:
  - cập nhật `financeApi.ts` thêm timeline types + API call
  - cập nhật `ApprovalHistory` component dùng timeline thật
  - giữ nguyên 2 drawer hiện có
- Out-of-scope:
  - màn admin audit viewer
  - timeline cho entity khác

## Relevant Files

- `src/modules/finance/api/financeApi.ts` - type + API call timeline
- `src/modules/finance/components/ApprovalHistory/index.tsx` - render timeline
- `src/modules/finance/components/CashVoucherDrawer/index.tsx` - surface hiện có
- `src/modules/finance/components/BankDeposit/BankVoucherDrawer.tsx` - surface hiện có

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `payment_vouchers`
  - `audit_logs` (new phase 1 backbone)
- Data nền cần có:
  - payment voucher đã có activity timeline
- Constraint/index/default cần có:
  - API timeline route phải trả sanitized DTO
- Kết quả: `DB_GAP_FOUND`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `/opt/docs/ai/liouni-erp/tasks/2026-05-24-plan-full-api-audit-logging.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: phase-1 `audit_logs` backbone đã apply + verify
- `npx tsc --noEmit`: PASS
- Smoke test:
  - Docker rebuild Web PASS; container `liouni-erp-web` recreated từ image `liouni-erp-web-liouni-erp-web`
  - HTTP check `http://127.0.0.1:8808` => `200 OK`
  - UI đang trỏ vào timeline API thật qua contract mới `getPaymentVoucherTimelineApi`
  - backend mutation smoke đã ghi được audit thật cho voucher `PT-QC-QCSEED-9CB78BAB` để UI có dữ liệu hiển thị

## Lessons Learned

- Không có issue / hoặc link entry: `No issue`

## Commit/Push Status

- Web repo: pending
- API repo: pending
- DB/directus staging: apply+verify+document (no code push required)
