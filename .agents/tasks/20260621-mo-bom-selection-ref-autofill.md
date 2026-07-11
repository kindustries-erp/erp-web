# Task: MO BOM Selection + Auto-fill ReferenceNo — Web

## Plan Source

`/home/lio/.gemini/antigravity-ide/brain/5d1b2c70-a33f-4887-a456-27aed6bcfcb2/implementation_plan.md`

## Scope (Web)

1. `productionCoreApi.ts` — add `getNextReferenceNo()`, add `bomId` to `ExecuteProductionPayload`
2. `useProductionOrderDrawer.ts` — auto-fill referenceNo, BOM selection state + effects
3. `ProductionOrderDrawer.tsx` — BOM version Combobox (visible when availableBoms > 1), referenceNo label hint

## Checklist

- [x] API client: getNextReferenceNo, bomId
- [x] Hook: auto-fill referenceNo on create open
- [x] Hook: availableBoms state, fetch on finishedGoodItemId change
- [x] Hook: bomId form field, watch to reload BOM lines
- [x] Hook: include bomId in execute/update payload
- [x] Drawer: BOM version Combobox field
- [x] bunx tsc --noEmit — PASS
- [x] bun run lint:check — PASS
- [x] bunx vitest run — PASS
- [x] Commit + push

## Bugs Fixed (post-initial)

- BOM lines not reloading when user changes BOM: added `form.bomId` to BOM lines effect deps
- Wrong BOM used at create: create path now resolves via `form.bomId` first, skips list call
- Edit mode cannot reselect BOM: removed `editing` early-bail in `availableBoms` effect; edit mode loads BOM list but skips auto-select (preserves saved bomId)
- Edit mode BOM lines: now also resolves via `form.bomId` first (reflects user reselection)

## Commits

- `52b5282` — feat(production): BOM version selector + auto-fill MO reference number on create
- `f278cb2` — fix(production): BOM lines reload on bomId change; use selected bomId in payload not server-default
- `<next>` — fix(production): enable BOM reselection in edit/draft mode

## Status: DONE
