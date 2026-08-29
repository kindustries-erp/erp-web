---
description: Quy trình 4 bước chuẩn hóa và kiểm duyệt Bảng dữ liệu (DataTable / SpreadsheetPageTemplate) trong Liouni ERP
---

# 📊 Standardize Table Workflow (`/standardize-table`)

Workflow này hướng dẫn Agent và Developer quy trình chuẩn 4 bước khi **tạo mới**, **fix bug** hoặc **refactor** bất kỳ bảng dữ liệu nào trong Liouni ERP, đảm bảo **100% cột có đầy đủ Header Filter, STT 1-based, Pagination responsive, Numeric formatting, Server-side integration và QC Verification**.

---

## ⚡ Fast-Track: Khi tạo mới Module Bảng

Nếu bạn đang tạo mới một màn hình bảng dữ liệu, **hãy ưu tiên chạy PlopJS Generator** để sinh ngay 100% code chuẩn trong 1 giây:
```bash
# Di chuyển vào erp-web
cd /home/dev/repos/erp/erp-web

# Chạy generator tạo full Table Page (API + Hook + Page + Drawer + Locales)
bun plop table-page <moduleName> <componentName> "<pageTitle>" <tableId> <drawerType> <drawerSize> <hasDateColumn> <hasAmountColumn> <hasStatusColumn>
```

---

## 🧭 Quy trình 4 Bước Bắt Buộc

### 🔹 BƯỚC 1: Kiểm Tra Backend API Contract (`getColumnOptions`)

Trước khi cấu hình bảng UI, **BẮT BUỘC** xác nhận API Backend đã hỗ trợ:
1. Endpoint `getColumnOptions`:
   - Endpoint: `GET /api/[module]/column-options?columnKey=...&search=...&page=1&pageSize=20&filters={...}`
   - Trả về payload phân trang: `{ items: string[] | { label: string; value: string }[], total: number, page: number, totalPages: number }`.
2. Endpoint `getList`:
   - Nhận query params: `page`, `pageSize`, `sorts` (mảng string, vd `createdAt` hoặc `-createdAt`), `date_from`, `date_to`, `column_filters` (JSON string), `column_search` (JSON string).
   - **Xử lý `column_search` (Tìm kiếm nâng cao)**:
     - Bắt buộc dùng `applyMultiKeywordFilter` hoặc `applyMultiKeywordMultiFieldFilter` (`@/common/utils/query-builder.util.ts`).
     - **Exact search (`"..."`)**: Tự động nhận diện chuỗi bọc trong cặp ngoặc kép `""` để so sánh chính xác tuyệt đối (bỏ `%...%` hoặc dùng toán tử `=`).
     - **Multi-search (`;`)**: Tự động phân tách chuỗi bằng dấu chấm phẩy `;` (`split(';')`) để tìm kiếm đồng thời nhiều giá trị với logic `OR`.
   - **Xử lý `column_filters` (Lọc giá trị rỗng `__BLANK__`)**:
     - Khi mảng giá trị lọc chứa `"__BLANK__"` (do UI bật `showBlankOption: true`), backend phải bổ sung điều kiện `(field IS NULL OR field = '')`.

---

### 🔹 BƯỚC 2: Chuẩn Hóa Frontend List Hook (`use[Module]List`)

Hook quản lý danh sách (`src/modules/[module]/hooks/use[Module]List.ts`) phải tuân thủ mẫu chuẩn:

```ts
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { moduleApi } from "../api/moduleApi";

export const getDefaultPageSize = (): number => {
  if (typeof window !== "undefined" && window.innerHeight >= 900) {
    return 50; // Desktop / màn hình lớn
  }
  return 20;   // Laptop / màn hình phổ thông
};

export function useModuleList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(getDefaultPageSize);
  const [sorts, setSorts] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["[module]-list", page, pageSize, sorts, dateFrom, dateTo, columnFilters, columnSearch],
    queryFn: () =>
      moduleApi.getList({
        page,
        pageSize,
        sorts,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        column_filters: Object.keys(columnFilters).length ? JSON.stringify(columnFilters) : undefined,
        column_search: Object.keys(columnSearch).length ? JSON.stringify(columnSearch) : undefined,
      }),
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

---

### 🔹 BƯỚC 3: Xây Dựng Cột Bảng Với `createColumnHeaderFilter`

Sử dụng `createColumnHeaderFilter` từ `@/shared/components/DataTable` để sinh nhanh header filter:

```tsx
import {
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";

// 1. Khởi tạo helper builder (Server-side)
const headerFilter = useMemo(
  () =>
    createColumnHeaderFilter({
      listHook,
      queryKeyPrefix: "module-column-options",
      fetchOptions: ({ columnKey, search, pageParam, filtersStr }) =>
        moduleApi.getColumnOptions(columnKey, search, pageParam, 20, filtersStr),
    }),
  [listHook],
);

// 2. Định nghĩa các cột theo ma trận chuẩn
const columns: DataTableColumn<RowItem>[] = useMemo(() => [
  // Cột STT: 40px, căn giữa tuyệt đối cả Header và Cell, 1-based index
  {
    key: "index",
    header: <span className="w-full block text-center">#</span>,
    size: 40,
    enableResizing: false,
    headerClassName: "text-center w-[40px] min-w-[40px]",
    className: "text-center w-[40px] min-w-[40px]",
    cell: (_, idx) => <span className="w-full block text-center">{idx}</span>,
  },

  // Cột Mã / Code: TableText + onDetailClick mở View Drawer + Badge trạng thái nháp/hủy
  {
    key: "code",
    size: 200,
    enableResizing: true,
    header: headerFilter("code", t("code", "Mã")),
    cell: (row) => (
      <div className="flex items-center gap-1.5 w-full min-w-0">
        <TableText
          className="flex-1 min-w-0"
          text={row.code}
          enableCopy
          tooltip
          onDetailClick={() => openDetail(row.id, "view")}
        />
        {row.status === "DRAFT" && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 ml-auto w-[50px] inline-flex items-center justify-center truncate">
            {t("draft", "Nháp")}
          </Badge>
        )}
      </div>
    ),
  },

  // Cột Ngày: DateRangeColumnSlot + TableDateCell căn phải
  {
    key: "createdAt",
    size: 150,
    enableResizing: true,
    className: "text-right",
    header: headerFilter.date("createdAt", t("createdAt", "Ngày tạo")),
    cell: (row) => <TableDateCell date={row.createdAt} className="justify-end w-full" />,
  },

  // Cột Số tiền / Tiền tệ: headerFilter.amount tự động format số phân tách hàng nghìn trong popover options
  {
    key: "amount",
    size: 150,
    enableResizing: true,
    className: "text-right",
    header: headerFilter.amount("amount", t("amount", "Số tiền")),
    cell: (row) => (
      <span className="tabular-nums font-semibold">
        {(row.amount || 0).toLocaleString("vi-VN")} đ
      </span>
    ),
  },

  // Cột Trạng thái: Badge fixed width w-[88px] + Tooltip
  {
    key: "status",
    size: 140,
    enableResizing: true,
    className: "text-center",
    header: headerFilter("status", t("status", "Trạng thái")),
    cell: (row) => (
      <div className="w-full flex justify-center">
        <Tooltip content={t(row.status, row.status)}>
          <Badge
            variant={row.status === "ACTIVE" ? "default" : "secondary"}
            className="w-[88px] inline-flex items-center justify-center text-center truncate"
          >
            {t(row.status, row.status)}
          </Badge>
        </Tooltip>
      </div>
    ),
  },

  // Cột có giá trị Null/Optional (Dùng showBlankOption để hỗ trợ lọc (blank) / (Trống))
  {
    key: "referenceNo",
    size: 160,
    enableResizing: true,
    header: headerFilter("referenceNo", t("referenceNo", "Mã tham chiếu"), { showBlankOption: true }),
    cell: (row) => <span className="text-muted-foreground">{row.referenceNo || "—"}</span>,
  },
], [headerFilter, t]);
```

---

| **Cột STT (Index)** | Rộng đúng `40px`, không resize, căn giữa tuyệt đối cả Header (`header: <span className="w-full block text-center">#</span>`) và Cell (`cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`). | [ ] |
| **100% Cột có Filter** | Không cột dữ liệu nào bị thiếu header filter (trừ STT & Selection). Dùng `headerFilter(key, title)` hoặc `headerFilter.date(...)` / `headerFilter.amount(...)`. | [ ] |
| **Numeric Filter Options** | Cột số/tiền tệ dùng `headerFilter.amount(...)` hoặc `headerFilter.numeric(...)` để tự động format số có phân tách hàng nghìn (`10.000.000 đ`) trên dropdown checkbox. | [ ] |
| **Cột Ngày (Date)** | Sử dụng `headerFilter.date(...)` để gắn `DateRangeColumnSlot` với preset range, ẩn checkbox filter mặc định (`hideFilter={true}`). Cell dùng `TableDateCell` căn phải. | [ ] |
| **Cột Mã Code/SKU** | Size `200px`, dùng `<TableText enableCopy tooltip onDetailClick>`, có badge Nháp/Hủy fixed width `w-[50px]` align right (`ml-auto`). | [ ] |
| **Cột Trạng Thái** | Dùng `<Badge>` fixed width `w-[88px]`, bọc `<Tooltip>` & `truncate`. | [ ] |
| **Lọc Giá trị Rỗng (`showBlankOption`)** | Các cột có dữ liệu null/optional được bật `{ showBlankOption: true }` để chèn lựa chọn `(blank)` / `(Trống)` (value: `"__BLANK__"`). | [ ] |
| **Exact & Multi-search (`""` và `;`)** | Backend API `column_search` đã dùng `applyMultiKeywordFilter` để hỗ trợ tìm chính xác `"..."` và tìm kiếm nhiều từ khóa qua `;` (OR). | [ ] |
| **Row Hover Actions & Context Menu** | BẮT BUỘC truyền prop `rowActions` trên `<SpreadsheetPageTemplate>`. Không tạo cột `{ key: "actions" }` tĩnh. 2 Quick Actions đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — ✏️). | [ ] |
| **2 Cấp độ Xóa Bộ Lọc** | Cột có nút "Xóa bộ lọc" trong Popover (cục bộ); Bảng có nút Clear All Filters khi `activeFilterCount > 0` (Page: `onClearAllFilters`; Drawer: `FilterButton` trong `titleExtra`). | [ ] |
| **Pagination Responsive** | Hỗ trợ `pageSizeOptions = [20, 50, 100, 200]`, khởi tạo `defaultPageSize` bằng `getDefaultPageSize()` (`< 900px` -> 20, `>= 900px` -> 50). Reset `setPage(1)` khi đổi filter/sort/tab. | [ ] |
| **Container & Table ID** | Bo góc `rounded-xl`, viền `border border-border/60`, có `tableId` unique để tự động lưu column sizing/visibility/order vào App Setting. | [ ] |
| **Summary Row** | Bảng có cột số tiền/số lượng phải có dòng tổng cộng `summaryRow`. | [ ] |
| **i18n** | 100% text bọc trong `t(...)`, bao gồm cả `TableColumnHeaderFilter`. | [ ] |
