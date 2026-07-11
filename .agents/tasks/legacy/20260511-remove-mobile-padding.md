# Task: Remove Mobile Padding for Right Panel

## Problem

In mobile view, the right panel has padding/margin that the user wants to remove to maximize space.

## Proposed Changes

1. Update `src/styles/shell.css` to remove padding/margin from `.right-panel` and `.app-content` in mobile media query.
2. Ensure the `Topbar` and `TabBar` still look correct if they were affected by any container padding.

## Checklist

- [x] Remove padding/margin from `.right-panel` and `.app-content` in mobile media query in `src/styles/shell.css`.
- [x] Smoke check the layout on mobile.

## DB Precheck

- [x] Collections/fields: N/A
- [x] Data nền: N/A
- [x] Constraint/index/default: N/A
- Result: `DB_READY`
