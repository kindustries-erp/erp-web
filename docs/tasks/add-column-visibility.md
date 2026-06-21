# Add Column Visibility Toggle to Tables

## Context
The user requested a feature to select which columns to render in a table. It was determined that the best architectural choice was to build this into the underlying `DataTable` and expose it to `StandardTable` via a new prop `enableColumnVisibility`.

## Implementation Details
- `src/shared/components/DataTable.tsx`:
  - Added `enableColumnVisibility` prop.
  - Linked `useReactTable` to `columnVisibility` component state.
  - Rendered a `@radix-ui/react-dropdown-menu` next to filters allowing users to toggle column visibility.
  - Added `hideable` and `label` properties to `DataTableColumn` so structural columns (like `actions`) remain locked.
- `src/shared/components/StandardTable.tsx`:
  - Added `enableColumnVisibility` to `StandardTableProps`.
  - Passed the prop down to the wrapped `DataTable`.
