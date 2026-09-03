---
name: standardize-table-page
description: Scaffold or refactor a standard DataTable page following the ERP project's UI standards. Use this skill whenever you need to create a new data table page or refactor an existing one for a new module.
---

# 📋 Table Page Standards

> ⚡ **FAST-TRACK (PlopJS Generator)**: Để tiết kiệm token và tạo ngay bộ khung chuẩn (API + Hook + Page + Detail Drawer + Locales), chạy:
> ```bash
> bun plop table-page <moduleName> <componentName> "<pageTitle>" <tableId> <drawerType> <drawerSize> <hasDateColumn> <hasAmountColumn> <hasStatusColumn>
> ```
> *(Xem chi tiết tại skill `plop-generate`)*

Khi tạo mới hoặc chỉnh sửa một trang hiển thị bảng dữ liệu trong hệ thống (như các trang `erp-invoice-*`, `garage-cases`), bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau.

## 1. Cấu trúc trang (Page Structure)

- **Wrapper**: Bọc toàn bộ nội dung trang trong `<SpreadsheetPageTemplate>` từ `@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate`.
- **Title & Description**: Trang **PHẢI** có tiêu đề (`<h1>`) và mô tả (`<p>`) rõ ràng, đều dùng hook i18n (`t(...)`).
- **Variant Bảng & Container**: Truyền `variant="spreadsheet"` cho `<DataTable>` để có giao diện dạng lưới Excel tinh gọn, đồng thời container bảng tự động giữ bo góc `rounded-xl` (12px) và viền `border border-border/60` đồng bộ toàn hệ thống.
- **Tự động kích hoạt Right Filter Panel 2 Chiều**: Khi truyền `columns`, `tableId` và `listHook` vào `<SpreadsheetPageTemplate>`, hệ thống **tự động khởi tạo Right Filter Panel thông minh** (chiều rộng 320px, dải Active Filter Chips, tìm kiếm cột nhanh, hỗ trợ toán tử nâng cao cho Số và Text, tự động đếm tổng số active filter count và nút "Xóa tất cả" tập trung). Không cần tự viết code quản lý side panel thủ công!

## 2. Breadcrumb & TabBar — BẮT BUỘC

### 2.1. Breadcrumb đúng cấp (Topbar)

Breadcrumb hiển thị trên Topbar phản ánh cấu trúc menu Sidebar. Trang Table **BẮT BUỘC** đăng ký breadcrumb theo đúng cấp độ (Module Group → Sub-group → Tên trang).

**Cách 1 — Static (ưu tiên)**: Thêm entry vào `BREADCRUMBS` trong `src/core/config/appStore.ts`.
Format: `Array<[i18nKey, pageKey?]>` — nếu có `pageKey` thì breadcrumb đó clickable.

```ts
// appStore.ts — trong BREADCRUMBS:
"[module]-list": [
  ["breadcrumb.accounting"],                          // Level 1: Module Group
  ["nav.items.[module]Group", "[module]-dashboard"], // Level 2: Sub-group (có link)
  ["nav.items.[module]List"],                         // Level 3: Tên trang hiện tại (cuối, không link)
],
```

**Cách 2 — Dynamic** (breadcrumb động theo state / record): Dùng `setCustomBreadcrumbs` trong `useEffect` (kèm cleanup khi unmount).

### 2.2. TabBar — Đăng ký PageKey và Label

1. **Thêm `PageKey`**: trong `src/shared/types/index.ts`.
2. **Đăng ký `SECTION_ROOTS`**: trong `src/core/config/appStore.ts` (`labelKey: "nav.items.[module]List"`, `group: "accounting" | "inventory" | ...`).
3. **Khai báo i18n**: Thêm key tương ứng vào `src/core/locale/system/nav/` và `breadcrumb/` (`vi.ts`, `en.ts`).

## 3. Đa ngôn ngữ (i18n) & Empty State — BẮT BUỘC

- Tất cả text hiển thị (title, desc, column label, filter placeholder, button, empty message...) **BẮT BUỘC** bọc trong hàm `t` từ `useTranslation("namespace")`. **TUYỆT ĐỐI KHÔNG** hardcode text trực tiếp.
- Tạo file locale module đi kèm tại `src/core/locale/[module]/vi.ts` và `en.ts`.
- Khi bảng không có dữ liệu, hiển thị `<EmptyState>` chuẩn hoặc truyền `emptyLabel={t("noData", "Không có dữ liệu")}`.

## 4. Server-side Hook, React Query & Responsive PageSize — BẮT BUỘC

- **Mặc định toàn hệ thống**: Filter, Sorting và Pagination **BẮT BUỘC** thực hiện ở **Server-side** thông qua custom hook `use[Module]List` kết nối **TanStack React Query (`useQuery`)**.
- **Enum Query Key Tập Trung**: **BẮT BUỘC** dùng Enum `ErpQueryKey` từ `@/shared/lib/queryKeys` (ví dụ: `ErpQueryKey.INVOICES_LIST`, `ErpQueryKey.VINFAST_PARTS_STOCK`, `ErpQueryKey.INVENTORY_STOCK_LIST`), **TUYỆT ĐỐI KHÔNG** hardcode string query key tự do.
- **Thời Gian Cache Tiêu Chuẩn (`DEFAULT_STALE_TIME`)**: Sử dụng hằng số chuẩn `DEFAULT_STALE_TIME = 90_000` (1 phút 30 giây) từ `@/shared/lib/queryKeys` (hoặc để mặc định từ `queryClient.ts`).
- **Khởi tạo `defaultPageSize` thích ứng theo Chiều cao màn hình (Screen Height)**:
  - Khi `window.innerHeight < 900px` (Laptop / màn hình phổ thông): Default `pageSize = 20`.
  - Khi `window.innerHeight >= 900px` (Desktop / Monitor lớn): Default `pageSize = 50`.
- **Mốc phân trang**: Bắt buộc hỗ trợ đầy đủ các mốc `pageSizeOptions = [20, 50, 100, 200]`.
- **File API**: Tạo sẵn `src/modules/[module]/api/[module]Api.ts` với đầy đủ CRUD và API `getColumnOptions(columnKey, search, pageParam, pageSize, filtersStr)`.

**Mẫu Hook Chuẩn (`use[Module]List.ts`):**

```ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ErpQueryKey, DEFAULT_STALE_TIME } from "@/shared/lib/queryKeys";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function use[Module]List(activeTab?: string) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      ErpQueryKey.[MODULE]_LIST, // 👉 Dùng Enum chuẩn
      activeTab,                  // 👉 Đưa tab vào queryKey để cache độc lập theo từng tab
      page,
      pageSize,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () => {
      // return [module]Api.getList({ page, pageSize, tab: activeTab, sorts, date_from: dateFrom || undefined, date_to: dateTo || undefined, column_filters: Object.keys(columnFilters).length ? JSON.stringify(columnFilters) : undefined, column_search: Object.keys(columnSearch).length ? JSON.stringify(columnSearch) : undefined });
      return Promise.resolve({ data: [], total: 0, totalPages: 0 });
    },
    staleTime: DEFAULT_STALE_TIME, // 👉 1 phút 30 giây (90,000ms)
  });

  const setSort = (key: string, state: "asc" | "desc" | "none") => {
    setSorts((prev) => {
      const filtered = prev.filter((s) => s !== key && s !== `-${key}`);
      if (state === "asc") return [...filtered, key];
      if (state === "desc") return [...filtered, `-${key}`];
      return filtered;
    });
    setPage(1);
  };

  const setColumnFilter = (key: string, vals: string[]) => {
    setColumnFilters((prev) => ({ ...prev, [key]: vals }));
    setPage(1);
  };

  const setColumnSearch = (key: string, val: string) => {
    setColumnSearch((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const setDateRange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.values(columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += vals.length;
    });
    Object.values(columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (dateFrom || dateTo) count += 1;
    return count;
  }, [columnFilters, columnSearch, dateFrom, dateTo]);

  const clearAllFilters = () => {
    setColumnFilters({});
    setColumnSearch({});
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  return {
    data: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading: isLoading || isFetching,
    page,
    setPage,
    pageSize,
    setPageSize,
    sorts,
    setSort,
    dateFrom,
    dateTo,
    setDateRange,
    columnFilters,
    setColumnFilter,
    columnSearch,
    setColumnSearch,
    activeFilterCount,
    clearAllFilters,
    refetch,
  };
}
```

## 5. Tích hợp Chuẩn Table & Drawer

Khi tạo bảng và drawer trong trang, **BẮT BUỘC** tuân thủ các quy chuẩn từ 2 skill cơ sở:

1. 👉 **Bảng dữ liệu ([`standardize-table`](../standardize_table/SKILL.md))**:
   - **`tableId="[module]-table"`**: Duy nhất để đồng bộ cấu hình cột vào App Setting Core (`core_user_preferences`) và LocalStorage cache.
   - **Reset Layout**: Nằm cố định trong menu dropdown `ColumnToggle` (`Settings2` → `RotateCcw`), không đặt ở header cột.
   - **Cột STT (Index)**: Rộng đúng `40px`, **bắt đầu từ 1 (1-based)**, căn giữa tuyệt đối cả header và cell (`cell: (_, idx) => <span className="w-full block text-center">{(page - 1) * pageSize + idx + 1}</span>`).
   - **Cột Mã Code**: Dùng `<TableText enableCopy tooltip onDetailClick={() => openDetail(row.id, "view")}>`.
   - **Row Actions**: BẮT BUỘC dùng prop `rowActions` trên `<SpreadsheetPageTemplate>`. Không tạo cột action tĩnh. Mảng `rowActions` phải chứa 2 action đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — ✏️) để map vào Floated Action Bar và Right-Click Context Menu.
   - **TableColumnHeaderFilter**: Dùng `fetchOptions` gọi `getColumnOptions` API; Cột Date dùng `<DateRangeColumnSlot>`; Tự động hỗ trợ tìm kiếm chính xác (`"..."`) và nhiều từ khóa qua dấu chấm phẩy (`;`); Cột có dữ liệu optional/null bật `{ showBlankOption: true }` để chèn option `(blank)` / `(Trống)`.
2. 👉 **Detail Drawer ([`standardize-drawer`](../standardize_drawer/SKILL.md))**:
   - Mở component `[Module]DetailDrawer` với prop `mode={drawerMode}` (`"view" | "edit"`) và `setMode={setDrawerMode}`. Không điều hướng URL.

## 6. Chế độ xem Cột linh hoạt (`ViewModeCombobox`) & Switch Nhanh (`PillTabs`) — BẮT BUỘC KHI CÓ ĐA GÓC NHÌN / PHÂN LOẠI CHIỀU DỮ LIỆU

Khi một trang dữ liệu có nhiều góc nhìn (ví dụ: góc nhìn thường nhật vs góc nhìn đối soát/kiểm toán) hoặc có các phân loại nghiệp vụ lớn (Thu/Chi, Mua vào/Bán ra, Mới/Thay thế/Điều chỉnh), **BẮT BUỘC** tích hợp vào `customActionsNode` của `<SpreadsheetPageTemplate>`:

### 6.1. Switch Nhanh (`PillTabs`)
- **Vị trí**: Nằm bên trái trong `customActionsNode`.
- **CSS Chuẩn**:
  ```tsx
  <PillTabs
    className="w-full sm:w-auto shrink-0"
    listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
    triggerClassName="h-7 px-3.5 text-xs rounded-full"
    items={[
      { value: "ALL", label: t("tabs.all", "Tất cả") },
      { value: "IN", label: t("tabs.in", "Thu") },
      { value: "OUT", label: t("tabs.out", "Chi") },
    ]}
    value={activeTab}
    onValueChange={handleTabChange}
    hideBorder
  />
  ```
- **Quy tắc**:
  1. Đồng bộ URL Query Param (ví dụ: `?txnType=IN` hoặc `?tab=IN`) để hỗ trợ bookmark và reload.
  2. Bắt buộc reset trang về 1 (`setPage(1)`) khi đổi tab.

### 6.2. Hệ thống Chế độ xem Cột linh hoạt (`ViewModeCombobox` & View Presets)
- **Component**: Dùng `<ViewModeCombobox>` từ `@/shared/components/ViewModeCombobox`.
- **Hooks & Store**: Kết hợp `usePageViewPresets({ tableId, defaultPresets })` và `useUserPreferencesStore`.
- **Tối thiểu 2 Presets Chuẩn**:
  1. **`overview` ("Tổng quan")**: Hiển thị các trường thông tin chung và vận hành thường nhật. Ẩn các trường đối soát sâu.
  2. **`audit` ("Kiểm toán / Đối soát")**: Hiển thị các trường đối soát hóa đơn VAT, chứng từ gốc, người thụ hưởng, cấn trừ công nợ.
- **Drawer Cấu hình Cột (`[Module]ViewConfigDrawer`)**:
  - Dùng `<StandardFormDrawer layout="1-column" size="sm">`.
  - Phân nhóm cột trực quan (`general`, `amount`, `reconciliation`, `partner`, v.v.).
  - Cho phép người dùng: Đặt tên view mới, Bật/tắt từng cột, Lưu vào Preferences, Khôi phục cài đặt gốc (`onResetDefault`).

```tsx
const viewTabsNode = (
  <div className="w-full sm:w-auto flex items-center flex-wrap gap-2 py-0.5">
    <PillTabs
      className="w-full sm:w-auto shrink-0"
      listClassName="h-8 p-0.5 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-[0_1px_2px_rgba(15,23,42,.03)]"
      triggerClassName="h-7 px-3.5 text-xs rounded-full"
      items={[
        { value: "ALL", label: t("tabs.all", "Tất cả") },
        { value: "IN", label: t("tabs.in", "Thu") },
        { value: "OUT", label: t("tabs.out", "Chi") },
      ]}
      value={activeTransactionType}
      onValueChange={handleTransactionTypeChange}
      hideBorder
    />

    <div className="hidden sm:block h-4 w-px bg-slate-300/80 dark:bg-slate-700/80 shrink-0" />

    <ViewModeCombobox
      presets={columnViewPresetsHook.presets}
      activePresetKey={activeColumnPresetKey}
      onSelect={handleColumnPresetChange}
      onCreateView={handleOpenCreateView}
      onEditView={handleOpenEditView}
      onDeleteView={handleDeleteViewPreset}
    />
  </div>
);
```

## 7. Header Page Tabs Cấp Trang (Optional — Tùy Chọn Khi Có Nhiều Phân Hệ / Góc Nhìn Độc Lập)

> 💡 **LƯU Ý QUAN TRỌNG**: Tính năng này là **OPTIONAL (TÙY CHỌN)**. Đối với các trang bảng đơn giản chỉ quản lý một danh mục duy nhất, **KHÔNG CẦN** khai báo prop `tabs`. Chỉ sử dụng khi trang nghiệp vụ cần phân rã thành các phân hệ lớn / các view độc lập (ví dụ trang Hóa đơn `erp-invoice` chia `Hóa đơn mua vào` [in], `Chi tiết mua vào` [in-lines], `Hóa đơn bán ra` [out], `Chi tiết bán ra` [out-lines]; hoặc trang Mua hàng chia `Đơn mua hàng` vs `Chi tiết dòng hàng`).

### 7.1. Phân biệt rõ: Header Page Tabs vs Toolbar PillTabs

| Đặc điểm | Header Page Tabs (`tabs` trên Template) | Toolbar PillTabs (`customActionsNode`) |
| :--- | :--- | :--- |
| **Vị trí** | Ngay dưới `PageHeader` (dưới Tiêu đề/Mô tả trang) | Nằm trên thanh công cụ của bảng (bên trái `customActionsNode`) |
| **Mục đích** | Phân chia các **phân hệ / góc nhìn lớn cấp Trang** (có thể đổi schema cột, API endpoint, hoặc render các View/Section khác nhau) | Lọc nhanh các **trạng thái / phân loại nhỏ** trong cùng 1 tập dữ liệu (như Mới/Thay thế/Điều chỉnh, hoặc Thu/Chi) |
| **Quy chuẩn** | **OPTIONAL (TÙY CHỌN)** — Chỉ dùng khi trang có nhiều phân hệ lớn | Bắt buộc khi trang có phân loại chiều dữ liệu/trạng thái cần switch nhanh |
| **Cấu hình** | Props `tabs`, `activeTab`, `onTabChange` trên `<SpreadsheetPageTemplate>` | Component `<PillTabs>` bọc trong `customActionsNode` |

### 7.2. Các quy tắc chuẩn bắt buộc khi sử dụng Header Page Tabs

Khi một trang bảng quyết định kích hoạt `Header Page Tabs`, **BẮT BUỘC** tuân thủ 5 nguyên tắc sau:

1. **Định nghĩa danh sách tabs (`TabItem[]`)**:
   - Sử dụng type `TabItem` từ `@/shared/components/PageLayout`:
   ```tsx
   import type { TabItem } from "@/shared/components/PageLayout";

   const pageTabs: TabItem[] = useMemo(() => [
     { value: "in", label: t("inbound", "Hóa đơn mua vào") },
     { value: "in-lines", label: t("inboundLines", "Chi tiết mua vào") },
     { value: "out", label: t("outbound", "Hóa đơn bán ra") },
     { value: "out-lines", label: t("outboundLines", "Chi tiết bán ra") },
   ], [t]);
   ```
   - 100% `label` phải bọc trong hàm dịch `t(...)`.

2. **Đồng bộ 2 chiều với URL Query Param (`?tab=...`)**:
   - Tab hiện tại bắt buộc được đọc từ URL khi load trang (để hỗ trợ reload và lưu bookmark/link):
   ```tsx
   const [currentTab, setCurrentTab] = useState<string>(() => {
     const params = new URLSearchParams(window.location.search);
     return params.get("tab") || "in"; // "in" là default tab
   });

   const handleTabChange = (newTab: string) => {
     setCurrentTab(newTab);
     const url = new URL(window.location.href);
     if (newTab === "in") {
       url.searchParams.delete("tab"); // Default tab có thể xóa param cho URL gọn gàng
     } else {
       url.searchParams.set("tab", newTab);
     }
     window.history.replaceState(null, "", url.toString());
   };
   ```

3. **Reset Phân trang & Cách ly Bộ lọc (State & Filter Isolation)**:
   - **BẮT BUỘC reset trang về 1 (`setPage(1)`)** ngay khi chuyển tab.
   - **Cách ly bộ lọc (Tránh Filter Bleeding)**: Nếu giữa các tab có tập cột hoặc ý nghĩa dữ liệu khác nhau (như Header vs Lines), cần reset filter (`clearAllFilters()`) hoặc lưu giữ state filter độc lập theo từng tab key, tuyệt đối không để filter cột của tab này áp dụng sai sang tab kia.

4. **Phân tách `tableId` theo từng Tab**:
   - Hệ thống tự động lưu cấu hình độ rộng cột, thứ tự cột và ẩn/hiện cột vào App Setting (`core_user_preferences`) qua `tableId`.
   - Nếu mỗi tab có cấu trúc cột khác nhau, **BẮT BUỘC** phân tách `tableId` theo tab (ví dụ: `tableId={`erp-invoices-table-${currentTab}`}`).
   - Nếu không phân tách, cấu hình cột của tab này sẽ ghi đè và làm lỗi hiển thị cột của tab kia.

5. **Tích hợp linh hoạt với View Switcher hoặc Đổi Column Set**:
   - **Cách 1 (Cùng 1 Template, đổi Columns & API)**: Truyền `columns` và `items` tương ứng theo `currentTab`.
   - **Cách 2 (Đa Template / Sub-sections như `ErpInvoicesTab`)**: Render các section con ẩn/hiện (`hidden` hoặc conditional mount) theo `currentTab`, mỗi section truyền cùng bộ `tabs={pageTabs}`, `activeTab={currentTab}` và `onTabChange={handleTabChange}` để giữ thanh tab đồng bộ xuyên suốt.

6. **Zero-latency Tab Switching qua React Query & `ErpQueryKey`**:
   - **BẮT BUỘC** đưa `currentTab` / `direction` / `subview` vào `queryKey` (ví dụ `queryKey: [ErpQueryKey.INVOICES_LIST, currentTab, page, ...]`).
   - Nhờ đó, TanStack Query tự động lưu cache riêng cho từng tab trong `DEFAULT_STALE_TIME` (90s). Khi người dùng chuyển đổi qua lại giữa các tab (`in` $\leftrightarrow$ `out` $\leftrightarrow$ `lines`), dữ liệu được hiển thị **ngay lập tức 0ms** từ cache mà không phải fetch lại API và không hiển thị loading spinner gián đoạn thao tác.

## 8. Mẫu code cơ bản (Table Page Boilerplate)

```tsx
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { Eye, Pencil, FileText, Trash2, Download } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import type { TabItem } from "@/shared/components/PageLayout";
// import { use[Module]List } from "@/modules/[module]/hooks/use[Module]List";
// import { [Module]DetailDrawer } from "@/modules/[module]/components/[Module]DetailDrawer";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

type ExampleRow = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  amount: number;
};

export function ExampleTablePage() {
  const { t } = useTranslation("exampleModule");

  // const listHook = use[Module]List();
  const listHook = {
    data: [] as ExampleRow[],
    isLoading: false,
    sorts: [] as string[],
    dateFrom: "",
    dateTo: "",
    setDateRange: (_from: string, _to: string) => {},
    columnFilters: {} as Record<string, string[]>,
    columnSearch: {} as Record<string, string>,
    setSort: (_k: string, _s: string) => {},
    setColumnFilter: (_k: string, _v: string[]) => {},
    setColumnSearch: (_k: string, _v: string) => {},
    setPage: (_p: number) => {},
    pageSize: 20,
    setPageSize: (_s: number) => {},
    total: 0,
    totalPages: 0,
    page: 1,
    activeFilterCount: 0,
    clearAllFilters: () => {},
    refetch: () => {},
  };

  // Quản lý Drawer & Mode (View / Edit)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const openDetail = (id: string, mode: "view" | "edit" = "view") => {
    setSelectedId(id);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    // Xác nhận và xử lý xóa
  };

  // 1-line Column Header Filter Builder (Server-side + Date + Amount + Status)
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook,
        queryKeyPrefix: "example-column-options",
        fetchOptions: ({ columnKey, search, pageParam, filtersStr }) =>
          Promise.resolve({ items: [], total: 0, next: null }),
      }),
    [listHook],
  );

  const columns: DataTableColumn<ExampleRow>[] = useMemo(
    () => [
      // 1. Cột STT: Bắt đầu từ 1, Căn giữa cả header và cell (40px)
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: ExampleRow, idx: number) => (
          <span className="w-full block text-center">{idx}</span>
        ),
      },
      // 2. Cột Mã (Code): TableText + onDetailClick view mode + Quick status badge
      {
        key: "code",
        size: 200,
        enableResizing: true,
        header: headerFilter("code", t("code", "Mã phiếu")),
        cell: (row: ExampleRow) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={row.code}
              enableCopy={true}
              tooltip={true}
              onDetailClick={(e) => {
                e.stopPropagation();
                openDetail(row.id, "view");
              }}
            />
            {row.status === "DRAFT" && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
              >
                {t("draft", "Nháp")}
              </Badge>
            )}
          </div>
        ),
      },
      // 3. Cột Trạng thái: Badge fixed width w-[88px]
      {
        key: "status",
        size: 150,
        enableResizing: true,
        className: "text-center",
        header: headerFilter("status", t("status", "Trạng thái")),
        cell: (row: ExampleRow) => (
          <div className="w-full flex justify-center">
            <Badge
              variant={row.status === "DONE" ? "default" : "secondary"}
              className="w-[88px] inline-flex items-center justify-center text-center truncate"
            >
              {t(row.status, row.status)}
            </Badge>
          </div>
        ),
      },
      // 4. Cột Ngày: DateRangeColumnSlot + TableDateCell
      {
        key: "createdAt",
        size: 140,
        enableResizing: true,
        className: "text-right",
        header: headerFilter.date("createdAt", t("createdAt", "Ngày tạo")),
        cell: (row: ExampleRow) => (
          <TableDateCell date={row.createdAt} className="justify-end w-full" />
        ),
      },
      // 5. Cột Số tiền: headerFilter.amount tự format tiền tệ trong dropdown
      {
        key: "amount",
        size: 140,
        enableResizing: true,
        className: "text-right",
        header: headerFilter.amount("amount", t("amount", "Số tiền")),
        cell: (row: ExampleRow) => (
          <span className="tabular-nums font-semibold">
            {row.amount.toLocaleString("vi-VN")} đ
          </span>
        ),
      },
    ],
    [headerFilter, t],
  );


  // Row Actions: 2 Quick Actions đầu tiên là View và Edit mode
  const getRowActions = (row: ExampleRow): ActionDropdownItem[] => [
    {
      groupLabel: "TRA CỨU",
      items: [
        {
          label: t("viewDetail", "Xem chi tiết"),
          icon: <Eye className="w-4 h-4" />,
          onClick: () => openDetail(row.id, "view"), // 👁️ Quick Action 1: View Mode
        },
        {
          label: t("download", "Tải xuống"),
          icon: <Download className="w-4 h-4" />,
          onClick: () => console.log("Download", row.id),
        },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        {
          label: t("edit", "Chỉnh sửa"),
          icon: <Pencil className="w-4 h-4" />,
          onClick: () => openDetail(row.id, "edit"), // ✏️ Quick Action 2: Edit Mode
        },
        {
          label: t("delete", "Xóa"),
          icon: <Trash2 className="w-4 h-4 text-destructive" />,
          variant: "danger",
          onClick: () => handleDelete(row.id),
        },
      ],
    },
  ];

  return (
    <>
      <SpreadsheetPageTemplate<ExampleRow>
        // (Tùy chọn) Header Page Tabs: Chỉ truyền khi trang có nhiều phân hệ / góc nhìn lớn
        // tabs={pageTabs}
        // activeTab={currentTab}
        // onTabChange={handleTabChange}
        title={t("pageTitle", "Danh sách dữ liệu")}
        desc={t("pageDesc", "Mô tả danh sách")}
        icon={<FileText className="w-5 h-5 text-primary" />}
        tableId="example-table"
        items={listHook.data}
        columns={columns}
        getRowKey={(row) => row.id}
        loading={listHook.isLoading}
        emptyLabel={t("noData", "Không có dữ liệu")}
        page={listHook.page}
        pageSize={listHook.pageSize}
        total={listHook.total}
        totalPages={listHook.totalPages}
        onPage={(p) => listHook.setPage(p)}
        onPageSize={(s) => {
          listHook.setPageSize(s);
          listHook.setPage(1);
        }}
        onRefresh={() => listHook.refetch()}
        activeFilterCount={listHook.activeFilterCount}
        onClearAllFilters={listHook.clearAllFilters}
        rowActions={getRowActions}
        summaryRow={{
          amount: (
            <div className="text-right font-bold text-primary tabular-nums">
              {listHook.data
                .reduce((sum, r) => sum + r.amount, 0)
                .toLocaleString("vi-VN")}{" "}
              đ
            </div>
          ),
        }}
      />

      {/* Detail Drawer */}
      {/* <[Module]DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        mode={drawerMode}
        setMode={setDrawerMode}
        id={selectedId}
      /> */}
    </>
  );
}
```

## Summary Checklist trước khi hoàn thành

### Breadcrumb & TabBar
- [ ] Đã thêm `PageKey` mới vào type trong `src/shared/types/index.ts` chưa?
- [ ] Đã đăng ký `SECTION_ROOTS` (`labelKey`, `group`) và `BREADCRUMBS` (3 cấp chuẩn) trong `appStore.ts` chưa?
- [ ] Đã thêm i18n key cho `nav/` và `breadcrumb/` (`vi.ts`, `en.ts`) chưa?

### Header Page Tabs (Tùy chọn - Khi trang có đa phân hệ / views lớn)
- [ ] Nếu trang có nhiều phân hệ lớn (ví dụ: Hóa đơn mua vào vs Bán ra vs Lines, Đơn hàng vs Dòng chi tiết), đã truyền `tabs={pageTabs}`, `activeTab` và `onTabChange` vào `<SpreadsheetPageTemplate>` chưa?
- [ ] Đã đồng bộ URL query param `?tab=...` (hỗ trợ bookmark/reload) và reset `setPage(1)` khi chuyển tab chưa?
- [ ] Đã phân tách `tableId` theo từng tab (ví dụ: `tableId={`[module]-table-${activeTab}`}`) để tránh ghi đè cấu hình ẩn/hiện và độ rộng cột trong App Settings (`core_user_preferences`) chưa?
- [ ] Đã kiểm tra cách ly bộ lọc (Filter Isolation), tránh filter của tab này áp dụng sai sang tab kia chưa?

### Server-side Hook, React Query & Responsive PageSize
- [ ] Mặc định **100% BẢNG ĐÃ ƯU TIÊN SERVER-SIDE SORTING & FILTERING** (thông qua hook `use[Module]List` + API `getColumnOptions`) chưa?
- [ ] **React Query & ErpQueryKey Enum**: Hook đã dùng `useQuery` kết hợp `ErpQueryKey` enum từ `@/shared/lib/queryKeys`, hưởng `staleTime: DEFAULT_STALE_TIME` (90s) và đưa `activeTab` / `direction` vào `queryKey` để hỗ trợ Zero-latency Tab Switching chưa?
- [ ] Hook đã dùng `getDefaultPageSize` để gán default pageSize theo chiều cao màn hình (`< 900px` -> `20`, `>= 900px` -> `50`) và hỗ trợ `pageSizeOptions = [20, 50, 100, 200]` chưa?

### Page Template & App Settings
- [ ] Container bảng đã có bo góc chuẩn `rounded-xl`, viền `border border-border/60` thanh thoát và TUYỆT ĐỐI KHÔNG bị `rounded-none` chưa?
- [ ] Bảng đã có `tableId` duy nhất để tự động lưu & khôi phục column sizing, visibility, order vào App Setting (`core_user_preferences`) & LocalStorage cache chưa?
- [ ] Nút Reset Column đã nằm gọn trong popup menu `ColumnToggle` (`Settings2` → `RotateCcw`), TUYỆT ĐỐI không đặt ở header cột chưa?
- [ ] Đã truyền `rowActions` với 2 Quick Actions đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — ✏️) chưa?

### Table Columns & Detail Drawer
- [ ] Cột STT rộng đúng 40px, **BẮT ĐẦU TỪ 1 VÀ CĂN GIỮA TUYỆT ĐỐI CẢ HEADER VÀ CELL** (`cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`) chưa?
- [ ] Cột Code dùng `<TableText>` mở View mode; Cột Status dùng `<Badge>` fixed width `w-[88px]`; Cột Date dùng `<DateRangeColumnSlot>` chưa?
- [ ] Đã tạo sẵn component `[Module]DetailDrawer` tuân thủ `standardize-drawer`, hỗ trợ nhận `mode` (`"view" | "edit"`) và `setMode` chưa?
