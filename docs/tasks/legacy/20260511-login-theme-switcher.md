# Task: Login Screen Theme Switcher

## Problem

The login screen currently lacks a theme switcher button (to toggle between "shell" and "classic" themes) and may still have a legacy "light/dark" toggle that needs to be removed/disabled.

## Proposed Changes

1. Remove/Disable any legacy light/dark toggle in `src/pages/Login.tsx`.
2. Add the `AppTheme` switcher button to `src/pages/Login.tsx`, using the same logic and styling as the one in `src/core/components/layout/Topbar.tsx`.

## Checklist

- [x] Investigate `src/pages/Login.tsx` for any remaining light/dark toggle.
- [x] Implement `AppTheme` switcher in `src/pages/Login.tsx`.
- [x] Verify the switcher works as expected.
- [x] Smoke check the login screen.

## DB Precheck

- [x] Collections/fields: N/A (UI only change)
- [x] Data nền: N/A
- [x] Constraint/index/default: N/A
- Result: `DB_READY`
