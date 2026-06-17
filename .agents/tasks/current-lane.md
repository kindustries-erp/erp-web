# Current Lane Task Entry

## Active entry docs

- `docs/ai/technical-instructions.md`
- `docs/app-structure.md`
- `docs/web-current-truth-index.md`
- `docs/README.md`

## High-value current-lane tasks

- `docs/tasks/20260617-105325-hotfix-accounting-journal-config-pages.md`
- `docs/tasks/20260616-172700-erp-invoices-and-po-invoice-field-web.md`
- `docs/tasks/20260614-213309-erp-core-elite-ci-lane.md`
- `docs/tasks/20260613-100500-purchase-edit-description-qty-notes.md`
- `docs/tasks/20260613-084500-react-query-shared-hook-inventory-catalog.md`
- `docs/tasks/20260611-093900-inventory-uom-item-type-masters.md`
- `docs/tasks/20260609-000800-purchase-form-and-goods-receipt-ux-fixes.md`
- `docs/tasks/20260608-235700-wave2-core-flow-verification.md`
- `docs/tasks/20260607-erp-core-web-scope-cut.md`

## Current lane lessons

- Accounting pages (`erp-accounting-journal`, `erp-accounting-config`) rely on `src/modules/accounting/api/accountingApi.ts`; this client must use `/api/v1/journal-entries` and `/api/v1/accounting-configs` (not relative root paths, not `accounting-configs-core`).
- Với Zustand page stores trong web repo, không lấy cả `store` object rồi đưa vào `useEffect` dependencies nếu effect gọi `set...`; phải tách selector cụ thể để tránh render loop/page freeze.
- Khi thêm ERP module mới có permission-gated pages, luôn verify cùng lúc 3 lớp: FE route path, BE controller path, và `rbac-core/collections` resource list.

## Historical signal

Những task cũ về AR / voucher / shell experiments / tax-portal / einvoice / Directus-first flow phải được xem là historical/reference trừ khi user mở lại scope đó.
