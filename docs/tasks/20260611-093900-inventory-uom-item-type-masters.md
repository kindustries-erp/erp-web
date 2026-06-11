# ERP Core Web Task — Inventory UOM + Item Type Masters

## Scope

- Lane: `erp-core`
- Goal: replace hardcoded UOM/item-type options in inventory item UI with live master data and expose lightweight config pages.

## Gate 0 DB precheck

- UI currently hardcodes item type and UOM option arrays in `ErpInventoryItemsPage.tsx`.
- Backend currently exposes only inventory items, not UOM/item-type masters.
- Initial DB/API result: `DB_GAP_FOUND` until API masters exist.

## UI contract target

- Inventory item form loads master options from API.
- New pages allow add/edit/deactivate UOM and item type masters.
- Existing inventory item page remains under `Kho` and uses same shell/components.

## Acceptance

- Build passes.
- Inventory item drawer shows live options.
- Config pages can create/edit/deactivate masters.
- Existing item list/create/edit continues working.

## Risk / rollback

- FE-only rollback possible by reverting routes/pages and returning to hardcoded options.
