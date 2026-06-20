# Task — Restore ESLint warnings and fix web violations

## Request Input (bạn chỉ cần điền phần này)

- Type: FIX
- Mục tiêu: Bật lại `@typescript-eslint/no-explicit-any` và `@typescript-eslint/no-unused-vars` từ `off` sang `warn` ở ERP Web, sau đó fix hết warning phát sinh.
- Bối cảnh/ngữ cảnh: User yêu cầu khôi phục chuẩn lint và dọn sạch warning thay vì tắt rule để pass nhanh.

## Goal

Khôi phục 2 rule TypeScript lint về warning trong repo web và đưa trạng thái lint/typecheck về sạch warning liên quan.

## Scope

- In-scope:
  - `eslint.config.mjs`
  - Các file `src/**/*` phát sinh warning từ 2 rule trên
- Out-of-scope:
  - Thay đổi business logic ngoài phạm vi cần thiết để fix lint
  - Nới thêm rule lint khác

## Relevant Files

- `eslint.config.mjs` - khôi phục mức rule từ off sang warn
- `src/**/*` - fix warning any / unused vars phát sinh

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: Không có
- Data nền cần có: Không có
- Constraint/index/default cần có: Không có
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done (N/A for this task)
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 Chạy `npx tsc --noEmit` (Verified via npm run build)
  - [ ] 4.2 Smoke test flow liên quan
- [ ] 5.0 Close
  - [ ] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web)
  - [ ] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY` (lint-only task, không đụng DB)
- `npx tsc --noEmit`: Verified via npm run build
- Smoke test: pending

## Lessons Learned

- Không có issue / hoặc link entry: Không có issue

## Commit/Push Status

- Web repo: done
- API repo: N/A
- DB/directus staging: N/A
