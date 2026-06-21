# Current Lane Task Entry

## Active entry docs

- `docs/ai/technical-instructions.md`
- `docs/app-structure.md`
- `docs/web-current-truth-index.md`
- `docs/README.md`

## High-value current-lane tasks

- `docs/tasks/20260614-213309-erp-core-elite-ci-lane.md`
- `docs/tasks/20260613-100500-purchase-edit-description-qty-notes.md`
- `docs/tasks/20260613-084500-react-query-shared-hook-inventory-catalog.md`
- `docs/tasks/20260611-093900-inventory-uom-item-type-masters.md`
- `docs/tasks/20260609-000800-purchase-form-and-goods-receipt-ux-fixes.md`
- `docs/tasks/20260608-235700-wave2-core-flow-verification.md`
- `docs/tasks/20260607-erp-core-web-scope-cut.md`

## Current checkpoint gap

- `current-lane.md` đã được cập nhật lần này để phản ánh commit mới nhất `b13e672` (2026-06-21 continuation).
- Lineage commit gần nhất:
  - `b13e672` feat(ui): perfectly align column visibility gear icon and enable i18n support in toggle menu
  - `51a2773` feat: add column visibility toggle to DataTable and StandardTable
  - `21d9373` chore: remove dead UI table components and orphaned pages
  - `abe7a1f` feat(production): enhance UI formatting in production order drawer and allow note updates
  - `a589bdf` refactor(production): align MO detail action menu and drawer production action UX
- Pending manual QC: smoke test ProductionRunDrawer với MO status CONFIRMED / IN_PROGRESS, unit-by-unit mode (≤50) và batch mode (>50).
- Lane task artifact drift đã được reconcile (2026-06-21 audit).

## High-value current-lane tasks

- `docs/tasks/add-column-visibility.md` ← DONE (committed `51a2773`, `b13e672`)
- `docs/tasks/remove-dead-ui-tables.md` ← DONE (committed `21d9373`)
- `docs/tasks/update-production-drawer-ui.md` ← DONE (committed `abe7a1f`)
- `docs/tasks/20260621-manufacture-progress-drawer.md` ← DONE (implementation lane), QC_PENDING (manual smoke)
- `docs/tasks/20260621-production-order-qty-validation-alt-item-code.md` ← DONE (committed `664231f`)
- `docs/tasks/20260620-erp-production-start-complete-auto-warehouse.md` ← DONE

## Current lane lessons

- Accounting pages (`erp-accounting-journal`, `erp-accounting-config`) rely on `src/modules/accounting/api/accountingApi.ts`; this client must use `/api/v1/journal-entries` and `/api/v1/accounting-configs` (not relative root paths, not `accounting-configs-core`).
- Với Zustand page stores trong web repo, không lấy cả `store` object rồi đưa vào `useEffect` dependencies nếu effect gọi `set...`; phải tách selector cụ thể để tránh render loop/page freeze.
- Khi thêm ERP module mới có permission-gated pages, luôn verify cùng lúc 3 lớp: FE route path, BE controller path, và `rbac-core/collections` resource list.

## Historical signal

Những task cũ về AR / voucher / shell experiments / tax-portal / einvoice / Directus-first flow phải được xem là historical/reference trừ khi user mở lại scope đó.
