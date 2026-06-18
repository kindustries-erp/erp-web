# Liouni ERP Web Rule

Apply to all work in this repo.

## Required behavior

- load `@.agents/skills/liouni-erp-web-current-truth/SKILL.md`
- read `@docs/ai/current-truth-context.md` first
- use repo-local context as default guidance
- treat Directus as legacy/reference unless the task explicitly says legacy scope
- treat Gitea as historical only
- use Bun/Bunx first
- follow DB -> API -> UI -> QC
- inspect current state before edits
- use evidence-first wording
- before push/commit, `cd /opt/repos/liouni-erp-core/liouni-erp-web`
- before push/commit, always run `bun run lint` and `bun run build` to verify code quality
- push with `github-industries`
- reuse existing components/hooks/utils/helpers/services/functions/page patterns first
- extend/adapt before duplicating

## Architecture & Development Standards

- **TDD**: Enforce Test-Driven Development (TDD) as a core practice. Write tests before implementing new features.
- **State Management**: Use `useState` for component inner state. Use `zustand` for any state that is used by multiple places. Use `@tanstack/react-query` with `axios` for UI API state.
- **Imports**: Use alias imports. Group 3rd-party imports first, followed by a blank line, then custom code imports.
- **Modularity**: Apply atomic design and a modular mindset. Break down components, hooks, utilities, and functions into the smallest possible, reusable units.
- **Forms & Validation**: All forms must use `react-hook-form`. All data type checking or enum/interface generation must use `zod`.
- **Options Fields**: All fields having options must use `enum` to select.

## Historical warning

If a file mentions Directus-first flows, Gitea deploys, old dev domains, or `erp-core`, classify it first.
Only repo-local current-truth docs should drive new implementation by default.
