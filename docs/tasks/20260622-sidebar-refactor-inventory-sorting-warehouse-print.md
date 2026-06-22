# Task: Sidebar Refactor, Inventory Sorting, and Warehouse Print Features

## Type: REFACTOR / FEATURE

## Goal
Phân tách `Sidebar.tsx` monolith thành cấu trúc module nhỏ dưới `sidebar/components/`,
thêm server-side sorting cho inventory tables, thêm silent printing từ warehouse tab,
và các cải tiến UX liên quan (global loading bar, is_lio_device flag, production MO drawer).

## Scope
- In-scope:
  - Sidebar decomposition: `058e00d`
  - Inventory server-side sorting: `87b910a`
  - Silent warehouse print + TopProgressBar: `5ef8e60`, `7c1fc83`
  - is_lio_device quick admin login flag: `cabeecc`
  - MO drawer UI + BOM auto-selection + translations: `f92bee4`
- Out-of-scope: API schema changes (no DB gate needed for these UI/refactor tasks)

## Related commits
- `058e00d` — Fix: Add eslint-disable for any type in useFaviconEffect (Sidebar refactor bundle)
- `87b910a` — refactor: sync inventory tables ui and enable server-side sorting
- `cabeecc` — feat: add is_lio_device flag for quick login admin
- `5ef8e60` — feat(erp-web): add silent printing from warehouse tab with indeterminate progress bar
- `7c1fc83` — feat: use global loading bar and update theme order
- `f92bee4` — fix(production): update MO drawer UI, BOM auto-selection, translations, and component improvements

## Gate 0 — DB Precheck
- No DB schema changes in this task bundle.
- DB gate result: `DB_READY` (UI/refactor only)

## Commit `058e00d` — Sidebar refactor detail
- `Sidebar.tsx` (403 lines) removed; replaced by module under `sidebar/`:
  - `SidebarBottom.tsx`, `SidebarHeader.tsx`, `SidebarNav.tsx`, `SidebarPrimitives.tsx`
  - `UserMenuPopover.tsx`, `sidebarIcons.tsx`, `NotificationPopover.tsx`
  - `sidebar/hooks/useFaviconEffect.ts`
  - `sidebar/index.tsx` (barrel)
- Updated imports in: `src/core/routing/index.ts`, `src/pages/ErpPermissionsCorePage.tsx`
- ESLint disable added for `useFaviconEffect` any type (minor lint fix)
- Blocker from previous session (`src/core/components/layout/Sidebar.tsx` dirty) resolved by this commit.

## Commit `87b910a` — Inventory sorting
- Server-side sorting enabled on `ErpInventoryItemsPage` and `InventoryMasterPage`
- `useInventoryItemsQuery`, `useInventoryMasterListQuery` — accept sort params
- `TablePagination` minor fix

## Commits `5ef8e60` + `7c1fc83` — Print + global loading
- `TopProgressBar` — new centralized indeterminate loading bar connected to `uiStore`
- `ErpWarehouseTab` — silent print via `setGlobalLoading`, removes inline portal loader
- `GiFormDrawer` / `GrFormDrawer` — integrated `globalLoading` for save
- `GoodsIssuePrintTemplate.tsx` + `GoodsReceiptPrintTemplate.tsx` — new print templates
- `ActionDropdown` — minor enhancement for print action

## Commit `cabeecc` — is_lio_device flag
- `Login.tsx` — show Quick Admin Login button if `localStorage['is_lio_device'] === 'true'`
  or on `localhost`

## Commit `f92bee4` — MO drawer UI fixes
- `ProductionOrderDrawer.tsx` — layout updates + BOM auto-selection
- `useProductionOrderDrawer.ts` — hook improvements
- Locale updates: `en.ts`, `vi.ts`
- `DatePicker.tsx`, `DocumentLineTable.tsx` — shared component improvements

## QC / Verification
- All commits carry pre-commit hook evidence (bunx vitest run) from push session
- `bunx tsc --noEmit` PASS (was verified in session 20260622 ~15:27)
- Worktree clean at time of push

## Risk
- Sidebar refactor is structural; if any consumer imports `Sidebar.tsx` directly (not through `sidebar/index.tsx`), it will fail at compile time. All updated paths verified in commit stat.
- Rollback: `git revert 058e00d` restores monolith Sidebar.tsx; other commits independent.

## Commit/Push Status
- Web repo: DONE — all 6 commits pushed to `github-industries erp-master` (branch `erp-master`)
- API repo: N/A
