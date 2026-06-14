# Task: ERP core Web Elite CI lane on erp-core branch

## Goal

- Checkout repo to `erp-core`
- Retarget GitHub Actions deploy from Head/Klotus production to Elite ERP core lane
- Use Elite ports `8020` for Web
- Keep DB/API/UI/QC gate evidence concise

## DB Precheck

- Scope: runtime/CI lane retarget only; no schema mutation in this task
- Collections/fields involved: none
- Constraints/defaults/relations involved: none
- Result: DB_READY

## Checklist

- [x] Inspect current branch/workflow/runtime state
- [x] Checkout repo to `erp-core`
- [x] Patch GitHub Actions workflow for Elite deploy on `erp-core`
- [x] Align stack/runtime port to `8020`
- [x] Build/deploy/verify Web returns `200` on root route
- [x] Record lessons learned if blockers occur
