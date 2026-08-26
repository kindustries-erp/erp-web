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

Khi tạo mới hoặc enhance một `DataTable` trong hệ thống, bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau để đảm bảo UI/UX đồng nhất và chuẩn chỉnh như `erp-invoice` page và `inventory-voucher` drawer.

## 1. Cấu trúc cột (Columns Structure)

- **Cột đầu tiên (First Column) — Cột Index (STT) hoặc Checkbox**: Bắt buộc rộng `40px` và **CĂN GIỮA TUYỆT ĐỐI (Align Center cả Header lẫn Cell)**.
  - Cần set `size: 40`, `headerClassName: "text-center w-[40px] min-w-[40px]"`, `className: "text-center w-[40px] min-w-[40px]"`, `enableResizing: false`.
  - **Căn giữa Header STT**: Header bắt buộc phải căn giữa hoàn toàn bằng cách wrap trong span block: `header: <span className="w-full block text-center">#</span>` kết hợp `headerClassName: "text-center"`.
  - **Căn giữa Cell STT**: Cell bắt buộc căn giữa hoàn toàn: `cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`.
  - **Lưu ý với cột Index (STT)**: Khi dùng cell renderer mặc định của framework, CHỈ SỬ DỤNG `{idx}`, **KHÔNG CỘNG THÊM 1** (`idx + 1`). Lý do: Core `DataTable` đã tự động xử lý pagination offset và trả về `idx` hệ 1-based.
  - **TUYỆT ĐỐI KHÔNG** định nghĩa cột Action tĩnh thủ công `{ key: "actions", ... }` trong mảng `columns`. Tất cả các thao tác theo dòng phải được quản lý qua prop `rowActions` (Floated Action Menu & Right-Click Context Menu).
- **Enable Resizing**: Luôn bật tính năng resize cho các cột dữ liệu bằng cách thêm `enableResizing: true` vào config của từng cột.
- **Đa ngôn ngữ (i18n)**: Tất cả các text trong table (header, empty state, action tooltip...) phải được bọc trong hàm `t` từ `useTranslation("namespace")`. KHÔNG hardcode tiếng Việt/Anh trực tiếp mà không qua hook translation.

## 2. Table Header Filter & Sorting Popover

Tất cả các cột dữ liệu (trừ cột Action, Index, Checkbox) **phải sử dụng component `<TableColumnHeaderFilter>`** (`@/shared/components/DataTable/TableColumnHeaderFilter`) cho header để tích hợp sẵn Filter và Sorting.

- Cần truyền thêm prop `align="center"` cho `<TableColumnHeaderFilter>` để header luôn được canh giữa một cách chuẩn xác.
- **Cột thường**: TUYỆT ĐỐI KHÔNG set `hideFilter: true` (hoặc `hideFilter={true}`), để đảm bảo user luôn nhìn thấy search box và danh sách checkbox options (column options) trong popover. Kể cả khi hook filter hiện tại chưa hỗ trợ cột đó, bạn phải chủ động update hook/API chứ **KHÔNG ĐƯỢC LÁCH LUẬT** bằng cách ẩn filter.
- **NGUYÊN TẮC: LUÔN ƯU TIÊN SERVER-SIDE SORTING & FILTERING**:
  - Mọi bảng trong hệ thống (cả màn hình Page lẫn Drawer/Modal) **MẶC ĐỊNH BẮT BUỘC** phải ưu tiên triển khai **Server-side Filter & Sort** qua API backend (hook TanStack Query + API `getColumnOptions`).
  - **CHỈ chuyển sang Client-side khi và chỉ khi có yêu cầu cụ thể từ User** (hoặc khi xử lý bảng dữ liệu nháp/tạm thời ở local client chưa lưu DB).
- **2 Cơ Chế Nạp Filter Options**:
  1. **Server-Side Infinite Scroll (`fetchOptions`) — MẶC ĐỊNH ƯU TIÊN**: Truyền `columnKey`, `queryKeyPrefix`, `allFilters={listHook.columnFilters}`, và hàm `fetchOptions` gọi API `getColumnOptions` của backend (`itemsApi.getColumnOptions(columnKey, search, pageParam, 20, filtersStr)`). Popover sẽ tự động phân trang infinite scroll khi cuộn danh sách options và hỗ trợ cascading filter từ server.
  2. **Client-Side Computed (`filterOptions`) — Chỉ dùng khi có yêu cầu cụ thể**: Truyền mảng `filterOptions={options}` đã được tính toán cascading từ dữ liệu hiện hành.
- **Định dạng nhãn tùy chọn (`formatOptionLabel`)**: Khi giá trị lưu trữ là ID (vd: `branchId`, `partnerId`) hoặc mã enum, sử dụng prop `formatOptionLabel={(val) => mapLabel(val)}` để hiển thị tên thân thiện trên dropdown checkbox.
- **Xử lý giá trị Trống / Null (`showBlankOption`)**: Với các cột có thể chứa giá trị null/rỗng (vd: Chi nhánh, Biển số xe, Ghi chú), thêm `showBlankOption={true}` để cho phép người dùng lọc các dòng mang giá trị `(Trống)`.
- **Cột Ngày Tháng (Date)**: Phải sử dụng `dateRangeSlot` (sử dụng component `<DateRangeColumnSlot>` trong `@/shared/components/DataTable/DateRangeColumnSlot`) để hiển thị bộ chọn khoảng ngày + presets (Hôm nay, Tháng này, Năm nay, Theo quý...), đồng thời set `hideFilter={true}` cùng `hideFooter={true}` để ẩn list checkbox mặc định.
- **Clear All Filters Button**: Khi bảng có sử dụng TableColumnHeaderFilter, bắt buộc phải bổ sung thêm nút xóa lọc (`FilterButton` từ `@/shared/components/FilterPanel` hoặc Button Reset Filter) hiển thị cạnh tiêu đề bảng nếu `activeFilterCount > 0`. Đối với bảng trong `DrawerSection`, BẮT BUỘC đặt vào prop `titleExtra` của `DrawerSection`.
- **Cascading Filter Options (Lọc phụ thuộc)**: Dữ liệu tùy chọn (filter options) của một cột **BẮT BUỘC** phải được tính toán dựa trên danh sách dữ liệu đã bị filter bởi **TẤT CẢ CÁC CỘT KHÁC**.
- **Nút Hành Động (Table Action Buttons)**: Đối với các bảng nằm trong `DrawerSection`, các nút thao tác chung của bảng như "Thêm dòng" (`+ Thêm dòng`), "Bộ lọc", "Nhập từ Excel"... BẮT BUỘC phải truyền vào prop `titleExtra` của `DrawerSection`.

### Nguyên tắc Server-side vs Client-side Logic

- **Mặc định toàn hệ thống**: Filter và Sorting thực hiện ở **Server-side** thông qua query params hoặc hook call API (như `useErpInvoicesList`). Dùng `fetchOptions` cho popover options.
- **Khi nào dùng Client-side**: Chỉ khi User chỉ định rõ ràng hoặc bảng local form data chưa lưu server.
  - **Lưu ý quan trọng khi dùng Client-side**: Khi filter/sort ở client-side bằng hook `useMemo`, **bắt buộc** phải truyền đủ các object filter vào array dependencies (VD: `tableState.columnFilters`, `tableState.sorts`, `tableState.columnSearch`), nếu không UI sẽ không update khi user chọn filter.

---

### Mẫu code cho `<TableColumnHeaderFilter>`:

#### 1. Cột Server-side dùng `fetchOptions` (Chuẩn cho Page):
```tsx
header: (
  <TableColumnHeaderFilter
    title={t("Mã linh kiện", "Item Code")}
    columnKey="itemCode"
    queryKeyPrefix="items-column-options"
    allFilters={listHook.columnFilters}
    fetchOptions={({ columnKey, search, pageParam, filtersStr }) =>
      itemsApi.getColumnOptions(columnKey, search, pageParam, 20, filtersStr)
    }
    sortState={
      listHook.sorts.includes("itemCode")
        ? "asc"
        : listHook.sorts.includes("-itemCode")
          ? "desc"
          : "none"
    }
    onSortChange={(state) => listHook.setSort("itemCode", state)}
    searchValue={listHook.columnSearch["itemCode"] || ""}
    onSearchChange={(val) => listHook.setColumnSearch("itemCode", val)}
    selectedFilters={listHook.columnFilters["itemCode"] || []}
    onFilterChange={(vals) => listHook.setColumnFilter("itemCode", vals)}
    isActive={!!listHook.columnFilters["itemCode"]?.length}
    align="center"
  />
)
```

#### 2. Cột Ngày Tháng dùng `<DateRangeColumnSlot>`:
```tsx
header: (
  <TableColumnHeaderFilter
    title={t("Ngày chứng từ", "Voucher Date")}
    sortState={
      listHook.sorts.includes("voucherDate")
        ? "asc"
        : listHook.sorts.includes("-voucherDate")
          ? "desc"
          : "none"
    }
    onSortChange={(state) => listHook.setSort("voucherDate", state)}
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
        onChange={(from, to) => {
          listHook.setDateRange(from, to);
        }}
        onClose={close}
      />
    )}
  />
)
```

#### 3. Cột Client-side dùng `filterOptions` (Chuẩn cho Drawer):
```tsx
header: (
  <TableColumnHeaderFilter
    title={t("Trạng thái", "Status")}
    sortState={clientSortState}
    onSortChange={(s) => setClientSort("status", s)}
    filterOptions={computedStatusOptions}
    selectedFilters={clientFilters["status"] || []}
    onFilterChange={(vals) => setClientFilter("status", vals)}
    searchValue={clientSearch["status"] || ""}
    onSearchChange={(val) => setClientSearch("status", val)}
    isActive={!!clientFilters["status"]?.length}
    align="center"
  />
)
```

#### 4. Mẫu code Nút Clear All Filters (Chuẩn Page & Drawer):

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

## 8. Subtotal Row (Dòng tổng cộng)

Đối với các bảng có cột mang giá trị số, **bắt buộc phải có dòng `summaryRow`** ở cuối để hiển thị tổng.

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

## Summary Checklist trước khi hoàn thành:

- [ ] Cột đầu tiên (STT) rộng đúng `40px`, **BẮT ĐẦU TỪ 1 VÀ CĂN GIỮA TUYỆT ĐỐI CẢ HEADER VÀ CELL** (`header: <span className="w-full block text-center">#</span>`, `headerClassName: "text-center"`, `className: "text-center"`, `cell: (_, idx) => <span className="w-full block text-center">{idx}</span>`) chưa?
- [ ] Phân trang đã hỗ trợ `pageSizeOptions = [20, 50, 100, 200]` và khởi tạo `defaultPageSize` linh hoạt theo chiều cao màn hình (Screen Height `< 900px` -> `20`, `>= 900px` -> `50`) chưa?
- [ ] Mặc định **100% BẢNG ĐÃ ƯU TIÊN SERVER-SIDE SORTING & FILTERING** (dùng `fetchOptions` gọi API `getColumnOptions` backend và TanStack Query) chưa? (Chỉ dùng client-side khi User chỉ định rõ ràng).
- [ ] TUYỆT ĐỐI không dùng `onRowClick` mở detail, chỉ mở từ `<TableText>` hoặc Floated Action Menu / Right-Click Context Menu (`rowActions`) chưa?
- [ ] TUYỆT ĐỐI không định nghĩa cột action tĩnh thủ công `{ key: "actions" }` trong `columns`, đã truyền prop `rowActions` chưa?
- [ ] Mảng `rowActions` đã có 2 actions đầu tiên là **Xem chi tiết** (`openDetail(id, "view")` — Icon `Eye` 👁️) và **Chỉnh sửa** (`openDetail(id, "edit")` — Icon `Pencil` ✏️) để map vào 2 nút Quick Actions trên Floated Bar chưa?
- [ ] Bảng đã tự động kích hoạt **Right-Click Context Menu** (`TableRowContextMenu`) qua `rowActions` / `actions` và highlight dòng active chưa?
- [ ] Nút Reset Column đã nằm gọn trong popup menu `ColumnToggle` (`Settings2` → `RotateCcw`), và TUYỆT ĐỐI không đặt ở header cột dữ liệu/Action chưa?
- [ ] Bảng đã có `tableId` duy nhất để tự động lưu & khôi phục column sizing, visibility, order vào App Setting (`core_user_preferences`) & LocalStorage cache chưa?
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
- [ ] Bảng có sử dụng TableColumnHeaderFilter đã có nút Clear All Filter hiển thị khi có active filter chưa? (Page: `activeFilterCount` + `onClearAllFilters` trên `SpreadsheetPageTemplate`; Drawer: `FilterButton` với `onClear` trong `titleExtra` của `DrawerSection`?)
- [ ] **Hiệu năng & Fast Selection**: Đã memoize `columns` độc lập, tránh truyền anonymous function cho `rowHoverActions`, và dùng lazy evaluation cho Popover nặng chưa?
