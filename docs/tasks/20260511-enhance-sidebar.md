# Task: Enhance Sidebar Styling and Mobile Behavior

## Problem
1. The sidebar in desktop mode lacks a box shadow, making it look inconsistent with the right panel.
2. In mobile mode, the sidebar slides from the bottom, which is not the desired behavior. It should slide from the left.

## Proposed Changes
1. Update `src/styles/shell.css` to add `box-shadow` to `.sidebar` in desktop mode.
2. Update `src/styles/shell.css` to change mobile sidebar transition from `translateY` to `translateX`.

## Checklist
- [x] Add box shadow to desktop sidebar in `src/styles/shell.css`.
- [x] Change mobile sidebar slide direction in `src/styles/shell.css`.
- [x] Smoke check the layout in both desktop and mobile modes (if possible).

## DB Precheck
- [x] Collections/fields: N/A
- [x] Data nền: N/A
- [x] Constraint/index/default: N/A
- Result: `DB_READY`
