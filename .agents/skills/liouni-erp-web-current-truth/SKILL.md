---
name: liouni-erp-web-current-truth
description: Web-specific local-only skill for Liouni ERP. Use when working in this repo to load the repo-local current-truth context, index, and implementation rules without relying on external docs.
---

# Liouni ERP Web Current-Truth

Use this skill only inside this repository.

## Local read order

1. `@.agents/AGENTS.md`
2. `@README.md`
3. Antigravity Brain (`implementation_plan.md` & `walkthrough.md`)

## Current truth

- Main ERP lane = GitHub + branch `erp-master`
- API contract phải bám schema, constraint, relation, và runtime config đang dùng thật

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
- Manage all task execution, planning, and verification in Antigravity Brain (`implementation_plan.md` -> `walkthrough.md`)
- Keep task checklist updated in realtime
- **Strict Git Workflow**: Follow the exact sequence: pull -> build -> check:ci -> test -> commit -> push (see rules for exact trigger definitions).
- When task docs are stale, verify with code + build/test + git state before correcting status/checklist

## Team-scale reminders

- Use `must` only for standards already enforced in this repo; use `prefer` for target-direction conventions.
- Keep page boundaries clean: page -> domain hook/query -> domain components -> shared primitives.
- If a new helper/component is created instead of reusing one, note the reason in the task artifact.
- A frontend task is not done until validation evidence and commit/push status are recorded.
