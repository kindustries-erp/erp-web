# ERP Web Agent Bootstrap

Entry point for this repo.

## Read order

1. `.agents/README.md`
2. `.agents/context/current-truth.md`
3. `.agents/context/working-contract.md`
4. `.agents/tasks/current-lane.md`
5. `docs/ai/technical-instructions.md`
6. `docs/app-structure.md`
7. Relevant `docs/tasks/*`

## Execution contract

- no code without a task file
- update checklists in real time
- record lessons learned for blockers
- use `bun` / `bunx` unless Bun incompatibility is proven
- before commit/push, `cd` vào root của repo hiện tại (`./erp-web` từ workspace root)
- push with `github-industries`
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before duplicating

## References

- `docs/ai/technical-instructions.md`
- `docs/tasks/_template.md`

## Tests

- pre-commit runs `bunx vitest run`
- fix source, not tests
- tests live in `__tests__/*.test.ts(x)`
- run all: `bunx vitest run`
- run one file: `bunx vitest run src/path/to/file.test.ts`

---

## Web Specific Agent Rules

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
