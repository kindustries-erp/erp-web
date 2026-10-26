---
name: vinfast-parts-stock
description: Module tri thức Giao diện Kho Phụ tùng VinFast (Tổng quan, Ô tô & Xe máy) trong erp-web. Chứa toàn bộ cấu trúc UI, 3 Header Tabs (dashboard, oto, xemay), SpreadsheetPageTemplate, sổ cái FIFO chi tiết FifoFlatTable, sync drawer, background export và UX tương tác.
---

# 🎨 Module Tri Thức: Giao Diện Kho Phụ Tùng VinFast - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

Module Kho Phụ Tùng VinFast cung cấp giao diện quản lý tồn kho, sổ cái chi tiết và báo cáo tổng quan dạng Header Tabs đồng bộ:
1. **`dashboard`** ("Tổng quan"): KPI Cards & Trend Charts Mua/Bán theo chu kỳ (Tháng/Tuần).
2. **`oto`** ("Phụ tùng ôtô"): Quản lý kho phụ tùng Ô tô VinFast.
3. **`xemay`** ("Phụ tùng xe máy"): Quản lý kho phụ tùng Xe máy điện VinFast.

### 1.1. Cấu hình Routing & Navigation
- **PageKey chính**: `vinfast-parts-stock` (khai báo trong `src/shared/types/index.ts`).
- **Sidebar**: Single `NavItem` trực tiếp `Phụ tùng Vinfast` (`t("nav.items.vinfastPartsGroup")`), không có sub-menus dropdown.
- **Header Tabs**:
  - `dashboard`: `VinfastPartsDashboardPage` tích hợp `DashboardTemplate`.
  - `oto`: `VinfastPartsStockTableView` với state độc lập `vinfast-parts-stock-oto`.
  - `xemay`: `VinfastPartsStockTableView` với state độc lập `vinfast-parts-stock-xemay`.
- **URL Query Param Sync**: `?tab=dashboard`, `?tab=oto`, `?tab=xemay`.
- **Quyền hạn (RBAC)**: `useHasPermission('vinfast', 'read')`.

---

## 2. Cấu trúc Source Code Frontend

```text
src/
├── pages/
│   ├── VinfastPartsStockPage.tsx                          # Unified Entry Point [L5 Page] (< 150 LoC) quản lý 3 Header Tabs
│   ├── VinfastPartsDashboardPage.tsx                      # Dashboard View (KPI Cards, Sparklines, Bar Charts)
│   ├── VinfastPartsOtoStockPage.tsx                       # Backward-compatible wrapper (initialTab="oto")
│   ├── VinfastPartsMotoStockPage.tsx                      # Backward-compatible wrapper (initialTab="xemay")
│   ├── api/
│   │   └── vinfastPartsStockExportApi.ts                  # API client cho background export kho phụ tùng
│   ├── hooks/
│   │   ├── useVinfastPartsStockPageUrl.ts                 # Hook URL hydration, active tab switcher & popstate (< 140 LoC)
│   │   └── useVinfastPartsStockExportProgress.ts          # Hook kết nối SSE tiến độ export Excel nền
│   └── components/
│       ├── vinfast-parts-stock-table/                     # [L3 Organism] Folder-per-component Tồn kho Ô tô & Xe máy
│       │   ├── VinfastPartsStockTable.tsx                 # Organism chính (< 150 LoC)
│       │   ├── VinfastPartsStockTable.hook.ts             # Hook React Query & state (< 160 LoC)
│       │   ├── useVinfastPartsStockTableUrlSync.ts        # Hook 2-way URL synchronization (< 150 LoC)
│       │   ├── VinfastPartsStockTable.columns.tsx         # Định nghĩa 7 cột DataTable (< 120 LoC)
│       │   ├── VinfastPartsStockTable.actions.tsx         # PillTabs, createActions, rowActions (< 120 LoC)
│       │   ├── VinfastPartsStockTable.type.ts             # Type contracts (< 30 LoC)
│       │   └── index.ts                                   # Barrel export
│       ├── VinfastPartsStockDetailDrawer.tsx              # Drawer chi tiết phụ tùng: 2 Top Tabs ("Chi tiết" & "Biến động & Phân tích")
│       ├── VinfastPartsSyncDrawer.tsx                     # Drawer kích hoạt đồng bộ hóa đơn IN/OUT và theo dõi tiến độ SSE
│       ├── VinfastPartsStockExportDrawer.tsx              # Drawer quản lý job xuất Excel ngầm và lịch sử tải file
│       └── fifo-unit-ledger/                              # Cụm component sổ cái đơn vị FIFO (No Blue Mandate)
│           ├── fifoColumns.ts                             # Cấu hình 17 cột FIFO & 4 dải tint màu (< 90 LoC)
│           ├── FifoFlatTable.tsx                          # Bảng phẳng hiển thị sổ cái FIFO (17 cột, hairline borders)
│           ├── FifoTableHeader.tsx                        # Header đa tầng 4 nhóm (Nhập, Xuất, Tồn, Hiệu quả KD)
│           ├── FifoTableRow.tsx                           # Dòng dữ liệu với background tint & GarageMarginBadge
│           ├── FifoTableFooter.tsx                        # Hàng tổng cộng đồng bộ 17 cột
│           ├── FifoUnitLedgerSection.tsx                  # Section container bọc FifoFlatTable và bộ lọc trạng thái
│           ├── fifoTransform.ts                           # Thuật toán chuyển đổi raw ledger sang cấu trúc đơn vị FIFO
│           └── useFifoUnitLedger.ts                       # Hook query dữ liệu FIFO unit từ API backend
└── shared/
    └── stores/
        ├── useVinfastPartsStockExportProgressStore.ts     # Zustand store lưu trạng thái tiến độ export Excel kho
        └── useVinfastPartsSyncProgressStore.ts            # Zustand store lưu trạng thái tiến độ sync catalog/ledger
```

---

## 3. Thành phần Giao diện & Logic Trọng tâm

### 3.1. Template Trang Kho (`VinfastPartsStockTemplate.tsx`)
- **Khung giao diện**: Kế thừa `<SpreadsheetPageTemplate>` với `tableId="vinfast-parts-stock-${vehicleType}"`.
- **Nút hành động đầu trang** (giống trang hóa đơn): nút chính tách đôi "Đồng bộ" (`onCreate` mở `VinfastPartsSyncDrawer`, icon `DownloadCloud`); menu ▾ chỉ có nhóm TRA CỨU → "Xuất Excel" (mở `VinfastPartsStockExportDrawer`). Cấu hình trong `VinfastPartsStockTable.tsx` (`createLabel`, `createIcon`, `onCreate`) và `VinfastPartsStockTable.actions.tsx` (`createActions`).
- **Bộ lọc & Sắp xếp Header Cột (`TableColumnHeaderFilter`)**:
  - Hỗ trợ tìm kiếm nhanh theo từng cột (`column_search`).
  - Lọc đa giá trị (`column_filters`) với cơ chế tải danh sách giá trị distinct qua `fetchColumnOptions` (`/api/v1/vinfast-parts/stock/column-options`).
  - Sắp xếp đa cột (`useTableColumnState`).
- **Cấu trúc Cột Bảng Tồn Kho**:
  1. `#`: Cột STT (`width: 40px`, căn giữa).
  2. `sku`: Mã phụ tùng — sử dụng `<TableText>` bật copy, tooltip, mở drawer chi tiết khi nhấp chuột.
  3. `name`: Tên phụ tùng — hiển thị kèm tooltip.
  4. `uom`: Đơn vị tính (ĐVT).
  5. `qtyIn`: Số lượng nhập trong kỳ (`text-emerald-700 dark:text-emerald-400`).
  6. `qtyOut`: Số lượng xuất trong kỳ (`text-rose-700 dark:text-rose-400`).
  7. `qtyBalance`: Số dư tồn cuối kỳ — sử dụng `text-slate-900 dark:text-zinc-100 tabular-nums font-bold` (nổi bật rõ nét trong Dark Theme, nếu âm chuyển sang `text-rose-600 dark:text-rose-400`).
  8. Dòng tổng cộng (Summary Row): Đồng bộ màu sắc tương tự, `qtyBalance` dùng `text-slate-900 dark:text-zinc-100 font-bold`.

### 3.1.1. Cấu hình Xuất Excel Báo Cáo Phụ Tùng (Chuẩn Hóa Theo Sao Kê Ngân Hàng)
- **Sheet 1 ("Tổng Hợp Tồn Kho")**:
  - Banner hàng đầu: Row 1 Tiêu đề in hoa, Row 2 Diễn giải kỳ (`Kỳ báo cáo: Từ ngày... đến ngày...` / `Toàn bộ thời gian`) + Phân loại xe (`Tất cả` / `Ô tô` / `Xe máy`).
  - Cột: `STT`, `Mã Phụ Tùng`, `Tên Phụ Tùng`, `ĐVT`, `Loại Xe` (`vehicleType`), `Tồn Đầu Kỳ` (`qtyOpening`), `Tổng Nhập` (`qtyIn`), `Tổng Xuất` (`qtyOut`), `Tồn Cuối Kỳ` (`qtyBalance`).
  - **Công thức Excel động (Dynamic Formulas)**:
    - Cột `Tổng Nhập`: Lấy số liệu từ Sổ Cái qua hàm `=SUMIFS('Sổ Cái Chi Tiết FIFO'!$F$7:$F$N, 'Sổ Cái Chi Tiết FIFO'!$A$7:$A$N, B7, 'Sổ Cái Chi Tiết FIFO'!$E$7:$E$N, "Nhập")`.
    - Cột `Tổng Xuất`: Lấy số liệu từ Sổ Cái qua hàm `=SUMIFS('Sổ Cái Chi Tiết FIFO'!$F$7:$F$N, 'Sổ Cái Chi Tiết FIFO'!$A$7:$A$N, B7, 'Sổ Cái Chi Tiết FIFO'!$E$7:$E$N, "Xuất")`.
    - Cột `Tồn Cuối Kỳ`: Dùng công thức `= Đầu kỳ + Nhập - Xuất` (`=F7+G7-H7`).
- **Sheet 2 ("Sổ Cái Chi Tiết FIFO")**:
  - Gồm 11 cột sổ cái phụ tùng (bổ sung cột `Loại Xe`, cột `Chiều` ghi "Nhập" / "Xuất") và Khối Hóa đơn chi tiết (`erp_invoice_items`):
    `[HĐ] Chi nhánh`, `[HĐ] Ngày HĐ`, `[HĐ] Số HĐ`, `[HĐ] Ký hiệu HĐ`, `[HĐ] MST HĐ` (tách riêng MST), `[HĐ] Đối tác HĐ` (chỉ ghi tên), `[HĐ] Tên dòng hàng`, `[HĐ] SL HĐ`, `[HĐ] Đơn giá HĐ (VND)`, `[HĐ] Thuế VAT (%)`, `[HĐ] Thành tiền HĐ (VND)`.
  - Styling: Header xanh Emerald (`FF065F46`), data cell xanh nhạt (`FFF0FDF4`), viền trái nét đôi (`double border`).
- **Drawer xuất Excel (`VinfastPartsStockExportDrawer`)**:
  - Phân nhóm 3 group cột rõ ràng: `summary` (Tổng hợp tồn kho), `ledger` (Sổ cái chi tiết FIFO), `invoice` (Dòng hóa đơn mua / bán liên quan).
  - Mục **Điều kiện xuất dữ liệu**: Tích hợp `V2Combobox` phân loại phụ tùng: "Tất cả" (`ALL`), "Phụ tùng ô tô" (`CAR`), "Phụ tùng xe máy" (`MOTORBIKE`). Khi chọn, tự động map vào payload query xuất Excel ngầm.

### 3.2. Sổ Cái Phân Rã Đơn Vị FIFO (`fifo-unit-ledger/`)
- Hiển thị theo nguyên tắc: Mỗi 1 số lượng nhập được tách thành 1 dòng đơn vị (`Unit 1..N`).
- **Ghép cặp tự động**:
  - Cột bên trái: Thông tin nhập kho (Ngày nhập, Số HĐ mua, Đơn giá nhập).
  - Cột bên phải: Thông tin xuất kho tương ứng (Ngày xuất, Số HĐ bán, Biển số xe, Lệnh quyết toán).
  - Cột trạng thái: `Đã xuất` (màu xám nhạt) hoặc `Tồn kho` (màu xanh lá nổi bật).
- **Bộ lọc nội bộ**: Cho phép lọc xem "Tất cả", "Chỉ hàng tồn kho", hoặc "Chỉ hàng đã xuất".
- **Không tự tính FIFO**: `fifoTransform.ts` (`buildFlatLedgerRows`) chỉ ánh xạ dòng từ `GET /vinfast-parts/ledger/:sku`. Tồn lũy kế (`balanceQty`, `balanceValue`) và giá vốn lấy từ API, giữ nguyên thứ tự API. Nguồn sự thật là engine phía API.
- **Cấu trúc sau khi tách** (`fifo-unit-ledger/`): `FifoUnitLedgerSection.tsx` (khung, nối hook) → `useFifoLedgerView.ts` (phân trang, lọc, sắp, tổng) → các hàm thuần `fifoFilters.ts`, `fifoOptions.ts`, `fifoSort.ts`, `fifoTotals.ts`. Bảng: `FifoFlatTable.tsx` → `FifoTableHeader.tsx` (+ `FifoHeaderCell.tsx`), `FifoTableRow.tsx`, `FifoTableFooter.tsx`; cấu hình cột ở `fifoColumns.ts`. Mọi file ≤ 200 dòng.
- **Test**: `__tests__/` có test đặc tả (snapshot DOM) cho bảng và section, dữ liệu mẫu ở `fifoLedgerFixture.ts`; `fifoPure.test.ts` và `fifoTransform.test.ts` cho các hàm thuần.
- **Nhãn trạng thái** (`FifoRowBadges.tsx`): "Trả hàng" cho dòng OUT điều chỉnh âm; "Thiếu hàng N" ở dòng xuất vượt tồn (`shortageDelta` = phần thiếu phát sinh tại dòng đó). Tồn âm hiển thị màu đỏ.

### 3.3. Drawer Đồng Bộ Hóa Đơn (`VinfastPartsSyncDrawer.tsx`)
- Cho phép người dùng chủ động quét lại hóa đơn để tái tạo sổ cái phụ tùng.
- Các tùy chọn:
  - Khoảng ngày cần quét (`dateFrom`, `dateTo`).
  - Tùy chọn **Xóa sạch và tạo lại từ đầu** (`clearDb: true`).
- Kết nối SSE endpoint `/api/v1/vinfast-parts/sync/progress` để cập nhật thanh tiến trình theo thời gian thực.
- Section "Tiến trình" bọc `V2SyncProgress` (`src/v2/shared/components/molecules/v2-sync-progress/`) trong `DrawerSection` V1, dùng chung với drawer "Đồng bộ hóa đơn" (`InvoiceSyncProgressSection`). Trạng thái suy bằng `deriveSyncPanelStatus` (`pages/hooks/vinfastSyncStatus.ts`): đang chạy > lỗi (dòng cuối có `level: "error"`) > hoàn tất (100%). Log lưu `{ at, message, level? }`, giờ hiển thị lấy từ `at`.

### 3.4. Drawer Xuất Báo Cáo Excel Chạy Ngầm (V2: `src/v2/modules/vinfast-parts/drawers/VinfastPartsStockExportDrawer.tsx`)
- Drawer đã chuyển sang V2 (`V2ExportExcelDrawer`, layout 2 cột `lg`). Đường dẫn V1 `src/pages/components/VinfastPartsStockExportDrawer.tsx` chỉ còn re-export để giữ nơi mount.
- Cấu trúc: `.hook.ts` (điều phối), `.period.hook.ts` (chế độ xuất, kỳ tháng/quý/tùy chỉnh, khoảng ngày), `.history.hook.ts` (query lịch sử + SSE, poll 10s khi job chạy và SSE không khỏe, map `historyItems`), `.helper.ts` (`buildExportPayload`, `buildFilterSummary`, map dòng lịch sử), `.columns.config.ts` (nhóm cột Tổng hợp / Sổ cái FIFO, mặc định chọn đủ), `Conditions.tsx` (mỏng, bọc `V2ExportConditionSection` từ shared).
- Điều kiện xuất (cột phải) dùng chung `V2ExportConditionSection` (`molecules/v2-export-condition-section`): radio card "Theo kỳ" / "Theo filter hiện tại" → khi theo kỳ: tab pill Theo tháng / Theo quý / Tùy chỉnh + Kỳ hoặc Quý + Từ/Đến ngày; khi theo filter: `V2ExportFilterSummary` (loại xe, từ khóa, số điều kiện lọc cột). Không còn lựa chọn "Tất cả thời gian": xuất toàn bộ thời gian = "Theo filter hiện tại" (không ghi đè ngày).
- Payload: "Theo kỳ" ghi đè `dateFrom/dateTo`; "Theo filter hiện tại" giữ nguyên `buildBaseQuery()` và không gửi ngày ghi đè. Nút Xuất bị khóa khi chưa chọn cột nào.
- Cột trái: `V2ColumnSelector` (chọn cột theo nhóm) + `V2ExportHistoryList` (lịch sử + `V2TablePagination`). Nút Xuất bị khóa khi chưa chọn cột nào. Gửi `selectedColumns` trong payload `startBackgroundExport`.
- Data layer nằm trong module V2 (không import V1): `api/vinfastStockExportApi.ts` (`v2HttpClient`), `api/dtos/vinfastStockExport.dto.ts`, `stores/useVinfastStockExportProgressStore.ts` (zustand), `hooks/useVinfastStockExportProgress.ts` (SSE `${V2_API_BASE_URL}/api/v1/vinfast-parts/stock/export/excel/progress/stream` + tải file blob). Các file V1 tương ứng đã xóa.
- Toast dùng `useV2ToastStore` (`V2Toaster` đã mount ở `App.tsx`, dùng được cả V1 lẫn V2). Chuỗi hiển thị qua `useV2Translation` với key `v2.vinfastParts.export.*` (module locale `vinfastParts.locale.ts`) và `v2.exportExcel.*` (dùng chung).
- Icon lấy qua registry `@/v2/shared/components/atoms` (`FileSpreadsheet`, `RefreshCw`, `Play`), không import `lucide-react` trực tiếp.
- Validate: "Từ ngày" có `maxDate = Đến ngày`, "Đến ngày" có `minDate = Từ ngày`; khi `Từ ngày > Đến ngày` hiện `V2AlertBanner` và khóa nút Xuất; hook chặn thêm bằng toast `destructive`.
- Nhãn kỳ: tháng `Tháng M/YYYY`, quý `Quý N/YYYY` (không còn kèm khoảng ngày trong nhãn).
- Hiển thị lịch sử các lần xuất trước, tải lại ngay nếu file còn hiệu lực (chưa quá 24h).

---

## 4. API Client & Interface

```typescript
// vinfastPartsStockExportApi.ts
export const vinfastPartsStockExportApi = {
  startExport: (query: VinfastPartsStockExportQuery) =>
    api.post<{ jobId: string; message: string; reused: boolean }>(
      '/api/v1/vinfast-parts/stock/export/excel/background',
      query
    ),
  getHistory: (page = 1, pageSize = 10) =>
    api.get<VinfastPartsStockExportHistoryResult>(
      '/api/v1/vinfast-parts/stock/export/excel/background/history',
      { params: { page, pageSize } }
    ),
  downloadFile: (jobId: string) =>
    api.get(`/api/v1/vinfast-parts/stock/export/excel/background/${jobId}/download`, {
      responseType: 'blob',
    }),
};
```

---

## 5. Quy tắc Kiểm tra & QC UI Mandate

1. **Spreadsheet Standard**: Bắt buộc dùng `SpreadsheetPageTemplate`, hỗ trợ đầy đủ `useTableColumnState` và phân trang chuẩn.
2. **Cột STT**: Độ rộng cố định `w-[40px] min-w-[40px]`, căn giữa.
3. **Cột Mã SKU**: Luôn sử dụng `<TableText>` có hỗ trợ `copyable`, `tooltip` và `onDetailClick` (Icon `Eye` mở chi tiết phụ tùng).
4. **SSE Clean-up**: Mọi SSE connection trong drawer/store phải được dọn dẹp (unsubscribe / close) khi unmount component để tránh rò rỉ bộ nhớ.
5. **Typecheck & CI**: Bắt buộc chạy `bun run check:ci` và `bun run test` thành công trước khi hoàn tất.

## Theo dõi đồng bộ (giai đoạn 6)
- `VinfastPartsSyncDrawer.tsx` dùng `useVinfastPartsSyncStatus` (polling `/vinfast-parts/sync/status`) và `reconcileSyncStatus` (`pages/hooks/vinfastSyncStatus.ts`) để gắn lại tiến trình khi đã có lượt đang chạy; xử lý 409 bằng cách theo dõi lượt đó.
