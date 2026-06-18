# Task: Web template + conventions pack for team-scalable delivery

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Tạo bộ template/convention dùng được ngay cho Web repo để agent/dev thêm page/module, đổi flow, refactor và review đồng nhất hơn.
- Bối cảnh/ngữ cảnh: Sau khi harden agent contract, repo cần thêm implementation templates + naming + DoD + ADR-lite ở mức gọn.

## Goal

Bổ sung bộ tài liệu mẫu ngắn, thực dụng, link được từ technical instructions để tăng tính teamwork / modular / scale / maintainability.

## Scope

- In-scope:
  - Web page template
  - Web domain-module template
  - Web naming conventions
  - Shared ADR-lite / DoD matrix / anti-pattern cookbook trong repo Web
  - Link lại từ technical instructions
- Out-of-scope:
  - Đổi source runtime
  - Tạo code generator
  - Refactor page business hiện có

## Relevant Files

- `docs/ai/technical-instructions.md` - canonical instructions
- `docs/ai/templates/*` - template pack mới
- `docs/ai/conventions/*` - conventions/DoD/anti-patterns mới

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A (docs/process task)
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: link DB task (directus-staging): N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint:check`
  - [x] 4.2 `bunx tsc --noEmit`
  - [x] 4.3 `bun run test`
  - [x] 4.4 `bun run build`
  - [x] 4.5 Smoke test flow liên quan
- [x] 5.0 Close
  - [x] 5.1 Lessons learned entry (if issue)
  - [x] 5.2 Commit + push code (web/api)
  - [x] 5.3 Tổng kết evidence

## Validation Evidence

- DB precheck result: `DB_READY`
- `bun run lint:check`: PASS
- `bunx tsc --noEmit`: PASS
- `bun run test`: PASS (`23 files`, `119 tests`)
- `bun run build`: PASS
- Smoke test: N/A (docs/process-only)

## Lessons Learned

- Không có issue / hoặc link entry: `docs/lessons-learned/<file>.md#<anchor>`

## Commit/Push Status

- Web repo: committed `4c91476`, pushed `github-industries/erp-master`
- API repo: coordinated separately in sibling repo task
- DB/directus staging: N/A
