---
name: liouni-erp-web-current-truth
description: Web-specific local-only skill for Liouni ERP. Use when working in this repo to load the repo-local current-truth context, index, and implementation rules without relying on external docs.
---

# Liouni ERP Web Current-Truth

Use this skill only inside this repository.

## Local read order

1. `@.agents/context/current-truth.md`
2. `@AGENTS.md`
3. `@docs/web-current-truth-index.md`
4. `@docs/ai/technical-instructions.md`
5. `@docs/app-structure.md`
6. Relevant file in `@docs/tasks/`

## Current truth

- Main ERP lane = GitHub + branch `erp-master`
- Directus = legacy/reference only unless task explicit says legacy scope
- Gitea = historical only
- Old dev domains are not default smoke endpoints
- Removed `liouni-erp-core-*` stacks must not be assumed to exist

## Web responsibilities

- UI flows
- route wiring
- action visibility by state/status
- consuming the real API contract
- build / test / route smoke evidence

## Working rules

- Follow DB -> API -> UI -> QC
- Inspect current state before edits
- Use Bun/Bunx first
- Be evidence-first
- Do not let historical Directus/Gitea-era docs drive new implementation by default
- No code without a task file under `docs/tasks/`
- Keep task checklist updated in realtime
- Before commit/push, run `bun run lint:check`, `bunx tsc --noEmit`, `bun run test`, and `bun run build`
- When task docs are stale, verify with code + build/test + git state before correcting status/checklist

## Team-scale reminders

- Use `must` only for standards already enforced in this repo; use `prefer` for target-direction conventions.
- Keep page boundaries clean: page -> domain hook/query -> domain components -> shared primitives.
- If a new helper/component is created instead of reusing one, note the reason in the task artifact.
- A frontend task is not done until validation evidence and commit/push status are recorded.
