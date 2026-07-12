# Task: Hide Mobile Scrollbar for App Content

## Problem

In mobile view, the shell theme shows a scrollbar in the app content area, which the user wants to hide, similar to how it is (or should be) in the classic theme.

## Proposed Changes

1. Update `src/styles/shell.css` to hide scrollbars for `.app-content` in the mobile media query.
2. Apply `scrollbar-width: none` and `::-webkit-scrollbar { display: none; }`.

## Checklist

- [x] Hide scrollbars for `.app-content` in mobile media query in `src/styles/shell.css`.
- [x] Smoke check on mobile.

## DB Precheck

- [x] Collections/fields: N/A
- [x] Data nền: N/A
- [x] Constraint/index/default: N/A
- Result: `DB_READY`
