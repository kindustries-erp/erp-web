# Liouni ERP Web Agent Bootstrap

Source of truth for this repo (`./erp-web`).

## Read order

1. `.agents/context/current-truth.md`
2. `.agents/context/working-contract.md`
3. `.agents/tasks/current-lane.md`
4. `.agents/skills/liouni-erp-web-current-truth/SKILL.md`
5. `.agents/rules/liouni-erp-web.md`
6. `docs/ai/technical-instructions.md`
7. `docs/app-structure.md`

## Web Specific Agent Mandates

### 1. UI Reusability Enforcer (Anti-Reinvention)

- **CRITICAL:** Do NOT build basic components like Modal, Drawer, Table/Spreadsheet, or Filter Panel from scratch.
- Always use `grep_search` in `src/components/` (e.g., `ConfirmModal`, `StandardDrawer`, `Spreadsheet`, `FilterPanel`) first.
- If found, read its interface/props and reuse it.

### 2. Atomic Design & Clean Code

- **Max File Size:** Any React file exceeding ~200 lines MUST be split.
- Extract complex state/API logic into `hooks/` (e.g., `use[Feature]Logic.ts`).
- Extract helper functions into `utils/`.
- Extract sub-components into their own files. Do NOT group multiple large React components in a single file.

### 3. React Query Mandate

- When handling Server State (fetch data, create, update, delete) in React, you **MUST** use `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`).
- **NEVER** use `useEffect` + `fetch/axios` for manual server state management.

### 4. Web Auto-TDD (Test Driven)

- After creating or modifying a core function, hook, layout, or critical UI component, you **MUST** generate a corresponding `.test.tsx` or `.test.ts` file.
- The unit test must cover the happy path and basic user interactions (e.g., click button, render layout correctly).

### 5. Strict Pre-push Hook

- Before running `git push`, you **MUST** run `bun run check:ci` and `bun run test`.
- Do NOT push if any of these commands fail. Fix the issues first.

### 6. i18n Translation Mandate

- You **MUST** use the project's i18n translation system (e.g., `useTranslation`, `t('key')`) for **all user-facing text** including titles, labels, placeholders, buttons, and validation messages.
- **NEVER** hardcode raw strings like `title="Xác nhận"`. Always use translation keys.

### 7. Rebase First Conflict Resolution

- When pushing code and encountering a conflict, your **first priority** is to use `git pull --rebase github-industries erp-master`.
- Only if the rebase presents overly complex conflicts, you may `git rebase --abort` and resolve using a standard merge (`git pull origin erp-master`).
