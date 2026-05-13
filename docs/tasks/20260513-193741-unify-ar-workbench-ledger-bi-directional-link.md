# Task — Unify AR Workbench with Ledger and Enhance Cash/Bank Bi-directional Linking

## Type
ENHANCE

## Gate 0 — DB Precheck
- Result: `DB_READY`.
- Existing fields verified in PLAN: `ar_documents.business_partner_id/open_amount/settled_amount/total_amount`, `payment_vouchers.counterparty_id/amount`, `cash_bank_related_documents.related_id/related_type`.
- No schema change required for this pass.

## Execution Checklist
- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend contract checked: `getArDocumentsApi` already supports `business_partner_id` filter
- [x] 3.0 UI: `PhaiThu` now opens a single AR Workbench flow instead of separate Workbench/legacy toggle
- [x] 3.1 UI: AR Workbench embeds current receivable ledger section in the same flow
- [x] 3.2 UI: Cash/Bank related documents selector filters AR documents by selected `counterparty_id`
- [x] 3.3 UI: Copy/in-flow navigation clarified as bi-directional AR ledger <-> Cash/Bank linkage
- [x] 4.0 Build validation: `npm run build` passes
- [ ] 5.0 Commit/push/deploy/verify

## Evidence to collect
- Web build output.
- Bundle marker after deploy:
  - `Invoice + Sổ công nợ`
  - `danh sách chỉ hiện chứng từ công nợ của đối tượng đó`
- Runtime smoke: web root HTTP 200 and no initial console crash.

## Risk + Rollback
- Risk: Embedding ledger inside AR Workbench makes AR page heavy.
- Mitigation: keep compact wrapper and existing ledger filters/table behavior intact.
- Rollback: revert web commit; DB/API untouched.
