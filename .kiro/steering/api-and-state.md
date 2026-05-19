---
inclusion: fileMatch
fileMatchPattern: "src/modules/**/api/**,src/modules/**/hooks/**,src/modules/**/domain/**"
---

# API & State Management Patterns

## API Function Pattern

API functions live in `modules/<domain>/api/` and use the shared axios instance.

```typescript
import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse, ListParams } from "@/shared/types/pagination";

// List with pagination
export async function getItemsApi(
  params: ListParams = {},
): Promise<PaginatedResponse<MyItem>> {
  const { data } = await axiosInstance.get<PaginatedResponse<MyItem>>(
    "/api/v1/my-domain",
    {
      params: {
        page: params.page ?? 1,
        pageSize: params.pageSize ?? 20,
        sort: (params.sort ?? ["-created_at"]).join(","),
        ...(params.search ? { search: params.search } : {}),
      },
    },
  );
  return data;
}

// Create
export async function createItemApi(dto: CreateDto): Promise<MyItem> {
  const { data } = await axiosInstance.post<{ message: string; data: MyItem }>(
    "/api/v1/my-domain",
    dto,
  );
  return data.data;
}

// Update
export async function updateItemApi(id: string, dto: UpdateDto): Promise<MyItem> {
  const { data } = await axiosInstance.patch<{ message: string; data: MyItem }>(
    `/api/v1/my-domain/${id}`,
    dto,
  );
  return data.data;
}

// Delete
export async function deleteItemApi(id: string): Promise<void> {
  await axiosInstance.delete(`/api/v1/my-domain/${id}`);
}
```

## Response Types

```typescript
// Standard paginated response from API
interface PaginatedResponse<T> {
  items: T[];
  meta: { total: number; page: number; pageSize: number };
}

// Standard list params
interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string[];
  search?: string;
}
```

## Hook Pattern for List Pages

```typescript
export function useItemList() {
  const [items, setItems] = useState<MyItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: 20 });
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async (params?: ListParams) => {
    setLoading(true);
    try {
      const res = await getItemsApi(params);
      setItems(res.items);
      setMeta(res.meta);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, []);

  return { items, loading, meta, search, setSearch, fetchItems };
}
```

## Hook Pattern for Drawer/Form

```typescript
export function useItemDrawer(onSaved: () => void) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const showToast = useUIStore((s) => s.showToast);
  const t = useT();

  const openCreate = useCallback(() => {
    setForm(emptyForm);
    setOpen(true);
  }, []);

  const openEdit = useCallback((item: MyItem) => {
    setForm(itemToForm(item));
    setOpen(true);
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      if (form.id) {
        await updateItemApi(form.id, formToDto(form));
      } else {
        await createItemApi(formToDto(form));
      }
      showToast({ title: t("success.saved"), variant: "default" });
      setOpen(false);
      onSaved();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }, [form, onSaved]);

  return { open, setOpen, form, setForm, saving, openCreate, openEdit, handleSave };
}
```

## Zustand Store Pattern

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      value: "",
      setValue: (v) => set({ value: v }),
    }),
    {
      name: "erp-my-store", // localStorage key
      partialize: (s) => ({ value: s.value }), // only persist what's needed
    },
  ),
);
```

## Request Deduplication

For frequently called lookups (e.g. cash funds, chart of accounts), use `dedupeRequest`:

```typescript
import { dedupeRequest } from "@/shared/utils/requestCache";

export async function getCashFundsApi(): Promise<CashFund[]> {
  return dedupeRequest("cash-funds:list", async () => {
    const { data } = await axiosInstance.get<PaginatedResponse<CashFund>>(
      "/api/v1/cash-funds",
      { params: { page: 1, pageSize: 200, sort: "fund_code" } },
    );
    return data.items;
  });
}
```

## Auth Token Flow

- Tokens stored in `authStore` (Zustand, persisted to localStorage as `erp-auth`)
- Axios request interceptor auto-attaches `Authorization: Bearer <token>`
- 401 response → interceptor refreshes via `/api/v1/auth/refresh` → retries
- Refresh failure → `clearAuth()` → redirects to login
- 403 → sets `appStore.forbidden = true` → shows 403 error page
