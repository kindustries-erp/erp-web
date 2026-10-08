---
name: v2-table
description: Module tri thức Bảng dữ liệu chuẩn V2 (V2StandardTable) trong erp-web (src/v2/shared/components/organisms/v2-standard-table cùng atom v2-page-button, v2-table-date-cell, molecule v2-table-pagination, v2-column-toggle, v2-column-header-filter, v2-table-row-actions, v2-table-text và template v2-spreadsheet-page-template). Chứa cây thư mục, props, hai chế độ server/client, header filter, lưu cấu hình cột, quy tắc UI bắt buộc và checklist khi dùng cho trang mới.
---

# Module Tri Thức: Bảng Chuẩn V2 (`V2StandardTable`) - `erp-web`

Bản V2 của bảng chuẩn trong skill `standardize_table`, **khớp `variant="spreadsheet"` của V1** và viết lại theo kiến trúc V2: mọi file < 180 LoC, không `blue-*`, 100% i18n VI/EN (`v2.table.*`), platform split desktop/mobile, test co-located, stories. **Không import `@/shared/*` của V1**; chỉ dùng `@/core/config/appStore` (qua `useV2Translation`).

## 1. Cây file (đúng 5 tầng, import một chiều)

```
src/v2/shared/
├── ui/{table,checkbox,input}/            Primitive shadcn (folder-per-component)
├── types/v2-table.ts                     Enums, V2TableQuery, V2FetchOptions, V2RowAction(Group), hằng số
├── utils/v2TableFormat.ts                getDefaultPageSize, normalizePageSize, formatCompositeFilterValue, format số/tiền
├── locales/{vi,en}.table.ts              Nhóm key v2.table.* (gắn vào vi.ts / en.ts)
└── components/
    ├── atoms/
    │   ├── v2-page-button/               Nút số trang 28px, active = primary, aria-current
    │   └── v2-table-date-cell/           Ngày + giờ 2 dòng (thuần hiển thị)
    ├── molecules/
    │   ├── v2-table-pagination/          Kiểu V1: "Hiển thị [n▾] hàng/trang", a–b / total, ‹ 1 … 5 … N ›
    │   ├── v2-column-toggle/             Ẩn/hiện, kéo thả (@dnd-kit, có bàn phím), Khôi phục
    │   ├── v2-column-header-filter/      Trigger + popup kiểu V1; .options (thuần), .operator, .date-slot, .panel, .hook
    │   ├── v2-table-row-actions/         Hover pill + menu chuột phải + V2RowActionList dùng chung
    │   └── v2-table-text/                V2TableText (copy, tooltip, detail/drawer)
    ├── organisms/v2-standard-table/
    │   V2StandardTable.tsx               Switcher theo useViewport
    │   .desktop.tsx / .mobile.tsx        Bảng spreadsheet / danh sách card
    │   .controller.hook.ts               State + view + selection dùng chung hai bản
    │   .state.hook.ts / .preferences.hook.ts / .view.hook.ts / .scroll.hook.ts / .menu.hook.ts
    │   .options.hook.ts + .filter.hook.ts  Truy vấn options (React Query) cho cột đang mở popup
    │   .hook.tsx                         useV2TableColumns (STT, cột chọn, cột dữ liệu TanStack)
    │   v2TableFilter / v2TableEvaluate / v2TableClient / v2TableData / v2TableQuery / v2ColumnPreferences
    │   v2HeaderFilterBuilder.ts          headerFilter(label), .date, .amount, .qty, .select
    │   .mock.tsx / .mock-server.ts / .stories.tsx / .variants.stories.tsx
    └── templates/v2-spreadsheet-page-template/   Header (icon, tiêu đề, mô tả, tab, actions) + vùng bảng full-height
```

Quy tắc tầng đã áp dụng (theo `ui-atomic-refactor`):
- Molecule **không import molecule khác**: popup dùng primitive `shared/ui` (`Popover`) và `V2Button` (atom) thay vì `V2Popover`/`V2Dropdown`.
- Molecule **0% API**: `V2ColumnHeaderFilter` nhận `optionsState` qua props; hook React Query nằm ở organism (`V2StandardTable.options.hook.ts`) và chỉ truy vấn cột đang mở popup.
- Không dùng `<button>` thuần trong code bảng: dùng `V2Button`.
- Hook/logic chỉ organism dùng nằm cạnh organism; chỉ enums/types và `v2TableFormat` ở `shared/`.

## 2. Cách dùng

```tsx
const columns = useMemo<V2Column<Order>[]>(() => [
  { key: "code", ...headerFilter("Mã", { showBlankOption: true }), size: 190,
    cell: (row) => <V2TableText text={row.code} enableCopy onDetailClick={() => open(row)} /> },
  { key: "status", ...headerFilter.select("Trạng thái", STATUS_OPTIONS), align: TableColumnAlign.CENTER, cell: ... },
  { key: "amount", ...headerFilter.amount("Thành tiền"), align: TableColumnAlign.RIGHT, cell: ... },
  { key: "createdAt", ...headerFilter.date("Ngày tạo"), align: TableColumnAlign.RIGHT,
    cell: (row) => <V2TableDateCell date={row.createdAt} /> },
], []);

<V2StandardTable
  tableId="orders-list"                     // bắt buộc, duy nhất: khóa lưu cấu hình cột
  columns={columns} items={data.items} total={data.total} loading={isFetching}
  getRowKey={(row) => row.id}
  fetchOptions={getColumnOptions}           // server mode: trả { items, total, next }
  initialQuery={initialQuery}               // createInitialQuery() (chỉ đọc lúc mount)
  onQueryChange={setQuery}                  // page/pageSize/sorts/columnFilters/columnSearch/columnOperators/dateRanges
  rowActions={rowActions}                   // useCallback; nhóm TRA CỨU rồi THAO TÁC
  className="min-h-0 flex-1"
/>
```

- Bảng **không tự fetch**: consumer dùng `useQuery` với `queryKey` chứa `query` (và `placeholderData: keepPreviousData`).
- `mode="client"`: truyền toàn bộ `items`, bảng tự lọc, sắp xếp, phân trang (`total` bị bỏ qua). Options header lấy từ chính dữ liệu.
- `headerFilter.select(label, options)`: danh sách option tĩnh (enum), không gọi `fetchOptions`.
- Cột không có `filter` thì không có popover lọc/sắp xếp và không tham gia lọc client.
- Đặt bảng trong `V2SpreadsheetPageTemplate` (title, tabs, actions) để trang có khung full-height và sticky header hoạt động.

## 3. Quy tắc cố định (giữ khi sửa)

**Giao diện spreadsheet (đã đo trên Storybook, khớp V1):**
- `<table>`: `table-fixed border-collapse border-spacing-0 text-xs`; kẻ ô dọc `border-r border-border` ở **mọi** `th`/`td`.
- Header: thead dính (`sticky top-0 z-20`) nền kính mờ `--table-header-bg` + `blur(16px) saturate(200%)`, hàng `h-8` (32px), chữ `text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-fg`.
- Dòng thân: `h-[38px]`, `border-b border-[var(--border-light)]`, hover `bg-surface-hover`, chọn `bg-muted`, menu chuột phải `bg-primary/[0.04]`.
- Khung: `rounded-xl border border-border/60 bg-surface overflow-auto` kèm bóng cuộn trên/dưới (`useV2TableScroll`). **Không bọc thêm border ngoài bảng.**
- Cột STT `__index` và cột chọn `__selection` rộng 40px, không resize; STT **bắt đầu từ 1 trên mọi trang**.
- Cột đệm cuối (116px) hấp thụ phần dư và chứa hover pill (`sticky right-0 z-20 pointer-events-none`, pill `pointer-events-auto`).
- Chỉ có một giao diện (spreadsheet), không có prop `variant`.

**Phân trang (khớp `TablePagination` V1):**
- Nằm **ngoài khung bảng**, `mt-2 shrink-0`. Trái: "Hiển thị [20▾] hàng/trang" (chọn số dòng bằng `ui/popover`, dấu check ở giá trị hiện tại, mốc `[20,50,100,200]`). Giữa: `a–b / total` (ẩn dưới 480px). Phải: `‹ 1 … 4 [5] 6 … N ›` bằng `V2PageButton`.
- Cửa sổ trang do `getPageWindow(page, totalPages, 5)` (thuật toán V1: trang đầu/cuối kèm `…`).
- Mặc định page size theo `innerHeight` (< 900 → 20, ≥ 900 → 50).

**Filter header (khớp `TableColumnHeaderFilter` V1):**
- Trigger: nhãn + icon `ListFilter` ẩn đến khi hover; active: màu primary + chấm ping; sort hiện `ArrowDownAZ`/`ArrowUpAZ`; mở popup thì `bg-muted`.
- Popup kính mờ `blur(24px) saturate(200%)`, `rounded-xl`, w-64 (w-72 cho cột ngày). Thứ tự: Sắp xếp (bấm là áp dụng và đóng) → Tìm kiếm → Danh sách chọn (`max-h-48`, infinite scroll theo `next`) → "Bộ lọc nâng cao" (toán tử) → footer `Xóa bộ lọc` / `Áp dụng`.
- **Mô hình chờ**: tick option, toán tử và ô tìm kiếm chỉ commit khi bấm Áp dụng hoặc Enter; đóng popup không Áp dụng thì bỏ thay đổi (panel chỉ mount khi mở nên tự khởi tạo lại). Áp dụng chỉ phát các giá trị thực sự đổi. Ô tìm kiếm chỉ thu hẹp danh sách options (debounce 300ms); `columnSearch` (lọc dòng) commit khi Áp dụng.
- "(Chọn tất cả đang hiển thị)" khi chưa gõ; "(Chọn tất cả kết quả tìm kiếm)" khi có từ khóa, lưu `["__ALL_MATCHING__", keyword]` và tự đồng bộ keyword mới (keyword rỗng thì bỏ chọn). `__BLANK__` hiển thị `(Trống)`. Không để lộ `:::`.
- Cột ngày: chỉ sắp xếp + khoảng ngày (preset + từ/đến), áp dụng ngay, không footer.
- Hỗ trợ `"..."` (khớp chính xác) và `;` (OR) trong tìm kiếm.

**Dữ liệu và trạng thái:**
- Hai nút nhanh của hover pill = **mục đầu của hai nhóm đầu** (TRA CỨU → Xem chi tiết, THAO TÁC → Chỉnh sửa); chỉ có một nhóm thì lấy hai mục đầu của nhóm đó. Không dùng `onRowClick` để mở chi tiết.
- Không có sort mặc định ở UI (`sorts: []`). Đổi filter, sort, pageSize luôn về trang 1. `resetAll` xóa filter nhưng giữ sort và pageSize.
- `activeFilterCount` đếm theo **cột**; nút "Xóa bộ lọc (N)" chỉ hiện khi N > 0.
- Lưu cột qua adapter `V2ColumnPreferencesStorage { load, save, clear }`, mặc định `localStorageColumnPreferences` (khóa `erp_v2_table_prefs:<tableId>`, có try/catch). Resize dùng `columnResizeMode: "onEnd"`. Không ẩn cột cuối cùng còn hiển thị; cột `enableHiding: false` luôn hiện.
- Dưới 768px (`useViewport().isMobile`) bảng thành card list (cột đầu = tiêu đề, cột hai = phụ đề, còn lại = meta, chỉnh bằng `mobileSlot`). Mobile không có header filter và tùy chỉnh cột.
- Hiệu năng: `columns`, `rowActions`, `getRowClassName` nên được memo/`useCallback`; row được `React.memo`.

**Chiều cao và sticky header:**
- Bảng gốc có `h-full min-h-0`; container cuộn là `flex-1 overflow-auto`. Sticky header chỉ hoạt động khi cha có chiều cao xác định. Dùng `V2SpreadsheetPageTemplate` (vùng nội dung `flex-1 min-h-0`) hoặc cha có `h-...`/`max-h-...` (qua `containerClassName`). Trong Storybook, decorator chung thêm `p-6` nên bọc story bằng `h-[calc(100vh-3rem)]`.

## 4. Chưa làm (đợt sau)

`SubtotalSummaryCell`, fullscreen, view-mode presets, filter panel bên phải, header filter trên mobile, đồng bộ cấu hình cột lên backend (`core_user_preferences`), bảng nhúng trong `V2StandardDrawer`. Chưa migrate trang V1 nào.

## 5. Kiểm thử

- Unit/integration co-located bằng vitest + testing-library (`bunx vitest run src/v2/shared/components/organisms/v2-standard-table`).
- Test component dùng `.fixture.tsx` (có ở organism và `v2-column-header-filter`) (dữ liệu, `renderTable`, mock viewport) và bọc `QueryClientProvider`.
- Stories: `V2/Organisms/V2StandardTable` (ServerSide, ClientSide, WithSelection, Empty, Loading), `.../Variants` (MobileCards, CustomColumnStorage) và `V2/Templates/V2SpreadsheetPageTemplate` (FullPage, WithoutHeader). Story phải có decorator `QueryClientProvider` vì preview chung không có.
- Gate: `grep -rn "blue-" src/v2/`, không file > 180 LoC (trừ 3 file có sẵn của `v2-standard-drawer`), `grep -rn 'from "@/shared' src/v2/` rỗng, không molecule import molecule, không `<button` thuần trong code bảng.
