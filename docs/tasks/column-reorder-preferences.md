# Column Reorder & User Preferences

## Status

- [ ] In Progress

## Precheck (Gate 0)

- DB/API check: `DB_READY`. The preference storage will use local storage exclusively as per user request. No DB changes needed.

## Sub-tasks

- [x] Cài đặt `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- [x] Tạo `src/shared/hooks/useUserPreferences.ts`
- [x] Update `ColumnToggle` trong `DataTable.tsx` sử dụng `@dnd-kit` và `Popover`
- [x] Truyền `tableId` vào các instance của `DataTable` (VD: BOM table)
- [x] Kiểm tra lỗi và confirm (Smoke check)

## Lessons Learned

- (Will be added if any issues arise)
