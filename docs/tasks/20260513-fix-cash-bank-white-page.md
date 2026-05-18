# Task — Fix cash/bank white page after preset UI deploy

## Type

FIX

## Scope

- In scope: ERP Web crash `Cannot read properties of undefined (reading 'length')` from cash/bank drawer preset/related-doc UI.
- Out of scope: DB schema/API behavior changes; AR Workbench changes.

## Gate 0 DB Precheck

- Result: DB_READY
- Reason: runtime error is frontend render nullability/prop wiring; no DB schema change required.

## Root Cause

- `TienMat.tsx` did not destructure/pass `tagPresets` and `handleTagPresetSelect` from `useCashVoucherHandlers` into `TienMatView`.
- `CashBankTagPresetCards` assumed `presets` is always an array and accessed `.length`, causing white page when prop was undefined.

## Plan DB -> API -> UI

- DB: no change.
- API: no change.
- UI:
  - Pass missing hook return values in `TienMat.tsx`.
  - Harden preset/related-doc components with array fallbacks.

## Checklist realtime

- [x] Root cause identified.
- [x] UI patch applied.
- [x] Web build passes.
- [x] Commit + push web: `013bb23 fix: prevent cash bank drawer white page`.
- [x] Deploy web stack: rebuilt with no cache and recreated `liouni-erp-web`.
- [x] Smoke verify route no longer white page: local login page renders, HTTP 200, no browser console crash on entry route.

## Evidence required

- `npm run build` web output.
- Web container status Up.
- Local HTTP route returns 200 after deploy.
