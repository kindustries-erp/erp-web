# Task — Fix ERP Core auth login path

## Request Input
- Type: BUGFIX
- Goal: fix ERP Core web login hitting wrong API path and returning 404

## Gate 0 — Contract Precheck
- FE module in scope: `src/modules/auth/api/auth.core.ts`
- Expected backend contract: `POST /api/v1/auth/login`
- Result: DB_READY (no DB mutation)

## Checklist
- [x] Identify wrong login path in FE
- [x] Patch FE auth client to use `/api/v1/auth/login`
- [x] Build web
- [x] Redeploy erp-core web
- [x] Verify public login path no longer 404

## Evidence
- Wrong path found in `src/modules/auth/api/auth.core.ts`:
  - old: `/auth/login`
  - old profile path: `/auth/profile`
- Fixed to:
  - `/api/v1/auth/login`
  - `/api/v1/auth/profile`
- Build verify:
  - `bunx tsc --noEmit` -> PASS
  - `bun run build` -> PASS
- Runtime verify after redeploy:
  - `POST https://api.erp-core.liouni.com/api/v1/auth/login` -> success
  - public bundle serves updated auth path
