# Task: Agent contract hardening for ERP Web repo

## Request Input (bạn chỉ cần điền phần này)

- Type: ENHANCE
- Mục tiêu: Chuẩn hóa rule / skill / workflow của agent trong repo Web để teamwork tốt hơn, modular hơn, scale tốt hơn và maintain được lâu dài.
- Bối cảnh/ngữ cảnh: Repo Web đã có `.agents`, `AGENTS.md`, `docs/ai/technical-instructions.md` nhưng còn dead reference, command gate chưa nhất quán, và có vài rule dùng từ "must" vượt trước mức adopt thực tế của codebase.

## Goal

Làm sạch và nâng chuẩn agent contract của repo Web theo hướng current-truth, team-scalable, evidence-first, Bun-first.

## Scope

- In-scope:
  - fix dead reference trong `.agents/rules` và local skill
  - thống nhất read order / canonical source of truth
  - chuẩn hóa command gates (`lint:check`, `tsc`, `test`, `build`, smoke)
  - bổ sung definition-of-done, anti-drift, teamwork/modularity guardrails trong docs agent
  - cập nhật task template sang Bun-first
  - nắn lại wording giữa enforced standard và preferred direction
- Out-of-scope:
  - thay đổi source business logic UI
  - thay đổi API contract
  - thay đổi CI workflow

## Relevant Files

- `.agents/rules/liouni-erp-web.md` - repo rule chính cho agent
- `.agents/skills/liouni-erp-web-current-truth/SKILL.md` - local skill current-truth
- `docs/ai/technical-instructions.md` - canonical workflow instructions
- `docs/tasks/_template.md` - task template cần Bun-first và current workflow wording

## Gate 0 — DB Precheck (bắt buộc)

- Collections/fields liên quan: N/A — docs/process-only change
- Data nền cần có: N/A
- Constraint/index/default cần có: N/A
- Kết quả: `DB_READY`
- Nếu `DB_GAP_FOUND`: N/A

## Checklist (bắt buộc cập nhật realtime)

- [x] 1.0 Gate 0 DB Precheck done
- [x] 2.0 Backend workflow/API gate done
- [x] 3.0 UI gate done
- [x] 4.0 Validation
  - [x] 4.1 `bun run lint:check`
  - [x] 4.2 `bunx tsc --noEmit`
  - [x] 4.3 `bun run test`
  - [x] 4.4 `bun run build`
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

- Web repo: committed `7efa53c`, pushed `github-industries/erp-master`
- API repo: coordinated separately in sibling repo task
- DB/directus staging: N/A
