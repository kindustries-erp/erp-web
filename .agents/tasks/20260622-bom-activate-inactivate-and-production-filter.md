# Task: BOM Activation/Inactivation and Production Filter

## Status

Completed

## Context

- The user requested the removal of the '#' column in the `ErpBomPage` data table.
- Replaced the "Cancel" action with dynamic "Activate" and "Inactivate" status toggles for the BOM records.
- Filtered the product selection in the `ProductionOrderDrawer` and `ProductionOrderListPage` to only list finished goods that have an `ACTIVE` BOM.

## Implementation Plan

1. **ErpBomPage Changes**:
   - Remove the '#' column from `StandardTable`.
   - Update `actions` for BOM items to show an "Áp dụng" (`common.activate`) action for `INACTIVE` BOMs, and a "Ngừng áp dụng" (`common.inactivate`) action for `ACTIVE` BOMs.
   - Use `ConfirmModal` for status transition confirmation.
2. **Translation updates**:
   - Add `common.activate` and `common.inactivate` keys to both `vi.ts` and `en.ts` locales.
3. **Production Module Changes**:
   - Filter `bomCoreApi.list({ pageSize: 500 })` results in `useProductionOrderDrawer.ts` and `ProductionOrderListPage.tsx` to only include BOMs with `status === "ACTIVE"`.
4. **Verification**:
   - Build the frontend and ensure there are no TypeScript compilation errors.

## Execution

- Modified `ErpBomPage.tsx`
- Modified `useProductionOrderDrawer.ts`
- Modified `ProductionOrderListPage.tsx`
- Modified `vi.ts` and `en.ts`
- Verified using `bun run build`.

## Verification

- Lint and type check passed without errors.
