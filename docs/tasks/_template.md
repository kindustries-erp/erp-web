# Task Template

## Request Input (bạn chỉ cần điền phần này)

- Type: FEATURE | ENHANCE | FIX
- Mục tiêu:
- Bối cảnh/ngữ cảnh:

## Goal

Mục tiêu rõ ràng của task.

## Scope

- In-scope:
- Out-of-scope:

## Relevant Files

- `path/to/file.tsx` - lý do liên quan

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan:
- Data nền cần có:
- Constraint/index/default cần có:
- Kết quả: `DB_READY` | `DB_GAP_FOUND`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging):

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
