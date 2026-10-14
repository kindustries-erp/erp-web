# Garage Drawer Table Scroll Fix

## Change

- Drawer header stacking level is `z-40`.
- Top navigation tabs use `sticky z-30 isolate` with the drawer header background.
- DataTable scroll containers use `isolate`; table headers remain `sticky z-20`.
- Drawer body and StandardFormDrawer left content use `flex/min-h-0` so nested table scrolling stays inside the drawer viewport.

## Verification

```bash
bunx vitest run src/shared/components/DataTable/__tests__/DataTableStickyFooter.test.tsx
bunx tsc --noEmit
bun run check:ci && bun run test
```

## Manual check

1. Open Garage > Công nợ garage and open a monthly detail drawer.
2. Scroll the Phải thu/Phải trả tables and confirm the table header remains inside the table area.
3. Scroll the drawer body and confirm the drawer title, close button, fullscreen button and top tabs remain above the table content.
4. Switch to Đối tượng HĐ and repeat for Thu khách hàng and Thu bảo hiểm.
5. Verify horizontal table scrolling and opening a row detail drawer still work.
