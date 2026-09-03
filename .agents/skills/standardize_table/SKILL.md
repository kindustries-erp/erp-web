---
name: standardize-table
description: Create or enhance a DataTable to follow standard UI rules in the ERP project (checkbox/action column, filter/sorting popover, subtotal, i18n, etc.). Use this skill whenever generating or updating tables in pages or drawers.
---

# 📋 DataTable Standards

> ⚡ **FAST-TRACK (PlopJS Generator)**: Để sinh nhanh bảng dữ liệu nhúng cho Drawer / Modal / Section, chạy:
> ```bash
> bun plop table-section <moduleName> <componentName> <rowTypeName>
> ```
> Hoặc để sinh nguyên Module Table Page, chạy `bun plop table-page`. *(Chi tiết tại skill `plop-generate`)*

Khi tạo mới hoặc enhance một `DataTable` trong hệ thống, bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau để đảm bảo UI/UX đồng nhất và chuẩn chỉnh:

## 0. Quy Chuẩn Thành Phần Giao Diện & Enums (shadcn/ui & TypeScript Enums)

- **Mặc định dùng Variant Spreadsheet (`variant="spreadsheet"`)**: Bắt buộc sử dụng `variant="spreadsheet"` cho tất cả các bảng (`<StandardTable>` và `<DataTable>`) để có giao diện ô tính kế toán chuẩn mực, compact và đường kẻ ô sắc nét.
- **TUYỆT ĐỐI KHÔNG bọc wrapper có border xung quanh Table & Pagination**: Khi đặt `<StandardTable>` hoặc `<DataTable>` bên trong Page, Modal hay `DrawerSection`, **TUYỆT ĐỐI KHÔNG** bọc thêm thẻ `div` có `border`, `rounded-xl`, `bg-background` hay `overflow-hidden`. `<StandardTable>` / `<DataTable>` đã tự quản lý viền, container và pagination. Việc bọc thêm border bên ngoài tạo ra giao diện lồng viền (nested border) thừa thãi và xấu.
- **100% shadcn/ui Components**: Tất cả các thành phần bảng và bộ lọc bắt buộc sử dụng component từ design system (`Button`, `Input`, `Checkbox`, `Badge`, `Tabs`, `Tooltip`, `DatePicker`, `Combobox`, `MultiSelect`, `Card`, `Popover`). **Tuyệt đối không dùng HTML thuần** (`<button>`, `<input>`, `<select>`).
- **Bắt buộc dùng Enums**:
  - `TableSortState`: `ASC = "asc"`, `DESC = "desc"`, `NONE = "none"`
  - `TableColumnAlign`: `LEFT = "left"`, `CENTER = "center"`, `RIGHT = "right"`
  - `ColumnValueType`: `TEXT = "text"`, `NUMBER = "number"`, `DATE = "date"`, `STATUS = "status"`, `SELECT = "select"`
  - `TextFilterOperator`: `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `EQUALS`, `NOT_EQUALS`, `IS_EMPTY`, `IS_NOT_EMPTY`
  - `NumberFilterOperator`: `EQUALS`, `NOT_EQUALS`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, `LESS_THAN_OR_EQUAL`, `BETWEEN`
  - `DateFilterOperator`: `BETWEEN`, `EQUALS`, `BEFORE`, `AFTER`
  - `FilterChipCategory`: `TEXT`, `MULTI_SELECT`, `NUMERIC`, `DATE`, `SORT`, `CUSTOM`

## 1. Cấu trúc cột (Columns Structure)

- **Cột đầu tiên (First Column) — Cột Index (STT) hoặc Checkbox**: Bắt buộc rộng `40px` và **CĂN GIỮA TUYỆT ĐỐI (Align Center cả Header lẫn Cell)**.
  - Cần set `size: 40`, `headerClassName: "text-center w-[40px] min-w-[40px]"`, `className: "text-center w-[40px] min-w-[40px]"`, `enableResizing: false`.
  - **Căn giữa Header STT**: Header bắt buộc phải căn giữa hoàn toàn bằng cách wrap trong span block: `header: <span className="w-full block text-center">#</span>` kết hợp `headerClassName: "text-center"`.
  - **Căn giữa Cell STT**: Cell bắt buộc căn giữa hoàn toàn: `cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`.
  - **Lưu ý với cột Index (STT)**: Khi dùng cell renderer mặc định của framework, CHỈ SỬ DỤNG `{idx}`, **TUYỆT ĐỐI KHÔNG CỘNG THÊM 1** (`idx + 1` hay `(page - 1) * pageSize + idx + 1`). Lý do: Core `DataTable` (`useDataTableColumns`) đã tự động xử lý pagination offset và truyền `idx` hệ 1-based (bắt đầu từ 1). Nếu cộng thêm sẽ khiến STT hiển thị bắt đầu từ 2.
  - **TUYỆT ĐỐI KHÔNG** định nghĩa cột Action tĩnh thủ công `{ key: "actions", ... }` trong mảng `columns`. Tất cả các thao tác theo dòng phải được quản lý qua prop `rowActions` (Floated Action Menu & Right-Click Context Menu).
- **Enable Resizing**: Luôn bật tính năng resize cho các cột dữ liệu bằng cách thêm `enableResizing: true` vào config của từng cột.
- **Đa ngôn ngữ (i18n)**: Tất cả các text trong table (header, empty state, action tooltip...) phải được bọc trong hàm `t` từ `useTranslation("namespace")`. KHÔNG hardcode tiếng Việt/Anh trực tiếp mà không qua hook translation.

## 2. Table Header Filter & Two-Way Interactive Right Filter Panel

Tất cả các cột dữ liệu (trừ cột Action, Index, Checkbox) **phải tích hợp sẵn Filter và Sorting** bằng cách sử dụng helper builder chuẩn **`createColumnHeaderFilter`** (`@/shared/components/DataTable`).

- **Cơ chế Đồng Bộ 2 Chiều (Bidirectional Synchronization)**:
  - Header Table ➔ Right Filter Panel: Khi user lọc trên header popover, dải **Active Filter Chips** và các card cột trên Right Filter Panel cập nhật ngay lập tức.
  - Right Filter Panel ➔ Header Table: Khi user đổi toán tử (`>=`, `Chứa`, `Bắt đầu bằng`), nhập từ khóa, chỉnh checkbox hoặc đổi ngày trên Right Filter Panel, bảng và header indicator cập nhật tức thì.
- **Toán Tử Tìm Kiếm Nâng Cao (Advanced Operators)**:
  - Cột Số (`NUMBER`): Hỗ trợ `=`, `!=`, `>`, `>=`, `<`, `<=`, `BETWEEN (Từ ... Đến ...)`.
  - Cột Văn bản (`TEXT`): Hỗ trợ `Chứa`, `Không chứa`, `Bắt đầu bằng`, `Kết thúc bằng`, `Chính xác (=)`, `Khác (≠)`, `Trống`, `Không trống`.

- **Ưu tiên số 1: Sử dụng `createColumnHeaderFilter`**:
  Thay vì viết lặp đi lặp lại 15 dòng props cho từng cột, khởi tạo helper 1 lần duy nhất trong `useMemo` và gọi ngắn gọn 1 dòng cho mỗi cột.

```tsx
import {
  createColumnHeaderFilter,
  type DataTableColumn,
  ColumnValueType,
} from "@/shared/components/DataTable";

// 1. Khởi tạo helper builder trong component/hook:
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

// 2. Sử dụng 1 dòng cho từng cột:
const columns: DataTableColumn<ExampleRow>[] = useMemo(() => [
  // Cột thường (Server-side):
  { key: "code", header: headerFilter("code", t("Mã phiếu")), size: 200, cell: ... },
  { key: "customerName", header: headerFilter("customerName", t("Khách hàng")), size: 220, cell: ... },

  // Cột Ngày (tự động gắn DateRangeColumnSlot + presets khoảng ngày):
  {
    key: "createdAt",
    header: headerFilter.date("createdAt", t("Ngày tạo")),
    size: 150,
    className: "text-right",
    cell: (row) => <TableDateCell date={row.createdAt} className="justify-end w-full" />,
  },

  // Cột Tiền tệ (tự động format phân tách hàng nghìn '10.000.000 đ' trong popover options):
  {
    key: "amount",
    header: headerFilter.amount("amount", t("Số tiền")),
    size: 150,
    className: "text-right",
    cell: (row) => <span className="tabular-nums font-semibold">{row.amount.toLocaleString("vi-VN")} đ</span>,
  },

  // Cột Số lượng (tự động format số '1,250' trong popover options):
  {
    key: "quantity",
    header: headerFilter.qty("quantity", t("Số lượng")),
    size: 120,
    className: "text-right",
    cell: (row) => <span className="tabular-nums">{row.quantity.toLocaleString("vi-VN")}</span>,
  },

  // Cột Tháng/Kỳ (dành cho Dashboard Card / Breakdown):
  {
    key: "label",
    header: headerFilter.month("label", t("Tháng")),
    size: 130,
    className: "text-center font-medium",
    cell: (row) => formatMonthLabel(row.label),
  },

  // Cột Client-side (cho Dashboard / Drawer / Form tạm chưa lưu server):
  {
    key: "status",
    header: headerFilter.client("status", t("Trạng thái"), { filterOptions: computedStatusOptions }),
    size: 140,
    className: "text-center",
    cell: ...
  },
], [headerFilter, t]);
```

- **Quy chuẩn Format Số trên Dropdown Options**: Với các cột số/tiền tệ, KHÔNG ĐƯỢC để dropdown hiển thị số thô (`10000000`). Bắt buộc dùng `headerFilter.amount(...)` hoặc `headerFilter.numeric(...)` (hoặc prop `formatOptionLabel`) để người dùng nhìn thấy số có phân tách hàng nghìn rõ ràng.
- **Cột Ngày / Tháng (Date / Month)**: Dùng `headerFilter.date(...)` hoặc `headerFilter.month(...)`. Popover **CHỈ** gồm **Sắp xếp** + **DateRange Slot (Chọn nhanh, Từ ngày, Đến ngày)**, BẮT BUỘC `hideFilter={true}` và `hideFooter={true}` để **TUYỆT ĐỐI KHÔNG** hiển thị ô Search Box hoặc Checkbox Options thừa.
- **Bảng Client-side**: Truyền `items: rawList` vào `createColumnHeaderFilter({ listHook, items: rawList })` và dùng `filterClientItems(rawList, listHook, { dateField: "label" })` để tự động lọc, search, sort 100% không sót tính năng nào.
- **Khung Viền Table (No Double Border)**: Khi đặt `<DataTable>` trong Card hoặc Container, **KHÔNG ĐƯỢC bọc thêm thẻ `div className="border rounded-lg ..."` bên ngoài**, vì `DataTable` đã có viền và khung chuẩn mực bên trong, tránh lỗi 2 lớp border đè lên nhau.
- **Cột thường**: TUYỆT ĐỐI KHÔNG set `hideFilter: true` (hoặc `hideFilter={true}`), để đảm bảo user luôn nhìn thấy search box và danh sách checkbox options.
- **Data Fetching, React Query & Enum QueryKey Chuẩn Hóa**:
  - Mọi bảng dữ liệu (màn hình Page, Drawer nhúng, hoặc Table Tabs) **BẮT BUỘC** sử dụng **TanStack React Query (`useQuery` / `useAppQuery`)** để nạp và quản lý dữ liệu.
  - **BẮT BUỘC dùng Enum `ErpQueryKey`** từ `@/shared/lib/queryKeys` (ví dụ: `ErpQueryKey.INVOICES_LIST`, `ErpQueryKey.VINFAST_PARTS_STOCK`, `ErpQueryKey.INVENTORY_STOCK_LIST`). **TUYỆT ĐỐI KHÔNG** hardcode chuỗi string tự do.
  - **Thời Gian Cache Tiêu Chuẩn (`DEFAULT_STALE_TIME`)**: Mọi query bảng tuân thủ thời gian cache chuẩn **1 phút 30 giây (`90_000` ms)** kế thừa từ `queryClient.ts` hoặc truyền `staleTime: DEFAULT_STALE_TIME`.
  - **Zero-latency Tab Switching**: Khi một màn hình có nhiều Tab hoặc Sub-view, `queryKey` **BẮT BUỘC** phải chứa tham số phân biệt tab (`tab`, `direction`, `variant`...). Nhờ đó, dữ liệu của mỗi tab được lưu cache riêng biệt trong 90s, giúp người dùng chuyển đổi qua lại giữa các tab tức thì 0ms mà không bị gọi lại API dư thừa hoặc giật lag layout.

- **NGUYÊN TẮC: LUÔN ƯU TIÊN SERVER-SIDE SORTING & FILTERING**:
  - Mọi bảng trong hệ thống (cả màn hình Page lẫn Drawer/Modal) **MẶC ĐỊNH BẮT BUỘC** phải ưu tiên triển khai **Server-side Filter & Sort** qua API backend (hook TanStack Query + API `getColumnOptions`).
  - Khi xử lý bảng thống kê ở Dashboard hoặc Drawer nháp client, dùng cơ chế Client-side Auto Extraction với `filterClientItems`.
- **Cú pháp Tìm kiếm Nâng cao trong Header Filter (Exact Search `""` & Multi-Search `;`)**:
  - Ô Search Box bên trong Header Filter Popover của mọi cột dữ liệu hỗ trợ sẵn 2 cú pháp tìm kiếm đặc biệt (hiển thị gợi ý tại placeholder và tooltip):
    1. **Tìm kiếm chính xác nguyên văn (`"..."`)**: Người dùng đặt từ khóa trong cặp ngoặc kép `""` (ví dụ: `"INV-001"`, `"0101234567"`). Hệ thống sẽ tìm khớp chính xác tuyệt đối giá trị thay vì tìm kiếm gần đúng `%...%`.
    2. **Tìm kiếm nhiều từ khóa đồng thời (Multi-search qua dấu chấm phẩy `;`)**: Người dùng phân tách các từ khóa bằng dấu chấm phẩy `;` (ví dụ: `1001;1005;1010` hoặc `VINFAST;HONDA`). Hệ thống sẽ tìm kiếm theo điều kiện `OR` (khớp bất kỳ từ khóa nào trong danh sách).
    3. **Kết hợp linh hoạt**: Có thể kết hợp cả 2 cú pháp, ví dụ: `"HD-01";HD-02;HD-03` (khớp chính xác HD-01 HOẶC chứa chuỗi HD-02 HOẶC chứa chuỗi HD-03).
  - **Quy chuẩn Backend cho `column_search`**:
    - Backend **BẮT BUỘC** sử dụng helper chuẩn `applyMultiKeywordFilter` hoặc `applyMultiKeywordMultiFieldFilter` (`@/common/utils/query-builder.util.ts`) để phân tách chuỗi `split(';')`, bóc tách dấu ngoặc kép `""` và bind params an toàn chống SQL injection.
- **Lọc Giá trị Rỗng / Trống (`showBlankOption` / `(blank)`)**:
  - Đối với các cột dữ liệu có thể chứa giá trị `NULL` hoặc chuỗi rỗng `''` (ví dụ: Số hóa đơn liên kết, Mã đơn PO tham chiếu, Tài khoản đối ứng, Nhân viên phụ trách...), truyền thêm option `{ showBlankOption: true }` vào `headerFilter(...)` hoặc `TableColumnHeaderFilter`:
    ```tsx
    {
      key: "invoiceNo",
      header: headerFilter("invoiceNo", t("Số hóa đơn"), { showBlankOption: true }),
      size: 180,
      cell: ...
    }
    ```
  - Khi bật `showBlankOption: true`, Header Filter Popover sẽ tự động chèn thêm lựa chọn đầu tiên là **`(blank)`** (hiển thị tiếng Việt là `(Trống)` qua `t("blank", "(Trống)")`), với giá trị định danh là `"__BLANK__"`.
  - **Xử lý Backend**: Khi backend nhận mảng giá trị lọc chứa `"__BLANK__"`, phải áp dụng điều kiện `(field IS NULL OR field = '')`.
- **Quy chuẩn 2 Cấp độ Xóa Bộ Lọc (Local Column Reset vs Global Clear All Filters)**:
  - **Cấp độ 1 — Cục bộ trên từng cột (Local Column Reset)**:
    - Nằm trực tiếp bên trong Popover của mỗi cột:
      - Nút icon `X` ở mép phải ô Search Box: Xóa nhanh nội dung tìm kiếm đang nhập của cột đó.
      - Nút **"Xóa bộ lọc"** (`t("clearFilter", "Xóa bộ lọc")`) ở góc trái Footer của Popover: Reset toàn bộ từ khóa tìm kiếm (`columnSearch[col]`) và các mục checkbox đang chọn (`columnFilters[col]`) của **riêng cột đó**, không làm ảnh hưởng đến bộ lọc của các cột khác.
      - *Lưu ý*: Với cột Date/Month, do dùng slot chuyên dụng `DateRangeColumnSlot` nên bắt buộc set `hideFilter={true}` và `hideFooter={true}`.
  - **Cấp độ 2 — Toàn cục cho toàn bộ Bảng (Global Clear All Filters)**:
    - Khi bảng có bất kỳ bộ lọc nào đang active (`activeFilterCount > 0` tính tổng từ FilterPanel, columnFilters, columnSearch và dateRanges), bắt buộc phải có nút xóa lọc tổng thể:
      - **Page-level**: Truyền `activeFilterCount` và `onClearAllFilters` vào `SpreadsheetPageTemplate`.
      - **Drawer-level / Card-level**: Gắn `<FilterButton activeCount={...} onClear={...} />` vào `titleExtra` của `DrawerSection` hoặc nút Inline Reset Pill `Xóa bộ lọc (N)`.
      - Khi click, nút này sẽ reset sạch 100% tất cả các cột, filter panel, khoảng ngày và đưa trang về 1 (`setPage(1)`).

---



### Mẫu code Nút Clear All Filters (Chuẩn Page & Drawer):

- **Pattern 1: Page-level (`SpreadsheetPageTemplate`)** (Chuẩn như `erp-invoices` / `ErpInvoicesTab.tsx` và `garage-cases` / `GarageCases.tsx`):

```tsx
// 1. Tính activeFilterCount tổng hợp (kết hợp FilterPanel, tableState.columnFilters và Date Ranges)
const activeFilterCount = useMemo(() => {
  const activeDateCount = Object.values(dateRanges).filter((range) =>
    Boolean(range?.from || range?.to),
  ).length;
  return (
    (listHook.filterPanel?.activeFilterCount || 0) +
    (listHook.tableState?.activeFilterCount || 0) +
    activeDateCount
  );
}, [listHook.filterPanel?.activeFilterCount, listHook.tableState?.activeFilterCount, dateRanges]);

// 2. Handler reset toàn bộ filter
const handleClearAllFilters = useCallback(() => {
  listHook.filterPanel?.resetAll?.();
  listHook.tableState?.resetFilters?.();
  setDateRanges({});
  setPage(1);
}, [listHook]);

// 3. Truyền vào SpreadsheetPageTemplate
<SpreadsheetPageTemplate
  activeFilterCount={activeFilterCount}
  onClearAllFilters={handleClearAllFilters}
  {/* ...các props khác */}
/>
```

- **Pattern 2: Drawer-level (`DrawerSection` + `FilterButton`)** (Chuẩn như `InvoiceSelectionDrawer.tsx`, `IaFormDrawer.tsx`, `GrFormDrawer.tsx`, `GiFormDrawer.tsx`):
```tsx
import { FilterButton } from "@/shared/components/FilterPanel";

// Truyền nút xóa lọc trực tiếp vào prop titleExtra của DrawerSection khi có filter active
<DrawerSection
  title="Danh sách chứng từ / hóa đơn"
  titleExtra={
    tableState.activeFilterCount > 0 ? (
      <FilterButton
        activeCount={tableState.activeFilterCount}
        onClear={() => {
          tableState.resetFilters();
          setDateFrom("");
          setDateTo("");
          setPage(1);
        }}
      />
    ) : undefined
  }
>
  <StandardTable ... />
</DrawerSection>
```

- **Pattern 3: DrawerSection / Card Section Inline Reset Pill** (Chuẩn như `GaragePaymentProgressCard.tsx`, `GarageMonthDetailDrawer.tsx`):
```tsx
// Đặt nút Xóa bộ lọc (N) ở bên TRÁI ngay sau tên tiêu đề bảng, đồng bộ và trực quan
<DrawerSection
  title={
    <div className="flex items-center gap-2">
      <span>Bảng phân loại dữ liệu</span>
      {tableHook.activeFilterCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            tableHook.resetFilters();
          }}
          className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full lowercase first-letter:uppercase tracking-normal font-sans"
        >
          <span>Xóa bộ lọc ({tableHook.activeFilterCount})</span>
        </button>
      )}
    </div>
  }
  titleExtra={
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <TableIcon className="w-3.5 h-3.5 text-primary mr-1" />
      {filteredRows.length} / {rawRows.length} dòng
    </div>
  }
>
  <DataTable items={filteredRows} ... />
</DrawerSection>
```

## 3. Row Click, View Detail, Row Hover Floating Action Menu & Right-Click Context Menu

- **Tuyệt đối KHÔNG sử dụng `onRowClick`** để mở trang / ngăn kéo chi tiết (detail drawer).
- **Tuyệt đối LOẠI BỎ cột Action tĩnh**: KHÔNG định nghĩa cột `{ key: "actions", ... }` hoặc prop `actionsColumn` thủ công trong bảng. Toàn bộ thao tác theo dòng đã được thay thế 100% bằng **Floated Action Menu** và **Right-Click Context Menu**.
- **Chỉ có 3 cách hợp lệ để mở Drawer chi tiết / chỉnh sửa một bản ghi**:
  1. Click vào biểu tượng icon detail nằm trong `<TableText>` (xem phần Mã Code/SKU bên dưới — mặc định mở chế độ Xem `view`).
  2. Click vào 2 nút **Quick Actions (Xem chi tiết 👁️ / Chỉnh sửa ✏️)** hoặc nút ba chấm `...` trên **Floated Action Menu**.
  3. Click chuột phải vào dòng dữ liệu để mở **Right-Click Context Menu** và chọn "Xem chi tiết" hoặc "Chỉnh sửa".

- **Floated Action Menu (Ô Nổi Thao Tác Khi Hover Hàng)**:
  - Khi rê chuột (hover) vào bất kỳ dòng nào trong bảng, một ô nổi chứa **2 nút thao tác nhanh (Quick Action Buttons)** và **nút ba chấm `...`** mở Action Menu đầy đủ sẽ xuất hiện nổi tại mép phải của dòng (`sticky right-0` trong suốt, không đè nền/viền lên dữ liệu).
  - **2 NÚT QUICK ACTIONS BẮT BUỘC (View & Edit Mode của Drawer Detail)**:
    - **Nút 1 — Xem chi tiết (`view` mode)**: Icon `Eye` 👁️ (`<Eye className="w-3.5 h-3.5" />`), label `t("viewDetail", "Xem chi tiết")`, onClick gọi `openDetail(row.id, "view")` để mở Drawer ở chế độ chỉ đọc / xem chi tiết.
    - **Nút 2 — Chỉnh sửa (`edit` mode)**: Icon `Pencil` ✏️ (`<Pencil className="w-3.5 h-3.5" />`), label `t("edit", "Chỉnh sửa")`, onClick gọi `openDetail(row.id, "edit")` để mở Drawer trực tiếp ở chế độ form chỉnh sửa.
    - **Nút 3 — Ba chấm (`...`)**: Mở `<ActionDropdown>` đầy đủ cho các thao tác mở rộng khác (In, Tải XML/PDF, Nhân bản, Đồng bộ, Xóa...).
  - **Button Pill luôn Floating ở mép phải khung nhìn**: Nút nổi luôn xuất hiện ở mép phải của hàng hiển thị trên màn hình (`absolute right-3.5 top-1/2 -translate-y-1/2`) bất kể bạn đang ở đầu, giữa hay cuối bảng. Cell chứa nút nổi hoàn toàn trong suốt (`bg-transparent border-none pointer-events-none`), không tạo bất kỳ dải cột cố định hay viền dọc nào che khuất dữ liệu khi cuộn.
  - **Cột đệm 116px ở cuối bảng (Không sticky header/footer)**: Header và Footer của cột cuối cuộn tự nhiên theo bảng. Khi cuộn ngang hết cỡ sang phải, cột đệm 116px này đóng vai trò khoảng trống an toàn để ô nổi nằm gọn gàng bên trong với lề 14px đều đặn, không đè lên dữ liệu của cột liền trước.
  - **Khoảng cách 3 Icon Buttons đều đặn**: Cả 3 nút đều có kích thước chuẩn (`w-6 h-6 rounded-lg`), giãn cách đều `gap-1` (4px), không dùng thanh ngăn cách để đảm bảo đối xứng thị giác hoàn hảo.
  - **Glassmorphism Styling**: Ô nổi sử dụng hiệu ứng kính mờ cao cấp đồng bộ với Universal Search (`backdrop-filter: blur(20px) saturate(180%)`, nền `var(--popup-bg)`, viền `var(--popup-border)` và viền sáng âm `inset`, đổ bóng mịn).
  - **Hiệu năng 0ms Lag**: Sử dụng hardware-accelerated CSS hover (`group-hover:opacity-100`), không gây re-render React khi di chuột, hoạt động mượt mà 60fps/120fps.
  - **Chuẩn Tooltip Bottom**: Toàn bộ tooltip trong bảng và hệ thống mặc định mở xuống dưới (`side="bottom"`) để không bao giờ che khuất các nút thao tác nổi.

- **Right-Click Context Menu (Menu Thao Tác Khi Chuột Phải Vào Hàng Dữ Liệu)**:
  - **Tự động kích hoạt toàn hệ thống**: Khi khai báo `rowActions` trên `<SpreadsheetPageTemplate>` hoặc `actions` / `rowHoverActions` trên `<StandardTable>` / `<DataTable>`, tính năng **Right-Click Context Menu** (`TableRowContextMenu`) sẽ **tự động được kích hoạt** trên mọi hàng của bảng (cả ở màn hình Page lẫn trong Drawer).
  - **Trải nghiệm tức thì**: Người dùng click chuột phải vào bất kỳ ô/cột nào trên dòng dữ liệu sẽ mở ngay Context Menu tại đúng tọa độ con trỏ chuột `(e.clientX, e.clientY)`. Context menu chứa đầy đủ các action (Xem chi tiết, Chỉnh sửa, In, Xóa...).
  - **Smart Viewport Collision Avoidance**: Menu render bằng React Portal vào `document.body` và tích hợp thuật toán đo đạc kích thước khung nhìn (`window.innerWidth`, `window.innerHeight`). Khi click gần mép phải hoặc đáy màn hình, menu tự động nắn chỉnh lùi lại với khoảng đệm `GAP = 8px`, đảm bảo không bao giờ bị che khuất hoặc tràn khỏi màn hình.
  - **Visual Feedback Active Row**: Khi Context Menu đang mở, hàng dữ liệu tương ứng được highlight nền nhẹ nhàng (`data-context-menu-active="true"`, `bg-primary/[0.04]`), giúp người dùng nhận biết tức thời dòng đang thao tác.
  - **Tự động đóng an toàn**: Menu tự động đóng khi click ra ngoài, cuộn trang/bảng (`scroll` capture), nhấn phím `Escape`, hoặc click chuột phải sang hàng khác.
  - **Tùy biến linh hoạt**: Hỗ trợ prop `enableRowContextMenu={true | false}` (mặc định `true`) và prop `onRowContextMenu={(item, index, event) => ...}` khi cần xử lý nâng cao.

- **Action Menu (Cấu trúc ActionDropdownItem chuẩn cho `rowActions`)**:
  - Các thao tác bên trong phải được **phân nhóm logic (Group)** rõ ràng bằng thuộc tính `groupLabel`.
  - **Chuẩn cấu trúc `rowActions`**:
    - Nhóm **TRA CỨU**: Mục đầu tiên là "Xem chi tiết" (`openDetail(row.id, "view")`), tiếp theo là In, Tải XML/PDF...
    - Nhóm **THAO TÁC**: Mục đầu tiên là "Chỉnh sửa" (`openDetail(row.id, "edit")`), tiếp theo là Đồng bộ, Nhân bản, Xóa...

**Mẫu code `rowActions` chuẩn (Hỗ trợ 2 chế độ View / Edit Drawer Detail)**:

```tsx
import { Eye, Pencil, Download, RefreshCw, Trash2 } from "lucide-react";

// Khai báo state quản lý Drawer & Mode
const [drawerOpen, setDrawerOpen] = useState(false);
const [drawerMode, setDrawerMode] = useState<"view" | "edit">("view");
const [selectedId, setSelectedId] = useState<string | null>(null);

const openDetail = (id: string, mode: "view" | "edit" = "view") => {
  setSelectedId(id);
  setDrawerMode(mode);
  setDrawerOpen(true);
};

// Khai báo rowActions (Floated Action Menu & Context Menu tự động dùng)
const getRowActions = (row: ExampleRow): ActionDropdownItem[] => [
  {
    groupLabel: "TRA CỨU",
    items: [
      {
        label: t("Xem chi tiết", "View Detail"),
        icon: <Eye className="w-3.5 h-3.5" />,
        onClick: () => openDetail(row.id, "view"), // 👁️ Nút Quick Action 1: Vào View Mode
      },
      {
        label: t("Tải XML", "Download XML"),
        icon: <Download className="w-3.5 h-3.5" />,
        onClick: () => downloadXML(row.id),
      },
    ],
  },
  {
    groupLabel: "THAO TÁC",
    items: [
      {
        label: t("Chỉnh sửa", "Edit"),
        icon: <Pencil className="w-3.5 h-3.5" />,
        onClick: () => openDetail(row.id, "edit"), // ✏️ Nút Quick Action 2: Vào Edit Mode
        disabled: row.status === "LOCKED",
      },
      {
        label: t("Đồng bộ lại", "Re-sync"),
        icon: <RefreshCw className="w-3.5 h-3.5" />,
        onClick: () => syncItem(row.id),
      },
      {
        label: t("Xóa", "Delete"),
        icon: <Trash2 className="w-3.5 h-3.5 text-destructive" />,
        variant: "danger",
        onClick: () => handleDelete(row.id),
      },
    ],
  },
];
```

- **Tô Màu & Highlight Dòng Dữ Liệu (`getRowClassName`)**:
  - Khi cần đổi màu nền, làm mờ font chữ hoặc highlight một dòng dữ liệu dựa theo trạng thái / điều kiện nghiệp vụ (ví dụ: Hóa đơn điều chỉnh/thay thế, Phiếu bị hủy, v.v.), sử dụng prop `getRowClassName={(row, index) => string | undefined}` trên `<SpreadsheetPageTemplate>`, `<StandardTable>` hoặc `<DataTable>`.
  - **Quy chuẩn màu sắc**:
    - **Hóa đơn Thay thế / Điều chỉnh / Bị điều chỉnh**: Nền vàng nhạt dịu (`bg-amber-50/40 dark:bg-amber-950/15 hover:bg-amber-100/40 dark:hover:bg-amber-900/15`).
    - **Hóa đơn Bị thay thế / Bị hủy**: Không đổi nền, làm mờ font (`opacity-40 text-muted-foreground`).
    - **Phiếu / Chứng từ bị Hủy (Garage Cases, etc.)**: Làm mờ font (`opacity-40 text-muted-foreground`), không đổi màu nền.
  - **Mẫu code**:
    ```tsx
    <SpreadsheetPageTemplate
      // ...
      getRowClassName={(item) => {
        if (item.status === "CANCELLED") return "opacity-40 text-muted-foreground";
        return undefined;
      }}
    />
    ```

## 4. Cột Text đặc thù (Mã Code / Số Phiếu / Dữ liệu liên kết)

Cột liên quan tới mã hệ thống, số phiếu (voucher code, item code, invoice no, so no...) bắt buộc sử dụng component `<TableText>` để có tính năng copy, tooltip khi bị dài (ellipsis) và click để xem chi tiết hoặc mở drawer liên kết:

- **Phân tách rõ 2 loại tương tác**:
  1. **Nội dung chính (Main Content / Primary Record)**: Sử dụng `onDetailClick` (sẽ tự động hiển thị icon con mắt `Eye` 👁️). Áp dụng cho: Số hóa đơn (`invoiceNo`), Số phiếu kho (`voucherNo`), Số đơn hàng (`soNo`), Mã lệnh sản xuất (`referenceNo`), Mã vụ việc (`soChungTu`), Mã định danh (`serialNo`), Mã đối tác (`code`), SKU...
  2. **Dữ liệu phụ / liên kết (Secondary / Related Data Drawer)**: Sử dụng `onDrawerClick` (sẽ tự động hiển thị icon ngăn kéo `PanelRightOpen` 📑). Áp dụng cho: Tên/MST đối tác trong hóa đơn, Tài khoản đối ứng trong sao kê, Đơn hàng liên kết trong hồ sơ bảo hành, Chứng từ tham chiếu...
- **Chiều rộng**: Bắt buộc set `size: 200` và `enableResizing: true`.
- **Quick Status Badge**: Nếu dòng dữ liệu đang ở trạng thái **Nháp (Draft)** hoặc **Hủy (Canceled/Voided)**, phải hiển thị thêm một Badge nhỏ nhắn.
  - **Align Right**: Badge trạng thái **BẮT BUỘC** phải được căn sát mép phải của cell (sử dụng class `ml-auto flex-shrink-0`), trong khi mã code và icon detail/drawer/copy nằm bên trái.
  - **Fixed Width đồng đều**: Thiết lập chiều rộng cố định cho badge (ví dụ: `w-[50px] inline-flex items-center justify-center text-center truncate`) để badge ở các dòng luôn bằng nhau và thẳng hàng.
  - **Sử dụng App Badge**: Bắt buộc dùng component `Badge` từ `@/shared/components/ui/badge`.
  - **Tooltip & Ellipsis**: Bọc Badge trong `<Tooltip>` và có `truncate` phòng trường hợp text trạng thái bị dài hoặc đa ngôn ngữ.

**Mẫu code cho cột Code/SKU chính (Main Record)**:

```tsx
{
  key: "code",
  size: 200,
  enableResizing: true,
  // ... header config ...
  cell: (row) => (
    <div className="flex items-center gap-1.5 w-full min-w-0">
      <TableText
        className="flex-1 min-w-0"
        text={row.code}
        enableCopy={true}
        tooltip={true} // Bật tính năng tooltip & ellipsis (truncate) nếu text quá dài
        onDetailClick={(e) => {
          e.stopPropagation();
          openDetail(row.id); // Icon con mắt (Eye) mở chi tiết bản ghi chính
        }}
      />
      {row.status === "DRAFT" && (
        <Tooltip content={t("Nháp", "Draft")}>
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
          >
            {t("Nháp", "Draft")}
          </Badge>
        </Tooltip>
      )}
      {(row.status === "CANCELED" || row.status === "CANCELLED") && (
        <Tooltip content={t("Hủy", "Canceled")}>
          <Badge
            variant="destructive"
            className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 font-medium ml-auto w-[50px] inline-flex items-center justify-center text-center truncate"
          >
            {t("Hủy", "Canceled")}
          </Badge>
        </Tooltip>
      )}
    </div>
  )
}
```

## 5. Cột Thời Gian (Ngày + Giờ)

Nếu cột thời gian bao gồm cả ngày tháng năm và thời gian, **bắt buộc** format làm 2 dòng với font style chuẩn như trong `erp-inventory-vouchers`:

- Cột ngày phải hiển thị full `dd/MM/yyyy HH:mm` nếu có đủ data, còn không thì chỉ hiển thị `dd/MM/yyyy` (component `TableDateCell` đã tự động xử lý việc này).
- **Canh lề**: Nội dung cột (content) của ngày tháng phải được canh phải (`className: "text-right"` cho cột và truyền `className="justify-end w-full"` cho `TableDateCell`). Tuy nhiên header vẫn có thể giữ nguyên canh giữa theo chuẩn `TableColumnHeaderFilter`.

**Mẫu code cho cột Date/Time**:

```tsx
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";

{
  key: "date",
  className: "text-right",
  // ...
  cell: (row) => <TableDateCell date={row.createdAt} className="justify-end w-full" />;
}
```

## 6. Cột Số và Tiền Tệ (Numbers & Currencies)

- **Cột Số lượng / Tiền tệ**: Nội dung cột (số) **BẮT BUỘC** phải được canh phải (align right) bằng class `className: "text-right"` và dùng class `tabular-nums` để các con số thẳng hàng nhau. Tiền tệ cần thêm class `font-semibold`.

## 7. Cột Trạng Thái (Status/State)

Bất kỳ cột nào liên quan đến **Status**, **State** thì bắt buộc phải tuân thủ các quy tắc sau:
- **Dùng App Badge component**: Bắt buộc dùng `<Badge>` (`@/shared/components/ui/badge`) hoặc `<StatusBadge>` (`@/shared/components/badges`).
- **Fixed Width đồng đều**: Bắt buộc thiết lập chiều rộng cố định cho badge (ví dụ: `w-[88px] inline-flex items-center justify-center text-center truncate`) để các trạng thái trên các dòng luôn thẳng tắp và đồng đều.
- **Tooltip & Ellipsis**: Bọc `<Tooltip>` cho Badge và thêm class `truncate` để không làm tràn vỡ layout khi text trạng thái dài.

**Mẫu code cho cột Trạng Thái**:

```tsx
{
  key: "status",
  header: renderHeaderFilter("status", t("Trạng thái")),
  size: 130,
  className: "text-center",
  cell: (row) => (
    <div className="w-full flex justify-center">
      <Tooltip content={t(row.status)}>
        <StatusBadge
          status={row.status || ""}
          className="w-[88px] inline-flex items-center justify-center text-center truncate"
        />
      </Tooltip>
    </div>
  ),
}
```

## 8. Table Header & Subtotal Row Glassmorphism (Hiệu ứng Kính Mờ cho Header & Dòng Tổng Cộng)

Cả thanh tiêu đề bảng (**`TableHeader`**) lẫn dòng tổng cộng (**`summaryRow` / `TableFooter`**) đều được tích hợp sẵn hiệu ứng kính mờ trong suốt (**Glassmorphism**) cao cấp:
- **`TableHeader`**: Sử dụng `table-header-glass bg-muted/80 backdrop-blur-sm sticky top-0 z-20 border-b border-border shadow-[0_1px_0_0_var(--border-light)]`. Khi cuộn dữ liệu, các hàng nội dung lướt mượt mà bên dưới thanh tiêu đề mà không bị che khuất thô cứng.
- **Sticky Column Headers (STT / Checkbox / Actions)**: Tự động kế thừa `table-header-glass bg-muted/80 backdrop-blur-sm` khi cuộn ngang.
- **`summaryRow` (`TableFooter`)**: Đối với các bảng có cột mang giá trị số, **bắt buộc phải có dòng `summaryRow`** ở cuối để hiển thị tổng, sử dụng `table-footer-glass bg-muted/80 backdrop-blur-sm sticky bottom-0 z-20 border-t border-border font-semibold shadow-[0_-1px_0_0_var(--border-light)]`.

**Mẫu code cho `summaryRow`**:

```tsx
<DataTable
  // ...other props
  summaryRow={{
    labelColumnKey: (
      <div className="text-right w-full font-semibold">
        {t("Tổng cộng", "Total")}:
      </div>
    ),
    qtyColumnKey: (
      <div className="text-center font-semibold text-emerald-600">
        {fmtQty(totalQty)}
      </div>
    ),
    amountColumnKey: (
      <div className="text-right font-bold text-primary">
        {money(totalAmount)}
      </div>
    ),
  }}
/>
```

## 9. Empty State và CSS Container

- Luôn truyền `emptyLabel={t("Không có dữ liệu", "No data")}`.
- **Quy chuẩn Border & Border-Radius cho Container Bảng**:
  - Container bảng **BẮT BUỘC** luôn duy trì bo góc chuẩn `rounded-xl` (12px) và viền thanh thoát `border border-border/60` trên nền `bg-surface` cho tất cả các variants (cả spreadsheet lẫn default).
  - **TUYỆT ĐỐI KHÔNG** gán `rounded-none` hoặc đặt viền quá đậm làm mất góc bo và tạo cảm giác viền lồng viền (border wrapper) thô cứng.
  - Tự động tích hợp hiệu ứng scroll shadows (`isScrolledTop` / `isScrolledBottom`) khi cuộn bảng.
- Với Table nằm trong **Drawer**, hạn chế chiều cao container để không làm vỡ Drawer, có cuộn dọc bên trong:
  `containerClassName="max-h-[calc(100vh-280px)] overflow-y-auto"`.
## 10. Phân trang & Default PageSize theo chiều cao màn hình (Pagination & Responsive PageSize)

- **Cột Index (STT) bắt đầu từ 1 (1-based index)**:
  - Giá trị `idx` truyền vào hàm `cell` của cột STT **luôn bắt đầu từ 1** (trên trang 1 là 1..20, trang 2 là 21..40...) nhờ Core `DataTable` đã tự động cộng dồn offset `(page - 1) * pageSize + index + 1`.
  - Cell renderer chỉ cần hiển thị `{idx}` và căn giữa tuyệt đối:
    ```tsx
    cell: (_, idx) => <span className="w-full block text-center">{idx}</span>
    ```
- **PageSize Options**: Danh sách mốc phân trang trên `TablePagination` hỗ trợ các mốc `[20, 50, 100, 200]`.
- **Default PageSize tự động thích ứng theo Chiều cao màn hình (Screen Height)**:
  - Khi chiều cao màn hình **< 900px** (Laptop / màn hình phổ thông): Default `pageSize = 20`.
  - Khi chiều cao màn hình **>= 900px** (Màn hình Desktop / Monitor lớn): Default `pageSize = 50`.
  - Hàm helper chuẩn dùng trong state/hook:
    ```ts
    export const getDefaultPageSize = (): number => {
      if (typeof window !== "undefined" && window.innerHeight >= 900) {
        return 50;
      }
      return 20;
    };
    ```

## 11. Default Sort (Sắp xếp mặc định)

- UI **KHÔNG ĐƯỢC** set state `sortBy` mặc định (vd: `const [sortBy, setSortBy] = useState<string | undefined>(undefined);`) nếu muốn bảng sắp xếp mặc định theo ngày tạo/ngày chứng từ.
- Backend **PHẢI** tự động apply sort mặc định (thường là `createdAt` DESC hoặc theo ngày chứng từ) khi UI truyền lên `sort` rỗng. Việc này đảm bảo khi vừa vào trang, bảng dữ liệu đã được sort mới nhất lên đầu nhưng trên Header UI không bị khoá cứng icon "đang sort" tại bất kỳ cột nào cho đến khi User click.

## 12. Quản lý Hiển thị, Tùy biến Cột & Khôi phục mặc định (Column Visibility, Ordering & App Settings Reset)

- **Trung tâm Tùy chỉnh cột (`ColumnToggle` / Column Visibility Dropdown)**:
  - Menu popover với icon bánh răng (`Settings2`) trên thanh công cụ bảng là nơi **DUY NHẤT** quản lý cấu hình và tùy biến giao diện cột:
    1. **Ẩn / Hiện cột**: Toggle bật/tắt checkbox của từng cột.
    2. **Kéo thả đổi thứ tự cột**: Dnd Sortable kéo thả để thay đổi vị trí hiển thị các cột.
    3. **Giới hạn chiều cao & Cuộn dọc**: Danh sách các cột có chiều cao tối đa `max-h-[min(360px,75vh)]` kết hợp cuộn dọc (`overflow-y-auto`), tránh tràn màn hình khi bảng có hàng chục cột.
    4. **Nút Khôi phục mặc định (Reset Layout)**: Nút "Khôi phục" (với icon `RotateCcw`) được gắn **cố định trên header của popup menu `ColumnToggle`**. Khi click, hệ thống sẽ tự động khôi phục toàn bộ:
       - Độ rộng cột (`columnSizing` → `{}`)
       - Trạng thái ẩn/hiện cột (`columnVisibility` → `defaultColumnVisibility`)
       - Thứ tự cột (`columnOrder` → `defaultColumnOrder`)
- **Cơ chế lưu trữ App Setting (`useUserPreferences` & `updateUserPreferencesApi`)**:
  - Toàn bộ cấu hình bảng của người dùng (`tableConfigs`: column visibility, ordering, sizing) được xử lý tập trung và đồng bộ 2 chiều qua **App Setting / User Preferences Core**:
    1. **Backend Database (App Settings Core)**: Tự động đồng bộ lên cơ sở dữ liệu (bảng `core_user_preferences`) qua API `updateUserPreferencesApi({ tableConfigs })` (cơ chế debounced 500ms).
    2. **LocalStorage Cache (`erp_preferences`)**: Tự động lưu cache qua Zustand Persist middleware để đảm bảo tốc độ render 0ms ngay khi mở trang trước khi nhận dữ liệu hydrate từ server.
    3. **Khi bấm nút "Khôi phục" (Reset)**: Hệ thống tự động ghi đè cấu hình mặc định về App Setting trên Backend Database lẫn LocalStorage cache.
- **NGHIÊM CẤM ĐẶT NÚT RESET Ở CỘT KHÁC**:
  - **TUYỆT ĐỐI KHÔNG** đặt nút Reset Column thủ công tại header của cột Action, cột STT hay bất kỳ cột dữ liệu nào. Toàn bộ logic reset đã được tích hợp tự động vào dropdown `ColumnToggle`.
- **Yêu cầu `tableId` duy nhất**:
  - Bảng bắt buộc phải được truyền prop `tableId` (dạng chuỗi unique, vd: `"erp-invoices-in"`, `"garage-cases"`, `"bom-list"`) để Core `DataTable` tự động kết nối Portal Target hiển thị nút `ColumnToggle` và lưu trữ trạng thái người dùng vào App Setting.

## 13. Hiệu năng & Tối ưu hóa Re-render khi Chọn Dòng (Table Performance & Fast Selection)

Khi phát triển hoặc nâng cấp bảng dữ liệu có hỗ trợ chọn nhiều dòng (`enableRowSelection={true}`), **BẮT BUỘC** tuân thủ các nguyên tắc hiệu năng sau để đảm bảo thao tác click checkbox phản hồi tức thì (< 16ms / 60fps):

1. **Ổn định Tham Chiếu Cột & Handlers (Referential Stability)**:
   - **TUYỆT ĐỐI KHÔNG** truyền inline anonymous function cho `rowHoverActions` hoặc `actionsColumn` (vd: `(row) => actions(row)`). Phải truyền trực tiếp `actions` đã được bọc bằng `useCallback`.
   - **Cô lập `columns` khỏi các state thay đổi thường xuyên**: Trong hook tạo cột, TUYỆT ĐỐI KHÔNG đưa toàn bộ object `listHook` vào dependency array của `useMemo`. Chỉ khai báo các dependency con thực sự cần thiết (`tableState.columnFilters`, `tableState.columnSearch`, `tableState.sorts`, `activeTaxTab`, `dateFrom`, `dateTo`).
2. **Lazy Evaluation cho Popover & Cell Nặng**:
   - Với các cell có Popover nội dung lớn (như danh sách mặt hàng, tính tổng sub-table nhiều dòng trong `<TableText>`), bắt buộc truyền `popoverContent` dưới dạng hàm lazy render `() => ReactNode` (chỉ tính toán và render DOM khi Popover thực sự mở).
3. **Bọc `React.memo` cho Custom Cells & Bulk Modals**:
   - Tất cả các cell renderer độc lập (Badge, Attachments, Info cells) và container `InvoiceBulkModals` phải được bọc bằng `React.memo`.

## 14. Chế độ Toàn Màn Hình cho Bảng Dữ Liệu (Table Full Screen Mode)

Nhằm tối ưu hóa trải nghiệm tra cứu, đối soát dữ liệu lớn (bảng có nhiều cột hoặc hàng trăm dòng) và đồng bộ với trải nghiệm của `<DrawerDocumentTraceability>`, Core `DataTable` và `StandardTable` hỗ trợ tính năng **Toàn màn hình (Full Screen Mode)**:

- **Nút Chuyển Đổi (Fullscreen Toggle Button)**:
  - Tự động portal vào thanh công cụ bảng (nằm ngay cạnh nút Tùy chỉnh cột `Settings2` và nút Tải lại `RefreshCcw` trên `TableActionGroup`).
  - **Trạng thái bình thường**: Hiển thị icon `Maximize2` (`<Maximize2 className="h-4 w-4" />`), tooltip `t("table.fullscreen", "Toàn màn hình")`.
  - **Trạng thái toàn màn hình**: Hiển thị icon `Minimize2` (`<Minimize2 className="h-4 w-4 text-primary" />`), tooltip `t("table.exitFullscreen", "Thu nhỏ lại (Esc)")`.
- **Phím tắt `Escape` (`Esc`)**:
  - Khi đang ở chế độ toàn màn hình, người dùng có thể nhấn phím `Esc` bất kỳ lúc nào để ngay lập tức thu nhỏ bảng trở lại layout ban đầu.
- **In-place Placeholder (Khung giữ chỗ tại vị trí cũ)**:
  - Khi bảng được phóng to, tại vị trí ban đầu của trang/drawer sẽ hiển thị một Card giữ chỗ viền nét đứt thanh lịch (`border border-dashed border-border rounded-xl p-6 text-center`) kèm icon `<TableIcon className="w-8 h-8 text-primary animate-pulse" />`, thông báo *"Bảng đang được mở ở chế độ Toàn màn hình."* và nút bấm *"Thu nhỏ lại (Esc)"*.
- **Portal Tràn Viền Full Viewport (`createPortal` ra `document.body`)**:
  - Bảng phóng to tràn viền màn hình (`fixed inset-0 z-[450] bg-surface dark:bg-slate-950 shadow-2xl flex flex-col p-4 sm:p-5 gap-3 animate-in fade-in duration-200`).
  - **Top Fullscreen Header Bar**: Hiển thị icon bảng, tiêu đề chứng từ/bảng (`tableTitle`), Badge tổng số dòng (`total`), và toàn bộ hàng nút hành động/tabs (`fullscreenHeaderExtra` chứa toàn bộ `TableActionGroup`: tabs trạng thái/thuế, dropdown kiểm toán, filter, search, ColumnToggle, Minimize2, Refresh, Sync/Create).
  - Toàn bộ chiều cao màn hình được tận dụng 100% (`flex-1 min-h-0`), sticky header và pagination cuộn mượt mà không bị giới hạn bởi layout cha.

### Kiến trúc Atomic Component (`src/shared/components/DataTable/`):

Core DataTable tuân thủ cấu trúc Atomic Refactor chuẩn:
- `DataTable/types.ts`: Toàn bộ TypeScript interfaces & types.
- `DataTable/utils.ts`: Pure helper functions (`getNestedValue`, `sanitizeActionColumnSizing`).
- `DataTable/hooks/`:
  - `useDataTablePreferences.ts`: Quản lý column visibility, order, sizing, reset layout và đồng bộ store.
  - `useDataTableColumns.tsx`: Xây dựng TanStack ColumnDef, valueType formatters, selection, hover actions.
  - `useDataTableScroll.ts`: Quản lý scroll shadow (isScrolledTop, isScrolledBottom).
  - `useDataTableFullscreen.ts`: Quản lý Fullscreen state, Escape listener, callbacks.
- `DataTable/components/`:
  - `ColumnToggle.tsx`: Popover tùy biến cột với dnd-kit kéo thả & nút Reset.
  - `FullscreenToggle.tsx`: Nút icon Maximize2 / Minimize2.
  - `SelectionCheckboxes.tsx`: Memoized Header & Row selection checkbox.
  - `DataTableRow.tsx`: Memoized DataTableRowMemo & DataTableRowInner.
  - `FullscreenModal.tsx`: Fullscreen Portal Container & in-place placeholder.
- `DataTable/DataTable.tsx`: Main Component gọn gàng kết nối hooks và UI layout.
- `DataTable/index.ts`: Barrel export cho toàn bộ module.
- `src/shared/components/DataTable.tsx`: Re-export wrapper tương thích ngược 100%.

### Hướng dẫn sử dụng:

1. **Trên màn hình Page (`SpreadsheetPageTemplate`)**:
   - Tính năng Toàn màn hình **mặc định đã được bật sẵn (`enableFullscreen = true`)** cho 100% trang sử dụng `SpreadsheetPageTemplate` trên toàn hệ thống.
   - Tiêu đề của trang (`title`) được tự động gắn vào `tableTitle` trên thanh header fullscreen.
   - Toàn bộ thanh công cụ (`TableActionGroup`) tự động đồng bộ lên Top Header Bar khi ở Fullscreen mode và ẩn khỏi layout nền.
   - Nếu có nhu cầu tắt tính năng này cho một trang đặc biệt, chỉ cần truyền `enableFullscreen={false}`.

2. **Trên bảng nhúng trong Drawer / Modal (`DrawerSection` + `StandardTable`)**:
   - Khi nhúng bảng dữ liệu có nhiều cột vào Drawer (ví dụ danh sách dòng hóa đơn, bảng kiểm kê, danh sách phiếu nhập kho), truyền thêm `enableFullscreen={true}`, `tableTitle={t("Danh sách mặt hàng...")}` và `tableId="unique-table-id"` vào `<StandardTable />` để người dùng có thể phóng to toàn màn hình thao tác dễ dàng:
   ```tsx
   <StandardTable
     tableId="drawer-inventory-lines"
     tableTitle={t("Danh sách mặt hàng kiểm kê")}
     enableFullscreen={true}
     columns={columns}
     items={items}
     getRowKey={(r) => r.id}
   />
   ```

## 15. Chế độ Xem Bảng Tùy Biến (View Mode Presets & ViewModeCombobox)

Khi một bảng dữ liệu có nhiều góc nhìn tra cứu (như Hóa đơn điện tử, Phiếu dịch vụ Garage), sử dụng component dùng chung `<ViewModeCombobox>` (`@/shared/components/ViewModeCombobox`) kết hợp với `useUserPreferences` để quản lý các chế độ xem:

- **Component chuẩn dùng chung**: `<ViewModeCombobox presets={presets} activePresetKey={activeKey} onSelect={...} onCreateView={...} onEditView={...} onDeleteView={...} />`.
- **Cơ chế Presets chuẩn**:
  - `overview`: Chế độ xem Tổng quan (mặc định ban đầu).
  - `audit` / `financial_progress`: Chế độ xem Đối soát / Kiểm toán / Tiến độ.
  - Các custom views: Người dùng tự định nghĩa cột hiển thị, thứ tự và độ rộng.
- **Bảo vệ View Mặc định**: Nút Xóa (Trash) chỉ hiển thị cho custom views; các view mặc định hệ thống (`isDefault === true`, `overview`, `audit`) được bảo vệ an toàn, không thể xóa.
- **Đồng bộ 2 chiều**: Toàn bộ danh sách presets và active preset key được tự động lưu vào backend qua `updateUserPreferencesApi` và cache LocalStorage.

---

## Summary Checklist trước khi hoàn thành:

- [ ] **100% Cột đã dùng `createColumnHeaderFilter`** (`headerFilter(...)`, `headerFilter.date(...)`, `headerFilter.amount(...)`, `headerFilter.numeric(...)`) để đảm bảo không bị thiếu sót filter ở bất kỳ cột dữ liệu nào chưa?
- [ ] **Cột Tiền tệ / Số lượng** đã dùng `headerFilter.amount` / `headerFilter.numeric` (hoặc `formatOptionLabel`) để tự động hiển thị số có phân tách hàng nghìn (`10.000.000 đ`, `1,250`) trên dropdown filter checkbox chưa?
- [ ] Cột đầu tiên (STT) rộng đúng `40px`, **BẮT ĐẦU TỪ 1 VÀ CĂN GIỮA TUYỆT ĐỐI CẢ HEADER VÀ CELL** (`header: <span className="w-full block text-center">#</span>`, `headerClassName: "text-center"`, `className: "text-center"`, `cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`) chưa?
- [ ] Phân trang đã hỗ trợ `pageSizeOptions = [20, 50, 100, 200]` và khởi tạo `defaultPageSize` linh hoạt theo chiều cao màn hình (Screen Height `< 900px` -> `20`, `>= 900px` -> `50`) chưa?
- [ ] Mặc định **100% BẢNG ĐÃ ƯU TIÊN SERVER-SIDE SORTING & FILTERING** (dùng `fetchOptions` gọi API `getColumnOptions` backend và TanStack Query) chưa? (Chỉ dùng client-side khi User chỉ định rõ ràng).
- [ ] **React Query & ErpQueryKey Enum**: Đã dùng `useQuery` / `useAppQuery` kết hợp `ErpQueryKey` enum từ `@/shared/lib/queryKeys`, hưởng `staleTime: DEFAULT_STALE_TIME` (90s) và đưa tab param vào `queryKey` để hỗ trợ Zero-latency Tab Switching chưa?
- [ ] TUYỆT ĐỐI không dùng `onRowClick` mở detail, chỉ mở từ `<TableText>` hoặc Floated Action Menu / Right-Click Context Menu (`rowActions`) chưa?
- [ ] TUYỆT ĐỐI không định nghĩa cột action tĩnh thủ công `{ key: "actions" }` trong `columns`, đã truyền prop `rowActions` trên `<SpreadsheetPageTemplate>` hoặc `actions={rowActions}`, `enableRowHoverActions={true}`, `hideLegacyActionColumn={true}` trên `<StandardTable>` chưa?
- [ ] Mảng `rowActions` đã có 2 actions đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — Icon `Eye` 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — Icon `Pencil` ✏️) để map vào 2 nút Quick Actions trên Floated Bar chưa?
- [ ] Bảng đã tự động kích hoạt **Right-Click Context Menu** (`TableRowContextMenu`) qua `rowActions` / `actions` và highlight dòng active chưa?
- [ ] Nút Reset Column đã nằm gọn trong popup menu `ColumnToggle` (`Settings2` → `RotateCcw`), và TUYỆT ĐỐI không đặt ở header cột dữ liệu/Action chưa?
- [ ] Bảng đã có `tableId` duy nhất để tự động lưu & khôi phục column sizing, visibility, order vào App Setting (`core_user_preferences`) & LocalStorage cache chưa?
- [ ] Bảng đã hỗ trợ tính năng **Toàn màn hình (Table Full Screen Mode)** (mặc định bật trên `SpreadsheetPageTemplate` và truyền `enableFullscreen={true}`, `tableTitle` trên các bảng lớn trong Drawer) chưa?
- [ ] `<ActionDropdown>` đã phân nhóm menu bằng `groupLabel` (TRA CỨU, THAO TÁC, ...) chưa?
- [ ] Các cột dữ liệu đã có `enableResizing: true` chưa?
- [ ] Header có `<TableColumnHeaderFilter align="center">` và truyền prop `isActive` chưa?
- [ ] Các cột thường KHÔNG set `hideFilter={true}` để hiện search box & options chưa?
- [ ] Cột ngày tháng (Date) đã dùng `dateRangeSlot` và `hideFilter={true}` chưa?
- [ ] Các cột mã/code (size: 200px) đã dùng `<TableText>` bật `enableCopy`, `tooltip`, dùng `onDetailClick` (Icon con mắt 👁️) cho bản ghi chính hoặc `onDrawerClick` (Icon ngăn kéo 📑) cho dữ liệu phụ và Quick Status Badge (align right `ml-auto`, fixed width, bọc Tooltip & ellipsis) chưa?
- [ ] Cột thời gian có format 2 dòng (Ngày to, Giờ nhỏ xám) chưa?
- [ ] Cột số lượng có class `tabular-nums`, cột tiền tệ có class `font-semibold` chưa?
- [ ] Cột trạng thái (status/state) độc lập có dùng App `<Badge>`/`<StatusBadge>`, fixed width đều nhau, bọc `<Tooltip>` & `truncate` chưa?
- [ ] Các cột số tiền / số lượng có `summaryRow` tổng không?
- [ ] Text đã có namespace i18n (`t(...)`) chưa?
- [ ] Đã bỏ default state `sortBy` ở UI và dùng default sort ở Backend chưa?
- [ ] Container bảng đã có bo góc chuẩn `rounded-xl`, viền `border border-border/60` thanh thoát và TUYỆT ĐỐI KHÔNG bị `rounded-none` chưa?
- [ ] Bảng có sử dụng TableColumnHeaderFilter đã có nút Clear All Filter hiển thị khi có active filter chưa? (Page: `activeFilterCount` + `onClearAllFilters` trên `SpreadsheetPageTemplate`; Drawer: `FilterButton` với `onClear` trong `titleExtra` của `DrawerSection`?)
- [ ] **Lọc Giá trị Rỗng (`showBlankOption`)**: Các cột dữ liệu có khả năng null/rỗng (số hóa đơn liên kết, mã tham chiếu...) đã được kích hoạt `{ showBlankOption: true }` để hiển thị option `(blank)` / `(Trống)` chưa?
- [ ] **Tìm kiếm Nâng cao (`""` và `;`)**: Backend query service đã dùng `applyMultiKeywordFilter` / `applyMultiKeywordMultiFieldFilter` để hỗ trợ tìm chính xác `"..."` và tìm kiếm nhiều từ khóa qua `;` (OR) chưa?
- [ ] **Hiệu năng & Fast Selection**: Đã memoize `columns` độc lập, tránh truyền anonymous function cho `rowHoverActions`, và dùng lazy evaluation cho Popover nặng chưa?

