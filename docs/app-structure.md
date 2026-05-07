# ERP App Structure Documentation

## Table of Contents

- [Atomic Design Architecture](#atomic-design-architecture)
- [Directory Structure](#directory-structure)
- [Styles Structure](#styles-structure)
- [Layer Responsibilities](#layer-responsibilities)
- [Component Structure](#component-structure)
- [Hook Structure](#hook-structure)
- [Util Structure](#util-structure)
- [Existing Components](#existing-components)

## Atomic Design Architecture

This application follows the Atomic Design pattern, organizing UI components into atoms, molecules, and organisms.

### Directory Structure

```
src/
├── shared/components/        # Atoms & generic Molecules — domain-agnostic, reusable anywhere
│   └── <ComponentName>/
│       └── index.tsx         # One component per folder
├── modules/<domain>/
│   ├── components/           # Organisms — domain-specific, reusable within the domain
│   │   └── <ComponentName>/
│   │       └── index.tsx
│   ├── hooks/                # Custom hooks encapsulating business logic
│   ├── types/                # Shared TypeScript interfaces & option constants
│   ├── utils/                # Pure helpers (no React)
│   └── api/                  # API calls
├── core/                     # App-wide config, i18n, routing, stores
└── pages/                    # Page orchestrators only — no business logic inline
```

## Styles Structure

All global CSS lives under `src/styles/` and is imported via `src/index.css` as the single entry point.

### File layout

```
src/
├── index.css                    # Entry point — @import only, no rules
└── styles/
    ├── themes/
    │   ├── default.css          # :root  — default (dark sidebar, light content)
    │   ├── dark.css             # .dark
    │   ├── classic.css          # .theme-classic (light)
    │   └── classic-dark.css     # .theme-classic.dark
    ├── base.css                 # Reset, html/body, scrollbar, keyframes, animation utilities
    ├── shell.css                # App shell, sidebar, topbar, tab-bar, right-panel, mobile media queries
    ├── components.css           # Tooltip, form inputs, card-shadow, popup dropdowns, context menu
    └── panels.css               # Slide panel, partner drawer, import modal, toast
```

### Entry point rule

`index.css` must contain **only** `@import` statements followed by `@tailwind` directives — no CSS rules inline.

```css
/* ── Theme Variables ── */
@import "./styles/themes/default.css";
@import "./styles/themes/dark.css";
@import "./styles/themes/classic.css";
@import "./styles/themes/classic-dark.css";

/* ── Base & Reset ── */
@import "./styles/base.css";
/* ... */

@tailwind base;
@tailwind components;
@tailwind utilities;
```

> **PostCSS rule**: `@import` must precede all other statements including `@tailwind`.

### Theme files

Each theme file only defines CSS custom properties — no selectors with rules, no layout.

| File                      | Selector              | Description                                 |
| ------------------------- | --------------------- | ------------------------------------------- |
| `themes/default.css`      | `:root`               | Default theme (dark sidebar, white content) |
| `themes/dark.css`         | `.dark`               | Full dark mode                              |
| `themes/classic.css`      | `.theme-classic`      | Classic flat light UI                       |
| `themes/classic-dark.css` | `.theme-classic.dark` | Classic flat dark UI                        |

Each theme file groups variables into sections:

```css
/* ── Palette ── */
/* ── Semantic colors (up/down/warn/approve) ── */
/* ── Glass chrome (top bar & tab bar only) ── */
/* ── Popups & dropdowns ── */
/* ── App shell ── */
```

### Where to add new styles

| What you need                                | Where to add                             |
| -------------------------------------------- | ---------------------------------------- |
| New CSS variable / token                     | The relevant `themes/*.css` file(s)      |
| Global reset or animation                    | `styles/base.css`                        |
| Layout change to shell, sidebar, topbar      | `styles/shell.css`                       |
| New reusable UI component style              | `styles/components.css`                  |
| New overlay, drawer, or modal                | `styles/panels.css`                      |
| Component-scoped styles (one component only) | Inline Tailwind classes in the component |

## Rules

### 1. Reuse before creating

Before adding a component, hook, or helper:

- **Prioritize shadcn/ui**: Always check if the required UI can be satisfied by a shadcn/ui component before creating a new one from scratch.
- **Check related components**: Before creating a new component, check if a similar or related one exists in the system. If it does, prioritize refactoring or extending it with generic props so it can be reused across multiple modules/components.
- Search `shared/components`, `shared/hooks`, `modules/<domain>/components`, `modules/<domain>/hooks`, and `modules/<domain>/utils`.
- Prefer extending an existing component with generic props when the behavior is broadly useful.
- Prefer composing existing atoms/molecules/organisms over copying JSX into a page.
- Create a new shared component only when it has no domain dependency and is reusable across modules.
- Create a new module component only when it uses domain language, domain types, or domain-specific workflows.

### 2. One component per folder

Every component lives in its own folder with `index.tsx`. No multi-component files.

```
✅ shared/components/SortTh/index.tsx
❌ shared/components/TableHelpers.tsx  (multiple exports)
```

### 3. Layer responsibilities

| Layer                         | What belongs here                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| `shared/components`           | Atoms/Molecules with no domain knowledge (SortTh, ChartSkeleton, BtnPrimary, StatusBadge) |
| `modules/<domain>/components` | Organisms using domain types (VoucherTable, CashVoucherDrawer, VoucherFilterBar)          |
| `modules/<domain>/hooks`      | State, effects, API orchestration, handlers extracted from pages                          |
| `modules/<domain>/types`      | Interfaces, enums, option arrays shared across components                                 |
| `modules/<domain>/utils`      | Pure helpers only: formatting, parsing, mapping, calculations                             |
| `pages/`                      | Thin orchestrators: compose organisms, wire hooks, no business logic inline               |

### 4. Component structure

Components should follow atomic design and stay presentation-focused.

**Atoms** in `shared/components`:

- Basic controls or display elements.
- No API calls, no domain imports, no business rules.
- Accept generic props and labels from parents.

**Molecules** in `shared/components`:

- Small combinations of atoms that remain domain-agnostic.
- Example: search input, pagination, date picker, upload box.

**Organisms** in `modules/<domain>/components`:

- Domain-specific UI composed from atoms/molecules.
- May import domain types and domain constants.
- Receive state and callbacks through props; do not fetch data directly unless the organism is explicitly self-contained.

Recommended component shape:

```tsx
interface VoucherTableProps {
  vouchers: PaymentVoucher[];
  loading: boolean;
  onEdit: (voucher: PaymentVoucher) => void;
}

export function VoucherTable({ vouchers, loading, onEdit }: VoucherTableProps) {
  const t = useT();
  const columns = useMemo(() => buildColumns(t), [t]);

  return (
    <Table
      columns={columns}
      rows={vouchers}
      loading={loading}
      onEdit={onEdit}
    />
  );
}
```

### 5. Hook structure

Hooks own behavior and keep pages/components small.

Hooks should:

- Encapsulate `useState`, `useEffect`, API calls, mutations, and event handlers.
- Return named state values and named callbacks.
- Keep domain hooks under `modules/<domain>/hooks`.
- Use shared hooks only for generic behavior such as debounce, filters, local UI state, or browser utilities.
- Memoize derived values with `useMemo` and stable callbacks with `useCallback` when passing them to child components or effects.

Recommended hook shape:

```tsx
export function useCashVoucherHandlers(params: UseCashVoucherHandlersParams) {
  const { vouchers, onSaved } = params;
  const [form, setForm] = useState<CashVoucherForm>(emptyForm("CASH_RECEIPT"));

  const totals = useMemo(() => calculateTotals(vouchers), [vouchers]);

  const handleSave = useCallback(async () => {
    // validate, call API, show toast, refresh
    onSaved();
  }, [form, onSaved]);

  return { form, totals, setField, handleSave };
}
```

### 6. Util structure

Utils must be pure and framework-free.

Use `modules/<domain>/utils` for:

- Formatting/parsing domain values.
- Building DTOs or form models from API objects.
- Pure calculations and data transforms.

Do not put these in utils:

- React hooks or JSX.
- API calls.
- Toasts, modals, navigation, or store access.
- State mutations.

```ts
// ✅ Pure util
export function buildForm(voucher: PaymentVoucher): CashVoucherForm {
  return { voucher_no: voucher.voucher_no, amount: formatMoneyInput(voucher.amount) };
}

// ❌ Wrong util
export function saveVoucher() {
  const showToast = useUIStore((s) => s.showToast);
  return createPaymentVoucherApi(...);
}
```

### 7. Pages must be thin

Pages should only:

- Call hooks to get state & handlers
- Compose organisms via props.
- Memoize derived values with `useMemo` and resolver callbacks with `useCallback`.
- NOT contain inline business logic, API calls, handlers, option construction, or large JSX blocks.

```tsx
// ✅ Correct page pattern
export function TienMat() {
  const { vouchers, loading, ... } = useVoucherList();
  const fundOpts = useMemo(() => buildFundOptions(funds), [funds]);

  return (
    <>
      <VoucherFilterBar ... />
      <VoucherKpiRow ... />
      <VoucherTable ... />
      <CashVoucherDrawer ... />
    </>
  );
}

// ❌ Wrong — inline API calls and 1000-line render
export function TienMat() {
  const [data, setData] = useState([]);
  useEffect(() => { fetch(...).then(setData) }, []);
  return <table>{data.map(v => <tr>...</tr>)}</table>;
}
```

### 8. Shared components accept no domain types

`shared/components` must not import from `modules/`. Pass data as generic props.

```tsx
// ✅ Generic — accepts any string status
<StatusBadge status={v.status} />;

// ❌ Wrong — imports PaymentVoucher inside shared
import type { PaymentVoucher } from "@/modules/finance/api/financeApi";
```

### 9. Constants belong in types files

Option arrays and label maps go in `modules/<domain>/types/`, not inside components or pages.

```tsx
// ✅ Correct
import { STATUS_FILTER_OPTS, STATUS_LABELS } from "@/modules/finance/types/voucherForm";

// ❌ Wrong — defined inside page/component
const STATUS_FILTER_OPTS = [{ value: "DRAFT", label: "Nháp" }, ...];
```

### 10. i18n always

- All user-visible strings use `useT()` or come from locale keys
- Never hardcode Vietnamese text inside shared components; pass as props instead
- Add missing keys to both `src/core/locale/vi.ts` and `en.ts` when creating new UI

### 11. Hooks own the state

Extract all `useState` + `useEffect` + API logic into custom hooks under `modules/<domain>/hooks/`.
Pages receive state and callbacks from hooks only.

## Existing Shared Components

| Component          | Path                                     | Purpose                                   |
| ------------------ | ---------------------------------------- | ----------------------------------------- |
| `SortTh`           | `shared/components/SortTh`               | Sortable table header                     |
| `BtnPrimary`       | `shared/components/BtnPrimary`           | Primary action button                     |
| `StatusBadge`      | `shared/components/badges`               | Voucher status pill                       |
| `VoucherTypeBadge` | `shared/components/badges`               | Thu/Chi pill                              |
| `AttachmentRow`    | `shared/components/AttachmentComponents` | Attachment list item                      |
| `AttachmentCell`   | `shared/components/AttachmentComponents` | Inline attachment count                   |
| `ChartSkeleton`    | `shared/components/ChartSkeleton`        | Line chart loader                         |
| `DonutSkeleton`    | `shared/components/DonutSkeleton`        | Donut chart loader                        |
| `ErrorBanner`      | `shared/components/ErrorBanner`          | Form error message                        |
| `DrawerModal`      | `shared/components/DrawerModal`          | Slide-in side panel (supports stacking)   |
| `MultiSelect`      | `shared/components/MultiSelect`          | Radix Popover multi-select with tag chips |
| `Combobox`         | `shared/components/Combobox`             | Radix Popover searchable single-select    |

## Existing Finance Organisms

| Component           | Path                                           | Purpose                          |
| ------------------- | ---------------------------------------------- | -------------------------------- |
| `VoucherFilterBar`  | `modules/finance/components/VoucherFilterBar`  | Period + date + channel filter   |
| `VoucherKpiRow`     | `modules/finance/components/VoucherKpiRow`     | 4 KPI cards                      |
| `VoucherChartRow`   | `modules/finance/components/VoucherChartRow`   | Line + 2 donut charts            |
| `VoucherTable`      | `modules/finance/components/VoucherTable`      | Data table with search/sort/page |
| `CashVoucherDrawer` | `modules/finance/components/CashVoucherDrawer` | Create/edit/approve cash voucher |

## DrawerModal — Stacked Panel System

`shared/components/DrawerModal` renders into `document.body` via `createPortal` (bypasses the `backdrop-filter` on `.right-panel`). Supports multi-level stacking where newer panels slide left and older panels slide right, with a visible gap between them.

### Key props

| Prop          | Type     | Default | Description                                                                                                                                                                     |
| ------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zIndex`      | `number` | `400`   | Stacking order. Increment by 10 per depth level.                                                                                                                                |
| `stackOffset` | `number` | `0`     | `translateX(N%)` applied to the panel when open. Negative = slide left (front panel). Positive = slide right (back panel). Percentage is relative to the panel's **own width**. |

### Stacking rule

Use the **same absolute percentage** on both panels, with opposite signs. The CSS `transition: transform 0.25s` on `.slide-panel` animates both shifts simultaneously.

```
Front panel (new):  stackOffset = -P   →  translateX(-P%)  slides left
Back panel (old):   stackOffset = +P   →  translateX(+P%)  slides right
```

Gap between panels = `backWidth × (1 − P/100) − frontWidth × (P/100)`

For the 420 px employee drawer behind the 620 px permission matrix, **P = 42** gives a ~16 px gap:

```tsx
// Back panel (employee edit, 420 px) — shifts right 42 % of its own width
<DrawerModal stackOffset={policyDrawerOpen ? 42 : 0} zIndex={400} ...>

// Front panel (permission matrix, 620 px) — shifts left 42 % of its own width
<PermissionMatrixDrawer stackOffset={-42} zIndex={410} ...>
```

### Scaling to 3+ panels

Each additional depth level adds one more P to the back panel's offset:

| Depth     | Panel   | stackOffset | zIndex |
| --------- | ------- | ----------- | ------ |
| 0 (front) | Newest  | `-P`        | 420    |
| 1         | Middle  | `+P`        | 410    |
| 2         | Deepest | `+2P`       | 400    |

### Mobile behaviour (≤ 500 px viewport)

On narrow screens, panels already occupy `100vw`. Stacking offsets would shift the front panel partially off-screen left and clip its content. The CSS media query in `index.css` forcibly resets any inline `stackOffset` transform back to `translateX(0)` on mobile:

```css
@media (max-width: 500px) {
  .slide-panel-overlay.open .slide-panel {
    transform: translateX(0) !important;
  }
}
```

Result: on mobile, new panels fully overlay older panels at full width (no peeking). No JS changes are needed; the rule is applied automatically.

### Portal & backdrop-filter note

`.right-panel` has `backdrop-filter: blur()` which makes `position: fixed` children position relative to `.right-panel` instead of the viewport. `DrawerModal` uses `createPortal(…, document.body)` to escape this. **Never render a DrawerModal inside another fixed/transformed container** — always let it portal to body.

## Finance Hooks

| Hook                     | Path                                           | Purpose                                           |
| ------------------------ | ---------------------------------------------- | ------------------------------------------------- |
| `useVoucherList`         | `modules/finance/hooks/useVoucherList`         | List state + pagination + filters                 |
| `useVoucherDashboard`    | `modules/finance/hooks/useVoucherDashboard`    | KPI + chart data                                  |
| `useVoucherDrawer`       | `modules/finance/hooks/useVoucherDrawer`       | Drawer state + CRUD + attachments                 |
| `useCashVoucherHandlers` | `modules/finance/hooks/useCashVoucherHandlers` | Cash voucher form handlers + save/delete workflow |
| `useBankVoucherHandlers` | `modules/finance/hooks/useBankVoucherHandlers` | Bank voucher form handlers + save/delete workflow |
| `usePeriodFilter`        | `modules/finance/hooks/usePeriodFilter`        | Period/date filter state                          |
| `useFilterState`         | `shared/hooks/useFilterState`                  | Debounced search + amount range                   |

## System / RBAC

### Organisms

| Component                | Path                                               | Purpose                                                                               |
| ------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `RoleDrawer`             | `modules/system/components/RoleDrawer`             | Create / edit role (name, description)                                                |
| `PermissionMatrixDrawer` | `modules/system/components/PermissionMatrixDrawer` | Collection × CRUD permission matrix; supports `stackOffset` and `zIndex` for stacking |

### Hooks

| Hook                   | Path                                        | Purpose                                                                                                                          |
| ---------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `useRoles`             | `modules/system/hooks/useRoles`             | Role list with pagination, search, CRUD                                                                                          |
| `usePermissionsEditor` | `modules/system/hooks/usePermissionsEditor` | Permission map state (toggle/row/column); accepts optional `{ getApi, saveApi }` to target roles **or** employee custom policies |

### API

| Function                     | Endpoint                                   | Notes                                             |
| ---------------------------- | ------------------------------------------ | ------------------------------------------------- |
| `getRolesApi`                | `GET /api/v1/rbac/roles`                   | Paginated role list                               |
| `getRolePermissionsApi`      | `GET /api/v1/rbac/roles/:id/permissions`   | Permission list for a role                        |
| `saveRolePermissionsApi`     | `PATCH /api/v1/rbac/roles/:id/permissions` | Save role permissions                             |
| `getEmployeePermissionsApi`  | `GET /api/v1/employees/:id/permissions`    | Employee custom policy permissions (graceful 404) |
| `saveEmployeePermissionsApi` | `PATCH /api/v1/employees/:id/permissions`  | Save employee custom policy permissions           |
| `getUserRolesApi`            | `GET /api/v1/rbac/users/:id/roles`         | Current roles for a Directus user (graceful 404)  |
| `updateUserRolesApi`         | `PATCH /api/v1/rbac/users/:id/roles`       | Replace user role set                             |

### RBAC collections (`RBAC_COLLECTIONS` in `modules/system/types/rbac.ts`)

The permission matrix covers these Directus collections, grouped by domain:

| Group     | Collections                                                                                                                                                                                                                                       |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tài chính | `gw_payment_vouchers`, `gw_payment_voucher_attachments`, `gw_payment_voucher_approval_logs`, `gw_cash_funds`, `gw_company_bank_accounts`, `gw_chart_of_accounts`, `gw_accounting_accounts`, `gw_opening_balances`, `gw_voucher_numbering_configs` |
| Nhân sự   | `gw_employees`, `gw_departments`, `gw_positions`                                                                                                                                                                                                  |
| Đối tác   | `gw_business_partners`, `gw_business_partner_roles`, `gw_business_partner_contacts`, `gw_business_partner_bank_accounts`                                                                                                                          |
| Hệ thống  | `directus_roles`                                                                                                                                                                                                                                  |

### Employee PATCH payload

`PATCH /api/v1/employees/:id` accepts these additional fields beyond the standard profile fields:

```ts
{
  role_id?:   string | null   // Base Directus role (single)
  policy_id?: string | null   // Custom policy (single; BE manages directus_access)
}
```

Backend handles role assignment (`directus_users.role`) and custom policy (`directus_access`) in one request.
