# ERP Web Agent Bootstrap

Source of truth for this repo (`./erp-web`).

## Read order

1. `.agents/skills/erp-web-truth/SKILL.md`

## Web Specific Agent Mandates

### 1. UI Reusability Enforcer (Anti-Reinvention)

- **V2 Atom Mandate**: trong `src/v2/**` luôn dùng V2 Atom (`V2Button`, `V2Text`, `V2Badge`, `V2Input`, `V2Textarea`, `V2Divider`, `V2Progress`, `V2Stack`…), cấm thẻ HTML trần khi đã có atom. Thiếu atom thì tạo trong `src/v2/shared/components/atoms/` bằng `bun run plop v2-component` (tầng `atoms`). Chi tiết: `erp-ui-structure` mục 2.1 của `references/atomic-ui.md`.

- **CRITICAL:** Do NOT build basic components like Modal, Drawer, Table/Spreadsheet, or Filter Panel from scratch.
- Always use `grep_search` in `src/shared/components/` (e.g., `ConfirmModal`, `StandardFormDrawer`, `DataTable`, `FilterPanel`) first. V2 components live in `src/v2/shared/components/`.
- If found, read its interface/props and reuse it.

### 2. Atomic Design & Clean Code

- **Max File Size:** Với `.tsx` và `.hook.ts`: cảnh báo ở 180 dòng, chặn ở 250 dòng (không merge). File dữ liệu và cấu hình thuần (`*.locale.ts`, `*.options.ts`, `*.config.ts`, `*.type.ts`, `*.data.ts`) không tính vào ngưỡng. V1 legacy vượt ngưỡng được miễn trừ trừ khi task chạm tới; see `erp-ui-structure`.
- **Core theo họ (áp dụng cho mọi họ, không ngoại lệ):** UI, rule, hook controller và locale của một họ nằm ở `src/v2/core/<họ>/`. Module của họ chỉ giữ API, cấu hình ghép core, page và locale riêng. Chiều phụ thuộc `modules → core → shared`; core không import module và không chứa tên module. Import qua barrel (`@/v2/core/<họ>`, `@/v2/shared/components`), không import sâu từ module hay core. Chi tiết: `erp-ui-structure` Phần B.
- Extract complex state/API logic into `hooks/` (e.g., `use[Feature]Logic.ts`).
- **Tên hook**: hook gắn một component/drawer/page dùng `[Component].hook.ts` (export `use[Component]`); hook độc lập (query, mutation, hook dùng chung, store) dùng `use<Tên>.ts`. Hook không JSX đuôi `.ts`. Chi tiết: `erp-ui-structure`.
- Extract helper functions into `utils/`.
- Extract sub-components into their own files. Do NOT group multiple large React components in a single file.

### 3. React Query Mandate

- When handling Server State (fetch data, create, update, delete) in React, you **MUST** use `@tanstack/react-query` (`useQuery`, `useMutation`, `useQueryClient`).
- **NEVER** use `useEffect` + `fetch/axios` for manual server state management.

### 4. Web Auto-TDD (Test Driven)

- After creating or modifying a core function, hook, layout, or critical UI component, you **MUST** generate a corresponding `.test.tsx` or `.test.ts` file.
- The unit test must cover the happy path and basic user interactions (e.g., click button, render layout correctly).

### 5. Strict Pre-push Hook

- Commit: pre-commit tự chạy lint-staged (eslint, prettier, `vitest related` trên file staged). Không chạy full test thủ công.
- Push: pre-push chạy `bun run type:check`. Do NOT push if it fails.
- Full test / build / check:ci chạy trên GitHub CI. Không push tiếp khi CI của nhánh đang đỏ.

### 6. i18n Translation Mandate

- **V2**: dùng `useV2Translation`, key `v2.*`, và khai báo đủ VI và EN cùng lúc (`src/v2/shared/locales/` hoặc `<họ>.locale.ts`). Không dùng `react-i18next` trong `src/v2`.

- You **MUST** use the project's i18n translation system (e.g., `useTranslation`, `t('key')`) for **all user-facing text** including titles, labels, placeholders, buttons, and validation messages.
- **NEVER** hardcode raw strings like `title="Xác nhận"`. Always use translation keys.

### 7. Rebase First Conflict Resolution

- When pushing code and encountering a conflict, your **first priority** is to use `git pull --rebase github-industries erp-master`.
- Only if the rebase presents overly complex conflicts, you may `git rebase --abort` and resolve using a standard merge (`git pull origin erp-master`).

### 8. E2E Mandate

- Luồng nhiều bước trên trình duyệt (tạo, duyệt, từ chối, nhân bản, menu, drawer) phải có kiểm tra E2E Playwright trong `e2e/` và được ghi vào skill `erp-e2e-playwright`.
- E2E không thay unit test. Không commit mật khẩu hay URL cứng; đọc qua biến môi trường (`E2E_PASSWORD` bắt buộc).
- Mỗi lần chạy E2E: nếu shell chưa có `E2E_PASSWORD`, đọc dòng `E2E_PASSWORD=` trong `erp-api/.env` (nguồn chuẩn, từ workspace root: `erp/erp-api/.env`) và nạp vào tiến trình chạy script (xem skill `erp-e2e-playwright`). Không in giá trị ra log, không ghi vào repo, không hỏi lại người dùng nếu `.env` đã có.
- Trước khi báo hoàn tất, chạy E2E trên môi trường đang chạy và báo PASS/FAIL theo lần chạy hiện tại.
- Port E2E: lấy `PORT` API từ `erp/erp-api/.env`, web đi kèm theo API 10001→5171, 10002→5172, 10003→5173 (chi tiết trong skill `erp-e2e-playwright`). Không dùng port mặc định cố định.

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
- **Strict Git Workflow**: You MUST follow the exact commit/push sequence defined below (test -> commit -> pull --rebase -> check:ci -> push, theo `erp-git-workflow`).
- push this repo with `github-industries`
- when debugging and testing API locally, always start dev on the port defined by `PORT` in `erp/erp-api/.env`
- by default, work on the `DATABASE_URL` in `.env` (master; luôn đọc `.env` để xác nhận DB thực tế); use the matching `.env.<tenant>-<stage>` file (greenway/klotus) only when explicitly indicated; scripts must take the env file explicitly (a bare `.env` may point at a production DB)
- before any DB scan or write, run `SELECT current_database();` to confirm the actual DB and report it before writing; never infer the DB from a file name
- reuse existing components/hooks/utils/helpers/functions/page patterns first
- extend/adapt before forking parallel patterns
- cancel or delete actions must have modal confirm (e.g. ConfirmModal)
- delete operations must be soft delete with `isDeleted` flag

---

### Git Workflow Mandates

1. **Master-First Mandate**: ALL code modifications, features, bug fixes, UI enhancements, and refactoring **MUST** be performed and tested on `erp-master` FIRST. Direct commits to downstream branches (`erp-greenway-*`, `erp-klotus-*`) are strictly prohibited.

2. When asked to **commit code**, you MUST execute the following in order:
   - Ensure current branch is `erp-master`
   - `git commit` (pre-commit tự chạy lint-staged và `vitest related` trên file staged; không chạy full test thủ công)

3. When asked to **pull code**, you MUST execute the following in order:
   - If there are uncommitted changes, you MUST execute the full **commit code** sequence first.
   - `git pull --rebase github-industries erp-master` (and resolve conflicts if any)

4. When asked to **push code**, you MUST execute the following in order:
   - If there are uncommitted changes, you MUST execute the full **commit code** sequence first.
   - `git pull --rebase github-industries erp-master` (and resolve conflicts if any)
   - `git push github-industries erp-master` (pre-push chạy `bun run type:check`; full test/build/check:ci chạy trên GitHub CI, theo dõi CI sau khi push)

5. When asked to **sync/deploy to downstream branches** (`erp-greenway-production`, `erp-greenway-staging`, `erp-klotus-*`):
   - First ensure `erp-master` is committed, tested, and pushed to `github-industries erp-master`.
   - Run `../.agents/scripts/sync-branch.sh <target-branch> --push` or follow `erp-git-workflow.md` Scenario 4.
   - Always return back to `erp-master` after syncing.

**Git Execution Context**: You MUST perform all Git operations (add, commit, pull, push) exclusively inside the `erp-web` directory. NEVER run git commands from the workspace root. When pulling or pushing, ALWAYS specify the remote `github-industries` (e.g., `git push github-industries erp-master`).

### Required behavior

- load `@.agents/skills/erp-web-truth/SKILL.md`
- use repo-local context as default guidance
- MUST use bun/bunx exclusively (do NOT use npm)
- when debugging and testing API locally, always start dev on the port defined by `PORT` in `erp/erp-api/.env`
- by default, work on the `DATABASE_URL` in `.env` (master; luôn đọc `.env` để xác nhận DB thực tế); use the matching `.env.<tenant>-<stage>` file (greenway/klotus) only when explicitly indicated; scripts must take the env file explicitly (a bare `.env` may point at a production DB)
- before any DB scan or write, run `SELECT current_database();` to confirm the actual DB and report it before writing; never infer the DB from a file name
- follow DB -> API -> UI -> QC
- inspect current state before edits
- use evidence-first wording
- before push/commit, `cd` vào root của repo hiện tại (`./erp-web` từ workspace root)
- **Strict Git Workflow**: You MUST follow the `Git Workflow Mandates` defined above for all commits and pushes (Master-First).
- push with `github-industries`
- always check branch 1st when push. All modifications must be developed and pushed on `erp-master` 1st, then merged/synced downstream to other branches.
- reuse existing components/hooks/utils/helpers/services/functions/page patterns first
- extend/adapt before duplicating
- plan trình trong hội thoại và chờ `OK`; theo dõi task trên Plane (project KINDU) bằng skill `plane-work-items`. Antigravity Brain chỉ là bản phụ.
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
