---
name: standardize-table
description: Create or enhance a DataTable to follow standard UI rules in the ERP project (checkbox/action column, filter/sorting popover, subtotal, i18n, etc.). Use this skill whenever generating or updating tables in pages or drawers.
---

# 📋 DataTable Standards

Khi tạo mới hoặc enhance một `DataTable` trong hệ thống, bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau để đảm bảo UI/UX đồng nhất và chuẩn chỉnh như `erp-invoice` page và `inventory-voucher` drawer.

## 1. Cấu trúc cột (Columns Structure)

- **Cột đầu tiên (First Column)**: Thường là cột **Index (STT)**, **Checkbox** hoặc **Action** (nếu có action theo dòng), với `width: 40px`.
  - Cần set `size: 40`, `headerClassName: "text-center w-[40px] min-w-[40px]"`, `className: "text-center w-[40px] min-w-[40px]"`.
  - **Lưu ý với cột Index (STT)**: Khi dùng cell renderer mặc định của framework, CHỈ SỬ DỤNG `{idx}` (VD: `cell: (_, idx) => <span>{idx}</span>`), **KHÔNG CỘNG THÊM 1** (`idx + 1`). Lý do: Core `DataTable` đã tự động xử lý pagination offset và trả về `idx` hệ 1-based.
- **Enable Resizing**: Luôn bật tính năng resize cho các cột dữ liệu bằng cách thêm `enableResizing: true` vào config của từng cột.
- **Đa ngôn ngữ (i18n)**: Tất cả các text trong table (header, empty state, action tooltip...) phải được bọc trong hàm `t` từ `useTranslation("namespace")`. KHÔNG hardcode tiếng Việt/Anh trực tiếp mà không qua hook translation.

## 2. Table Header Filter & Sorting Popover

Tất cả các cột dữ liệu (trừ cột Action, Index, Checkbox) **phải sử dụng component `<TableColumnHeaderFilter>`** (`@/shared/components/DataTable/TableColumnHeaderFilter`) cho header để tích hợp sẵn Filter và Sorting.

- Cần truyền thêm prop `align="center"` cho `<TableColumnHeaderFilter>` để header luôn được canh giữa một cách chuẩn xác.
- **Cột thường**: TUYỆT ĐỐI KHÔNG set `hideFilter: true` (hoặc `hideFilter={true}`), để đảm bảo user luôn nhìn thấy search box và danh sách checkbox options (column options) trong popover. Kể cả khi hook filter hiện tại chưa hỗ trợ cột đó, bạn phải chủ động update hook (ví dụ: làm cho `useVoucherClientFilter` trở nên dynamic để support mọi trường) chứ **KHÔNG ĐƯỢC LÁCH LUẬT** bằng cách ẩn filter.
- **2 Cơ Chế Nạp Filter Options**:
  1. **Server-Side Infinite Scroll (`fetchOptions`)** (Ưu tiên cho Page): Truyền `columnKey`, `queryKeyPrefix`, `allFilters={listHook.columnFilters}`, và hàm `fetchOptions` gọi API `getColumnOptions` của backend. Popover sẽ tự động phân trang infinite scroll khi cuộn danh sách options và hỗ trợ cascading filter từ server.
  2. **Client-Side Computed (`filterOptions`)** (Ưu tiên cho Drawer / local table): Truyền mảng `filterOptions={options}` đã được tính toán cascading từ dữ liệu hiện hành.
- **Định dạng nhãn tùy chọn (`formatOptionLabel`)**: Khi giá trị lưu trữ là ID (vd: `branchId`, `partnerId`) hoặc mã enum, sử dụng prop `formatOptionLabel={(val) => mapLabel(val)}` để hiển thị tên thân thiện trên dropdown checkbox.
- **Xử lý giá trị Trống / Null (`showBlankOption`)**: Với các cột có thể chứa giá trị null/rỗng (vd: Chi nhánh, Biển số xe, Ghi chú), thêm `showBlankOption={true}` để cho phép người dùng lọc các dòng mang giá trị `(Trống)`.
- **Cột Ngày Tháng (Date)**: Phải sử dụng `dateRangeSlot` (sử dụng component `<DateRangeColumnSlot>` trong `@/shared/components/DataTable/DateRangeColumnSlot`) để hiển thị bộ chọn khoảng ngày + presets (Hôm nay, Tháng này, Năm nay, Theo quý...), đồng thời set `hideFilter={true}` cùng `hideFooter={true}` để ẩn list checkbox mặc định.
- **Clear All Filters Button**: Khi bảng có sử dụng TableColumnHeaderFilter, bắt buộc phải bổ sung thêm nút xóa lọc (`FilterButton` từ `@/shared/components/FilterPanel` hoặc Button Reset Filter) hiển thị cạnh tiêu đề bảng nếu `activeFilterCount > 0`. Đối với bảng trong `DrawerSection`, BẮT BUỘC đặt vào prop `titleExtra` của `DrawerSection`.
- **Cascading Filter Options (Lọc phụ thuộc)**: Đối với các bảng có filter ở client-side, dữ liệu tùy chọn (filter options) của một cột **BẮT BUỘC** phải được tính toán dựa trên danh sách dữ liệu đã bị filter bởi **TẤT CẢ CÁC CỘT KHÁC**.
- **Nút Hành Động (Table Action Buttons)**: Đối với các bảng nằm trong `DrawerSection`, các nút thao tác chung của bảng như "Thêm dòng" (`+ Thêm dòng`), "Bộ lọc", "Nhập từ Excel"... BẮT BUỘC phải truyền vào prop `titleExtra` của `DrawerSection`.

### Client-side vs Server-side Logic

- **Trong Page**: Filter và Sorting thực hiện ở **Server-side** thông qua query params hoặc hook call API (như `useErpInvoicesList`). Dùng `fetchOptions` cho popover options.
- **Trong Drawer**: Filter và Sorting thực hiện ở **Client-side** (trừ trường hợp dataset quá lớn). Dùng `filterOptions` dạng computed.
  - **Lưu ý quan trọng**: Khi filter/sort ở client-side bằng hook `useMemo`, **bắt buộc** phải truyền đủ các object filter vào array dependencies (VD: `tableState.columnFilters`, `tableState.sorts`, `tableState.columnSearch`), nếu không UI sẽ không update khi user chọn filter.

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

## 3. Row Click, View Detail & Action Menu

- **Tuyệt đối KHÔNG sử dụng `onRowClick`** để mở trang / ngăn kéo chi tiết (detail drawer).
- Chỉ có 2 cách hợp lệ để xem chi tiết một bản ghi (View Detail):
  1. Click vào biểu tượng icon detail nằm trong `<TableText>` (xem phần Mã Code/SKU bên dưới).
  2. Click vào tùy chọn **"Chi tiết"** trong Action Menu của hàng.
- **Action Menu (Cột Thao Tác)**: Bắt buộc sử dụng component `<ActionDropdown>` (`@/shared/components/ActionDropdown`).
  - Các thao tác bên trong phải được **phân nhóm logic (Group)** rõ ràng bằng thuộc tính `groupLabel`.
  - Ví dụ nhóm "TRA CỨU" (Chi tiết, Tải XML, In), nhóm "THAO TÁC" (Sửa, Xóa, Đồng bộ).

**Mẫu code `<ActionDropdown>`**:

```tsx
<ActionDropdown
  items={[
    {
      groupLabel: "TRA CỨU",
      items: [
        { label: "Chi tiết", icon: <Eye />, onClick: () => openDetail(row.id) },
        {
          label: "Tải XML",
          icon: <Download />,
          onClick: () => downloadXML(row.id),
        },
      ],
    },
    {
      groupLabel: "THAO TÁC",
      items: [
        {
          label: "Đồng bộ lại từ XML",
          icon: <RefreshCw />,
          onClick: () => syncXML(row.id),
        },
      ],
    },
  ]}
/>
```

## 4. Cột Text đặc thù (Mã Code / Số Phiếu)

Cột liên quan tới mã hệ thống, số phiếu (voucher code, item code) bắt buộc sử dụng component `<TableText>` để có tính năng copy, tooltip khi bị dài (ellipsis) và click để mở detail drawer:

- **Chiều rộng**: Bắt buộc set `size: 200` và `enableResizing: true`.
- **Quick Status Badge**: Nếu dòng dữ liệu đang ở trạng thái **Nháp (Draft)** hoặc **Hủy (Canceled/Voided)**, phải hiển thị thêm một Badge nhỏ nhắn.
  - **Align Right**: Badge trạng thái **BẮT BUỘC** phải được căn sát mép phải của cell (sử dụng class `ml-auto flex-shrink-0`), trong khi mã code và icon drawer/copy nằm bên trái.
  - **Fixed Width đồng đều**: Thiết lập chiều rộng cố định cho badge (ví dụ: `w-[50px] inline-flex items-center justify-center text-center truncate`) để badge ở các dòng luôn bằng nhau và thẳng hàng.
  - **Sử dụng App Badge**: Bắt buộc dùng component `Badge` từ `@/shared/components/ui/badge`.
  - **Tooltip & Ellipsis**: Bọc Badge trong `<Tooltip>` và có `truncate` phòng trường hợp text trạng thái bị dài hoặc đa ngôn ngữ.

**Mẫu code cho cột Code/SKU**:

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
        onDrawerClick={(e) => {
          e.stopPropagation();
          openDetailDrawer(row.id); // Cách 1 mở Detail
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
- Style bảng dạng Excel (nếu cần edit): `variant="spreadsheet"`.

## 10. Default Sort (Sắp xếp mặc định)

- UI **KHÔNG ĐƯỢC** set state `sortBy` mặc định (vd: `const [sortBy, setSortBy] = useState<string | undefined>(undefined);`) nếu muốn bảng sắp xếp mặc định theo ngày tạo/ngày chứng từ.
- Backend **PHẢI** tự động apply sort mặc định (thường là `createdAt` DESC hoặc theo ngày chứng từ) khi UI truyền lên `sort` rỗng. Việc này đảm bảo khi vừa vào trang, bảng dữ liệu đã được sort mới nhất lên đầu nhưng trên Header UI không bị khoá cứng icon "đang sort" tại bất kỳ cột nào cho đến khi User click.

## Summary Checklist trước khi hoàn thành:

- [ ] TUYỆT ĐỐI không dùng `onRowClick` mở detail, chỉ mở từ `<TableText>` hoặc `ActionDropdown` chưa?
- [ ] `<ActionDropdown>` đã phân nhóm menu bằng `groupLabel` (TRA CỨU, THAO TÁC, ...) chưa?
- [ ] Các cột dữ liệu đã có `enableResizing: true` chưa?
- [ ] Cột đầu tiên (STT/Checkbox/Action) rộng đúng `40px` chưa? (STT dùng `{idx}` thay vì `idx + 1` chưa?)
- [ ] Header có `<TableColumnHeaderFilter align="center">` và truyền prop `isActive` chưa?
- [ ] Các cột thường KHÔNG set `hideFilter={true}` để hiện search box & options chưa?
- [ ] Cột ngày tháng (Date) đã dùng `dateRangeSlot` và `hideFilter={true}` chưa?
- [ ] Drawer thì client-side filter, Page thì server-side chưa? Nếu client-side filter thì `useMemo` đã có đủ dependency chưa?
- [ ] Các cột mã/code (size: 200px) đã dùng `<TableText>` bật `enableCopy`, `tooltip`, `onDrawerClick` và Quick Status Badge (align right `ml-auto`, fixed width, bọc Tooltip & ellipsis) chưa?
- [ ] Cột thời gian có format 2 dòng (Ngày to, Giờ nhỏ xám) chưa?
- [ ] Cột số lượng có class `tabular-nums`, cột tiền tệ có class `font-semibold` chưa?
- [ ] Cột trạng thái (status/state) độc lập có dùng App `<Badge>`/`<StatusBadge>`, fixed width đều nhau, bọc `<Tooltip>` & `truncate` chưa?
- [ ] Các cột số tiền / số lượng có `summaryRow` tổng không?
- [ ] Text đã có namespace i18n (`t(...)`) chưa?
- [ ] Đã bỏ default state `sortBy` ở UI và dùng default sort ở Backend chưa?
