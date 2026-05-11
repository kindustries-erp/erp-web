# Task: Align Topbar Padding with Content on Mobile

## Problem
In mobile view, the Topbar has larger horizontal padding (`24px`) than the app content below it (`12px`), causing them to be misaligned.

## Proposed Changes
1. Update `src/core/components/layout/Topbar.tsx` to remove the hardcoded `px-6` Tailwind class.
2. Update `src/styles/shell.css` to define Topbar padding:
    - Desktop: `24px`
    - Mobile: `12px`

## Checklist
- [x] Remove `px-6` from `Topbar.tsx`.
- [x] Add Topbar padding styles to `src/styles/shell.css` (Desktop & Mobile).
- [x] Smoke check the alignment on mobile.

## DB Precheck
- [x] Collections/fields: N/A
- [x] Data nền: N/A
- [x] Constraint/index/default: N/A
- Result: `DB_READY`
