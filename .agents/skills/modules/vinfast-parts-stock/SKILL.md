---
name: vinfast-parts-stock
description: Module tri thức Giao diện Kho Phụ tùng VinFast (Ô tô & Xe máy) trong erp-web. Chứa toàn bộ cấu trúc UI, routing (vinfast-parts-oto-stock, vinfast-parts-xemay-stock), SpreadsheetPageTemplate, sổ cái FIFO chi tiết FifoFlatTable, sync drawer, background export và UX tương tác.
---

# 🎨 Module Tri Thức: Giao Diện Kho Phụ Tùng VinFast (Ô tô & Xe máy) - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

Module Kho Phụ Tùng VinFast cung cấp giao diện quản lý tồn kho và sổ cái chi tiết theo chuẩn bảng tính Spreadsheet Excel cho 2 phân hệ độc lập: **Kho Phụ Tùng Ô tô** và **Kho Phụ Tùng Xe Máy**.

### 1.1. Cấu hình Routing & Navigation
- **PageKeys**:
  - `vinfast-parts-oto-stock`: Quản lý kho phụ tùng Ô tô VinFast.
  - `vinfast-parts-xemay-stock`: Quản lý kho phụ tùng Xe máy điện VinFast.
- **Sidebar Group**: `vinfast` (khai báo trong `src/core/config/appStore.ts` tại `PAGE_DEFINITIONS`).
- **Tên hiển thị tab / Menu i18n**:
  - `nav.items.vinfastPartsOtoStock` ("Kho phụ tùng ô tô")
  - `nav.items.vinfastPartsXemayStock` ("Kho phụ tùng xe máy")
- **Lazy Routes trong `src/App.tsx`**:
  - `vinfast-parts-oto-stock` trỏ tới `VinfastPartsOtoStockPage.tsx`.
  - `vinfast-parts-xemay-stock` trỏ tới `VinfastPartsMotoStockPage.tsx`.
- **Quyền hạn (RBAC)**: `useHasPermission('vinfast', 'read')`.

---

## 2. Cấu trúc Source Code Frontend

```text
src/
├── pages/
│   ├── VinfastPartsOtoStockPage.tsx                       # Entry point trang Kho phụ tùng Ô tô (vehicleType="oto")
│   ├── VinfastPartsMotoStockPage.tsx                      # Entry point trang Kho phụ tùng Xe máy (vehicleType="xemay")
│   ├── api/
│   │   └── vinfastPartsStockExportApi.ts                  # API client cho background export kho phụ tùng
│   ├── hooks/
│   │   └── useVinfastPartsStockExportProgress.ts          # Hook kết nối SSE tiến độ export Excel nền
│   └── components/
│       ├── VinfastPartsStockTemplate.tsx                  # Template chung dạng Spreadsheet cho cả Ô tô và Xe máy
│       ├── VinfastPartsStockDetailDrawer.tsx              # Drawer xem chi tiết thông tin phụ tùng và lịch sử sổ cái
│       ├── VinfastPartsSyncDrawer.tsx                     # Drawer kích hoạt đồng bộ hóa đơn IN/OUT và theo dõi tiến độ SSE
│       ├── VinfastPartsStockExportDrawer.tsx              # Drawer quản lý job xuất Excel ngầm và lịch sử tải file
│       └── fifo-unit-ledger/                              # Cụm component sổ cái đơn vị FIFO
│           ├── FifoFlatTable.tsx                          # Bảng phẳng hiển thị từng đơn vị nhập vs đơn vị xuất tương ứng
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
