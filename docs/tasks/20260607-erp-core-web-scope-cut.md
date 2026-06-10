# ERP Core Web Scope Cut

## Request Input (bạn chỉ cần điền phần này)

- Type: FEATURE
- Mục tiêu: Tách lane `erp-core` trên branch mới và cắt scope UI xuống core-only.
- Bối cảnh/ngữ cảnh: Reuse repo `liouni-erp-web`, chung remote, branch `erp-core`. Phase đầu ưu tiên giữ shell tối thiểu và chuẩn bị rebind sang backend Neon/local auth.

## Goal

Chuẩn bị lane web `erp-core` với scope route/menu tối giản: login, profile, purchasing, inventory receipts, BOM, production orders, sales/shipping.

## Scope

- In-scope:
  - Tạo branch `erp-core`
  - Tạo task/handoff scope cut
  - Chuẩn bị phase UI cutover theo backend mới
- Out-of-scope:
  - Full page rewrite trong turn này
  - Final runtime integration

## Relevant Files

- `src/App.tsx`
- `src/core/components/layout/Sidebar.tsx`
- auth/profile related modules

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
  - Source scan theo artifact `/opt/docs/ai/liouni-erp/artifacts/260607-erp-core-postgres-plan.md`
- Data nền cần có:
  - Chưa cần data migration trong phase này
- Constraint/index/default cần có:
  - API/DB target đang ở trạng thái `DB_GAP_FOUND`
- Kết quả: `DB_GAP_FOUND`
- Nếu `DB_GAP_FOUND`: link DB scan/reference task (legacy directus-staging source): `/opt/repos/liouni-erp/directus-staging/ops/tasks/20260607-erp-core-postgres-scan-and-plan.md`
- Active web source for this lane is now `/opt/repos/liouni-erp-core/liouni-erp-web`.

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
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

- DB precheck result: `DB_GAP_FOUND`
- `npx tsc --noEmit`: pending (web chưa cut scope trong turn này)
- Smoke test: pending

## Lessons Learned

- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status

- Web repo:
- API repo:
- DB/directus staging: apply+verify+document (no code push required)
