# Task — ERP Core Elite deploy lane

## Request Input

- Type: DEPLOYMENT
- Goal: create separate Elite deploy lane for `erp-core` Web with Gitea Actions, stack wrapper, and docs update.

## Gate 0 — DB Precheck

- Collections/tables: none (web-only deploy)
- Result: DB_READY

## Checklist

- [x] Inspect existing staging workflow and runtime
- [x] Create separate erp-core stack/workflow
- [x] Deploy and verify on Elite
- [x] Update docs

## Evidence

- Stack wrapper created: `/opt/stacks/liouni-erp-core-web`
- Build-time env wired to erp-core API domain (`VITE_API_BASE_URL` -> `https://api.erp-core.liouni.com`)
- Workflow created: `.gitea/workflows/deploy-erp-core.yml`
- Active source root for this deploy lane: `/opt/repos/liouni-erp-core/liouni-erp-web`
- Local runtime verify:
  - `http://127.0.0.1:8809/` -> `200`
- Public runtime verify:
  - `https://erp-core.liouni.com/` -> `200`
- NPM route verify on Head:
  - `erp-core.liouni.com` -> `100.75.67.115:8809`
- Container verify:
  - `liouni-erp-core-web` Up
