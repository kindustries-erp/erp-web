# ERP Web - Copilot Instructions

## Required read order

1. `.agents/context/current-truth.md`
2. `.agents/context/working-contract.md`
3. `.agents/tasks/current-lane.md`
4. `.agents/AGENTS.md`
5. `AGENTS.md`
6. `docs/ai/technical-instructions.md`
7. `docs/app-structure.md`
8. Relevant task file in `docs/tasks/`

## Working rules

- Reuse existing skills, hooks, and UI patterns before creating new artifacts.
- Follow gate order: DB -> API -> UI -> QC.
- Use Bun/Bunx only.
- No code without a task file in `docs/tasks/`.
- Respect pre-commit and pre-push hooks.
- Before push, run this sequence explicitly: `bun run check:ci` -> `bun run test` (Vitest) -> `bun run build` -> `git push`.

## Notes

- Treat Directus and Gitea docs as historical/reference unless the task explicitly sets legacy scope.
