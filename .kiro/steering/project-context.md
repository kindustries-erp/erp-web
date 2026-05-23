---
inclusion: auto
---

# Liouni ERP Web — Project Context & Coding Standards

## System Overview

Liouni ERP is a Vietnamese enterprise resource planning system with three tiers:

1. **Directus Staging** (PostgreSQL + Directus CMS) — schema & data
2. **ERP API** (NestJS) — business logic, auth proxy, Directus SDK
3. **ERP Web** (this repo) — React SPA frontend

All Directus collections use `gw_` prefix (e.g. `gw_payment_vouchers`, `gw_employees`).

## Tech Stack

- React 18 + TypeScript (strict)
- Vite 5 (build + dev server)
- Tailwind CSS 3.4 + PostCSS
- Zustand (state management with persist middleware)
- Radix UI (Popover, Tabs, Toast, Tooltip, Checkbox)
- @tanstack/react-table (data tables)
- Axios (HTTP client with token refresh interceptor)
- Chart.js + react-chartjs-2
- date-fns + react-day-picker
- Lucide React (icons)
- class-variance-authority + clsx + tailwind-merge (`cn()` utility)
- vite-plugin-pwa

## Architecture: Atomic Design

```
src/
├── core/            # App infrastructure (api, stores, i18n, routing, layout)
├── modules/         # Domain feature modules
│   └── <domain>/
│       ├── api/         # API call functions (axios)
│       ├── components/  # Organisms (domain-specific UI)
│       ├── hooks/       # State + logic + API orchestration
│       ├── types/       # Interfaces, enums, option constants
│       └── utils/       # Pure helpers (no React)
├── pages/           # Thin orchestrators only
├── shared/          # Domain-agnostic reusable components & hooks
│   ├── components/  # Atoms & Molecules
│   ├── hooks/       # Generic hooks (useDebounce, useFilterState, etc.)
│   ├── types/       # Shared TS types (PageKey, pagination)
│   └── utils/       # Generic utilities
└── styles/          # Global CSS (themes, shell, components, panels)
```

## Critical Rules

### 1. Thin Pages

- Pages < 100 lines JSX
- Only compose hooks + organisms via props
- NO inline business logic, API calls, or large JSX blocks

### 2. Hooks Own the State

- Extract ALL `useState` + `useEffect` + API logic into custom hooks
- Hooks live in `modules/<domain>/hooks/`
- Pages receive state and callbacks from hooks only

### 3. Reuse First

- Check `shared/components/` and `modules/<domain>/components/` before creating new
- Prefer extending existing components with generic props
- shadcn/ui pattern: use `cn()` utility for class composition

### 4. i18n Always

- All user-visible strings use `useT()` hook
- Keys defined in `src/core/locale/vi.ts` and `en.ts`
- Never hardcode Vietnamese text in shared components

### 5. No Domain Types in Shared

- `shared/components/` must NOT import from `modules/`
- Pass data as generic props

### 6. Constants in Types Files

- Option arrays and label maps go in `modules/<domain>/types/`
- Not inside components or pages

### 7. PageLayout Wrapper (mandatory)

Every page uses `<PageLayout>` from `shared/components/PageLayout.tsx`:
- Provides consistent `space-y-4` spacing
- Renders `PageHeader` with title/desc/icon/actions
- Optionally renders sticky tabs (replaces `PageWithTabsLayout`)
- No padding on pages — shell handles it (`app-content` CSS)
- Use `hideHeader` for embedded/nested pages

### 8. DrawerModal Stacking

- Use `stackOffset` (negative = front, positive = back) + `zIndex` (increment by 10)
- Mobile: CSS auto-resets to full-width overlay

## Routing

No React Router. Custom page-key system:

- `appStore.navigate(pageKey)` → updates URL via `history.pushState`
- `pathToPage()` / `pageToPath()` for URL ↔ page key mapping
- `popstate` listener syncs browser back/forward

## State Stores (Zustand)

| Store           | Purpose                                               |
| --------------- | ----------------------------------------------------- |
| `appStore`      | Navigation, tabs, theme, locale, login flag           |
| `authStore`     | Tokens, employee, profile, permissions, impersonation |
| `uiStore`       | Toasts, modals, slide panels                          |
| `settingsStore` | User preferences                                      |

All persisted to localStorage via Zustand `persist` middleware.

## API Integration

- Single axios instance at `src/core/api/axiosInstance.ts`
- Base URL from `VITE_API_BASE_URL` env var
- Auto-attaches Bearer token from authStore

### Interceptor Pipeline (order of execution)

1. **Request**: attaches `Bearer <token>` from localStorage
2. **Retry** (response error): auto-retries network errors (`ERR_NETWORK`, `ECONNABORTED`) and 502/503/504 up to 2 times with 1s exponential backoff
3. **Success toast** (response success): POST/PUT/PATCH/DELETE → auto shows i18n success toast (`createSuccess` / `updateSuccess` / `deleteSuccess`)
4. **Auth + Error toast** (response error):
   - 401 → refresh token via `/api/v1/auth/refresh` → retry original request; if refresh fails → logout
   - 403 → sets `appStore.forbidden` flag (renders Forbidden page)
   - All other errors → auto shows destructive toast with API error message preserved as-is

### Opt-out Flags

Components can suppress automatic toasts per-request:

```ts
// Suppress success toast (e.g., component shows its own inline feedback)
await axiosInstance.post(url, payload, { _silentSuccess: true });

// Suppress error toast (e.g., component handles error in ErrorBanner)
await axiosInstance.post(url, payload, { _silentError: true });

// Suppress both
await axiosInstance.post(url, payload, {
  _silentSuccess: true,
  _silentError: true,
});
```

### Error Extraction Utility

`extractApiError(e, fallback?)` in `shared/utils/apiError.ts`:

- Extracts `response.data.message` from AxiosError (preserves Directus/NestJS message as-is)
- Handles `string[]` from NestJS validation pipe (joins with "; ")
- Falls back to i18n network/timeout/unknown messages
- Still useful for inline error display (`ErrorBanner`, local state)

### i18n Keys

- `apiErrors.*` — error messages (forbidden, sessionExpired, networkError, timeout, unknown)
- `apiToast.*` — toast titles (createSuccess, updateSuccess, deleteSuccess, saveFail)

### API Function Pattern

```ts
// modules/<domain>/api/<domain>Api.ts
export async function createItemApi(payload: CreateDto): Promise<Item> {
  const { data } = await axiosInstance.post<Item>("/api/v1/items", payload);
  return data;
}
```

Components just `await createItemApi(payload)` — toast is automatic. Use `_silentSuccess` / `_silentError` only when custom UI feedback is needed.

## Validation & Build

```bash
npx tsc --noEmit          # Type check
npm run lint:check        # ESLint (zero warnings)
npm run build             # Full build (tsc + vite)
npx vitest run            # Unit tests (must pass before commit)
```

### Unit Testing

- Framework: Vitest + React Testing Library + fast-check (property tests)
- Test files: `__tests__/*.test.ts(x)` co-located with source
- Pre-commit hook runs all tests automatically (husky)
- Run single file: `npx vitest run src/path/to/file.test.ts`
- Watch mode: `npx vitest` (not in pre-commit)

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json + vite.config.ts)

## CSS Architecture

- `src/index.css` — entry point (@import only, then @tailwind directives)
- `src/styles/themes/` — CSS custom properties per theme
- `src/styles/base.css` — reset, animations
- `src/styles/shell.css` — app shell layout
- `src/styles/components.css` — reusable UI styles
- `src/styles/panels.css` — drawers, modals, overlays
- Prefer Tailwind utility classes inline; global CSS only for app-wide concerns
