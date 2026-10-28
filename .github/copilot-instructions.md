# ERP Web - Copilot Instructions

## Required read order

1. `AGENTS.md` (router gộp của repo này)
2. `.agents/AGENTS.md`
3. `.agents/skills/erp-web-current-truth/SKILL.md`
4. Workflow liên quan trong `.agents/workflows/` (ví dụ `plan-and-task.md`, `standardize-table.md`)

## Working rules

- Dùng `bun` / `bunx` only, không dùng `npm` hay `yarn`.
- Reuse existing components, hooks and utils (`src/components/`) before creating new ones.
- Follow gate order: DB -> API -> UI -> QC.
- Mọi text hiển thị dùng i18n key, không hard-code.
- Before push: chạy `bun run verify:final` một lần trên commit cuối, sau đó push theo ERP Git workflow.
