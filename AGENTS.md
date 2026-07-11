# ERP Web Agent Entry

This file is the repo-root bridge for agents.

## Read order

1. `.agents/context/current-truth.md`
2. `.agents/context/working-contract.md`
3. `.agents/tasks/current-lane.md`
4. `.agents/skills/liouni-erp-web-current-truth/SKILL.md`
5. `.agents/rules/liouni-erp-web.md`
6. `.agents/rules/ai-instructions/technical-instructions.md`
7. `.agents/context/system/app-structure.md`

## Mandatory alignment

- Reuse existing `.agents` skills, rules, and task artifacts before creating new ones.
- Follow gate order: DB -> API -> UI -> QC.
- Use Bun/Bunx only.
- No code without a task file under `.agents/tasks/`.
- Before push, run required checks defined by husky hooks.
