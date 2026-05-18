# Task — ERP Web AR Phase 2A Sales Invoice Posting UI

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Thêm UI tối thiểu trong AR Workbench để tạo hóa đơn bán hàng công nợ, post và reverse invoice.
- Bối cảnh/ngữ cảnh: API Phase 2A added create/post/reverse endpoints. UI phải giữ flow cũ và dữ liệu hiện có an toàn.

## Goal

Người dùng tạo draft sales invoice có line/tax trong AR Workbench, post invoice để sinh JE, và reverse posted invoice chưa thanh toán bằng action rõ ràng.

## Scope

- In-scope:
  - Finance API client types/functions for sales invoice create/post/reverse.
  - AR Workbench drawer supports sales invoice lines and actions in document table.
  - Build/regression smoke.
- Out-of-scope:
  - Full master-data picker for customers/items/accounts.
  - Receipt allocation UI (Phase 2B).

## Relevant Files

- `src/modules/finance/api/financeApi.ts`
- `src/modules/finance/components/ArWorkbenchPanel/index.tsx`
- `docs/tasks/20260511-ar-phase2a-sales-invoice-web.md`

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: `ar_documents`, `ar_document_lines`, `journal_entries`, `journal_entry_lines`, `chart_of_accounts`, `business_partners`.
- Data nền cần có: accounts `131`, `511`, `3331`; customers/business partners.
- Constraint/index/default cần có: Phase 2A DB triggers/indexes already applied.
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: stop and return to DB task.

## Coordination Impact

- [x] ERP API affected
- [x] ERP Web affected
- [ ] No cross-system impact

## Checklist (cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 API client contract done
- [ ] 3.0 UI workflow done
- [ ] 4.0 Validate
  - [ ] 4.1 `npm run build`
  - [ ] 4.2 Browser/API smoke after deploy
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code
  - [ ] 5.3 Summary with evidence

## Validation Evidence

- DB precheck: `DB_READY`
- Build:
- Smoke:

## Lessons Learned

- Link: No issue yet

## Commit/Push Status

- Web repo: pending
