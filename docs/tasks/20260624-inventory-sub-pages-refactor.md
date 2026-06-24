# Inventory Sub-Pages Refactor

## Scope

- Restructure "Inventory" page which had 3 tabs into 3 distinct sub-pages: "Stock", "Serial / Tracking", "Vouchers".
- Update the sidebar `SidebarNav` to group these 3 pages under a `NavGroup`.
- Rename navigation keys to avoid duplicate naming for 'Inventory/Warehouse' sections and group titles.
- Configure Breadcrumbs to display 3 hierarchy levels (`Warehouse > Inventory > Stock`).

## Files Changed

- `src/pages/Inventory.tsx` (Deleted)
- `src/pages/inventory/InventoryStockPage.tsx` (Created)
- `src/pages/inventory/InventoryTrackingPage.tsx` (Created)
- `src/pages/inventory/InventoryVouchersPage.tsx` (Created)
- `src/App.tsx` (Updated routes)
- `src/core/config/appStore.ts` (Updated page mappings and breadcrumbs)
- `src/shared/utils/pageUrl.ts` (Updated legacy redirects)
- `src/core/locale/en.ts` and `vi.ts` (Added missing translations)
- `src/core/components/layout/sidebar/components/SidebarNav.tsx` (Updated navigation menu)
- `src/modules/production-core/hooks/useProductionOrderDrawer.ts` (Updated hook redirect)

## Verification

- Run `bun run lint:check`
- Run `bun run tsc`
- Successful builds and no lint issues.
