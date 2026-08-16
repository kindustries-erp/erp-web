---
name: vinfast-parts-dashboard
description: Module tri thức Giao diện Dashboard Tổng quan Phụ tùng VinFast trong erp-web. Chứa toàn bộ cấu trúc UI, routing (vinfast-parts-dashboard), KPI Cards, Sparklines, Bar/Line Trend Charts, bảng phân tích hiệu quả VinfastPartDashboardTable, Drawer chi tiết mua/bán và export ngầm.
---

# 📊 Module Tri Thức: Dashboard Tổng Quan Phụ Tùng VinFast - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

Module Dashboard Phụ Tùng VinFast cung cấp màn hình phân tích trực quan toàn diện về hiệu quả kinh doanh, cơ cấu giá vốn, biên lợi nhuận và giá trị tồn kho cho toàn bộ danh mục phụ tùng VinFast (Ô tô và Xe máy).

### 1.1. Cấu hình Routing & Navigation
- **PageKey**: `vinfast-parts-dashboard` (khai báo trong `src/shared/types/index.ts`).
- **Sidebar Group**: `vinfast` (khai báo trong `src/core/config/appStore.ts` tại `PAGE_DEFINITIONS`).
- **Tên hiển thị tab / Menu i18n**: `nav.items.vinfastPartsDashboard` ("Tổng quan phụ tùng").
- **Tab Icon**: `<LayoutDashboard className="h-4 w-4" />`.
- **Breadcrumbs**: `[["breadcrumb.vinfast"], ["breadcrumb.vinfastPartsDashboard"]]`.
- **Lazy Route trong `src/App.tsx`**: Đăng ký `vinfast-parts-dashboard: VinfastPartsDashboardPage`.
- **Quyền hạn (RBAC)**: `useHasPermission('vinfast', 'read')`.

---

## 2. Cấu trúc Source Code Frontend

```text
src/
├── pages/
│   ├── VinfastPartsDashboardPage.tsx                      # Trang Dashboard chính (KPIs, Sparklines, Biểu đồ xu hướng Bar/Line)
│   ├── api/
│   │   └── vinfastPartsExportApi.ts                       # API client cho background export báo cáo phụ tùng
│   ├── hooks/
│   │   └── useVinfastPartsExportProgress.ts               # Hook kết nối SSE stream tiến độ export báo cáo
│   └── components/
│       ├── VinfastPartDashboardTable.tsx                  # Bảng phân tích chi tiết hiệu quả từng mã phụ tùng
│       ├── VinfastPartDashboardDrawer.tsx                 # Drawer tra cứu chi tiết hóa đơn Mua/Bán của một mã phụ tùng
│       └── VinfastPartsExportDrawer.tsx                   # Drawer quản lý tiến trình xuất file báo cáo ngầm
└── shared/
    ├── hooks/
    │   ├── useVinfastPartsDashboardTable.ts               # Hook fetch dữ liệu bảng kê phân tích hiệu quả phụ tùng
    │   └── useVinfastPartsTracking.ts                     # Hook fetch danh sách theo dõi tổng thể phụ tùng
    └── stores/
        └── useVinfastPartsExportProgressStore.ts          # Zustand store quản lý trạng thái SSE export báo cáo
```

---

## 3. Thành phần Giao diện & Logic Trọng tâm

### 3.1. Trang Dashboard Chính (`VinfastPartsDashboardPage.tsx`)
- **Wrapper**: Sử dụng `<DashboardTemplate>` kèm thanh điều khiển `<FilterPanel>`:
  - Bộ chọn khoảng thời gian (`dateFrom`, `dateTo`).
  - Bộ chọn chu kỳ phân tích (`groupBy`): Theo tháng (`month`) hoặc Theo tuần (`week`).
- **Khối Thẻ Chỉ Số KPI (`KpiCard` compact grid 4 cột)**:
  1. **Doanh thu**: Tổng doanh thu bán phụ tùng, kèm Sparkline xu hướng và breakdown Ô tô vs Xe máy ở đáy thẻ.
  2. **Giá vốn (FIFO)**: Tổng giá vốn xuất kho theo nguyên tắc FIFO.
  3. **Lợi nhuận gộp**: Lợi nhuận gộp trước thuế ($\text{Doanh thu} - \text{Giá vốn}$).
  4. **Giá trị tồn kho**: Tổng giá trị hàng đang lưu kho thực tế.
- **Khối Biểu Đồ Xu Hướng (`VinfastPartTrendChart`)**:
  - Biểu đồ lớn trên cùng: **Tất cả phụ tùng (Tổng hợp)**.
  - 2 biểu đồ chia đôi phía dưới: **Phụ tùng Ô tô** (`vehicleType="CAR"`) và **Phụ tùng Xe máy** (`vehicleType="MOTORBIKE"`).
  - Phối màu chuẩn thương hiệu:
    - Cột Giá vốn: Màu cam `#ea580c` (Orange 600).
    - Cột Doanh thu: Màu xanh lục `#059669` (Emerald 600).
    - Đường Lợi nhuận gộp: Màu xám đậm `#1e293b` (Slate 800) dạng đường kẻ nổi bật.

### 3.2. Bảng Phân Tích Hiệu Quả SKU (`VinfastPartDashboardTable.tsx`)
- Kế thừa `<StandardTable>` với bộ lọc server-side qua `TableColumnHeaderFilter`.
- Các cột dữ liệu:
  - Mã phụ tùng (`itemCode`), Tên phụ tùng (`description`), ĐVT (`unit`).
  - Số lượng mua (`qtyBought`), Thành tiền mua (`amountBought`).
  - Số lượng bán (`qtySold`), Doanh thu bán (`amountSold`).
  - Lợi nhuận gộp (`profit`).
- Tương tác: Nhấp chuột vào bất kỳ dòng nào sẽ mở Drawer tra cứu chi tiết (`VinfastPartDashboardDrawer`).

### 3.3. Drawer Chi Tiết Mua / Bán (`VinfastPartDashboardDrawer.tsx`)
- Sử dụng `<DrawerModal>` với kích thước lớn (`size="2xl"` hoặc `"full"`).
- Hiển thị biểu đồ xu hướng thu nhỏ riêng của chính mã phụ tùng đó (`variant="drawer"`).
- Chia 2 bảng dữ liệu riêng biệt:
  - **Tab/Phần Mua vào (IN)**: Ngày HĐ, Ký hiệu & Số HĐ mua, Nhà cung cấp (VinFast), Đơn giá mua, Thành tiền trước thuế.
  - **Tab/Phần Bán ra (OUT)**: Ngày HĐ, Ký hiệu & Số HĐ bán, Khách hàng, Biển số xe, Lệnh quyết toán, Đơn giá bán, Thành tiền trước thuế.
  - Dòng tổng cộng ở chân mỗi bảng (Subtotal row).

### 3.4. Drawer Xuất Báo Cáo Excel Ngầm (`VinfastPartsExportDrawer.tsx`)
- Khởi chạy tác vụ nền gọi `/api/v1/reports/vinfast-parts/export/excel/background`.
- Lắng nghe tiến độ SSE từ `/api/v1/reports/vinfast-parts/export/excel/progress/stream`.
- Hiển thị danh sách các bản xuất trước đó kèm trạng thái `COMPLETED` / `RUNNING` / `FAILED` và nút tải về trực tiếp.

---

## 4. API Client & Interface

```typescript
// vinfastPartsExportApi.ts
export const vinfastPartsExportApi = {
  startExport: (query: VinfastPartsExportQuery) =>
    api.post<{ jobId: string; message: string; reused: boolean }>(
      '/api/v1/reports/vinfast-parts/export/excel/background',
      query
    ),
  getHistory: (page = 1, pageSize = 10) =>
    api.get<VinfastPartsExportHistoryResult>(
      '/api/v1/reports/vinfast-parts/export/excel/background/history',
      { params: { page, pageSize } }
    ),
  downloadFile: (jobId: string) =>
    api.get(`/api/v1/reports/vinfast-parts/export/excel/background/${jobId}/download`, {
      responseType: 'blob',
    }),
};
```

---

## 5. Quy tắc Kiểm tra & QC UI Mandate

1. **Dashboard Standard**: Kế thừa `<DashboardTemplate>` chuẩn hóa, xử lý loading skeleton cho các biểu đồ (`ChartSkeleton`).
2. **KpiCard Format**: Sử dụng helper `money()` định dạng tiền tệ VNĐ và làm tròn hợp lý.
3. **Table & Drawer Synchronization**: Khi bộ lọc ngày trên Dashboard thay đổi, các bảng con và drawer chi tiết phải tự động đồng bộ lại `queryKey` của TanStack Query.
4. **Typecheck & CI**: Bắt buộc chạy `bun run check:ci` và `bun run test` thành công trước khi hoàn tất.
