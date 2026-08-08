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

Tất cả các cột dữ liệu (trừ cột Action, Index, Checkbox) **phải sử dụng component `<TableColumnHeaderFilter>`** cho header để tích hợp sẵn Filter và Sorting.

- Cần truyền thêm prop `align="center"` cho `<TableColumnHeaderFilter>` để header luôn được canh giữa một cách chuẩn xác.
- **Cột thường**: TUYỆT ĐỐI KHÔNG set `hideFilter: true` (hoặc `hideFilter={true}`), để đảm bảo user luôn nhìn thấy search box và danh sách checkbox options (column options) trong popover.
- **Cột Ngày Tháng (Date)**: Phải sử dụng `dateRangeSlot` (sử dụng component `DateRangeColumnSlot` trong `@/shared/components/DataTable/DateRangeColumnSlot`) để hiển thị bộ lọc Date Range, và set `hideFilter={true}` cùng `hideFooter={true}` để ẩn list checkbox mặc định.
- **Cascading Filter Options (Lọc phụ thuộc)**: Đối với các bảng có filter ở client-side, dữ liệu tùy chọn (filter options) của một cột **BẮT BUỘC** phải được tính toán dựa trên danh sách dữ liệu đã bị filter bởi **TẤT CẢ CÁC CỘT KHÁC**. Nghĩa là khi user chọn filter ở một cột A (ví dụ Mã linh kiện), thì filter options ở cột B (ví dụ Tên linh kiện) chỉ được hiển thị các giá trị tương ứng còn lại trong bảng.

### Client-side vs Server-side Logic

- **Trong Page**: Filter và Sorting thường thực hiện ở **Server-side** thông qua query params hoặc hook call API (như `useErpInvoicesList`).
- **Trong Drawer**: Filter và Sorting thường thực hiện ở **Client-side** (trừ trường hợp dataset quá lớn cần paginate từ server).
  - **Lưu ý quan trọng**: Khi filter/sort ở client-side bằng hook `useMemo`, **bắt buộc** phải truyền đủ các object filter vào array dependencies (VD: `tableState.columnFilters`, `tableState.sorts`, `tableState.columnSearch`), nếu không UI sẽ không update khi user chọn filter.

**Mẫu code cho `<TableColumnHeaderFilter>`**:

```tsx
header: <TableColumnHeaderFilter
  title={t("Mã linh kiện", "Item Code")}
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
/>;
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
- **Quick Status Badge**: Nếu dòng dữ liệu đang ở trạng thái **Nháp (Draft)** hoặc **Hủy (Canceled/Voided)**, phải hiển thị thêm một Badge nhỏ nhắn ngay cạnh mã code để user nhận diện nhanh.

**Mẫu code cho cột Code/SKU**:

```tsx
{
  key: "code",
  size: 200,
  enableResizing: true,
  // ... header config ...
  cell: (row) => (
    <div className="flex items-center gap-2 w-full">
      <TableText
        text={row.code}
        enableCopy={true}
        tooltip={true} // Bật tính năng tooltip & ellipsis (truncate) nếu text quá dài
        onDrawerClick={(e) => {
          e.stopPropagation();
          openDetailDrawer(row.id); // Cách 1 mở Detail
        }}
      />
      {row.status === "DRAFT" && (
        <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 flex-shrink-0">
          {t("Nháp", "Draft")}
        </Badge>
      )}
      {row.status === "CANCELED" && (
        <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4 flex-shrink-0">
          {t("Hủy", "Canceled")}
        </Badge>
      )}
    </div>
  )
}
```

## 5. Cột Thời Gian (Ngày + Giờ)

Nếu cột thời gian bao gồm cả ngày tháng năm và thời gian, **bắt buộc** format làm 2 dòng với font style chuẩn như trong `erp-inventory-vouchers`:

**Mẫu code cho cột Date/Time**:

```tsx
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";

cell: (row) => <TableDateCell date={row.createdAt} />;
```

## 6. Cột Số và Tiền Tệ (Numbers & Currencies)

- **Cột Số lượng (Quantity, Xuất/Nhập)**:
  - Cần style dạng tabular (đều khoảng cách số) giống trong `erp-inventory-stock`.
  - Column config: `className: "text-right"`.
  - Cell render: `<span className="inline-block w-full text-right text-sm tabular-nums">{formatQty(row.qty)}</span>`

- **Cột Tiền tệ (Thành tiền, Amount)**:
  - Cần style in đậm làm nổi bật giống trong `erp-invoice`.
  - Column config: `className: "text-right font-semibold"`.
  - Cell render: Chứa string đã format tiền, VD: `fmtAmt(row.totalAmount)` (có kèm "đ").

## 7. Cột Trạng Thái (Status/State)

Bất kỳ cột nào liên quan đến **Status**, **State** thì bắt buộc phải dùng **Badge component** có sẵn trong app (`@/shared/components/ui/badge`).
Nếu màu sắc / variant chưa có sẵn, hãy thêm các class custom (hoặc tạo variant mới trong theme) thay vì viết thẻ div / span thủ công.

**Mẫu code cho Badge**:

```tsx
cell: (row) => (
  <Badge variant={row.status === "DONE" ? "default" : "secondary"}>
    {t(row.status)}
  </Badge>
);
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
- [ ] Các cột mã/code (size: 200px) đã dùng `<TableText>` bật `enableCopy`, `tooltip`, `onDrawerClick` và Badge status (nếu Nháp/Hủy) chưa?
- [ ] Cột thời gian có format 2 dòng (Ngày to, Giờ nhỏ xám) chưa?
- [ ] Cột số lượng có class `tabular-nums`, cột tiền tệ có class `font-semibold` chưa?
- [ ] Cột trạng thái (status/state) độc lập có dùng `<Badge>` không?
- [ ] Các cột số tiền / số lượng có `summaryRow` tổng không?
- [ ] Text đã có namespace i18n (`t(...)`) chưa?
- [ ] Đã bỏ default state `sortBy` ở UI và dùng default sort ở Backend chưa?
