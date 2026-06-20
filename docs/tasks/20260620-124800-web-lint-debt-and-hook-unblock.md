# Task: Web lint debt cleanup to restore pre-commit docs-only safety

> **Created:** 2026-06-20
> **Lane:** erp-master
> **Repo:** `liouni-erp-web`
> **Status:** DONE

## Scope

- Remove current lint debt blocking `bun run lint:check`
- Restore ability to commit docs-only changes without `--no-verify`
- Keep scope limited to existing warnings only

## DB

- No DB/schema change

## API

- N/A

## UI

- Fix existing `@typescript-eslint/no-unused-vars`
- Fix existing `@typescript-eslint/no-explicit-any`
- Target files only:
  - `src/modules/goods-issues-core/components/GiFormDrawer.tsx`
  - `src/modules/goods-issues-core/hooks/useGiDrawer.ts`
  - `src/modules/goods-receipts-core/components/GrFormDrawer.tsx`
  - `src/modules/production-core/components/ProductionOrderDrawer.tsx`
  - `src/modules/production-core/components/ProductionOrderListPage.tsx`
  - `src/modules/production-core/hooks/useProductionOrderDrawer.ts`

## QC

- `bun run lint:check`
- `bunx vitest run`
- `bunx tsc --noEmit`

## Risks

- Over-tightening types may break current production-core UX
- Refactor must stay additive and local

## Rollback

- Revert the cleanup commit in `liouni-erp-web`

## Checklist

- [ ] classify each warning
- [ ] fix unused vars safely
- [ ] replace `any` with local explicit types or `unknown` + narrowing
- [ ] run lint/typecheck/tests
- [ ] update artifact to DONE with evidence
