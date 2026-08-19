---
name: standardize-table-page
description: Scaffold or refactor a standard DataTable page following the ERP project's UI standards. Use this skill whenever you need to create a new data table page or refactor an existing one for a new module.
---

# 📋 Table Page Standards

Khi tạo mới hoặc chỉnh sửa một trang hiển thị bảng dữ liệu trong hệ thống (như các trang `erp-invoice-*`), bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau.

## 1. Cấu trúc trang (Page Structure)

- **Wrapper**: Bọc nội dung trang trong `<SpreadsheetPageTemplate>` từ `@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate`.
- **Title & Description**: Trang **PHẢI** có tiêu đề (`<h1>`) và mô tả (`<p>`) rõ ràng, đều dùng i18n.
- **Variant Bảng**: Truyền `variant="spreadsheet"` cho `<DataTable>` để có giao diện dạng lưới Excel.

## 2. Breadcrumb & TabBar — BẮT BUỘC

### 2.1. Breadcrumb đúng cấp (Topbar)

Breadcrumb hiển thị trên Topbar phản ánh cấu trúc menu Sidebar. Trang Table **BẮT BUỘC** đăng ký breadcrumb theo đúng cấp độ (Module Group → Sub-group → Tên trang).

**Cách 1 — Static (ưu tiên)**: Thêm entry vào `BREADCRUMBS` trong `src/core/config/appStore.ts`.

Format: `Array<[i18nKey, pageKey?]>` — nếu có `pageKey` thì breadcrumb đó clickable.

```ts
// appStore.ts — trong BREADCRUMBS:
"[module]-list": [
  ["breadcrumb.accounting"],              // Level 1: Module Group
  ["nav.items.[module]Group", "[module]-dashboard"], // Level 2: Sub-group (có link)
  ["nav.items.[module]List"],             // Level 3: Tên trang hiện tại (cuối, không link)
],
```

Ví dụ thực tế (Kế toán > Sao kê > Sao kê ngân hàng):

```ts
"erp-invoices-in": [
  ["breadcrumb.accounting"],
  ["breadcrumb.erpInvoices"],
  ["breadcrumb.inbound"],
],
```

**Cách 2 — Dynamic** (breadcrumb cần động theo state / record): Dùng `setCustomBreadcrumbs` trong `useEffect`:

```tsx
import { useAppStore } from "@/core/config/appStore";

const { setCustomBreadcrumbs } = useAppStore();

useEffect(() => {
  setCustomBreadcrumbs([
    ["breadcrumb.accounting"],
    ["nav.items.[module]Group", "[module]-dashboard"],
    ["nav.items.[module]List"],
  ]);
  return () => setCustomBreadcrumbs(null); // Cleanup bắt buộc khi unmount
}, [setCustomBreadcrumbs]);
```

> **Lưu ý cấp breadcrumb**: Phải tương ứng với cấu trúc mục Sidebar thực tế.
>
> - `Kế toán > Hóa đơn đầu vào` → `[["breadcrumb.accounting"], ["breadcrumb.inbound"]]`
> - `Kho > Chứng từ` → `[["breadcrumb.inventory"], ["breadcrumb.inventoryVouchers"]]`
> - `Hệ thống > Thiết lập kho > Đơn vị tính` → `[["breadcrumb.settings"], ["breadcrumb.erpInventoryMasters"], ["breadcrumb.erpInventoryUom"]]`

### 2.2. TabBar — Đăng ký PageKey và Label

Tab hiển thị trên TabBar lấy tên từ `SECTION_ROOTS`. Khi tạo page mới:

**Bước 1**: Thêm `PageKey` mới vào type trong `src/shared/types/index.ts`:

```ts
export type PageKey =
  // ... existing keys
  "[module]-list" | "[module]-dashboard";
```

**Bước 2**: Đăng ký trong `SECTION_ROOTS` tại `appStore.ts`:

```ts
"[module]-list": {
  labelKey: "nav.items.[module]List",  // i18n key tên tab
  group: "accounting",                // phải khớp với section sidebar
},
```

> Giá trị hợp lệ cho `group`: `accounting`, `inventory`, `sales`, `purchasing`, `manufacturing`, `hr`, `garage`, `settings`, `system`.

**Bước 3**: Thêm i18n key vào `src/core/locale/system/nav/vi.ts` và `nav/en.ts`:

```ts
// nav/vi.ts
items: {
  "[module]List": "Danh sách [Tên Module]",
  "[module]Dashboard": "Tổng quan [Tên Module]",
}
```

**Bước 4**: Thêm breadcrumb key vào `src/core/locale/system/breadcrumb/vi.ts` và `breadcrumb/en.ts`:

```ts
// breadcrumb/vi.ts
"[module]List": "Danh sách [Tên Module]",
```

## 3. Đa ngôn ngữ (i18n) — BẮT BUỘC

- Tất cả text hiển thị (title, desc, label cột, placeholder filter, button, empty state message...) **BẮT BUỘC** phải được bọc bằng hàm `t` từ `useTranslation("namespace")`.
- **KHÔNG** hardcode tiếng Việt hay tiếng Anh trực tiếp trong JSX.
- Tạo file locale đi kèm tại `src/core/locale/[module]/vi.ts` và `src/core/locale/[module]/en.ts`.

**Mẫu đúng:**

```tsx
const { t } = useTranslation("exampleModule");

// ✅ Đúng
<h1>{t("pageTitle", "Danh sách")}</h1>
<EmptyState message={t("noData", "Không có dữ liệu")} />
header: <TableColumnHeaderFilter title={t("code", "Mã phiếu")} ... />

// ❌ Sai
<h1>Danh sách</h1>
emptyLabel="Không có dữ liệu"
header: <TableColumnHeaderFilter title="Mã phiếu" ... />
```

## 4. Empty State — BẮT BUỘC

- Khi bảng không có dữ liệu, **BẮT BUỘC** phải hiển thị `<EmptyState>` từ `@/shared/components/EmptyState` thay cho vùng trắng.
- Truyền `emptyLabel` cho `<DataTable>` **VÀ** nếu cần tùy chỉnh giao diện hơn, sử dụng `emptyContent` prop (nếu DataTable hỗ trợ) để truyền trực tiếp `<EmptyState>`.
- Nội dung message và description của `<EmptyState>` phải dùng `t(...)`.

```tsx
import { EmptyState } from "@/shared/components/EmptyState";

<DataTable
  columns={columns}
  data={listHook.data ?? []}
  loading={listHook.isLoading}
  variant="spreadsheet"
  emptyLabel={t("noData", "Không có dữ liệu")}
/>;

{
  /* Hoặc khi muốn kiểm soát hoàn toàn giao diện empty: */
}
{
  !listHook.isLoading && listHook.data.length === 0 && (
    <EmptyState
      message={t("noData", "Không có dữ liệu")}
      description={t(
        "noDataDesc",
        "Thử điều chỉnh bộ lọc hoặc thêm bản ghi mới",
      )}
    />
  );
}
```

## 5. Server-side Filter & Sort — BẮT BUỘC

- Filter và Sort trong **Page** bắt buộc phải thực hiện ở **Server-side** (khác Drawer là client-side).
- Tạo sẵn custom hook `use[Module]List` để quản lý toàn bộ state (`page`, `pageSize`, `sorts`, `dateFrom`, `dateTo`, `columnFilters`, `columnSearch`, `activeFilterCount`) và gọi API qua TanStack Query.
- Tạo sẵn file API `src/modules/[module]/api/[module]Api.ts` với đầy đủ các hàm CRUD và `getColumnOptions(column, search, page, pageSize, filtersStr)`.
- `onSortChange`, `onFilterChange`, `onSearchChange`, `dateRangeSlot` của Table Header phải update vào hook state → hook thay đổi sẽ tự động reset `page = 1` và trigger call API.

**Mẫu Hook Chuẩn (`use[Module]List.ts`):**

```ts
// src/modules/[module]/hooks/use[Module]List.ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

export function use[Module]List() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      "[module]-list",
      page,
      pageSize,
      sorts,
      dateFrom,
      dateTo,
      columnFilters,
      columnSearch,
    ],
    queryFn: () => {
      // return [module]Api.getList({
      //   page,
      //   pageSize,
      //   sorts,
      //   date_from: dateFrom || undefined,
      //   date_to: dateTo || undefined,
      //   column_filters: Object.keys(columnFilters).length ? JSON.stringify(columnFilters) : undefined,
      //   column_search: Object.keys(columnSearch).length ? JSON.stringify(columnSearch) : undefined,
      // });
      return Promise.resolve({ data: [], total: 0, totalPages: 0 });
    },
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
    isLoading,
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

## 6. Tuân thủ `standardize-table`

Bảng dữ liệu bên trong trang **BẮT BUỘC** tuân thủ nghiêm ngặt kỹ năng `standardize-table`:

- Cột STT / Checkbox: `size: 40`, `w-[40px] min-w-[40px]`. (STT dùng `{idx}`, không cộng 1).
- Cột Code/ID/SKU: `size: 200`, dùng `<TableText enableCopy tooltip onDrawerClick>`.
- Header tất cả cột filterable: dùng `<TableColumnHeaderFilter align="center">`.
- Cột Date: dùng `dateRangeSlot` + `hideFilter={true}`.
- Cột trạng thái: dùng `<Badge>`.
- Cột số lượng / tiền tệ: class `text-right tabular-nums`, tiền tệ thêm `font-semibold`.
- Cột tiền tệ/số lượng: cần có `summaryRow` tổng cộng.
- **Row Actions**: BẮT BUỘC dùng prop `rowActions` của `<SpreadsheetPageTemplate>` (Row Hover Floating Actions). TUYỆT ĐỐI KHÔNG thêm cột `{ key: "actions" }` thủ công vào mảng `columns`.

## 7. Detail Drawer — BẮT BUỘC

- Click vào `<TableText>` (cột Code) hoặc chọn "Chi tiết" từ `<ActionDropdown>` phải mở **Drawer**, không điều hướng trang.
- Tự động tạo component `src/modules/[module]/components/[Module]DetailDrawer.tsx`.
- Drawer này **BẮT BUỘC** tuân thủ kỹ năng `standardize-drawer` (`<StandardFormDrawer>`, `DrawerSection`, `DrawerField`).

## 8. Mẫu code cơ bản (Table Page Boilerplate)

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { SpreadsheetPageTemplate } from "@/shared/components/SpreadsheetPageTemplate";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { Badge } from "@/shared/components/ui/badge";
import { Eye, FileText, Trash2 } from "lucide-react";
import type { DataTableColumn } from "@/shared/components/DataTable";
// import { use[Module]List } from "@/modules/[module]/hooks/use[Module]List";
// import { [Module]DetailDrawer } from "@/modules/[module]/components/[Module]DetailDrawer";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

// Kiểu dữ liệu ví dụ
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
    activeFilterCount: 0,
    clearAllFilters: () => {},
  };

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const openDetail = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };

  const getSortState = (key: string) => {
    if (listHook.sorts.includes(key)) return "asc" as const;
    if (listHook.sorts.includes(`-${key}`)) return "desc" as const;
    return "none" as const;
  };

  const columns: DataTableColumn<ExampleRow>[] = React.useMemo(
    () => [
      // Cột STT
      {
        key: "index",
        header: <div className="text-center w-[40px] min-w-[40px]">#</div>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: ExampleRow, idx: number) => <span>{idx}</span>,
      },
      // Cột Mã (Code) — Hỗ trợ fetchOptions server-side
      {
        key: "code",
        header: (
          <TableColumnHeaderFilter
            title={t("code", "Mã phiếu")}
            columnKey="code"
            queryKeyPrefix="example-column-options"
            allFilters={listHook.columnFilters}
            // fetchOptions={({ columnKey, search, pageParam, filtersStr }) =>
            //   exampleApi.getColumnOptions(columnKey, search, pageParam, 20, filtersStr)
            // }
            sortState={getSortState("code")}
            onSortChange={(s) => listHook.setSort("code", s)}
            searchValue={listHook.columnSearch["code"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("code", v)}
            selectedFilters={listHook.columnFilters["code"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("code", v)}
            isActive={!!listHook.columnFilters["code"]?.length}
            align="center"
          />
        ),
        size: 200,
        enableResizing: true,
        cell: (row: ExampleRow) => (
          <div className="flex items-center gap-1.5 w-full min-w-0">
            <TableText
              className="flex-1 min-w-0"
              text={row.code}
              enableCopy={true}
              tooltip={true}
              onDrawerClick={(e) => {
                e.stopPropagation();
                openDetail(row.id);
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
      // Cột Trạng thái
      {
        key: "status",
        header: (
          <TableColumnHeaderFilter
            title={t("status", "Trạng thái")}
            sortState={getSortState("status")}
            onSortChange={(s) => listHook.setSort("status", s)}
            searchValue={listHook.columnSearch["status"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("status", v)}
            selectedFilters={listHook.columnFilters["status"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("status", v)}
            isActive={!!listHook.columnFilters["status"]?.length}
            align="center"
          />
        ),
        size: 150,
        enableResizing: true,
        className: "text-center",
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
      // Cột Ngày tháng — tích hợp DateRangeColumnSlot
      {
        key: "createdAt",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("createdAt", "Ngày tạo")}
            sortState={getSortState("createdAt")}
            onSortChange={(s) => listHook.setSort("createdAt", s)}
            searchValue=""
            onSearchChange={() => {}}
            selectedFilters={[]}
            onFilterChange={() => {}}
            hideFilter={true}
            hideFooter={true}
            isActive={Boolean(listHook.dateFrom || listHook.dateTo)}
            align="center"
            dateRangeSlot={({ close }) => (
              <DateRangeColumnSlot
                dateFrom={listHook.dateFrom || ""}
                dateTo={listHook.dateTo || ""}
                onChange={(from, to) => listHook.setDateRange(from, to)}
                onClose={close}
              />
            )}
          />
        ),
        size: 140,
        enableResizing: true,
        cell: (row: ExampleRow) => (
          <TableDateCell date={row.createdAt} className="justify-end w-full" />
        ),
      },
      // Cột Số tiền
      {
        key: "amount",
        className: "text-right",
        header: (
          <TableColumnHeaderFilter
            title={t("amount", "Số tiền")}
            sortState={getSortState("amount")}
            onSortChange={(s) => listHook.setSort("amount", s)}
            searchValue={listHook.columnSearch["amount"] || ""}
            onSearchChange={(v) => listHook.setColumnSearch("amount", v)}
            selectedFilters={listHook.columnFilters["amount"] || []}
            onFilterChange={(v) => listHook.setColumnFilter("amount", v)}
            isActive={!!listHook.columnFilters["amount"]?.length}
            align="center"
          />
        ),
        size: 140,
        enableResizing: true,
        cell: (row: ExampleRow) => (
          <span className="tabular-nums font-semibold">
            {row.amount.toLocaleString("vi-VN")} đ
          </span>
        ),
      },
    ],
    [listHook.sorts, listHook.columnFilters, listHook.columnSearch, listHook.dateFrom, listHook.dateTo, t],
  );

  return (
    <>
      <SpreadsheetPageTemplate<ExampleRow>
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
        rowActions={(row: ExampleRow) => [
          {
            groupLabel: "TRA CỨU",
            items: [
              {
                label: t("viewDetail", "Chi tiết"),
                icon: <Eye className="w-4 h-4" />,
                onClick: () => openDetail(row.id),
              },
            ],
          },
          {
            groupLabel: "THAO TÁC",
            items: [
              {
                label: t("delete", "Xóa"),
                icon: <Trash2 className="w-4 h-4 text-destructive" />,
                onClick: () => handleDelete(row.id),
              },
            ],
          },
        ]}
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
        id={selectedId}
      /> */}
    </>
  );
}
```

## Summary Checklist trước khi hoàn thành

### Breadcrumb & TabBar

- [ ] Đã thêm `PageKey` mới vào type trong `src/shared/types/index.ts` chưa?
- [ ] Đã đăng ký `SECTION_ROOTS` với `labelKey` và `group` đúng sidebar section trong `appStore.ts` chưa?
- [ ] Đã đăng ký `BREADCRUMBS` theo đúng level (Module Group > Sub-group > Tên trang) trong `appStore.ts` chưa?
- [ ] Breadcrumb level có tương ứng với cấu trúc menu Sidebar thực tế không (vd: Kế toán > Dòng tiền > Sao kê ngân hàng)?
- [ ] Đã thêm i18n key `nav.items.[module]List` vào `nav/vi.ts` và `nav/en.ts` chưa?
- [ ] Đã thêm breadcrumb key vào `breadcrumb/vi.ts` và `breadcrumb/en.ts` chưa?

### i18n

- [ ] Tất cả text tĩnh đã dùng `t(...)` từ `useTranslation("namespace")` chưa? **KHÔNG hardcode.**
- [ ] Đã tạo file locale module `vi.ts` và `en.ts` đi kèm chưa?

### UI & Empty State

- [ ] Page có dùng `<SpreadsheetPageTemplate>` truyền đầy đủ props (`items`, `columns`, `loading`, `page`, `pageSize`, `total`, `onRefresh`, `activeFilterCount`, `onClearAllFilters`) chưa?
- [ ] Đã truyền `rowActions` vào `<SpreadsheetPageTemplate>` để kích hoạt Row Hover Floating Actions chưa?
- [ ] Bảng đã có `emptyLabel={t(...)}` khi data rỗng sau khi load xong chưa?

### Server-side Logic & Filter Standard

- [ ] Logic Filter & Sort có được thực hiện **Server-side** thông qua custom hook `use[Module]List` chưa?
- [ ] Hook `use[Module]List` đã có đủ `dateFrom`, `dateTo`, `columnFilters`, `columnSearch`, `activeFilterCount`, `clearAllFilters` chưa?
- [ ] Cột Date dùng `<DateRangeColumnSlot>` trong `dateRangeSlot={({ close }) => ...}` với `hideFilter={true}` & `hideFooter={true}` chưa?
- [ ] Các cột ID / Mã hỗ trợ Server-side phân trang dùng `fetchOptions` gọi API `getColumnOptions` chưa?

### Table Columns (`standardize-table`)

- [ ] Cột STT/Checkbox rộng đúng 40px chưa? (STT dùng `{idx}`, không `idx + 1`)
- [ ] TUYỆT ĐỐI không khai báo cột action tĩnh `{ key: "actions" }` trong `columns`, đã chuyển sang `rowActions` chưa?
- [ ] Cột Code/SKU size 200px, dùng `<TableText>` bật `enableCopy`, `tooltip`, `onDrawerClick` và Quick Status Badge chưa?
- [ ] Cột Status dùng `<Badge>` fixed width `w-[88px]`, bọc `<Tooltip>` & `truncate` chưa?
- [ ] Cột số/tiền có class `tabular-nums text-right` (tiền tệ có `font-semibold`) chưa?
- [ ] Header filterable có `<TableColumnHeaderFilter align="center">` với `isActive` chưa?

### Detail Drawer (`standardize-drawer`)

- [ ] Đã tạo sẵn component `[Module]DetailDrawer` tuân thủ `standardize-drawer` chưa?
- [ ] Click vào `<TableText>` hoặc Row Hover Actions mở Drawer (không điều hướng trang) chưa?

