# Task — ERP Web: permission keys for prefixed branches/chart_of_accounts

## Request Input (bạn chỉ cần điền phần này)
- Type: ENHANCE
- Mục tiêu: cập nhật UI permission keys / RBAC registry theo collection names mới `erp_branches`, `erp_chart_of_accounts`.
- Bối cảnh/ngữ cảnh: Directus staging schema rename + API binding update cùng lane ERP.

## Goal
Giữ nguyên UX nhưng đảm bảo RBAC/permission surfaces và settings screens không gãy sau khi Directus collection names đổi prefix.

## Scope
- In-scope:
  - RBAC collection registry
  - permission editor / useHasPermission literals nếu có
  - branch-related settings surface verification
- Out-of-scope:
  - Không đổi route/browser slug
  - Không redesign UI

## Relevant Files
- `src/modules/system/types/rbac.ts` - collection registry literals
- `src/modules/branches/api/branchApi.ts` - route remains stable, smoke verification target
- `src/modules/settings/components/BranchTab.tsx` - runtime UI smoke target

## Gate 0 — DB Precheck (bắt buộc)
- Collections/fields liên quan:
  - `erp_branches`, `erp_chart_of_accounts`
- Data nền cần có:
  - Directus runtime expose được collections mới
- Constraint/index/default cần có:
  - permission metadata/runtime read hoạt động sau DB gate
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): `/opt/docs/ai/liouni-erp/tasks/20260525.1958 - remove-legacy-money-source-bridge-and-prefix-branches-coa.md`

## Checklist (bắt buộc cập nhật realtime)
- [ ] 1.0 Gate 0 DB Precheck done
- [ ] 2.0 Backend workflow/API gate done
- [ ] 3.0 UI gate done
- [ ] 4.0 Validation
  - [ ] 4.1 Chạy `npx tsc --noEmit`
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [ ] 5.2 Commit + push code (web/api)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence
- DB precheck result:
- `npx tsc --noEmit`:
- Smoke test:

## Lessons Learned
- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status
- Web repo:
- API repo:
- DB/directus staging: apply+verify+document (no code push required)
