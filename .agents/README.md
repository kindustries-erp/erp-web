# Liouni ERP Web Agent Pack

Source of truth for this repo (`./erp-web`).

## Read order

1. `context/current-truth.md`
2. `context/working-contract.md`
3. `tasks/current-lane.md`
4. `skills/liouni-erp-web-current-truth/SKILL.md`
5. `rules/liouni-erp-web.md`

## Purpose

- keep current truth, contract, lane, skill, and rule together
- avoid deriving implementation guidance from scattered historical docs
- separate bootstrap from implementation docs

## Boundary

- `.agents/` = agent source of truth
- `docs/` = implementation/history/references

## Preferences

- Bun/Bunx first
- stay inside this repo for commit/push
- use `github-industries`
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before duplicating
- follow atomic design and TDD (Test-Driven Development)
- try to break down components, hooks, utils, functions, anything into smaller modules

## Historical rule

Treat `docs/` files mentioning Directus, Gitea, old dev domains, or `erp-core` as historical/reference before using them for new work.
