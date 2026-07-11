# Task: ERP Invoices Core — Web scope

> **Created:** 2026-06-16  
> **Lane:** erp-core  
> **Repo:** `liouni-erp-web` (`/opt/repos/liouni-erp-core/liouni-erp-web`)  
> **Status:** DONE — verified build + tests PASS 2026-06-18  
> **Linked API task:** `liouni-erp-api/docs/tasks/20260616-172700-erp-invoices-and-po-invoice-field-api.md`

---

## Tóm tắt

3 deliverable UI:

1. Field **Số HĐ NCC** trên form đơn mua hàng (`variant === "purchase"`)
2. Sidebar group **Kế toán** + NavItem **Hóa đơn**
3. Page **Hóa đơn** (`ErpInvoicePage`) — 2 tab IN/OUT, drawer chi tiết, form tạo/sửa

---

## Prerequisite — đọc trước khi làm

```
/opt/docs/ai/MASTER_CONTEXT.md
/opt/docs/ai/liouni-erp/erp-shared-context.md
liouni-erp-api/docs/tasks/20260616-172700-erp-invoices-and-po-invoice-field-api.md
```

API endpoints cần:

- `GET/POST /api/v1/erp-invoices` (module mới)
- `GET/PATCH/DELETE /api/v1/erp-invoices/:id`
- `PATCH /api/v1/purchase-orders/:id` đã nhận `supplierInvoiceNo`

---

## Scope 1 — Field `supplier_invoice_no` trên Form PO

### 1.1 API client

**[MODIFY]** `src/modules/purchase-orders-core/api/purchaseOrdersCoreApi.ts`

Trong interface `ErpPurchaseOrder`:

```typescript
supplierInvoiceNo?: string | null;
```

Trong interface `CreatePoPayload`:

```typescript
supplierInvoiceNo?: string;
```

### 1.2 Form store

**[MODIFY]** `src/modules/operational/hooks/useOperationalFormStore.ts`

Thêm vào `OperationalFormState`:

```typescript
supplierInvoiceNo: string;
```

Thêm vào `OperationalFormActions`:

```typescript
setSupplierInvoiceNo: (v: string) => void;
```

Trong `defaultState()`:

```typescript
supplierInvoiceNo: "",
```

Trong store actions:

```typescript
setSupplierInvoiceNo: (v) => set({ supplierInvoiceNo: v }),
```

Trong `initNew()` — reset về `""` (đã tự reset qua `defaultState()` spread).

Trong `initFromDoc()`:

```typescript
supplierInvoiceNo: (doc as never as Record<string, string>)['supplier_invoice_no'] || '',
```

### 1.3 Submit payload

**[MODIFY]** `src/modules/operational/components/OperationalFormDrawer.tsx`

Trong block `if (variant === "purchase")` của `handleSubmit()`:

```typescript
Object.assign(payload, {
  // ... fields hiện có ...
  supplier_invoice_no: store.supplierInvoiceNo.trim() || undefined,
});
```

> **Lưu ý:** Chỉ thêm vào block `isPurchaseStatusOnlyMode` và block full payload (không thêm vào block `isPurchaseFullyLocked` vì đó là locked state).

### 1.4 UI Field

**[MODIFY]** `src/modules/operational/components/form/FormGeneralInfoPanel.tsx`

Thêm import `supplierInvoiceNo`, `setSupplierInvoiceNo` từ store.

Thêm sau `DrawerField "Ngày nhận dự kiến"` (chỉ `variant === "purchase"`):

```tsx
{
  variant === "purchase" && (
    <DrawerField label={t("Số HĐ nhà cung cấp")}>
      <input
        className={inputCls}
        value={supplierInvoiceNo}
        disabled={isPurchaseFullyLocked}
        placeholder="Số hóa đơn VAT từ nhà cung cấp"
        onChange={(e) => setSupplierInvoiceNo(e.target.value)}
      />
    </DrawerField>
  );
}
```

---

## Scope 2 — Sidebar Group Kế toán

**[MODIFY]** `src/core/components/layout/Sidebar.tsx`

Thêm import `Receipt` từ `lucide-react`.

Thêm section mới **sau** section Manufacturing, **trước** section Hệ thống:

```tsx
{
  /* Kế toán */
}
<div className="sidebar-nav-section py-2">
  <div className="sidebar-label-el px-4 pt-2 pb-1 text-[11px] font-semibold text-[color:var(--sidebar-label)] uppercase tracking-[0.08em] mb-[2px] whitespace-nowrap">
    Kế toán
  </div>
  <NavItem
    collapsed={c}
    icon={<Receipt className="w-4 h-4 opacity-65 flex-shrink-0" />}
    label="Hóa đơn"
    active={currentPage === "erp-invoices"}
    onClick={() => navTo("erp-invoices")}
    contextPage="erp-invoices"
  />
</div>;
```

---

## Scope 3 — Wiring (PageKey, appStore, App.tsx)

### 3.1 PageKey

**[MODIFY]** `src/shared/types/index.ts`

Thêm vào union `PageKey`:

```typescript
| "erp-invoices"
```

### 3.2 appStore

**[MODIFY]** `src/core/config/appStore.ts`

Trong `CORE_PAGES`:

```typescript
"erp-invoices",
```

Trong `SECTION_ROOTS`:

```typescript
"erp-invoices": {
  labelKey: "nav.items.erpInvoices",
  group: "accounting",
},
```

Trong `BREADCRUMBS`:

```typescript
"erp-invoices": [["breadcrumb.accounting"], ["breadcrumb.erpInvoices"]],
```

### 3.3 App.tsx

**[MODIFY]** `src/App.tsx`

Import:

```typescript
import { ErpInvoicePage } from "@/pages/ErpInvoicePage";
```

Trong `CORE_PAGES`:

```typescript
"erp-invoices",
```

Render block (theo pattern các page khác):

```tsx
{
  openTabs.includes("erp-invoices") && (
    <div className={currentPage === "erp-invoices" ? "block h-full" : "hidden"}>
      <ErpInvoicePage />
    </div>
  );
}
```

---

## Scope 4 — API client `ErpInvoice`

**[NEW]** `src/modules/erp-invoices-core/api/erpInvoicesCoreApi.ts`

```typescript
import axiosInstance from "@/core/api/axiosInstance";
import type { PaginatedResponse } from "@/shared/types/pagination";

export interface ErpInvoice {
  id: string;
  invoiceNo: string;
  serialNo?: string | null;
  invoiceDate: string;
  direction: "IN" | "OUT";
  status: string;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  sellerAddress?: string | null;
  sellerBank?: string | null;
  buyerName?: string | null;
  buyerTaxCode?: string | null;
  buyerAddress?: string | null;
  description?: string | null;
  preVatAmount: string;
  vatRate?: string | null;
  vatAmount: string;
  discountAmount: string;
  totalAmount: string;
  purchaseOrderId?: string | null;
  salesOrderId?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateErpInvoicePayload {
  invoiceNo: string;
  serialNo?: string;
  invoiceDate: string;
  direction: "IN" | "OUT";
  status?: string;
  sellerName?: string;
  sellerTaxCode?: string;
  sellerAddress?: string;
  sellerBank?: string;
  buyerName?: string;
  buyerTaxCode?: string;
  buyerAddress?: string;
  description?: string;
  preVatAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  purchaseOrderId?: string;
  salesOrderId?: string;
  notes?: string;
}

export type UpdateErpInvoicePayload = Partial<CreateErpInvoicePayload>;

const BASE = "/api/v1/erp-invoices";

export const erpInvoicesCoreApi = {
  list: async (params?: {
    direction?: "IN" | "OUT";
    search?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    pageSize?: number;
  }): Promise<PaginatedResponse<ErpInvoice>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<ErpInvoice>>(
      BASE,
      { params },
    );
    return data;
  },

  get: async (id: string): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.get<{ data: ErpInvoice }>(
      `${BASE}/${id}`,
    );
    return data.data;
  },

  create: async (payload: CreateErpInvoicePayload): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.post<{ data: ErpInvoice }>(
      BASE,
      payload,
    );
    return data.data;
  },

  update: async (
    id: string,
    payload: UpdateErpInvoicePayload,
  ): Promise<ErpInvoice> => {
    const { data } = await axiosInstance.patch<{ data: ErpInvoice }>(
      `${BASE}/${id}`,
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
};
```

---

## Scope 5 — Page `ErpInvoicePage.tsx`

**[NEW]** `src/pages/ErpInvoicePage.tsx`

### Cấu trúc

```
ErpInvoicePage
├── Header: title "Hóa đơn" + button "Tạo hóa đơn"
├── Tab bar: "Đầu vào (IN)" | "Đầu ra (OUT)"
├── Filter bar: SearchInput + DatePicker (from/to) + Select status
├── DataTable (columns bên dưới)
└── DrawerModal (detail/create/edit)
```

### Columns DataTable

| Key                                               | Header     |
| ------------------------------------------------- | ---------- |
| `invoiceDate`                                     | Ngày HĐ    |
| `invoiceNo`                                       | Số hóa đơn |
| `serialNo`                                        | Ký hiệu    |
| tab IN: `sellerName` / tab OUT: `buyerName`       | Đối tác    |
| tab IN: `sellerTaxCode` / tab OUT: `buyerTaxCode` | MST        |
| `preVatAmount`                                    | Trước VAT  |
| `vatAmount`                                       | Thuế VAT   |
| `discountAmount`                                  | Chiết khấu |
| `totalAmount`                                     | Thành tiền |
| `status`                                          | Trạng thái |
| link chứng từ                                     | Chứng từ   |

### Drawer sections

**Section "Thông tin hóa đơn":**

- Số hóa đơn, Ký hiệu, Ngày HĐ, Trạng thái

**Section "Bên bán":**

- Tên, MST, Địa chỉ, Ngân hàng

**Section "Bên mua":**

- Tên, MST, Địa chỉ

**Section "Tài chính":**

- Diễn giải, Giá trước VAT, Thuế suất, Tiền thuế, Chiết khấu, Thành tiền

**Section "Chứng từ liên quan":**

- Nếu `purchaseOrderId`: button "Xem đơn mua hàng" → navigate sang page `purchasing`
- Nếu `salesOrderId`: button "Xem đơn bán hàng" → navigate sang page `sales`
- Select PO (direction=IN) hoặc SO (direction=OUT) khi tạo/sửa

### Pattern tham khảo

Reuse pattern từ:

- `ErpWarehousePage.tsx` — filter + DataTable + DrawerModal pattern
- `ErpSalesOrdersPage.tsx` — layout 2 tab
- `EInvoice.tsx` — tab structure, filter bar

### Logic cốt lõi

```typescript
// Load data theo tab active
const [direction, setDirection] = useState<"IN" | "OUT">("IN");
const [page, setPage] = useState(1);
const [search, setSearch] = useState("");
const [dateFrom, setDateFrom] = useState("");
const [dateTo, setDateTo] = useState("");

// Khi tab đổi, reset về page 1
useEffect(() => {
  setPage(1);
}, [direction]);

// API call
const loadInvoices = useCallback(async () => {
  const result = await erpInvoicesCoreApi.list({
    direction,
    search,
    date_from: dateFrom,
    date_to: dateTo,
    page,
    pageSize: 40,
  });
  // ...
}, [direction, search, dateFrom, dateTo, page]);
```

---

## Verification

```bash
cd /opt/repos/liouni-erp-core/liouni-erp-web

# Typecheck
bunx tsc --noEmit

# Build
bun run build

# Tests
bun run test
```

**UI smoke:**

1. Form PO: field "Số HĐ nhà cung cấp" hiển thị, nhập "HD-001", lưu → load lại thấy giá trị đúng
2. Sidebar: section "Kế toán" > "Hóa đơn" click được, mở đúng tab
3. Page `/erp-invoices`: tab IN/OUT, filter theo ngày, DataTable load data
4. Drawer chi tiết: mở 1 invoice, thấy đủ sections, click link PO/SO navigate đúng
5. Tạo mới invoice: điền form, save → xuất hiện trong list

---

## Done checklist

- [x] `purchaseOrdersCoreApi.ts` — thêm `supplierInvoiceNo` vào interfaces
- [x] `useOperationalFormStore.ts` — state + action + `initFromDoc` mapping
- [x] `OperationalFormDrawer.tsx` — payload `supplier_invoice_no` trong purchase block
- [x] `FormGeneralInfoPanel.tsx` — DrawerField "Số HĐ nhà cung cấp" (purchase only)
- [x] `Sidebar.tsx` — section Kế toán + NavItem Hóa đơn với icon `Receipt`
- [x] `types/index.ts` — `"erp-invoices"` vào PageKey
- [x] `appStore.ts` — CORE_PAGES + SECTION_ROOTS + BREADCRUMBS
- [x] `App.tsx` — import + CORE_PAGES + render block
- [x] `erp-invoices-core/api/erpInvoicesCoreApi.ts` — [NEW] API client
- [x] `ErpInvoicePage.tsx` — [NEW] page đầy đủ
- [x] `bunx tsc --noEmit` PASS — evidence 2026-06-18
- [x] `bun run build` PASS — `vite build` 2803 modules, exit 0 — 2026-06-18
- [x] `bun run test` PASS — Vitest 119/119, kể cả erp-invoices-core tests — 2026-06-18
- [ ] UI smoke 5 điểm PASS (cần live env với `bun start:dev`)
