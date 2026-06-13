# React Query shared hook + inventory catalog first cut

## Scope

- FE-only infrastructure enhancement in `liouni-erp-core` web.
- Introduce React Query to app shell.
- Create shared reusable query hook layer for API modules.
- Apply first on inventory catalog owner screen: `InventoryMasterPage` -> `ErpInventoryItemsTab`.
- Add unit tests for shared hook/util behavior.

## Gate 0 DB precheck

- DB scope: N/A (FE-only)
- API contract used: existing `/api/v1/inventory/items`, `/api/v1/inventory/uoms`, `/api/v1/inventory/item-types`
- Result: `DB_READY` (no DB mutation required)

## Owner audit

- Mounted owner for inventory catalog tab is `src/pages/InventoryMasterPage.tsx` rendering `ErpInventoryItemsTab` from `src/pages/ErpInventoryItemsPage.tsx`.
- Current data flow uses `useEffect + useState` and `inventoryCoreApi` directly.

## Plan checklist

- [ ] Audit current owner page, API module, and app bootstrap for provider placement
- [ ] Add `@tanstack/react-query` dependency and app-level `QueryClientProvider`
- [ ] Create shared React Query helpers/hooks under `src/shared/hooks` / `src/shared/lib`
- [ ] Refactor inventory catalog item list + master-option fetch to use shared hooks
- [ ] Keep existing UI shell/components unchanged (`PageLayout`, `DataTable`, `FilterPanel`, drawer/confirm flows)
- [ ] Add unit tests for shared hook/helper behavior
- [ ] Run build + targeted vitest and record results

## Constraints

- Do not redesign shell/UI.
- Reuse existing `inventoryCoreApi` contract first; no BE change.
- Keep page ownership unchanged.
- Prefer reusable shared hook shape so other modules can adopt later.

## Verification target

- `bun run build`
- targeted `vitest` for new shared hooks/util
