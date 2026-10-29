---
name: v2-table
description: Module tri thức Bảng dữ liệu chuẩn V2 (V2StandardTable) trong erp-web (src/v2/shared/components/organisms/v2-standard-table cùng atom v2-page-button, v2-table-date-cell, molecule v2-table-pagination, v2-column-toggle, v2-column-header-filter, v2-table-row-actions, v2-table-text và template v2-module-page). Chứa cây thư mục, props, hai chế độ server/client, header filter, lưu cấu hình cột, quy tắc UI bắt buộc và checklist khi dùng cho trang mới.
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
    │   ├── v2-table-date-cell/           Ngày + giờ 2 dòng (thuần hiển thị)
    │   ├── v2-table-filter-button/       Nút Lọc + badge số cột đang lọc (dùng V2ToolbarIconButton)
    │   ├── v2-toolbar-icon-button/       NGUỒN DUY NHẤT cho nút icon toolbar: outline h-8 w-8, label = aria-label + title, active, badge
    │   └── v2-filter-chip/               Chip "Cột: tóm tắt" + ✕
    ├── molecules/
    │   ├── v2-table-pagination/          Kiểu V1: "Hiển thị [n▾] hàng/trang", a–b / total, ‹ 1 … 5 … N ›
    │   ├── v2-column-toggle/             Ẩn/hiện, kéo thả (@dnd-kit, có bàn phím), Khôi phục
    │   ├── v2-column-header-filter/      Trigger + popup kiểu V1; .options (thuần), .operator, .date-slot, .panel, .hook
    │   ├── v2-table-row-actions/         Hover pill + menu chuột phải + V2RowActionList dùng chung
    │   ├── v2-table-text/                V2TableText (text link `onTextClick`, copy, tooltip, detail/drawer; icon đặt sau text)
    │   ├── v2-tab-panel/                 V2TabPanel (lazy + keepAlive), V2PageTabs.context, useV2ToolbarPortal (slot header)
    │   ├── v2-split-button/              Nút chính + chevron; menu bơm qua renderMenu (molecule không import molecule)
    │   ├── v2-table-selection-chip/      ☑ (N) ▾ ✕; menu bơm qua renderMenu
    │   ├── v2-view-mode-combobox/        Trigger + popover: nhóm lọc `filterGroup` (trên) và danh sách chế độ xem (dưới), chỉ UI, không lưu
    │   ├── v2-filter-card/               Card thu gọn/mở cho một cột (icon theo kiểu dữ liệu, chấm active); children chỉ render khi mở
    │   └── v2-filter-panel/              Shell panel lọc: header, reset, đóng, ô tìm cột, chips, extraContent, empty state
    ├── organisms/v2-standard-table/
    │   V2StandardTable.tsx               Switcher theo useViewport
    │   .desktop.tsx / .mobile.tsx        Bảng spreadsheet / danh sách card
    │   .controller.hook.ts               State + view + selection dùng chung hai bản
    │   .state.hook.ts / .preferences.hook.ts / .view.hook.ts / .scroll.hook.ts / .menu.hook.ts
    │   .options.hook.ts + .filter.hook.ts  Truy vấn options (React Query) cho cột đang mở popup
    │   .toolbar.tsx / .toolbar.cluster.tsx / .toolbar.hook.ts   Cụm nút (portal lên slot header hoặc inline), cột + fullscreen + slot
    │   .toolbar.type.ts                  V2TableToolbarConfig, V2ViewPreset(State/Storage), V2TableFilterPanelConfig
    │   .viewmodes.tsx / .viewdialog.tsx  Combobox + hộp thoại tạo/sửa view + ConfirmModal xóa (organism, không ở molecule)
    │   hooks/.views.hook.ts / .views.sync.hook.ts / .views.dialog.hook.ts   Trạng thái view tùy chỉnh, đồng bộ storage, trạng thái hộp thoại
    │   .fullscreen.hook.ts               Bật/tắt fullscreen (ESC thoát)
    │   .grid.tsx                         Phần <table> (colgroup + header + body)
    │   .filterpanel.tsx / .filterpanel.hook.ts / v2ActiveFilterChips.ts   Panel lọc theo cột: card = V2ColumnHeaderFilterPanel, chips, mở card nào truy vấn options card đó
    │   .hook.tsx                         useV2TableColumns (STT, cột chọn, cột dữ liệu TanStack)
    │   v2TableFilter / v2TableEvaluate / v2TableClient / v2TableData / v2TableQuery / v2ColumnPreferences
    │   v2HeaderFilterBuilder.ts          headerFilter(label), .date, .amount, .qty, .select
    │   .mock.tsx / .mock-server.ts / .stories.tsx / .variants.stories.tsx / .toolbar.stories.tsx
    └── templates/v2-module-page/               Khung trang `V2ModulePage`: `V2PageHeader` (icon, tiêu đề, mô tả, slot toolbar theo tab, actions) + tab (`kind`: `list` dựng `V2StandardTable`, `dashboard` render nội dung) + vùng nội dung full-height (`V2Stack`)
```

Quy tắc tầng đã áp dụng (theo `ui-atomic-refactor`):
- Molecule **không import molecule khác**: popup dùng primitive `shared/ui` (`Popover`) và `V2Button` (atom) thay vì `V2Popover`/`V2Dropdown`.
- Molecule **0% API**: `V2ColumnHeaderFilter` nhận `optionsState` qua props; hook React Query nằm ở organism (`hooks/V2StandardTable.options.hook.ts`) và chỉ truy vấn cột đang mở popup.
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
- Đặt bảng trong `V2ModulePage` (title, tabs, actions) để trang có khung full-height và sticky header hoạt động. Bảng của tab `list` được khung dựng tự động từ `table` và `data`.

### Cụm nút toolbar (`toolbar`) và slot theo tab

- Có slot header (`V2ModulePage`) thì toolbar luôn portal lên header: có `toolbar` thì là cụm đầy đủ; không có `toolbar` thì chỉ portal trạng thái chọn/lọc và nút "Tùy chỉnh cột" (cùng hàng với nút header). Fullscreen hoặc không có slot thì render inline dưới header.

```tsx
<V2ModulePage
  title="Danh sách"
  tabs={[
    { key: "overview", label: "Tổng quan", kind: "dashboard", content: <Dashboard /> },
    {
      key: "in", label: "Danh sách", kind: "list",
      table: {
        tableId: "in", columns, getRowKey,
        toolbar: {
          filterGroup: { title, items, activeKey, onChange, allKey }, // Tất cả / Mới / ... (nằm trong popover chế độ xem)
          viewModes: { items, activeKey, onSelect },                // Tổng quan ▾ (tạo/sửa/xóa tùy chỉnh do bảng lo)
          bulkActions: [/* V2DropdownGroup[] cho chip (N) */],
          filterPanel: { defaultOpen: false, extraContent: <PageFilters /> },   // panel lọc bên phải
          onRefresh, enableFullscreen: true,
          create: { label: "Đồng bộ", icon, onClick, actions },     // split button
        },
      },
      data: { items, total, loading, onQueryChange },
    },
  ]}
  activeTab={tab}
  onTabChange={setTab}
  tabVariant="page"
/>
```

- Template tạo **một slot ở header cho mỗi tab**; chỉ slot của tab đang active hiển thị. Bảng trong `V2TabPanel` portal toolbar vào slot của tab mình, nên bảng giữ toàn bộ chiều cao.
- Toolbar rơi về **inline** khi: bảng ngoài template/`V2TabPanel`, template `hideHeader`, đang fullscreen, hoặc mobile. Không truyền `toolbar` thì giao diện cũ (cột + "Xóa lọc").
- `V2TabPanel`: `lazy` (mount khi mở lần đầu) + `keepAlive` (giữ mounted, ẩn bằng CSS), mặc định cả hai. Thay `mountedViewsRef` thủ công.
- Layering: context + hook portal ở L2 (`v2-tab-panel`); template (L4) cung cấp, bảng (L3) tiêu thụ. **Không import template từ organism.**
- Mobile bỏ `viewModes`, fullscreen, cấu hình cột, panel lọc.
- **Thứ tự nút toolbar chuẩn (từ trái qua phải)**:
  `[Chế độ xem / viewModes]` ➔ `[Chip chọn hàng loạt]` ➔ `[Xóa bộ lọc]` ➔ **`[Tùy chỉnh cột (V2ColumnToggle)]`** ➔ **`[Bộ lọc (V2TableFilterButton)]`** ➔ `[Toàn màn hình]` ➔ `[Làm mới (V2ToolbarIconButton)]` ➔ `[Hành động chính (V2SplitButton)]`.
  Quy chuẩn: **Nút Cột luôn đứng TRƯỚC nút Bộ lọc**.
- **Nút icon toolbar luôn dùng `V2ToolbarIconButton`** (Lọc, Cột, Toàn màn hình, Làm mới); không tự viết `V2Button` icon mới cho cụm này.
- **Panel lọc** (`toolbar.filterPanel`): cột bên phải `w-80`, co bảng lại, nằm trong vùng fullscreen. Mỗi cột có `filter` spec + nguồn options là một `V2FilterCard`, thân là `V2ColumnHeaderFilterPanel` (cùng mô hình chờ "Áp dụng" như popup header, một nguồn logic). Chip "Đang lọc" dựng bởi `v2ActiveFilterChips` (một chip/cột, gỡ = `clearColumn`). `extraContent` cho bộ lọc theo trang.

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
- Bảng gốc có `h-full min-h-0`; container cuộn là `flex-1 overflow-auto`. Sticky header chỉ hoạt động khi cha có chiều cao xác định. Dùng `V2ModulePage` (vùng nội dung `flex-1 min-h-0`) hoặc cha có `h-...`/`max-h-...` (qua `containerClassName`). Trong Storybook, decorator chung thêm `p-6` nên bọc story bằng `h-[calc(100vh-3rem)]`.

## 4. Chưa làm (đợt sau)

đồng bộ view tùy chỉnh lên backend (hiện lưu localStorage), lưu filter/sort/tìm kiếm vào view, filter panel dạng popover cho mobile, header filter trên mobile, đồng bộ cấu hình cột lên backend (`core_user_preferences`), bảng nhúng trong `V2StandardDrawer`. Chưa migrate trang V1 nào.

## 5. Kiểm thử

- Unit/integration co-located bằng vitest + testing-library (`bunx vitest run src/v2/shared/components/organisms/v2-standard-table`).
- Test component dùng `.fixture.tsx` (có ở organism và `v2-column-header-filter`) (dữ liệu, `renderTable`, mock viewport) và bọc `QueryClientProvider`.
- Stories: `V2/Organisms/V2StandardTable` (ServerSide, ClientSide, WithSelection, Empty, Loading), `.../Variants` (MobileCards, CustomColumnStorage), `.../Toolbar` (WithFullToolbar, WithFilterPanel, FilterPanelWithExtraContent). Mọi thành phần con đều có story riêng (V2ColumnToggle, V2ColumnHeaderFilter, V2TablePagination, V2TableRowActions, V2TableText, V2PageButton, V2TableDateCell, V2TabBar, V2ToolbarIconButton, V2FilterChip/Card/Panel...). `storyCoverage.test.ts` chặn thành phần V2 mới thiếu story (allowlist chỉ còn 6 molecule drawer) và `Components/Templates/V2ModulePage` (ListAndDashboard, ListOnly). Story phải có decorator `QueryClientProvider` vì preview chung không có.
- Gate: `grep -rn "blue-" src/v2/`, không file > 180 LoC (trừ 3 file có sẵn của `v2-standard-drawer`), `grep -rn 'from "@/shared' src/v2/` rỗng, không molecule import molecule, không `<button` thuần trong code bảng.

## Tái sử dụng atom/molecule trong V2StandardTable

- Chữ trong toolbar, header, empty state và nhãn lọc dùng `V2Text` (atom) thay cho `<span>`/`<p>` thuần; giữ class cũ bằng `className` để không đổi giao diện.
- Vạch ngăn toolbar dùng atom `V2Divider` (`orientation="vertical"` mặc định).
- Ô chọn dòng/chọn tất cả (desktop header, desktop cell, mobile card) dùng molecule `V2TableSelectCheckbox` (nhận `checked: boolean | "indeterminate"`, `aria-label` bắt buộc do bên gọi truyền i18n). Checkbox dùng style chuẩn V1 sắc nét: `rounded-[4px]`, viền mờ `border-border`, nền `bg-surface`, chỉ khi checked/indeterminate mới lên `bg-primary`, và hiện icon `Minus` khi indeterminate.
- Không thay `<table>` trong `grid/V2StandardTable.grid.tsx` bằng primitive `Table` của `shared/ui`: primitive bọc thêm `div.overflow-auto`, làm mất sticky header.

## 6. V2SubtotalSummaryCell (molecule `v2-subtotal-summary-cell/`)

- Props: `variant: "qty" | "amount" | "count" | "label"`, `pageValue`, `totalValue`, `label`, `page`, `totalPages`, `cumulativeValue`, `displayMode: "page" | "total"`, `metricTitle`, `unit`, `locale`.
- Trực quan: Ô số có **gạch chân nét đứt** (`border-b border-dashed border-current/40`) kèm **icon `Info` (`ⓘ`)** báo hiệu popover; ô `label` hiển thị nhãn (mặc định "Tổng cộng:") kèm icon `Info` (`ⓘ`), hover mở popover xem chi tiết số dòng.
- Mở popover bằng hover (delay 120ms mở, 180ms đóng), focus, click; Esc đóng. Logic nằm ở `V2SubtotalSummaryCell.hook.ts`; hàm thuần (tỷ lệ, lũy kế, định dạng) ở `V2SubtotalSummaryCell.utils.ts`.
- Chỉ là UI, nhận số liệu qua props, không gọi API.

## 7. Hàng tổng (summary row) của V2StandardTable

- Khai báo trên cột: `V2Column.summary = { variant: "qty" | "amount" | "count" | "label", label?, accessor?, total?, metricTitle?, unit? }`. Cột có `variant: "label"` hiển thị ô `Tổng cộng: ⓘ` mở popover số dòng; các cột có `variant` số hiển thị giá trị tương ứng; cột không có `summary` để ô trống.
- Desktop only: hàng tổng là `<tfoot>` cuối bảng (`summary/V2StandardTable.summary.row.tsx`), dùng `V2SubtotalSummaryCell`. Mobile không render.
- Ô của hàng tổng `sticky bottom-0` với nền kính `V2_GLASS_SURFACE_CLASS` (cùng nền và `backdrop-blur-[16px]` với header, hằng số định nghĩa trong `V2StandardTable.header.tsx`): bảng ngắn thì hàng tổng nằm sát dòng cuối, bảng phải cuộn thì dính đáy vùng cuộn và dòng bên dưới mờ qua nền kính.
- Popover của ô tổng (`V2SubtotalSummaryCell`) rộng 320px, giữ glass/blur; nhãn `truncate`, giá trị `shrink-0 whitespace-nowrap` để không tràn.
- Giá trị (`summary/V2StandardTable.summary.ts` + `summary/V2StandardTable.summary.hook.ts`):
  - `mode="client"`: tự tính từ toàn bộ dòng đã lọc/sắp xếp (subtotal trang, lũy kế, tổng).
  - `mode="server"`: subtotal trang lấy từ `items`; **tổng toàn bộ phải truyền qua `summary.total`** (từ API); **lũy kế được bảng tự tích lũy theo từng trang**, reset khi đổi filter/sort/pageSize. Trang chưa đi qua thì không có lũy kế.
- Story: `V2StandardTable` → `WithSummary` (client), `WithSummaryServer`, `BenchmarkParity` (so khớp chuẩn mực V1); template → `V2ModulePage` → `ListAndDashboard`.

## 8. Tìm kiếm toàn cục, query trên URL và dữ liệu từ khung trang

- `V2TableQuery.search?: string` và `toolbar.search = { placeholder? }`: ô tìm kiếm (`V2SearchInput`, debounce 300ms, Enter/nút xóa áp dụng ngay) ở đầu cụm toolbar. Đổi tìm kiếm thì về trang 1; `resetAll` xóa luôn tìm kiếm. Chế độ `client` lọc theo giá trị mọi cột (dấu `;` nhiều từ khóa, `"..."` khớp chính xác); chế độ `server` chỉ báo `query.search`.
- Bảng là uncontrolled: đồng bộ URL bằng `useV2TableUrlState` (truyền `initialQuery`, `onQueryChange`). Khi bảng nằm trong `V2ModulePage`, khung đã làm sẵn với tiền tố là khóa tab.
- Chế độ `server` với hàng tổng: tổng toàn bộ do hook trả về trong `summaries` của `useData`, khung gắn vào `summary.total` của cột.
- Bảng nhúng trong drawer: xem `v2-foundation` mục 5.

## 9. Playground trên Storybook (nguồn prop là type gốc)
- Story `Playground` (`playground/V2StandardTable.playground.stories.tsx`, `V2ModulePage.playground.stories.tsx`) chỉ khai báo control cho prop lấy từ `Pick<V2StandardTableProps<T>, ...>` / `Pick<V2ModulePageProps<T>, ...>`, nên tên prop không thể lệch khỏi type gốc.
- Options union lấy từ mảng runtime trong type gốc: `V2_TABLE_MODES` (`V2StandardTable.type.ts`) cho `mode`, `V2_MODULE_PAGE_TAB_VARIANTS` (`V2ModulePage.type.ts`) cho `tabVariant`. Đổi giá trị union thì sửa mảng này.
- Công tắc toolbar (`show<Key>`) suy ra từ `keyof V2TableToolbarConfig` qua `playground/V2StandardTable.playground.toolbar.tsx`; `DEMO_TOOLBAR` khai báo kiểu `Required<V2TableToolbarConfig>`, nên thêm key mới vào type gốc mà thiếu demo thì tsc báo lỗi.
- Công tắc `showSummary` gắn `summary` cho cột `amount`, giống story `With Summary`; ở `mode="server"` tổng lấy từ `GRAND_TOTAL`.
- Nhãn control trong Storybook trùng tên arg (không đặt `name` tiếng Việt): `showSummary`, `keepRows`, và các công tắc toolbar `show<Key>` (ví dụ `showFilterGroup`).
- Dữ liệu Playground đi qua React Query thật (client cũng có độ trễ 400ms). Công tắc `keepRows` ("Giữ dòng cũ khi tải"): bật thì khi đổi trang/làm mới bảng giữ dòng cũ (làm mờ); tắt thì hiện skeleton trong lúc chờ. Nút "Làm mới" của toolbar gọi `refetch` thật.
- Story `PlaygroundMobile` dùng `parameters.viewport.defaultViewport = "mobile1"` để xem nhánh mobile (thẻ).

## 10. Trạng thái tải và rỗng
- Khi `loading` và không có dòng: desktop hiện các dòng skeleton theo từng cột đang hiển thị (`V2TableSkeletonRows`, `skeleton/V2TableSkeletonRows.tsx`, dùng `V2Skeleton`); mobile hiện 3 thẻ skeleton (`V2TableSkeletonCards`). Chữ "Đang tải dữ liệu..." giữ dưới dạng `sr-only` với `role="status"` (chỉ một phần tử).
- Khi đang tải lại mà còn dòng: giữ dòng cũ, làm mờ (`opacity-60`), không chuyển sang skeleton.
- Khi không tải và không có dòng: hiện `emptyLabel` (hoặc "Không có dữ liệu").


## 11. Cấu trúc thư mục (cập nhật, mỗi component một folder)
- Gốc: `V2StandardTable.tsx` (switcher), `V2StandardTable.type.ts`, `index.ts`, stories và test tổng.
- Component con, mỗi folder có `index.ts`: `desktop/`, `mobile/`, `header/`, `body/`, `grid/`, `toolbar/` (gồm cluster), `filterpanel/`, `summary/`, `skeleton/` (hai component một file).
- `hooks/`: hook state/cấu hình bảng. `utils/`: logic thuần (filter, sort, query, preferences). `mocks/`: dữ liệu demo và fixture test (không import từ production). `playground/`: story Playground và helper.
- Test co-located cạnh component; `mocks/V2StandardTable.table-harness.tsx` bọc bảng TanStack thật để test body/summary/skeleton. Fixture riêng cho chế độ xem: `mocks/V2StandardTable.views.fixture.ts` (`renderViews`).

## 12. Chế độ xem tùy chỉnh và nhóm lọc (đã thay pill tabs)

- **Pill tabs đã bỏ** (`toolbar.pillTabs` không còn). Nhóm lọc nhanh là `toolbar.filterGroup`, hiển thị trong popover chế độ xem dưới tiêu đề "Bộ lọc dữ liệu"; trigger ghép nhãn `"Tổng quan • Mới"` khi filter khác `allKey` (mặc định `"all"`). Chỉ có `filterGroup` (không có `viewModes`) thì trigger chỉ hiện nhãn filter.
- **Tạo/sửa/xóa do bảng lo**: `toolbar.viewModes` chỉ nhận `items` (view hệ thống, luôn coi là `isSystem`), `activeKey`, `onSelect`. View tùy chỉnh (tên + cột hiện/ẩn + thứ tự) lưu ở `V2ViewPresetStorage`, mặc định `v2ViewPresetStorage` (store `useV2TablePreferencesStore`, đồng bộ server qua `PATCH /api/v1/app/table-preferences/:tableId`). Prop `viewPresetStorage` để thay adapter.
- **Chọn view tùy chỉnh**: bảng gọi `prefs.applyView` (cột + thứ tự, bỏ key lạ, không để ẩn hết cột) rồi gọi `viewModes.onSelect(baseKey)`. `baseKey` là view hệ thống nền lúc tạo. Chọn view hệ thống chỉ gọi `onSelect`, không đụng cột.
- **Nhớ lựa chọn**: bảng ghi `activeKey` (view đang chọn), `filterKey` (filter group) vào storage khi đổi, **không gọi callback lúc mount**. Consumer phải khôi phục state ban đầu bằng `readV2ViewState(tableId)` (`utils/v2ViewPresets.ts`) rồi đưa vào `filterGroup.activeKey` và `viewModes.activeKey`. Nếu consumer không làm vậy, bảng sẽ bỏ lựa chọn tùy chỉnh (vì `activeKey` không khớp `baseKey`).
- **Mobile**: `viewModes` bị bỏ, không có hộp thoại view; `filterGroup` vẫn dùng được và được nhớ.
- **Trang hóa đơn** (`src/v2/modules/finance-invoice`): hai bảng IN và OUT **mỗi bảng lưu view riêng** (theo `tableId` `invoice-shape-IN|OUT`, giống cách lưu cột). Trang khôi phục state ban đầu từ bảng IN. Một view tạo ở bảng IN sẽ không hiện ở bảng OUT. Dùng chung một khóa lưu cho cả hai sẽ làm hai bảng ghi đè dữ liệu của nhau.
- Hộp thoại (`V2ViewConfigDialog`): tên bắt buộc, không trùng (không phân biệt hoa thường), ít nhất 1 cột hiển thị (cột `canHide: false` luôn tính là hiển thị). Xóa view có `V2ConfirmModal` variant `danger`; xóa view đang chọn thì quay về view hệ thống đầu tiên.
- i18n: `v2.table.filterGroupTitle`, `viewModeSection`, `createViewTitle`, `editViewTitle`, `viewDeleteTitle`, `viewDeleteConfirm`, `viewNameLabel`, `viewNamePlaceholder`, `viewColumnsLabel`, `selectAllColumns`, `clearAllColumns`, `viewNameRequired`, `viewNameDuplicate`, `viewColumnsRequired` (vi + en). Nút Lưu/Hủy dùng `v2.common.save` / `v2.common.cancel`.
