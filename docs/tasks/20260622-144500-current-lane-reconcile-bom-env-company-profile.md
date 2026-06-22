# Task: Web current-lane reconcile for BOM / production / env stamp / company profile lineage

## Scope
Docs-only closure to align current lane checkpoint with actual Web repo history after `b13e672`.

## Related commits
- `22b53ee` — refactor ProductionRunDrawer layout and fix double drawer mounting
- `c0648e7` — enhance BOM drawer and table formatting
- `b292ce3` — BOM activate/inactivate actions + production active-BOM filter
- `aa8ca5e` — draggable column reordering + persisted preferences
- `411db2d` — production progress UI + columns + sorting support
- `ffc2bac` — serialize production sort parameter as string
- `69cb59d` — add environment stamp float
- `69f72db` — refactor EnvStamp into Zustand + shared enum
- `e49b517` — UI enhancements and company profile integration
- `eb93ac1` — move env stamp to right edge vertically
- `bcd20bb` — update company profile drawer to reuse modal style and improve layout

## DB
- No DB change in this closure artifact.
- Gate 0 result: `DB_READY`.

## API
- No API code change in this closure artifact.

## UI
- Reconciles Web lane docs to reflect current production/BOM/inventory/company-profile lineage already present in Git history.
- Does not change runtime code.

## Verification
- `git log --oneline b13e672..HEAD`
- `bunx tsc --noEmit`
- `bun run lint:check`
- `git status --short`

## Risk
- Low. Docs-only lane hygiene reconciliation.

## Rollback
- Revert this docs-only commit in `liouni-erp-web` if lane summary needs to be rewritten.

## Status
- DONE — pending docs-only commit/push.
