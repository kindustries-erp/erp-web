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
- **Bộ lọc & Sắp xếp Header Cột (`TableColumnHeaderFilter`)**:
  - Hỗ trợ tìm kiếm nhanh theo từng cột (`column_search`).
  - Lọc đa giá trị (`column_filters`) với cơ chế tải danh sách giá trị distinct qua `fetchColumnOptions` (`/api/v1/vinfast-parts/stock/column-options`).
  - Sắp xếp đa cột (`useTableColumnState`).
- **Cấu trúc Cột Bảng Tồn Kho**:
  1. `#`: Cột STT (`width: 40px`, căn giữa).
  2. `sku`: Mã phụ tùng — sử dụng `<TableText>` bật copy, tooltip, mở drawer chi tiết khi nhấp chuột.
  3. `name`: Tên phụ tùng — hiển thị kèm tooltip.
  4. `uom`: Đơn vị tính (ĐVT).
  5. `qtyOpening`: Tồn đầu kỳ.
  6. `qtyIn`: Số lượng nhập trong kỳ.
  7. `qtyOut`: Số lượng xuất trong kỳ.
  8. `qtyBalance`: Số dư tồn cuối kỳ (nổi bật màu sắc nếu tồn > 0).
  9. `avgCost`: Đơn giá bình quân / FIFO (`money()`).
  10. `totalAmount`: Giá trị tồn kho (`money()`).
  11. `actions`: Menu thao tác dòng `<ActionDropdown>`:
      - **Xem sổ cái FIFO**: Mở Drawer phân rã đơn vị FIFO (`FifoUnitLedgerSection`).
      - **Xem chi tiết phụ tùng**: Mở `VinfastPartsStockDetailDrawer`.

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

### 3.4. Drawer Xuất Báo Cáo Excel Chạy Ngầm (`VinfastPartsStockExportDrawer.tsx`)
- Tích hợp với Zustand store `useVinfastPartsStockExportProgressStore`.
- Lắng nghe SSE stream `/api/v1/vinfast-parts/stock/export/excel/progress/stream`.
- Hiển thị lịch sử các lần xuất trước, cho phép tải lại ngay lập tức nếu file còn hiệu lực (chưa quá 24h).

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
