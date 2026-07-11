# Task: Fix MO create BOM mapping, alternative item selection, and GI modal close

> **Created:** 2026-06-20
> **Lane:** erp-master
> **Repo:** `liouni-erp-web`
> **Status:** DONE

## Scope

- Fix BOM table display in MO create flow so component SKU/name render correctly.
- Add alternative inventory item selection for lacking material rows.
- Override submit material itemId with selected alternative item when present.
- Fix Inventory Issue drawer close/cancel action.

## Result

- BOM drawer now renders component code/name correctly instead of exposing raw item UUID in the code column.
- Lacking-stock lines in MO create now expose alternative inventory item selection and show selected replacement state.
- Submit flow reuses existing `materialOverrides` payload contract to override material item at API level.
- GI drawer close/cancel issue was verified as already fixed in source; no additional patch beyond carrying the in-flight change.

## Evidence target

- BOM rows show correct component code/name after selecting BOM.
- Alternative item dropdown renders for lacking rows and selected state is visible.
- Submit path sends overridden `itemId` for selected alternative rows.
- GI drawer close/cancel action works.

## Verification

- PASS: `bunx tsc --noEmit`
- PASS: `bun run lint:check`
- PASS: `bunx vitest run`
