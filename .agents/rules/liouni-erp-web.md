# Liouni ERP Web Rule

Apply to all work in this repo.

## Required behavior

- load `@.agents/skills/liouni-erp-web-current-truth/SKILL.md`
- read `@.agents/context/current-truth.md` first
- use repo-local context as default guidance
- treat Directus as legacy/reference unless the task explicitly says legacy scope
- treat Gitea as historical only
- MUST use bun/bunx exclusively (do NOT use npm)
- when debugging and testing API locally, always start dev on port 10020
- by default, always work on ERP_MASTER_DATABASE_URL unless ERP_KLTOUS_STAGING_DATABASE_URL or ERP_KLTOUS_MASTER_DATABASE_URL is explicitly indicated
- follow DB -> API -> UI -> QC
- inspect current state before edits
- use evidence-first wording
- before push/commit, `cd /opt/repos/liouni-erp-core/liouni-erp-web`
- before push/commit, always run `bun run lint:check`, `bunx tsc --noEmit`, `bun run test`, and `bun run build`
- push with `github-industries`
- always check branch 1st when push. all commit must be push on erp-master 1st, then I will create PR to another branch
- reuse existing components/hooks/utils/helpers/services/functions/page patterns first
- extend/adapt before duplicating
- no code without a task file under `docs/tasks/`
- keep task checklist updated in realtime
- if task status in docs drifts from code reality, verify by code + build/test + git state before correcting the artifact

## Architecture & Development Standards

- **TDD**: Prefer Test-Driven Development for new features and non-trivial fixes. If not practical, add or update the nearest affected automated test before closing the task.
- **State Management**: Use `useState` for component inner state. Use `zustand` for state shared across multiple places. Use `@tanstack/react-query` with `axios` for server/API state.
- **Imports**: Use alias imports. Group 3rd-party imports first, followed by a blank line, then custom code imports.
- **Modularity**: Apply atomic design and a modular mindset. Break down components, hooks, utilities, and functions into the smallest possible, reusable units.
- **Forms & Validation**: Prefer `react-hook-form` + schema-based validation for new complex forms or when refactoring unstable forms. Do not force a partial migration that makes the codebase more inconsistent.
- **Options Fields**: Prefer explicit enums/typed options for option-based fields; keep naming aligned with existing domain types.
- **Page boundaries**: Pages should orchestrate layout, query hooks, and domain components; avoid pushing business-heavy logic directly into `src/pages/*`.
- **Definition of done**: A frontend task is not done until task checklist is updated, validation evidence is recorded, and commit/push status is stated clearly.

## Teamwork guardrails

- Use `must` only for standards already enforced or verified in this repo; use `prefer` for target-direction conventions.
- If introducing a new page/module, record route wiring, page key, app store registration, API client dependency, and permission impact in the task.
- Documentation/process changes must update the canonical file first (`docs/ai/technical-instructions.md`), then keep `.agents` aligned.

## Anti-drift / anti-patterns

- Do not reference non-existent bootstrap files.
- Do not let historical docs override repo-local current truth.
- Do not add domain-heavy logic into shared generic components.
- Do not report a task DONE from docs alone; verify with code state, build/test evidence, and git state.

## Historical warning

If a file mentions Directus-first flows, Gitea deploys, old dev domains, or `erp-core`, classify it first.
Only repo-local current-truth docs should drive new implementation by default.
