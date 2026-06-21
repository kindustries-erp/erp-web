# Add Column Visibility Toggle to Tables

## Context

The user requested a feature to select which columns to render in a table. It was determined that the best architectural choice was to build this into the underlying `DataTable` and expose it to `StandardTable` via a new prop `enableColumnVisibility`.

## Implementation Details

- `src/shared/components/DataTable.tsx`:
  - Added `enableColumnVisibility` prop to `DataTableProps` and `StandardTableProps`.
- Created an inline DropdownMenu in `DataTable` using Radix UI that controls the column visibility.
- Modified `DataTableColumn` to accept a `hideable` and `label` prop. Columns like actions are non-hideable by default.
- Pushed changes to `github-industries/erp-master`.

### Phase 2: Hoisting State to TableActionGroup

- **Problem**: The user wanted the "Hiển thị" toggle to be rendered right next to the "Filter" button, which resides in the `<TableActionGroup>` component placed in the Page Header, while the table sits in the Page Body.
- **Solution**: Created a custom hook `useColumnVisibility` that hoists the `columnVisibility` state up to the Page level.
  - The hook provides a `<ColumnToggle />` component (with i18n translation `t("Hiển thị")`) that can be safely rendered inside `<TableActionGroup>`.
  - The hook returns `visibility` state and an `onVisibilityChange` handler, which are passed down into `<StandardTable>`.
- **Pages Updated**:
  - `ErpSalesOrdersPage`
  - `PurchaseOrderListPage`
  - `ErpInventoryItemsPage`
  - `ErpWarehousePage`
  - `ErpBomPage`
  - `ProductionOrderListPage`
  - `InventoryMasterPage`
- Verified all components with `bun run lint` and `bun run tsc --noEmit`.

- `src/shared/components/StandardTable.tsx`:
  - Added `enableColumnVisibility` to `StandardTableProps`.
  - Passed the prop down to the wrapped `DataTable`.
