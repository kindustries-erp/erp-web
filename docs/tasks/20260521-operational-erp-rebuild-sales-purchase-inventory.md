# Operational ERP Rebuild — Sales / Purchase / Inventory

- Source contract: `/opt/docs/ai/liouni-erp/tasks/20260521-operational-erp-rebuild-sales-purchase-inventory.md`
- Status: IN_PROGRESS

## Checklist

- [x] Read AGENTS + technical instructions + app structure + shared ERP context
- [x] Record Gate 0 DB precheck result from shared task
- [x] Add new page keys/routes for sales purchasing inventory receivables payables
- [x] Replace placeholder sales/purchasing screens with operational pages
- [x] Add sales-service-order list/detail shell
- [x] Add purchase-order and operating-expense list/detail shell
- [x] Add inventory movement/tồn kho shell
- [x] Add receivable/payable summary shells
- [x] Hide/deprecate legacy operational AR/AP create paths from new navigation surfaces
- [x] Build + route smoke
- [ ] Commit + push

## Evidence

- Build: `npm run build` exit 0 in `/opt/repos/liouni-erp-core/liouni-erp-web`.
- Routes/pages added: `Sales.tsx`, `Purchasing.tsx`, `OperatingExpenses.tsx`, `Inventory.tsx`, updated `Receivables.tsx`, `Payables.tsx`.
- API client added: `src/modules/operational/api/operationalApi.ts`.
- Shared list shell added: `src/modules/operational/components/OperationalListPage.tsx`.
- Navigation/URL/store/i18n updated: `App.tsx`, `Sidebar.tsx`, `appStore.ts`, `pageUrl.ts`, `vi.ts`, `en.ts`, `PageKey`.

## Notes

- Reuse shell routing/store patterns; avoid breaking current cash/bank and settings pages.
- Preserve e-invoice page capability for later reuse.
- Inventory is MVP shell only until detailed stock movement form is finalized.
