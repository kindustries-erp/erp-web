# Grouped Table Actions & EnvStamp Adjustment

## Context
The table action menus in the ERP were getting crowded. We needed to organize them into logical groups (e.g., "Tra cứu" for view/details, "Thao tác" for execution/processes). Additionally, the EnvStamp was relocated to the top center.

## Changes Made
- **ActionDropdown.tsx**: Updated to support `ActionGroup` in addition to `ActionItem`, adding support for `DropdownMenu.Separator` and `DropdownMenu.Group`.
- **StandardTable.tsx**: Updated the type of the `actions` prop to support grouped actions.
- **PurchaseOrderListPage.tsx**: Grouped the table actions into "Tra cứu" and "Thao tác".
- **ErpBomPage.tsx**: Applied similar grouping.
- **ProductionOrderListPage.tsx**: Applied similar grouping.
- **EnvStamp.tsx**: Moved the stamp from the top-right to the top-center using `-translate-x-1/2` and adjusted padding/borders.

## Verification
- Code has been verified with `bun run tsc --noEmit` and `bun run lint:check`. No errors were found.
- The UI properly displays headers and separators inside the action dropdowns.
