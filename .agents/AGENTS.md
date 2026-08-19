# Liouni ERP Web Agent Bootstrap

Source of truth for this repo (`./erp-web`).

## Read order

1. `.agents/skills/liouni-erp-web-current-truth/SKILL.md`

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

---

## Current Truth

- Main ERP lane hiện tại: **GitHub + branch `erp-master`**
- Repo này là Web repo của lane active.
- Old dev domains không phải current-truth endpoints mặc định.

### Repo role

- UI flows
- route wiring
- action visibility by status/state
- consuming real API contract
- build/test/route smoke evidence cho Web lane

---

## Working Contract

### Order

1. DB
2. API
3. UI
4. QC

### Rules

- inspect before edits
- MUST use bun/bunx exclusively (do NOT use npm)
- evidence-first
- before commit/push, `cd` into the repo root (`./erp-web`)
- **Strict Git Workflow**: You MUST follow the exact commit/push sequence defined below (pull -> build -> check:ci -> test -> commit -> push).
- push this repo with `github-industries`
- when debugging and testing API locally, always start dev on port 10010
- by default, always work on ERP_MASTER_DATABASE_URL unless ERP_KLTOUS_STAGING_DATABASE_URL or ERP_KLTOUS_MASTER_DATABASE_URL is explicitly indicated
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before forking parallel patterns
- cancel or delete actions must have modal confirm (e.g. ConfirmModal)
- delete operations must be soft delete with `isDeleted` flag

---

## Liouni ERP Web Rules

Apply to all work in this repo.

### Git Workflow Mandates

When asked to **commit code**, you MUST execute the following in order:

1. `bun run build`
2. `bun run check:ci`
3. `bun run test`
4. `git commit`

When asked to **pull code**, you MUST execute the following in order:

1. If there are uncommitted changes, you MUST execute the full **commit code** sequence first (build -> check:ci -> test -> commit).
2. `git pull --rebase github-industries erp-master` (and resolve conflicts if any)

When asked to **push code**, you MUST execute the following in order:

1. If there are uncommitted changes, you MUST execute the full **commit code** sequence first (build -> check:ci -> test -> commit).
2. `git pull --rebase github-industries erp-master` (and resolve conflicts if any)
3. `bun run build`
4. `bun run check:ci`
5. `bun run test`
6. `git push github-industries erp-master`

**Git Execution Context**: You MUST perform all Git operations (add, commit, pull, push) exclusively inside the `erp-web` directory. NEVER run git commands from the workspace root. When pulling or pushing, ALWAYS specify the remote `github-industries` (e.g., `git push github-industries erp-master`).

### Required behavior

- load `@.agents/skills/liouni-erp-web-current-truth/SKILL.md`
- use repo-local context as default guidance
- MUST use bun/bunx exclusively (do NOT use npm)
- when debugging and testing API locally, always start dev on port 10010
- by default, always work on ERP_MASTER_DATABASE_URL unless ERP_KLTOUS_STAGING_DATABASE_URL or ERP_KLTOUS_MASTER_DATABASE_URL is explicitly indicated
- follow DB -> API -> UI -> QC
- inspect current state before edits
- use evidence-first wording
- before push/commit, `cd` vào root của repo hiện tại (`./erp-web` từ workspace root)
- **Strict Git Workflow**: You MUST follow the `Git Workflow Mandates` defined above for all commits and pushes.
- push with `github-industries`
- always check branch 1st when push. all commit must be push on erp-master 1st, then I will create PR to another branch
- reuse existing components/hooks/utils/helpers/services/functions/page patterns first
- extend/adapt before duplicating
- manage all task execution, planning, and verification in Antigravity Brain (`implementation_plan.md` -> `walkthrough.md`)
- keep task checklist updated in realtime
- if task status in docs drifts from code reality, verify by code + build/test + git state before correcting the artifact

### Architecture & Development Standards

- **TDD**: Prefer Test-Driven Development for new features and non-trivial fixes. If not practical, add or update the nearest affected automated test before closing the task.
- **State Management**: Use `useState` for component inner state. Use `zustand` for state shared across multiple places. Use `@tanstack/react-query` with `axios` for server/API state.
- **Imports**: Use alias imports. Group 3rd-party imports first, followed by a blank line, then custom code imports.
- **Modularity**: Apply atomic design and a modular mindset. Break down components, hooks, utilities, and functions into the smallest possible, reusable units.
- **Forms & Validation**: Prefer `react-hook-form` + schema-based validation for new complex forms or when refactoring unstable forms. Do not force a partial migration that makes the codebase more inconsistent.
- **Options Fields**: Prefer explicit enums/typed options for option-based fields; keep naming aligned with existing domain types.
- **Page boundaries**: Pages should orchestrate layout, query hooks, and domain components; avoid pushing business-heavy logic directly into `src/pages/*`.
- **Definition of done**: A frontend task is not done until task checklist is updated, validation evidence is recorded, and commit/push status is stated clearly.

### Teamwork guardrails

- Use `must` only for standards already enforced or verified in this repo; use `prefer` for target-direction conventions.
- If introducing a new page/module, record route wiring, page key, app store registration, API client dependency, and permission impact in the task.

### Anti-drift / anti-patterns

- Do not reference non-existent bootstrap files.
- Do not let historical docs override repo-local current truth.
- Do not add domain-heavy logic into shared generic components.
- Do not report a task DONE from docs alone; verify with code state, build/test evidence, and git state.

### SpreadsheetPageTemplate filtering bug

When using `SpreadsheetPageTemplate`, NEVER pass `filterState`, `filterPanelOpen`, `activeFilterCount`, or `onFilterToggle` props. The template interface has been refactored. Always pass the FULL `FilterPanelReturn` object directly to the `filter` prop:

```tsx
// Correct
const filterPanel = useFilterPanel(config);
<SpreadsheetPageTemplate
  ...
  filter={filterPanel}
/>

// Wrong - will crash FilterPanel with "Cannot read properties of undefined (reading 'search')"
<SpreadsheetPageTemplate
  ...
  filterState={filterPanel.state}
/>
```

### Table Column Width / Layout Stretching

When using `SpreadsheetPageTemplate` or `DataTable`, the table uses `table-layout: fixed`. To protect fixed-width columns (`__actions`, `__expand`, `__selection`) from browser stretching when the container is larger than the total column sizes:

You do NOT need to set `w-full` on any columns. The `DataTable` template has been updated with a structural CSS fix (an invisible auto-sizing spacer column) that automatically absorbs any excess screen width.

However, to prevent the table from appearing cramped on large monitors, you **should** define explicit `size` properties (e.g. `size: 150`, `size: 250`) on your normal data columns so `table.getTotalSize()` is reasonably large.
