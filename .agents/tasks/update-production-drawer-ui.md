# Update Production Order Drawer UI

## Context

The user requested several visual enhancements for the Production Order Drawer (MO drawer) table:

1. Fix the note input field so it's editable even when the MO is in `COMPLETED` state.
2. Format the `Tên Linh Kiện` and `NVL Thay Thế` columns to enforce minimum width and use ellipses (`truncate`) with tooltips on overflow.
3. Clean up the `NVL Thay Thế` badge font size to match the table.
4. Remove the `Đã xuất` and `ĐVT` columns to reduce noise.
5. Apply minimum width to `Cần dùng` and `Khả dụng` columns so their headers do not break into two lines.

## Implementation Details

- `src/modules/production-core/hooks/useProductionOrderDrawer.ts`: Updated the condition for calling `productionCoreApi.update` to include `COMPLETED`.
- `src/modules/production-core/components/ProductionOrderDrawer.tsx`:
  - Removed `issued` and `uom` columns from the `DocumentLineTable`.
  - Wrapped `Tên Linh Kiện` and `NVL Thay Thế` text inside `<Tooltip>` components.
  - Added `truncate`, `max-w-*`, `inline-block`, and `minWidth` tailwind classes and properties to ensure clean text rendering.
  - Added `minWidth: "100px"` to `required` (Cần dùng) and `available` (Khả dụng) columns.
