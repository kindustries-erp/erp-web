# Task — Unify Cash/Bank forms and remove AR duplicate flows

## Type

ENHANCE

## Scope

- Cash/Bank is the only create/update surface for: Phiếu thu, Đặt cọc, and cash/bank-linked AR settlement flows.
- AR Workbench only creates/manages AR documents/invoices and acts as source documents to link from Cash/Bank.

## Gate 0 DB precheck

- Result: DB_READY
- Evidence: existing tables checked before ACT: payment_vouchers, cash_bank_tag_presets, cash_bank_related_documents, ar_documents, ar_applications.
- Existing columns support customer advance state on payment_vouchers.

## Checklist realtime

- [x] API: remove AR Workbench write routes for duplicate payment/deposit/application flows.
- [x] API: keep Cash/Bank payment-voucher contract accepting customer advance voucher type.
- [x] UI: add Đặt cọc create action to Tiền mặt and Tiền gửi.
- [x] UI: remove Phiếu thu, Đặt cọc, Cấn trừ cọc tabs from Phải thu.
- [x] UI: link open AR documents from Cash/Bank related documents editor.
- [x] Web build passes.
- [x] Deploy + smoke verify.

## Gate validations

- Build: `npm run build`.
- Phải thu no longer exposes duplicate create tabs for Phiếu thu/Đặt cọc/Cấn trừ cọc.
- Tiền mặt/Tiền gửi expose unified Đặt cọc button plus existing receipt/payment buttons.
- Cash/Bank related documents can add AR documents.

## Risks

- Existing users may expect old AR tabs. Mitigation: AR Workbench copy explains Cash/Bank owns these flows.
- Customer advance voucher type must satisfy DB shape constraints: receipt direction, external counterparty.

## Rollback

- Revert web commit and redeploy web stack.
- If API routes are needed temporarily, revert API controller commit and redeploy API.
