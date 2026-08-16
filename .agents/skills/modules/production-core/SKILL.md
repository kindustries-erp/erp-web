---
name: production-core
description: Module tri thức Quản lý Lệnh sản xuất (Production Orders / Manufacturing Orders) trong erp-web. Chứa toàn bộ cấu trúc UI, routing, SpreadsheetPageTemplate, DataTable columns, Drawer tạo lệnh ProductionOrderDrawer, Drawer thực thi 2 giai đoạn ProductionRunDrawer, API client và các tương tác UX.
---

# 🎨 Module Tri Thức: Quản lý Lệnh Sản Xuất (Production Orders) - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

Module Quản lý Lệnh sản xuất cung cấp giao diện theo chuẩn thiết kế bảng dạng Spreadsheet Excel, hỗ trợ lập kế hoạch sản xuất, chọn và xem cây phân rã BOM, thay thế linh kiện, xuất kho nguyên vật liệu và ghi nhận thành phẩm theo 2 giai đoạn sản xuất thực tế.

### 1.1. Routing & TabBar Configuration
- **PageKey**: `erp-production` (khai báo trong `src/shared/types/index.ts`).
- **Sidebar Group**: `manufacturing` (khai báo trong `src/core/config/appStore.ts` tại `SECTION_ROOTS`).
- **Tên hiển thị tab**: `nav.items.erpProduction` ("Lệnh sản xuất").
- **Breadcrumbs**: `[["breadcrumb.manufacturing"], ["breadcrumb.erpProduction"]]` (K sản xuất > Lệnh sản xuất).
- **Tab Icon**: `<Factory />` từ `lucide-react` (khai báo trong `TabBar.tsx`).
- **Lazy Route**: Đăng ký trong `src/App.tsx` trỏ tới `src/pages/ErpProductionPage.tsx`.
- **Quyền hạn (RBAC)**: `useHasPermission('production', 'read')`, `'create'`, `'update'`, `'delete'`.

---

## 2. Cấu trúc Source Code Frontend

```text
src/
├── pages/
│   └── ErpProductionPage.tsx                       # Trang entry point render ProductionOrderListPage
├── modules/
│   └── production-core/
│       ├── api/
│       │   └── productionCoreApi.ts                # API client gọi backend /api/v1/production
│       ├── components/
│       │   ├── ProductionOrderListPage.tsx         # Trang danh sách bảng tính Spreadsheet & Filter Panel
│       │   ├── ProductionOrderDrawer.tsx           # Drawer tạo/chỉnh sửa thông tin lệnh sản xuất & BOM
│       │   └── ProductionRunDrawer.tsx             # Drawer thực thi sản xuất 2 giai đoạn (Xuất NVL -> Nhập Xe/Serial)
│       └── hooks/
│           └── useProductionOrderDrawer.ts         # Custom Hook quản lý form state, BOM explosion & linh kiện thay thế
```

---

## 3. Thành phần Giao diện & Logic Trọng tâm

### 3.1. Trang danh sách (`ProductionOrderListPage.tsx`)
- **Wrapper**: Sử dụng `<SpreadsheetPageTemplate>` với `tableId="erp-production-table"`.
- **Filter Panel**:
  - `search`: Tìm kiếm theo mã lệnh sản xuất (`referenceNo`).
  - `status`: Lọc trạng thái (`DRAFT`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
  - `custom.finishedGoodItemId`: Combobox chọn thành phẩm có BOM `ACTIVE`.
  - `dateFrom` & `dateTo`: Bộ lọc dải ngày bắt đầu kế hoạch.
- **Bảng dữ liệu (`DataTable` variant spreadsheet)**:
  - Cột `referenceNo` (Mã lệnh): Dùng `<TableText>` bật copy, tooltip, mở drawer xem chi tiết khi click, kèm `<Badge>` "Nháp" hoặc "Hủy".
  - Cột `plannedStartDate` & `plannedEndDate`: Hiển thị ngày `yyyy-MM-dd`, tích hợp bộ lọc dải ngày popup `dateRangeSlot` (`DateRangeColumnSlot`).
  - Cột `finishedGoodItemName` (Thành phẩm): Hiển thị tên kèm `<Tooltip>`.
  - Cột `bomVersion` (Phiên bản BOM): Tên BOM kèm version (vd: `Định mức Lotus (v1.0)`).
  - Cột `qtyProduced` (Tiến độ sản xuất): Thanh tiến độ `<Progress>` trực quan hiển thị tỷ lệ % hoàn thành và số lượng đã xong trên tổng kế hoạch: `(qtyProduced / qtyToProduce)`. Màu sắc động (xám: 0%, xanh dương: >0%, xanh lá: 100%).
  - Cột `status` (Trạng thái): Badge màu chuẩn (Xanh lá cho `COMPLETED`, Xanh dương cho `IN_PROGRESS`, Đỏ cho `CANCELLED`, Vàng/Cam cho `DRAFT`/`CONFIRMED`).

### 3.2. Menu Thao tác Hàng (`rowActions`)
- Nhóm `Tra cứu`:
  - **Chi tiết**: Mở `ProductionOrderDrawer` ở chế độ `view`.
  - **Xuất XLSX**: Tải biên bản Lệnh sản xuất file `.xlsx` qua `productionCoreApi.exportXlsx(id)`.
- Nhóm `Thao tác`:
  - **Tiến hành sản xuất / Tiếp tục sản xuất / Xem kết quả**: Mở `ProductionRunDrawer` trực tiếp từ danh sách (chỉ khả dụng khi lệnh ở `CONFIRMED`, `IN_PROGRESS` hoặc `COMPLETED`).
  - **Xóa lệnh nháp / Hủy lệnh**:
    - Với lệnh `DRAFT`: Mở `ConfirmModal` xóa lệnh vĩnh viễn (`productionCoreApi.remove`).
    - Với lệnh `CONFIRMED`: Mở `ConfirmModal` hủy lệnh và hoàn trả tồn kho giữ chỗ (`productionCoreApi.cancel`).

### 3.3. Drawer Tạo & Sửa Lệnh (`ProductionOrderDrawer.tsx` & `useProductionOrderDrawer.ts`)
- Kế thừa `<StandardFormDrawer>` với 3 chế độ (`create`, `edit`, `view`).
- **Khu vực 1 — Thông tin chung (`DrawerSection`)**:
  - `referenceNo`: Mã lệnh sản xuất (tự động gợi ý qua `productionCoreApi.getNextReferenceNo`).
  - `finishedGoodItemId`: Chọn thành phẩm qua `Combobox` (chỉ hiển thị các mặt hàng `CAN_BE_MANUFACTURED` có BOM `ACTIVE`).
  - `qtyToProduce`: Số lượng thành phẩm cần sản xuất.
  - `bomId`: Chọn phiên bản định mức BOM áp dụng.
  - `warehouseCode`: Kho thực hiện sản xuất.
  - `plannedStartDate` & `plannedEndDate`: Ngày kế hoạch bắt đầu và kết thúc (`DatePicker`).
- **Khu vực 2 — Bảng định mức & Kiểm tra tồn kho NVL**:
  - Tự động gọi `productionCoreApi.explodePreview` để phân rã cây BOM theo số lượng sản xuất.
  - Hiển thị bảng danh mục NVL gồm: Mã linh kiện, Tên linh kiện, ĐVT, Số lượng định mức, Tồn kho thực tế (`qtyOnHand`), Tồn giữ chỗ (`qtyReserved`), và Tồn khả dụng (`availableQty`).
  - **Thay thế Linh kiện (Alternative Items)**: Người dùng có thể chọn linh kiện thay thế trực tiếp trên từng dòng qua Combobox tìm kiếm `inventoryItems`.
  - Cảnh báo trực quan màu đỏ nếu linh kiện không đủ tồn kho khả dụng khi ở chế độ `CONFIRMED`.
- **Nút hành động (Footer Actions)**:
  - `Lưu Nháp`: Tạo/cập nhật lệnh ở trạng thái `DRAFT` (cho phép lưu dù chưa đủ NVL).
  - `Xác nhận`: Chuyển lệnh sang `CONFIRMED` và kích hoạt giữ chỗ kho.
  - `Tiến hành sản xuất`: Mở nhanh `ProductionRunDrawer`.

### 3.4. Drawer Thực thi Sản xuất 2 Giai đoạn (`ProductionRunDrawer.tsx`)
Drawer chuyên dụng cho quản lý thực thi tại xưởng sản xuất:

- **Giai đoạn 1 — Xuất kho Nguyên vật liệu (`handleStartSubmit`)**:
  - Cho phép nhập số lượng sản xuất đợt này (`qtyToManufacture`).
  - Bảng tính tỷ lệ NVL cần xuất tương ứng và kiểm tra tồn kho vật lý.
  - Nút **Xuất kho NVL**: Gọi `productionCoreApi.start` $\to$ sinh Phiếu xuất kho `XK-YYYYMMxxx` và chuyển lệnh sang `IN_PROGRESS`.
- **Giai đoạn 2 — Ghi nhận Thành phẩm Hoàn thành (`handleCompleteSubmit`)**:
  - Nhập số lượng thành phẩm hoàn thành (`qtyFinished`) và đơn giá vốn (`unitCost`).
  - Tự động nhận diện Tracking Policy của thành phẩm:
    - **Thành phẩm Xe (`VEHICLE`)**: Hiển thị bảng nhập danh sách xe gồm Số VIN, Số máy, Số serial, Mã màu sơn (`DEN`, `TRANG`, `DO`, `XANH`, `XAM`, `BAC`). Hỗ trợ công cụ sinh nhanh mã hàng loạt (Auto Generate VIN/Engine No tiền tố + số tăng dần).
    - **Thành phẩm Serial (`SERIAL`)**: Bảng nhập danh sách Serial number.
    - **Thành phẩm Lô (`LOT`)**: Nhập mã số Lô.
  - Nút **Nhập kho Thành phẩm**: Gọi `productionCoreApi.complete` $\to$ sinh Phiếu nhập kho `NK-YYYYMMxxx`, kích hoạt thuật toán **FIFO As-Built BOM** tự động liên kết linh kiện vào xe, cập nhật tồn kho thành phẩm.
- **Giai đoạn 3 — Danh mục Sản phẩm đã hoàn thành**:
  - Hiển thị danh sách các xe/serials đã xuất xưởng của lệnh.
  - Hỗ trợ in Barcode, in Phiếu xuất xưởng / Chứng nhận xuất xưởng.

---

## 4. API Client Interface (`productionCoreApi.ts`)

```typescript
export interface ErpProductionOrderMaterial {
  id: string;
  productionOrderId: string;
  itemId: string;
  qtyRequired: string;
  qtyIssued: string;
  uom?: string | null;
  itemName?: string | null;
  itemCode?: string | null;
  originalItemId?: string | null;
  alternativeItemId?: string | null;
  alternativeItemName?: string | null;
  alternativeNotes?: string | null;
}

export interface ErpProductionOrder {
  id: string;
  referenceNo?: string | null;
  status?: string | null;
  finishedGoodItemId?: string | null;
  finishedGoodItemName?: string | null;
  finishedGoodItemCode?: string | null;
  qtyProduced?: string | null;
  qtyToProduce?: string | null;
  plannedStartDate?: string | null;
  plannedEndDate?: string | null;
  notes?: string | null;
  warehouseCode?: string | null;
  createdAt?: string;
  materials?: ErpProductionOrderMaterial[];
  producedVehicles?: ErpProducedVehicle[];
  producedSerials?: ErpProducedSerial[];
  bomVersion?: string | null;
}

export const productionCoreApi = {
  list: (params?: ListParams) => Promise<PaginatedResponse<ErpProductionOrder>>,
  get: (id: string) => Promise<ErpProductionOrder>,
  getNextReferenceNo: () => Promise<string>,
  getProductionOrderColumnOptions: (params) => Promise<{ items: { label: string; value: string }[]; total: number; next: number | null }>,
  explodePreview: (bomId: string, qtyToProduce: number) => Promise<{ flatMaterials: ErpProductionOrderMaterial[]; explosionTree: any[] }>,
  execute: (payload: ExecuteProductionPayload) => Promise<ExecuteProductionResult>,
  update: (id: string, payload: ExecuteProductionPayload) => Promise<ErpProductionOrder>,
  remove: (id: string) => Promise<{ id: string }>,
  confirm: (id: string) => Promise<ErpProductionOrder>,
  cancel: (id: string) => Promise<ErpProductionOrder>,
  start: (id: string, payload: { qtyToManufacture: number; warehouseCode?: string }) => Promise<{ id: string; goodsIssueNo?: string }>,
  complete: (id: string, payload: { qtyFinished: number; unitCost?: number; identifiers?: any[] }) => Promise<{ id: string; goodsReceiptNo?: string }>,
  exportXlsx: (id: string) => Promise<Blob>,
};
```

---

## 5. Tích hợp Liên Module trên Frontend

- **`bom-core`**:
  - Dùng `bomCoreApi.list` để lấy danh sách BOM đang áp dụng (`ACTIVE`) cho thành phẩm.
- **`goods-issues-core`**:
  - Nhúng `useGiDrawer` hoặc liên kết trực tiếp tới Phiếu xuất kho `XK-...` đã sinh khi xem chi tiết xuất vật tư.
- **`inventory-core` & `basic-masters`**:
  - Dùng `useBasicMasterInfinite` để tìm kiếm và chọn linh kiện thay thế (`inventoryItems`).
  - Truy vấn số dư kho tức thời cho từng dòng định mức.

---

## 6. Quy tắc Kiểm tra & QC UI Mandate

1. **Spreadsheet Page Standard**: Bắt buộc dùng `SpreadsheetPageTemplate`, truyền đầy đủ `filter` trả về từ `useFilterPanel`.
2. **Cột STT**: Dùng `#` size `40px` (w-[40px] min-w-[40px]).
3. **Cột Mã Lệnh**: Luôn dùng `<TableText>` có copy, tooltip và `onDrawerClick`.
4. **Delete / Cancel**: Bắt buộc có modal xác nhận `<ConfirmModal>` với cờ `danger={true}`.
5. **Thanh tiến độ**: Bắt buộc tính toán đúng tỷ lệ và hiển thị số lượng dạng `(qtyProduced / qtyToProduce)`.
6. **Typecheck & CI**: Bắt buộc chạy `bun run check:ci` trong `erp-web/` trước khi kết thúc công việc.
