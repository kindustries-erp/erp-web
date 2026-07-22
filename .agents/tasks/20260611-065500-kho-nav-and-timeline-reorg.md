# ERP Core Web — Kho nav/timeline reorg

## Scope

- Move inventory movement expand/timeline from `ErpInventoryItemsPage` to the aggregate stock table on `inventory` (`Kho (Tổng hợp tồn)`).
- Move `erp-inventory-items` menu item to the end of group `Kho`.
- Rename nav label / breadcrumb / tab label for `erp-inventory-items` to `Danh mục kho`.

## Gate 0

- DB: `DB_READY`
- DB changes: none
- API dependency:
  - existing `GET /api/v1/inventory/stock`
  - existing `GET /api/v1/inventory/items/:id/movements`
- UI owner pages:
  - aggregate stock page: `src/pages/Inventory.tsx` -> `OperationalListPage variant="inventory"`
  - item master page: `src/pages/ErpInventoryItemsPage.tsx`

## Acceptance criteria

1. Expand-row movement timeline no longer appears on `Danh mục kho` item-master table.
2. Expand-row movement timeline appears on the aggregate stock table (`Kho (Tổng hợp tồn)`).
3. Sidebar `Kho` order puts `Danh mục kho` at the end of the group.
4. `erp-inventory-items` label is `Danh mục kho` in sidebar, breadcrumb, and tab label.
5. `bun run build` passes.

## Risk

- Aggregate stock rows are keyed by `inventory_item_id + branch_id`; expand-state must stay stable.
- Timeline API is item-based, so multiple branch rows for the same item will share one item-level timeline.

## Rollback

- Revert changes in:
  - `src/pages/ErpInventoryItemsPage.tsx`
  - `src/modules/operational/components/OperationalListPage.tsx`
  - `src/core/components/layout/Sidebar.tsx`
  - `src/core/config/appStore.ts`
  - locale files

## Evidence checklist

- Read mounted page/nav wiring before edits
- Build result
- Git diff for label/order/timeline move
