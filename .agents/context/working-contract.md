# Working Contract

## Order

1. DB
2. API
3. UI
4. QC

## Rules

- inspect before edits
- MUST use bun/bunx exclusively (do NOT use npm)
- evidence-first
- do not use historical Directus/Gitea docs as default guidance
- before commit/push, `cd` into the repo root
- before commit/push, remember to run `bun build`, `bun lint`, and `bun lint:check`
- push this repo with `github-industries`
- when debugging and testing API locally, always start dev on port 10020
- by default, always work on ERP_MASTER_DATABASE_URL unless ERP_KLTOUS_STAGING_DATABASE_URL or ERP_KLTOUS_MASTER_DATABASE_URL is explicitly indicated
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before forking parallel patterns
- cancel or delete actions must have modal confirm (e.g. ConfirmModal)
- delete operations must be soft delete with `isDeleted` flag

## Read path

1. `.agents/README.md`
2. `.agents/context/current-truth.md`
3. `.agents/context/working-contract.md`
4. `.agents/tasks/current-lane.md`
5. `AGENTS.md`
6. `docs/ai/technical-instructions.md`
7. `docs/app-structure.md`
8. `docs/tasks/<relevant>.md`
