---
name: bom-core
description: Module tri thức Định mức vật tư (BOM - Bill of Materials) trong erp-web. Chứa toàn bộ cấu trúc UI, routing, SpreadsheetPageTemplate, DataTable columns, cây đa cấp BomTree, form drawer BomFormDrawer, API client và các tương tác UX.
---

# 🎨 Module Tri Thức: Định mức vật tư (BOM - Bill of Materials) - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

Module BOM cung cấp giao diện quản lý định mức vật tư sản xuất (Bill of Materials) trên Web theo chuẩn thiết kế bảng dạng Spreadsheet Excel, hỗ trợ xem cây định mức phân rã đa cấp, import/export Excel và chỉnh sửa form trực quan.

### 1.1. Routing & TabBar Configuration
- **PageKey**: `erp-bom` (khai báo trong `src/shared/types/index.ts`).
- **Sidebar Group**: `manufacturing` (khai báo trong `src/core/config/appStore.ts` tại `SECTION_ROOTS`).
- **Tên hiển thị tab**: `nav.items.erpBom` ("Định mức NVL (BOM)").
- **Breadcrumbs**: `[["breadcrumb.manufacturing"], ["breadcrumb.erpBom"]]` (K sản xuất > Định mức NVL (BOM)).
- **Tab Icon**: `<Network />` từ `lucide-react` (khai báo trong `TabBar.tsx`).
- **Lazy Route**: Đăng ký trong `src/App.tsx` trỏ tới `src/pages/ErpBomPage.tsx`.
- **Quyền hạn (RBAC)**: `useHasPermission('bom', 'read')`, `'create'`, `'update'`, `'delete'`.

---

## 2. Cấu trúc Source Code Frontend

```text
src/
├── pages/
│   └── ErpBomPage.tsx                       # Trang chính hiển thị danh sách BOM và cây BomTree
├── modules/
│   └── bom-core/
│       ├── api/
│       │   └── bomCoreApi.ts                # API client gọi backend /api/v1/bom
│       └── components/
│           └── BomFormDrawer.tsx            # Drawer xem/tạo/sửa BOM và nhập liệu linh kiện
```

---

## 3. Thành phần Giao diện & Logic Trọng tâm

### 3.1. Trang danh sách (`ErpBomPage.tsx`)
- **Wrapper**: Sử dụng `<SpreadsheetPageTemplate>` với `tableId="erp-bom-table"`.
- **Filter Panel**:
  - Tìm kiếm text (`search`): Tìm theo tên BOM, mã BOM.
  - Lọc trạng thái (`status`): `ACTIVE` (Đang áp dụng), `INACTIVE` (Ngừng áp dụng), `DRAFT` (Bản nháp).
  - Lọc thành phẩm (`custom.finishedGoodItemId`): `Combobox` infinite scroll lấy dữ liệu từ `inventoryItems` có cờ `CAN_BE_MANUFACTURED`.
- **Bảng dữ liệu (`DataTable` variant spreadsheet)**:
  - Cột `bomCode`: Dùng `<TableText>` bật copy, tooltip, mở view drawer khi click, kèm `<Badge>` "Nháp" nếu status = DRAFT.
  - Cột `bomName`: Tên BOM hiển thị kèm `<Tooltip>`.
  - Cột `finishedGoodItemCode`: Mã SKU thành phẩm.
  - Cột `finishedGoodItemName`: Tên thành phẩm kèm ghi chú nhỏ `notes`.
  - Cột `version`: Phiên bản BOM.
  - Cột `status`: `<Badge>` màu tương ứng (`default` cho ACTIVE, `destructive` cho INACTIVE, `secondary` cho DRAFT).
  - Cột `effectiveFrom` & `effectiveTo`: Hiển thị ngày định dạng `yyyy-MM-dd`, tích hợp bộ lọc dải ngày `dateRangeSlot` (`DateRangeColumnSlot`).

### 3.2. Cây định mức đa cấp (`<BomTree>`)
- Được render trong prop `renderSubRow` khi người dùng mở rộng một dòng BOM.
- **Cơ chế hoạt động**:
  - Tự động load chi tiết dòng gốc qua `bomCoreApi.get(bomId)`.
  - Nếu linh kiện có sub-BOM tương ứng (`fgToBomMap[componentItemId]`), hiển thị nút mở rộng `<ChevronRight>`.
  - Khi click mở rộng, gọi API lấy chi tiết sub-BOM và chèn flat nodes thụt lề theo cấp (`level * 1.5rem`).
- **An toàn & Hiệu năng**:
  - Giới hạn độ sâu tối đa 10 cấp (`max depth 10`).
  - Chống vòng lặp đệ quy (`getAncestorBomIds` + circular check).
  - Tích hợp tìm kiếm và sắp xếp cục bộ theo SKU / Tên / Số lượng ngay trong sub-row tree.
  - Hiển thị badge tỷ lệ hao hụt (%) màu amber cho các linh kiện có hao hụt > 0.

### 3.3. Thao tác hàng (`ActionDropdown`)
- Nhóm `Tra cứu`:
  - **Chi tiết**: Mở `BomFormDrawer` ở chế độ `view`.
  - **Xuất Excel**: Tải file `.xlsx` định dạng K LOTUS chuẩn qua `bomCoreApi.export(id, 'xlsx')`.
  - **Xuất CSV**: Tải file `.csv` UTF-8 có BOM header.
- Nhóm `Thao tác`:
  - **Nhân bản**: Sao chép toàn bộ thông tin và danh sách linh kiện sang một BOM mới ở trạng thái `DRAFT` với mã `-COPY`.
  - **Áp dụng**: Chuyển trạng thái sang `ACTIVE` (Modal xác nhận `ConfirmModal`).
  - **Ngừng áp dụng**: Chuyển trạng thái sang `INACTIVE` (Modal xác nhận `ConfirmModal`).
  - **Xóa**: Xóa mềm BOM (chỉ khả dụng khi BOM không ở trạng thái ACTIVE, có `ConfirmModal`).

### 3.4. Drawer Form (`BomFormDrawer.tsx`)
- Kế thừa `<StandardFormDrawer>` với 3 chế độ (`create`, `edit`, `view`).
- **Khu vực 1 — Thông tin chung**:
  - `bomCode` (Mã BOM - required)
  - `bomName` (Tên BOM - required)
  - `finishedGoodItemId` (Thành phẩm - Combobox infinite scroll `CAN_BE_MANUFACTURED`)
  - `version` (Version - mặc định "1.0")
  - `status` (Trạng thái - ACTIVE / INACTIVE / DRAFT)
  - `effectiveFrom`, `effectiveTo` (DatePicker)
  - `notes` (Ghi chú)
- **Khu vực 2 — Bảng định mức nguyên vật liệu**:
  - Công cụ Import: Nút `Tải template` và `Nhập từ file` (hỗ trợ đọc file Excel/CSV qua `bomCoreApi.parseBomLines`, tự động validate và điền vào bảng).
  - Bảng dòng linh kiện: Hỗ trợ sửa trực tiếp dạng lưới (Inline Cell Input), chọn linh kiện với Combobox tìm SKU, tự động điền ĐVT mặc định từ `itemUomMap`, nhập số lượng và tỷ lệ hao hụt.
  - Bộ lọc và sắp xếp cột cục bộ: Header các cột hỗ trợ tìm kiếm và sắp xếp.
  - Phân trang nội bộ bảng dòng: `pageSize = 10`.

---

## 4. API Client Interface (`bomCoreApi.ts`)

```typescript
export interface ErpBomLine {
  id?: string;
  componentItemId?: string;
  componentItemCode?: string;
  componentItemName?: string;
  qtyRequired: string;
  uomId?: string;
  uom?: string;
  scrapRate?: string;
  notes?: string;
}

export interface ErpBom {
  id: string;
  bomCode: string;
  bomName: string;
  finishedGoodItemId?: string | null;
  finishedGoodItemCode?: string | null;
  finishedGoodItemName?: string | null;
  version: string;
  status?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  notes?: string | null;
  createdAt?: string;
  lines?: ErpBomLine[];
}

export const bomCoreApi = {
  list: (params?: ListParams) => Promise<PaginatedResponse<ErpBom>>,
  getBomColumnOptions: (params) => Promise<{ items: { label: string; value: string }[]; total: number; next: number | null }>,
  get: (id: string) => Promise<ErpBom>,
  create: (payload: CreateBomPayload) => Promise<ErpBom>,
  update: (id: string, payload: UpdateBomPayload) => Promise<ErpBom>,
  remove: (id: string) => Promise<void>,
  export: (id: string, format: "xlsx" | "csv") => Promise<Blob>,
  downloadImportTemplate: () => Promise<Blob>,
  parseBomLines: (file: File) => Promise<ErpBomLine[]>,
};
```

---

## 5. Tích hợp Với Module Sản Xuất (`production-core`)

- Trong `src/modules/production-core/hooks/useProductionOrderDrawer.ts`:
  - Khi chọn thành phẩm cho Lệnh sản xuất, hệ thống gọi `bomCoreApi.list({ finishedGoodItemId, status: 'ACTIVE' })` để tự động chọn BOM đang áp dụng.
  - Hỗ trợ đổi BOM khác hoặc override từng dòng linh kiện trong cây phân rã.

---

## 6. Quy tắc Kiểm tra & QC UI Mandate

1. **Spreadsheet Page Standard**: Bắt buộc dùng `SpreadsheetPageTemplate`, truyền đầy đủ `filter` trả về từ `useFilterPanel`.
2. **Cột STT**: Dùng `#` size `40px` (w-[40px] min-w-[40px]).
3. **Cột Code**: Luôn dùng `<TableText>` có copy, tooltip và `onDrawerClick`.
4. **Delete/Cancel**: Bắt buộc có modal xác nhận `<ConfirmModal>`.
5. **Typecheck & CI**: Bắt buộc chạy `bun run check:ci` và `bun run test` trước khi commit/push.
