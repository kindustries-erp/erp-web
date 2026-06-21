# Task: Fix BOM Form Combobox Option Cache (Prevent Selected Label Reset on Search)

## Source

Plan: `/home/lio/.gemini/antigravity-ide/brain/83ca5e1b-e84e-4e86-9073-b1f1114ded5f/artifacts/implementation_plan.md`

## Problem

When the user types to search in Thành phẩm or Linh kiện combobox inside the BOM drawer, the
`itemsData` from the API updates to match the new search term. Because `itemOptions` is derived
from `itemsData` + `editing`, selected items that don't match the current search term are dropped
from `itemOptions`, causing the Combobox to fall back to the placeholder visually — looks like the
selected value was lost.

## Scope

- FE-only: `src/pages/ErpBomPage.tsx`
- No DB/API/DTO change needed.

## Gate 0 — DB Precheck

- `DB_READY` — no schema changes required.

## Plan Steps

1. Add `cachedItems` ref (`useRef<Record<string, string>>({})`) to persist `id -> label` for every
   item loaded from API pages or selected by the user.
2. `useEffect` on `itemsData` changes → populate cache from each page's `inventoryItems`.
3. Update `itemOptions` `useMemo` to also inject:
   - `form.finishedGoodItemId` → look up label from cache
   - `form.lines[i].componentItemId` → look up label from cache
   - `filter.state.custom?.finishedGoodItemId` → look up label from cache
4. Ensure no duplicate options (deduplicate by `value`).

## Checklist

- [x] Gate 0 DB Precheck — `DB_READY`
- [x] Patch `ErpBomPage.tsx`
- [x] `bunx tsc --noEmit` — PASS
- [x] `bun run lint:check` — PASS
- [x] `bunx vitest run` — 119/119 PASS
- [ ] Commit + push

## Commit/Push Status

- pending
