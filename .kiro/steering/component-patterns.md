---
inclusion: fileMatch
fileMatchPattern: "src/**/*.tsx"
---

# Component & Hook Patterns

## Component Creation Checklist

Before creating a new component:
1. Search `shared/components/` — is there a generic version?
2. Search `modules/<domain>/components/` — is there a domain version?
3. Can an existing component be extended with props?
4. Does it belong in `shared/` (no domain types) or `modules/<domain>/` (uses domain types)?

## Recommended Component Shape

```tsx
interface Props {
  data: SomeType[];
  loading: boolean;
  onAction: (item: SomeType) => void;
}

export function MyComponent({ data, loading, onAction }: Props) {
  const t = useT();
  // Memoize derived values
  const processed = useMemo(() => transform(data), [data]);

  return (/* JSX */);
}
```

## Recommended Hook Shape

```tsx
export function useDomainFeature(params: Params) {
  const [state, setState] = useState<Form>(initial);
  const derived = useMemo(() => compute(state), [state]);

  const handleAction = useCallback(async () => {
    // validate, call API, show toast
  }, [state]);

  return { state, derived, handleAction };
}
```

## File Organization

- One component per folder: `ComponentName/index.tsx`
- Hook files: `modules/<domain>/hooks/useFeatureName.ts`
- Type files: `modules/<domain>/types/featureName.ts`
- Util files: `modules/<domain>/utils/featureName.ts`

## Key Shared Components Available

| Component | Purpose |
|-----------|---------|
| `DrawerModal` | Slide-in panel (supports stacking) |
| `DataTable` | @tanstack/react-table wrapper |
| `Combobox` | Searchable single-select (Radix Popover) |
| `MultiSelect` | Multi-select with tag chips |
| `BtnPrimary` | Primary action button |
| `StatusBadge` | Status pill |
| `ErrorBanner` | Form error display |
| `Pagination` | Page navigation |
| `SortTh` | Sortable table header |

## Toast Pattern

```tsx
import { useUIStore } from "@/core/config/uiStore";

const showToast = useUIStore((s) => s.showToast);
showToast({ title: t("success.saved"), variant: "default" });
```

## Permission Check Pattern

```tsx
import { useHasPermission } from "@/shared/hooks/useHasPermission";

const canEdit = useHasPermission("gw_payment_vouchers", "update");
```
