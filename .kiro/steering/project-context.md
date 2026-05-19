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

### 7. DrawerModal Stacking

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
- 401 → auto-refresh via `/api/v1/auth/refresh` → retry original request
- 403 → sets `forbidden` flag in appStore
- API functions in `modules/<domain>/api/` return typed responses

## Validation & Build

```bash
npx tsc --noEmit          # Type check
npm run lint:check        # ESLint (zero warnings)
npm run build             # Full build (tsc + vite)
```

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
