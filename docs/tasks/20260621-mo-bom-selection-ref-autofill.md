# Task: MO BOM Selection + Auto-fill ReferenceNo — Web

## Plan Source
`/home/lio/.gemini/antigravity-ide/brain/5d1b2c70-a33f-4887-a456-27aed6bcfcb2/implementation_plan.md`

## Scope (Web)
1. `productionCoreApi.ts` — add `getNextReferenceNo()`, add `bomId` to `ExecuteProductionPayload`
2. `useProductionOrderDrawer.ts` — auto-fill referenceNo, BOM selection state + effects
3. `ProductionOrderDrawer.tsx` — BOM version Combobox (visible when availableBoms > 1), referenceNo label hint

## Checklist
- [ ] API client: getNextReferenceNo, bomId
- [ ] Hook: auto-fill referenceNo on create open
- [ ] Hook: availableBoms state, fetch on finishedGoodItemId change
- [ ] Hook: bomId form field, watch to reload BOM lines
- [ ] Hook: include bomId in execute/update payload
- [ ] Drawer: BOM version Combobox field
- [ ] bunx tsc --noEmit — PASS
- [ ] bun run lint:check — PASS
- [ ] bunx vitest run — PASS
- [ ] Commit + push

## Commit
- pending
