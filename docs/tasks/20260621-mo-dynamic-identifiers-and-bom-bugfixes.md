# Task: MO dynamic identifiers + BOM/MO bugfix batch

## Scope

- ProductionRunDrawer dynamic identifier entry (VIN/Engine/Serial) during complete MO
- BOM tree bugfixes and MO validation/display fixes from implementation plan `/home/lio/.gemini/antigravity-ide/brain/8ff6f73e-166a-4a7f-bad5-a6c1d0144e74/artifacts/implementation_plan.md`

## UI

- Dynamic identifier rows based on trackingPolicy
- BOM alt-item naming fix
- BOM qty display fix (remove FE double multiplication)
- Confirm validation for warehouseCode
- Circular BOM guard in ErpBomPage
- Improve qty clarity/prefill in ProductionRunDrawer

## Verification

- bunx tsc --noEmit
- bun run lint:check
- bunx vitest run

## Risks

- Dirty local dev changes in web repo must not be mixed or overclaimed
- Identifier UI must stay aligned with API DTO shape

## Rollback

- Revert repo commit(s) in Web repo only
