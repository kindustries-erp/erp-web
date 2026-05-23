# ERP Web Agent Bootstrap

This file is the entrypoint for any AI agent/model working in this repository.

## Required reading order

1. `docs/ai/technical-instructions.md` (canonical rules)
2. `docs/app-structure.md` (architecture and layering)
3. Relevant task file in `docs/tasks/`

## Mandatory execution contract

- No code without a task file in `docs/tasks/`.
- Tick checklist items (`[ ]` -> `[x]`) in realtime when each sub-task is done.
- If any issue/blocker occurs, record it in lessons learned before closing task.

## Canonical references

- Technical instructions: `docs/ai/technical-instructions.md`
- Task template: `docs/tasks/_template.md`

## Testing rules (NON-NEGOTIABLE)

- Pre-commit hook runs ALL tests (`npx vitest run`). If tests fail, commit is blocked.
- **If a test fails, fix the SOURCE CODE — NOT the test.** Tests are the source of truth for expected behavior.
- Unit tests live in `__tests__/*.test.ts(x)` co-located with source.
- Run tests: `npx vitest run` (all) or `npx vitest run src/path/to/file.test.ts` (specific).
- Framework: Vitest + React Testing Library + fast-check (property tests).
- Lessons template: `docs/lessons-learned/_template.md`
