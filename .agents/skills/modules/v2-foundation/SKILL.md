---
name: v2-foundation
description: Module tri thức nền tảng V2 để dựng một module hoàn chỉnh (lấy erp-invoice làm chuẩn đối chiếu) trong erp-web: router và guard quyền, hook URL (bảng, tab, drawer/modal), đăng ký i18n theo module, khung trang V2ModulePage với hợp đồng useData(query), ô nhập/biểu đồ/xem trước tệp V2, bảng parity với erp-invoice và các hạng mục chưa có.
---

# Module Tri Thức: Nền Tảng V2 Cho Một Module Hoàn Chỉnh - `erp-web`

Nguyên tắc: module chỉ viết **logic nghiệp vụ** (hook nhận query, trả dữ liệu), **cột**, **nội dung drawer** và **widget dashboard**. Vỏ trang, tab, bảng, khung drawer, trạng thái URL, quyền truy cập do V2 lo. Không nằm trong V2: API, store, component V1.

## 1. Router, quyền, menu (`src/v2/app/`)

- `router/v2RouteConfig.ts`: `V2_ROUTES` (`id` trùng id mục menu, `path`, `title`, `permission?`) và `resolveV2Route(pathname)` (khớp tiền tố, ưu tiên route dài nhất).
- `router/guards/permission-guard/PermissionGuard`: bọc nội dung route, thiếu quyền thì hiện thông báo (`v2.guard.*`) hoặc `fallback`.
- `shared/hooks/useV2HasPermission.ts`: `hasV2Permission`, `useV2HasPermission(requirement?)`, `useV2PermissionChecker()`. `V2PermissionRequirement = { collection, action? }`, mặc định `read`, hỗ trợ ký tự `*`. Dùng chung auth store với V1.
- `layouts/v2-app-layout/v2Navigation.ts`: `filterV2NavItems`, `filterV2NavSections` ẩn mục menu mà route cùng `id` đòi quyền người dùng không có (cả desktop và mobile). Thêm module mới: thêm một dòng vào `V2_ROUTES` kèm `permission`.

## 2. Hook và tiện ích URL (`src/v2/shared/`)

| Thành phần | Việc |
| :--- | :--- |
| `utils/v2Url.ts` | `readV2SearchParams`, `updateV2SearchParams(mutate, "push" \| "replace")`, `subscribeV2Url`. Phát sự kiện `v2:urlchange` để hook cùng tab nhận biết |
| `hooks/useV2SearchParams` | Query string hiện tại dạng `URLSearchParams`, tự cập nhật |
| `utils/v2TableUrl.ts` | `writeV2TableQuery`, `parseV2TableQuery`, `clearV2TablePrefix`, `resetV2TableUrl`. Khóa URL: `page`, `size`, `sort` (`-field` là giảm dần), `q`, `cf`, `cs`, `co`, `dr`, thêm tiền tố `<prefix>.` khi có nhiều bảng |
| `hooks/useV2TableUrlState({ base, prefix })` | Giữ `V2TableQuery` và đồng bộ URL. Bảng là uncontrolled: truyền `initialQuery` và `onQueryChange={setQuery}` |
| `hooks/useV2ModuleTabState` | Tab đang mở trên `?tab=`. Đổi tab thì URL chỉ còn khóa của tab đích, khóa tab cũ được cất và trả lại khi quay về |
| `hooks/useV2OverlayState` | Chồng drawer/modal trên `?overlay=a,b` (phần tử cuối là lớp trên cùng). `open` dùng push để Back đóng lớp trên cùng, `close` dùng replace. Id có thể chứa mã bản ghi, ví dụ `invoice:123` |
| `utils/v2TableQueryParams.ts` | Hàm thuần đổi query sang tham số API của module: `getV2PrimarySort`, `getV2ColumnFilterValues`, `getV2DateRange`, `toV2DayBounds`, `toV2OffsetPage` |

Giới hạn: bảng không phản ứng khi người dùng bấm Back làm đổi `page`/lọc trên URL (bảng uncontrolled). Back chỉ đóng/mở drawer và đổi tab.

## 3. i18n theo module (`shared/locales/moduleRegistry.ts`)

`registerV2ModuleLocale("invoice", { vi, en })` đăng ký khóa dưới `v2.invoice.*`; `useV2Translation` tra từ điển chung trước rồi tới module. Namespace không được trùng khóa chung (`common`, `table`, `drawer`, `form`, `chart`, `preview`, `guard`...), trùng sẽ ném lỗi. Đăng ký lại cùng namespace thì ghi đè.

## 4. Khung trang `V2ModulePage` (`templates/v2-module-page/`)

```tsx
<V2ModulePage
  title="Hóa đơn" tabs={[
    { key: "overview", label: "Tổng quan", kind: "dashboard", content: <Dashboard /> },
    { key: "in", label: "Mua vào", kind: "list",
      table: { tableId, columns, getRowKey, toolbar, rowActions, enableRowSelection },
      useData: (query) => ({ items, total, loading, refetch?, summaries? }),
      initialQuery?, resetKey? },
  ]}
  overlays={<>drawer, modal</>} syncUrl defaultTab activeTab onTabChange />
```

- `useData(query)` là hook của module, được gọi **bên trong tab mount lazy**: tab chưa mở thì chưa tải dữ liệu. Không nhận state của V1.
- `refetch` tự gắn vào nút Làm mới của toolbar (trừ khi toolbar đã có `onRefresh`).
- `summaries: { [columnKey]: tổng }` là tổng toàn bộ mọi trang, khung gắn vào `summary.total` của cột (chế độ server).
- State ngoài `V2TableQuery` (pill tab, chế độ xem) do page giữ; `useData` đọc qua closure. Đổi pill tab thì gọi `resetV2TableUrl(tabKey)` và đổi `resetKey` để bảng về trang 1.
- `syncUrl` (mặc định true) giữ tab trên URL; tắt trong story/test cần cô lập.
- Mẫu hoàn chỉnh: `templates/v2-module-page/invoice-shape/` (dữ liệu giả, không gọi API) và story `Components/Templates/V2ModulePage/InvoiceShape`; smoke test `V2ModulePage.invoice-shape.test.tsx`.

## 5. Thành phần V2 thêm cho module hoàn chỉnh

| Tầng | Thành phần | Thay cho (V1) |
| :--- | :--- | :--- |
| Atom | `V2Switch`, `V2Textarea`, `V2Skeleton`, `V2Progress` (+ `ui/progress`), `V2NumberInput`, `V2CopyButton`, `V2Sparkline` | `switch`, `textarea`, `Skeleton`, `progress`, ô nhập số, `CopyButton`, `KpiSparkline` |
| Molecule | `V2Combobox`, `V2DatePicker`, `V2DateRangePicker` (+ `buildV2DatePresets`), `V2EmptyState`, `V2FileUpload`, `V2SearchInput`, `V2StatCard`, `V2Panel`, `V2ChartFrame` | `Combobox`, `DatePicker`, `EmptyState`, `Attachment`, `SearchInput`, `KpiCard`, `Panel` |
| Organism | `V2BarChart`, `V2LineChart`, `V2DonutChart` (`organisms/v2-chart/`), `V2FilePreviewPanel` | `BarChart`, `LineChart`, `DonutChart`, `FilePreviewDrawer` |
| Template | `V2ModulePage` | `PageLayout`, `SpreadsheetPageTemplate`, `DashboardTemplate` |

- `V2StandardTable` có thêm `toolbar.search` (ô tìm kiếm toàn cục, ghi vào `query.search`, chế độ client lọc theo mọi cột; hỗ trợ `;` nhiều từ khóa và `"..."` khớp chính xác).
- Bảng nhúng trong drawer: dùng `DrawerSection fitViewportHeight bodyClassName="flex flex-col overflow-hidden"` để bảng tự cuộn, header dính và thanh phân trang hiện đủ (đã kiểm bằng ảnh Storybook). Nếu thiếu `bodyClassName`, cả phần cuộn và thanh phân trang bị cắt.
- `V2FilePreviewPanel`: PDF bằng `iframe`, ảnh bằng `img`, XML/JSON/CSV/TXT bằng văn bản do module tải rồi truyền `text`; định dạng khác hiện nút Tải xuống. Module chịu trách nhiệm tải tệp có xác thực.

## 6. Biểu đồ (`organisms/v2-chart`, skill `dataviz`)

- Bảng màu `utils/v2ChartPalette.ts`: **5 màu cố định** (cam, lục lam, vàng, hồng, lục), không có xanh dương (No Blue Mandate) và không có đỏ (dành cho trạng thái lỗi), đã chạy validator ở cả sáng/tối. Thứ tự cố định, không xoay vòng; vượt 5 chuỗi/mảng thì `capV2Series`/`foldSlices` gộp vào "Khác".
- Quy cách: cột tối đa 24px bo 4px ở đầu dữ liệu, đường 2px, chấm 8px có viền màu nền, vùng area ~10%, khe 2px giữa các mảng xếp chồng và donut. Legend luôn có từ 2 chuỗi. Mọi biểu đồ có chế độ xem dạng bảng (`V2ChartFrame`).
- Theme sáng/tối lấy từ `useV2ChartTheme` (đọc class `dark` và biến CSS).
- Test: jsdom không có canvas, nên mock `react-chartjs-2` và test các hàm dựng dữ liệu/tùy chọn trong `V2Chart.options.ts`.

## 7. Parity với erp-invoice (đã kiểm bằng story mẫu)

Đã đáp ứng: trang nhiều tab (dashboard + bảng), bảng (tìm kiếm, pill tab, chế độ xem, lọc, chọn nhiều, hàng loạt, hàng tổng, phân trang), drawer chi tiết 2 cột + tab + xem/sửa + panel xem trước + xếp tầng nhiều drawer, drawer hạch toán và xuất, modal hàng loạt và nhập tệp, form (combobox, ngày, số, switch, textarea), dashboard (KPI, biểu đồ), quyền theo route.

**Chưa có (cần làm riêng):**
- Chứng từ liên kết đa tầng: V1 `DrawerDocumentTraceability` dài khoảng 2.900 dòng (canvas, pipeline, bảng, liên kết/gỡ liên kết). V2 mới có `DrawerRelatedDeck` làm khung; story mẫu dùng bảng rút gọn.
- Lưu cấu hình cột/view lên server (V2 chỉ có localStorage), chọn nhanh theo lịch trong bộ lọc cột (đã có sẵn khe ngày với mốc `today/last7/last30/thisMonth`).
- Nhiều tab cùng một trang (`instanceIndex`) như V1.
- Bảng không đồng bộ lại khi Back đổi query trên URL.

## 8. Công thức dựng một module mới

1. Thêm route vào `V2_ROUTES` (kèm `permission`) và đăng ký i18n bằng `registerV2ModuleLocale`.
2. Viết hook `useXData(query)` (React Query) dùng `v2TableQueryParams` để đổi query thành tham số API; trả `{ items, total, loading, refetch, summaries }`.
3. Viết cột bằng `headerFilter...`; ô đặc thù (số HĐ, đối tác) là component của module.
4. Viết drawer bằng `V2StandardDrawer` + `DrawerSection`/`DrawerField` và các ô nhập V2; mở/đóng bằng `useV2OverlayState`.
5. Ghép trong `V2ModulePage` (page chỉ ghép, dưới ~200 dòng), bọc route bằng `PermissionGuard`.
6. Thêm test và story; chạy `bun run check:ci` và `bun run test`.

## 9. Lưu ý kiểm thử

- Menu `V2Dropdown` nằm trong drawer không mở được bằng `fireEvent`/`userEvent` trong jsdom; kiểm tra trạng thái xếp tầng bằng cách khôi phục từ URL (`?overlay=invoice%3AIN-1,posting`) và truy vấn nút với `hidden: true` khi có drawer chồng nhau.
- Mỗi test dùng URL sạch: `window.history.replaceState(null, "", "/v2/x")` trong `beforeEach`.
- Story gọi hook phải bọc trong component đặt tên (quy tắc rules-of-hooks của ESLint), không gọi hook trong `render`.
