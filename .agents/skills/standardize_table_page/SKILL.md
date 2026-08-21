---
name: standardize-table-page
description: Scaffold or refactor a standard DataTable page following the ERP project's UI standards. Use this skill whenever you need to create a new data table page or refactor an existing one for a new module.
---

# 📋 Table Page Standards

Khi tạo mới hoặc chỉnh sửa một trang hiển thị bảng dữ liệu trong hệ thống (như các trang `erp-invoice-*`, `garage-cases`), bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau.

## 1. Cấu trúc trang (Page Structure)

- **Wrapper**: Bọc toàn bộ nội dung trang trong `<SpreadsheetPageTemplate>` từ `@/shared/components/SpreadsheetPageTemplate/SpreadsheetPageTemplate`.
- **Title & Description**: Trang **PHẢI** có tiêu đề (`<h1>`) và mô tả (`<p>`) rõ ràng, đều dùng hook i18n (`t(...)`).
- **Variant Bảng**: Truyền `variant="spreadsheet"` cho `<DataTable>` để có giao diện dạng lưới Excel.

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

## 4. Server-side Hook & Responsive PageSize — BẮT BUỘC

- **Mặc định toàn hệ thống**: Filter, Sorting và Pagination **BẮT BUỘC** thực hiện ở **Server-side** thông qua custom hook `use[Module]List` kết nối TanStack Query.
- **Khởi tạo `defaultPageSize` thích ứng theo Chiều cao màn hình (Screen Height)**:
  - Khi `window.innerHeight < 900px` (Laptop / màn hình phổ thông): Default `pageSize = 20`.
  - Khi `window.innerHeight >= 900px` (Desktop / Monitor lớn): Default `pageSize = 50`.
- **Mốc phân trang**: Bắt buộc hỗ trợ đầy đủ các mốc `pageSizeOptions = [20, 50, 100, 200]`.
- **File API**: Tạo sẵn `src/modules/[module]/api/[module]Api.ts` với đầy đủ CRUD và API `getColumnOptions(columnKey, search, pageParam, pageSize, filtersStr)`.

**Mẫu Hook Chuẩn (`use[Module]List.ts`):**

```ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50;
  }
  return 20;
};

export function use[Module]List() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["[module]-list", page, pageSize, sorts, dateFrom, dateTo, columnFilters, columnSearch],
    queryFn: () => {
      // return [module]Api.getList({ page, pageSize, sorts, date_from: dateFrom || undefined, date_to: dateTo || undefined, column_filters: Object.keys(columnFilters).length ? JSON.stringify(columnFilters) : undefined, column_search: Object.keys(columnSearch).length ? JSON.stringify(columnSearch) : undefined });
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

## 5. Tích hợp Chuẩn Table & Drawer

Khi tạo bảng và drawer trong trang, **BẮT BUỘC** tuân thủ các quy chuẩn từ 2 skill cơ sở:

1. 👉 **Bảng dữ liệu ([`standardize-table`](../standardize_table/SKILL.md))**:
   - **`tableId="[module]-table"`**: Duy nhất để đồng bộ cấu hình cột vào App Setting Core (`core_user_preferences`) và LocalStorage cache.
   - **Reset Layout**: Nằm cố định trong menu dropdown `ColumnToggle` (`Settings2` → `RotateCcw`), không đặt ở header cột.
   - **Cột STT (Index)**: Rộng đúng `40px`, **bắt đầu từ 1 (1-based)**, căn giữa tuyệt đối cả header và cell (`cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`).
   - **Cột Mã Code**: Dùng `<TableText enableCopy tooltip onDetailClick={() => openDetail(row.id, "view")}>`.
   - **Row Actions**: BẮT BUỘC dùng prop `rowActions` trên `<SpreadsheetPageTemplate>`. Không tạo cột action tĩnh. Mảng `rowActions` phải chứa 2 action đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — ✏️) để map vào Floated Action Bar và Right-Click Context Menu.
   - **TableColumnHeaderFilter**: Dùng `fetchOptions` gọi `getColumnOptions` API; Cột Date dùng `<DateRangeColumnSlot>`.
2. 👉 **Detail Drawer ([`standardize-drawer`](../standardize_drawer/SKILL.md))**:
   - Mở component `[Module]DetailDrawer` với prop `mode={drawerMode}` (`"view" | "edit"`) và `setMode={setDrawerMode}`. Không điều hướng URL.

## 6. Mẫu code cơ bản (Table Page Boilerplate)

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

  const getSortState = (key: string) => {
    if (listHook.sorts.includes(key)) return "asc" as const;
    if (listHook.sorts.includes(`-${key}`)) return "desc" as const;
    return "none" as const;
  };

  const columns: DataTableColumn<ExampleRow>[] = useMemo(
    () => [
      // Cột STT: Bắt đầu từ 1, Căn giữa cả header và cell
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
      // Cột Mã (Code): TableText + onDetailClick view mode
      {
        key: "code",
        header: (
          <TableColumnHeaderFilter
            title={t("code", "Mã phiếu")}
            columnKey="code"
            queryKeyPrefix="example-column-options"
            allFilters={listHook.columnFilters}
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
      // Cột Trạng thái: Badge fixed width
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
      // Cột Ngày: DateRangeColumnSlot
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

### Server-side Hook & Responsive PageSize
- [ ] Mặc định **100% BẢNG ĐÃ ƯU TIÊN SERVER-SIDE SORTING & FILTERING** (thông qua hook `use[Module]List` + API `getColumnOptions`) chưa?
- [ ] Hook đã dùng `getDefaultPageSize` để gán default pageSize theo chiều cao màn hình (`< 900px` -> `20`, `>= 900px` -> `50`) và hỗ trợ `pageSizeOptions = [20, 50, 100, 200]` chưa?

### Page Template & App Settings
- [ ] Bảng đã có `tableId` duy nhất để tự động lưu & khôi phục column sizing, visibility, order vào App Setting (`core_user_preferences`) & LocalStorage cache chưa?
- [ ] Nút Reset Column đã nằm gọn trong popup menu `ColumnToggle` (`Settings2` → `RotateCcw`), TUYỆT ĐỐI không đặt ở header cột chưa?
- [ ] Đã truyền `rowActions` với 2 Quick Actions đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — ✏️) chưa?

### Table Columns & Detail Drawer
- [ ] Cột STT rộng đúng 40px, **BẮT ĐẦU TỪ 1 VÀ CĂN GIỮA TUYỆT ĐỐI CẢ HEADER VÀ CELL** (`cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`) chưa?
- [ ] Cột Code dùng `<TableText>` mở View mode; Cột Status dùng `<Badge>` fixed width `w-[88px]`; Cột Date dùng `<DateRangeColumnSlot>` chưa?
- [ ] Đã tạo sẵn component `[Module]DetailDrawer` tuân thủ `standardize-drawer`, hỗ trợ nhận `mode` (`"view" | "edit"`) và `setMode` chưa?
