# Task — ERP Web AR Workbench UI

> **HISTORICAL REFERENCE ONLY**
> Task này thuộc AR / Directus-era flow cũ. Không dùng làm default implementation guidance cho lane `erp-master` hiện tại nếu user không mở lại scope finance legacy.

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Add AR workbench UI on `/phai-thu` with optimized UX while preserving existing partner ledger flow.
- Bối cảnh/ngữ cảnh: User approved execution of AR coverage plan and explicitly requires reasonable/optimized UI UX plus no conflict with old flows/data.

## Goal

Provide a backward-compatible AR workbench UI for production AR use-case coverage visibility and core document/application/collection operations.

## Scope

- In-scope:
  - Add AR workbench tab/section to `/phai-thu` without removing existing ledger UI.
  - Display summary, coverage matrix, document list, quick create drawer/form, collection activities basics.
  - UX guardrails: clear states, low-step flows, no destructive actions, confirmation for risky actions.
  - Regression smoke for existing finance pages.
- Out-of-scope:
  - No removal of existing PartnerLedgerPage.
  - No destructive bulk migration UI.

## Relevant Files

- `src/pages/PhaiThu.tsx` - page composition.
- `src/modules/finance/api/financeApi.ts` - API contracts.
- `src/modules/finance/components/*` - AR workbench UI.
- `src/core/i18n/locales/*` - labels if required.

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: `ar_documents`, `ar_document_lines`, `ar_applications`, `ar_collection_activities` plus existing ledger/payment/journal collections.
- Data nền cần có: existing partner/account/payment data remains compatible; no seed required.
- Constraint/index/default cần có: DB/API gates must be verified before UI implementation.
- Kết quả: `DB_GAP_FOUND` until DB migration/API endpoints are verified.
- Nếu `DB_GAP_FOUND`: link DB task: `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260511-ar-use-case-coverage-plan.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
  - [x] 3.1 Add backward-compatible AR workbench entry point: `/phai-thu` now has AR Workbench tab plus legacy ledger tab
  - [x] 3.2 Implement summary/coverage/document UI with loading/error/empty states
  - [x] 3.3 Ensure old ledger flow still accessible: `Sổ công nợ hiện tại` tab keeps `PartnerLedgerPage`
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`: passed
  - [x] 4.2 Smoke test `/phai-thu`, `/phai-tra`, `/tien-mat`, `/tien-gui`, `/nhat-ky-chung`
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` after Directus phase 1 migration created additive `ar_*` collections and transaction+rollback smoke passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed; Vite emitted existing chunk-size/dynamic-import warnings only.
- Runtime image build: `/opt/stacks/liouni-erp-web docker compose build` passed after commit `db83dc4`; same existing Vite warnings only.
- Deploy: `/opt/stacks/liouni-erp-web docker compose up -d` recreated and started container `liouni-erp-web`.
- Smoke test:
  - Public routes returned HTTP 200: `/phai-thu`, `/phai-tra`, `/tien-mat`, `/tien-gui`, `/nhat-ky-chung`.
  - Runtime bundle contains `ar-workbench` in `/usr/share/nginx/html/assets/index-fidIjYmQ.js`, confirming rebuilt UI includes new AR Workbench code.

## Lessons Learned

- Không có UI-specific issue; DB lesson: `/opt/repos/liouni-erp/directus-staging/ops/lessons-learned/20260511-directus-permission-json-distinct.md`

## Commit/Push Status

- Web repo: committed and pushed `db83dc4` (`Add AR workbench UI`)
- API repo: committed and pushed `da06319` (`Add AR workbench API foundation`)
- DB/directus staging: apply+verify+document complete (no code push required)
