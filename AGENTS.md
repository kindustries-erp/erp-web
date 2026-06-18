# ERP Web Agent Bootstrap

Entry point for this repo.

## Read order

1. `.agents/README.md`
2. `.agents/context/current-truth.md`
3. `.agents/context/working-contract.md`
4. `.agents/tasks/current-lane.md`
5. `docs/ai/technical-instructions.md`
6. `docs/app-structure.md`
7. Relevant `docs/tasks/*`

## Execution contract

- no code without a task file
- update checklists in real time
- record lessons learned for blockers
- use `bun` / `bunx` unless Bun incompatibility is proven
- before commit/push, `cd /opt/repos/liouni-erp-core/liouni-erp-web`
- push with `github-industries`
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before duplicating

## References

- `docs/ai/technical-instructions.md`
- `docs/tasks/_template.md`

## Tests

- pre-commit runs `bunx vitest run`
- fix source, not tests
- tests live in `__tests__/*.test.ts(x)`
- run all: `bunx vitest run`
- run one file: `bunx vitest run src/path/to/file.test.ts`
