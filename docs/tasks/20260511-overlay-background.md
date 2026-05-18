# Task: Add Overlay Background Color

## Problem

Currently, many overlays (slide panels, modals) have a transparent background, which can make them hard to distinguish from the content below. The user wants to add a subtle `rgba(0,0,0,0.1)` background to these overlays.

## Proposed Changes

1. Update `src/styles/panels.css`:
   - Change `.slide-panel-overlay` background to `rgba(0, 0, 0, 0.1)`.
   - Change `.import-modal-overlay` background to `rgba(0, 0, 0, 0.1)`.
2. Update `src/shared/components/ConfirmModal.tsx`:
   - Add `backgroundColor: "rgba(0, 0, 0, 0.1)"` to the overlay container.

## Checklist

- [x] Update `.slide-panel-overlay` in `src/styles/panels.css`.
- [x] Update `.import-modal-overlay` in `src/styles/panels.css`.
- [x] Update `ConfirmModal.tsx` to include overlay background.
- [x] Smoke check overlays.

## DB Precheck

- [x] Collections/fields: N/A
- [x] Data nền: N/A
- [x] Constraint/index/default: N/A
- Result: `DB_READY`
