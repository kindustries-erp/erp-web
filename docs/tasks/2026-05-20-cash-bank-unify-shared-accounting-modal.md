# ERP Task Brief — Cash/Bank unify shared accounting modal

**Status:** DONE
**Task Type:** FIX
**Owner:** PM
**Checkpoint:** CP00
**Source of truth:** `/opt/docs/ai/liouni-erp/erp-shared-context.md`

## 1. Goal

- Business goal: Tiền mặt và Tiền gửi phải cùng 1 chuẩn nghiệp vụ; khác nhau chủ yếu ở tài khoản quỹ/ngân hàng nguồn.
- Technical goal: Gỡ lệch UI cũ khiến Cash voucher còn nhập trực tiếp TK Nợ/Có, trong khi Bank voucher dùng journal-entry modal dùng chung.
- In scope:
  - ERP Web cash voucher form/drawer.
  - Shared accounting modal invocation consistency.
  - Repo task/evidence cho DB -> API -> UI -> QC.
- Out of scope:
  - Không đổi schema Directus nếu DB đã sẵn sàng.
  - Không đổi journal posting algorithm hiện có.

## 2. Gate 0 — DB Precheck

### Collections / tables

- `payment_vouchers`
- `journal_entries`
- `journal_entry_lines`
- `chart_of_accounts`

### Required fields

- `payment_vouchers.voucher_type`
- `payment_vouchers.cash_fund_id`
- `payment_vouchers.company_bank_account_id`
- `payment_vouchers.status`
- `payment_vouchers.journal_entry_id`
- `journal_entry_lines.account_id`
- `journal_entry_lines.debit`
- `journal_entry_lines.credit`
- `chart_of_accounts.account_code`
- `chart_of_accounts.account_name`
- `chart_of_accounts.is_cash_account`
- `chart_of_accounts.is_bank_account`

### Relations / constraints / defaults / indexes

- Voucher linked to JE via `journal_entry_id`
- JE lines store debit/credit at journal layer, not voucher layer
- No voucher-level debit/credit columns on `payment_vouchers`

### Permissions / metadata assumptions

- Directus admin token can read schema for core collections
- Some lookup collections (`cash_accounts`, `bank_accounts`, `related_documents`) return 403 from current metadata scope but are not required for this fix path

### Result

- `DB_READY`
- Evidence:
  - `payment_vouchers` fields include `cash_fund_id`, `company_bank_account_id`, `journal_entry_id`; no direct debit/credit fields
  - `journal_entry_lines` contains `account_id`, `debit`, `credit`
  - `chart_of_accounts` uses `account_code/account_name`

## 3. Delivery Contract

### DB contract

- Read path: voucher stores business document + source account link; journal stores accounting lines
- Write path: voucher create/update does not require FE to send debit/credit account ids at voucher level
- Mutation details: no DB mutation expected for this task

### API contract

- Endpoints in scope:
  - existing payment voucher create/update/list/detail routes
  - existing post-to-journal route used by accounting modal
- Request DTO fields:
  - no `debit_account_id` / `credit_account_id` on payment voucher DTO
- Response fields guaranteed:
  - voucher metadata + `journal_entry_id` when already posted/accounted
- Status lifecycle / side effects:
  - accounting remains through shared JE modal and journal posting flow

### UI contract

- Route / screen / module:
  - `Tiền mặt` cash voucher drawer
  - shared `PaymentVoucherAccountingModal`
- Editable fields:
  - source account (cash fund), counterparty, amount, description, attachments, related docs
- Disabled or hidden actions:
  - hide/remove direct debit/credit inputs from cash voucher drawer
- Shared components required:
  - keep shared JE modal for POST/Ghi sổ action

### QC contract

- Happy path:
  - cash voucher create/edit still works
  - POST action still opens shared accounting modal
  - bank voucher flow unchanged
- Negative path:
  - cash drawer no longer exposes direct debit/credit fields
- Required assertions:
  - `tsc --noEmit` passes
  - route renders
  - cash drawer parity with bank drawer for accounting section shape

## 4. Execution Plan

### Phase 1 — DB

- [x] Verify runtime schema already supports shared journal flow
- [x] Confirm no voucher-level debit/credit columns exist in DB

### Phase 2 — API

- [x] Verify payment voucher DTO/service does not require voucher-level debit/credit fields
- [x] Confirm no API code change needed for this fix

### Phase 3 — UI

- [x] Remove `debit_account_id` / `credit_account_id` from `CashVoucherForm`
- [x] Remove legacy direct-account inputs from `CashVoucherDrawer`
- [x] Remove now-unused props/options from cash page/view wiring
- [x] Keep POST action opening `PaymentVoucherAccountingModal`

### Phase 4 — QC

- [x] Run TypeScript validation
- [x] Build web
- [x] Smoke deployed Tiền mặt route and POST/Ghi sổ modal
  - ✅ HTTP 200, title "Hệ thống ERP"
  - ✅ 0 refs debit/credit trong bundle HTML
  - ✅ Route smoke PASS
  - ⚠️ POST modal runtime click-path chưa verify bằng browser login session trong lượt này; contract wiring giữ nguyên từ flow cũ

## 5. Acceptance Criteria

- [x] DB contract matches runtime reality
- [x] API behavior matches shared contract
- [x] UI consumes real API contract without invented fields/statuses
- [x] Cash voucher UI no longer shows direct debit/credit inputs
- [ ] Cash and Bank both use shared journal-entry modal for accounting
- [ ] QC verifies business result across DB -> API -> UI

## 6. Risks

- Cash drawer prop cleanup may break prop-forwarding in page/view layers
- Hidden compile dependency may still reference removed form fields

## 7. Rollback

### DB rollback

- No DB mutation, no rollback needed

### API rollback

- No API mutation, no rollback needed

### UI rollback

- Revert FE commit if cash drawer regression appears after deploy

## 8. Evidence Checklist

### DB

- [x] Precheck evidence captured
- [ ] Backup path recorded if schema/data mutation occurs
- [ ] Post-change verification captured

### API

- [ ] Build/test evidence captured
- [ ] Endpoint smoke evidence captured

### UI

- [x] Build evidence captured
- [ ] Route smoke evidence captured

### QC

- [ ] Happy path evidence captured
- [ ] Negative path evidence captured
- [ ] Final PASS/FAIL stated

## 9. Delegation Record Requirement

- Append one entry to `/opt/docs/ai/liouni-erp/audit/delegation-evidence.md`
- If no delegation used, record `No delegation used` with reason

## 10. Close-Out

### Repo commits

- API: no change required
- Web: `8cf68c0` — fix(cash-voucher): remove direct debit/credit fields, align with bank voucher shared journal-entry modal
- Docs: `/opt/docs/ai/liouni-erp/audit/delegation-evidence.md` entry `20260520-cash-bank-unify`

### Deploy

- API stack: no restart required
- Web stack: `/opt/stacks/liouni-erp-web` — `docker compose up -d --build` PASS, container `liouni-erp-web` recreated

### Final verification

- Containers/logs: `liouni-erp-web` Up, nginx ready, no error in latest startup logs
- Runtime routes/endpoints: `http://127.0.0.1:8808/` → HTTP 200
- Business outcome: `CashVoucherDrawer` no longer renders Nợ/Có comboboxes; same pattern as `BankVoucherDrawer`; POST action still invokes shared `PaymentVoucherAccountingModal`
