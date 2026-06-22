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

## Recently closed (2026-06-22 — reconcile session)

- `docs/tasks/add-column-visibility.md` ← DONE (`51a2773`, `b13e672`)
- `docs/tasks/remove-dead-ui-tables.md` ← DONE (`21d9373`)
- `docs/tasks/update-production-drawer-ui.md` ← DONE (`abe7a1f`)
- `docs/tasks/20260621-manufacture-progress-drawer.md` ← DONE (implementation), QC_PENDING (manual smoke staging)
- `docs/tasks/20260621-production-order-qty-validation-alt-item-code.md` ← DONE (`664231f`)
- `docs/tasks/20260620-erp-production-start-complete-auto-warehouse.md` ← DONE
- `docs/tasks/20260621-bom-combobox-option-cache.md` ← DONE (`5e21328`, `dc2841b`)
- `docs/tasks/20260621-mo-bom-selection-ref-autofill.md` ← DONE (`52b5282`, `f278cb2`, `a12109c`, `14fa12d`)
- `docs/tasks/20260621-mo-dynamic-identifiers-and-bom-bugfixes.md` ← DONE (bulk vehicle complete, dynamic identifiers, BOM bugfixes)
- `docs/tasks/feat-env-stamp.md` ← DONE (`69cb59d`)
- `docs/tasks/feat-env-stamp-refactor.md` ← DONE (`69f72db`, `eb93ac1`)
- `docs/tasks/column-reorder-preferences.md` ← DONE (`aa8ca5e`)
- `docs/tasks/20260622-bom-activate-inactivate-and-production-filter.md` ← DONE (`b292ce3`)

## Recent closed / reconciled lineage (2026-06-22 evening)

Earlier commits already reflected:
- `22b53ee` — refactor ProductionRunDrawer layout + double-drawer fix
- `c0648e7` — BOM drawer + table formatting
- `b292ce3` — BOM activate/inactivate + active-BOM filter in production
- `aa8ca5e` — draggable column reorder + preferences persistence
- `411db2d` — production progress UI columns and sorting
- `ffc2bac` — production sort param serialization fix
- `69cb59d` — EnvStamp float
- `69f72db` — EnvStamp Zustand refactor + shared enum
- `e49b517` — UI enhancements + company profile integration
- `eb93ac1` — EnvStamp right edge position
- `bcd20bb` — company profile drawer modal style reuse

Latest commits now reconciled:
- `058e00d` — sidebar refactor + `useFaviconEffect` lint fix
- `87b910a` — inventory tables UI sync + server-side sorting
- `cabeecc` — `is_lio_device` quick admin login flag
- `5ef8e60` — warehouse silent printing + print templates
- `7c1fc83` — global loading bar + theme order update
- `f92bee4` — MO drawer UI/BOM auto-selection/translations improvements

Related closure artifact:
- `docs/tasks/20260622-sidebar-refactor-inventory-sorting-warehouse-print.md`
- existing task artifacts already present:
  - `docs/tasks/20260622-global-loading-theme-refactor.md`
  - `docs/tasks/add-is-lio-device-flag.md`

## Current checkpoint gap (2026-06-22 evening)

- Previous dirty blocker `src/core/components/layout/Sidebar.tsx` is resolved in committed lineage (`058e00d`).
- Company profile + R2 API feature (`e06188e`) now has API closure artifact; Web side only needs follow-up if/when company-profile UI surface expands.
- Pending staging QC: smoke test ProductionRunDrawer with MO status CONFIRMED / IN_PROGRESS, unit-by-unit mode (≤50) and batch mode (>50), plus vehicle tracking complete-all flow.

## Current lane lessons

- Accounting pages (`erp-accounting-journal`, `erp-accounting-config`) rely on `src/modules/accounting/api/accountingApi.ts`; this client must use `/api/v1/journal-entries` and `/api/v1/accounting-configs` (not relative root paths, not `accounting-configs-core`).
- Với Zustand page stores trong web repo, không lấy cả `store` object rồi đưa vào `useEffect` dependencies nếu effect gọi `set...`; phải tách selector cụ thể để tránh render loop/page freeze.
- Khi thêm ERP module mới có permission-gated pages, luôn verify cùng lúc 3 lớp: FE route path, BE controller path, và `rbac-core/collections` resource list.

## Historical signal

Những task cũ về AR / voucher / shell experiments / tax-portal / einvoice / Directus-first flow phải được xem là historical/reference trừ khi user mở lại scope đó.
