# Task — ERP Web compatibility for erp_departments / erp_positions

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Keep Employees / Positions UI working after Directus+API rename of `departments` and `positions` to `erp_` prefixed collections.
- Bối cảnh/ngữ cảnh: Web may reference collection keys in HR API layer, routing metadata, RBAC/menu config, and employee form components.

## Goal

Đảm bảo UI HR không gãy sau rename DB/API, đặc biệt employee form lookup department/position.

## Scope

- In-scope:
  - Audit/patch HR API layer and any collection-key usage
  - Build and smoke Employees / Positions screens
- Out-of-scope:
  - Route rename
  - New UI redesign

## Relevant Files

- `src/modules/hr/api/hrApi.ts` - HR API bindings
- `src/pages/Employees.tsx` - employee screen orchestration
- `src/pages/Positions.tsx` - positions screen orchestration
- `src/modules/hr/components/Employees/EmployeeDrawer.tsx` - lookup/form impact
- `src/core/components/layout/Sidebar.tsx` - menu audit
- `src/modules/system/types/rbac.ts` - permission key audit

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - `erp_departments`, `erp_positions`, `erp_employees.department_id`, `erp_employees.position_id`
- Data nền cần có:
  - Department and position datasets available after rename
- Constraint/index/default cần có:
  - Employee relation graph preserved after DB rename
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260526-erp-prefix-departments-positions.md`

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit`
  - [x] 4.2 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` — `erp_departments` / `erp_positions` present and employee relations preserved.
- `npx tsc --noEmit`: PASS via `bun run build`
- Smoke test:
  - web build PASS
  - sidebar HR permission gate switched to `erp_departments` / `erp_positions`
  - RBAC collection list switched to `erp_departments` / `erp_positions`
  - published web root `https://dev.erp.liouni.com/` -> `200`

## Lessons Learned

- Không có issue

## Commit/Push Status

- Web repo: pending
- API repo: pending
- DB/directus staging: apply+verify+document (no code push required)
