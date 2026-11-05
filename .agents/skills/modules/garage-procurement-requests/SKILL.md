---
name: garage-procurement-requests-web
description: Module tri thức Frontend V2 cho Quản lý Đề nghị Mua hàng Garage (Garage Procurement Requests) trong erp-web. Module mỏng ghép nối với lõi core họ procurement (`src/v2/core/procurement/`). Tuân thủ quy chuẩn V2, Atomic 5 tầng (< 180 LoC), No Blue mandate, Top Navigation Tabs, V2StandardTable, Table Filter & Search Engine, DrawerAuditTimeline, DrawerRelatedDeck, Mobile-First và đa ngôn ngữ vi/en.
---

# 🎨 Module Tri Thức: Đề Nghị Mua Hàng Garage Frontend V2 (`garage-procurement-requests`)

## 1. Ranh giới Module và Core

- **Module** `src/v2/modules/garage-procurement-requests/` là lớp mỏng đặc thù của Garage:
  - Khởi tạo API client với base path `/api/v2/garage-procurement-requests`.
  - Cấu hình hiển thị bảng `garageProcurementRequestsDisplay` (`tableId: erp-garage-procurement-requests-table`), tiêu đề, mô tả, quyền RBAC (`garage_procurement_requests`).
  - Gắn component `GarageProcurementRequestsPage` dùng khung `ProcurementListPage` từ core.
- **Core** `src/v2/core/procurement/` quản lý mọi thành phần tái sử dụng của họ mua hàng (PR và PO):
  - **Table Columns** (`columns/procurementRequestColumns.tsx`): 8 cột dữ liệu với `headerFilter`, `V2TableText` tương tác click xem chi tiết + copy, format tiền tệ VNĐ, badge trạng thái ngữ nghĩa (`ProcurementStatusBadge`).
  - **Table Query & Search Engine**: Hàm `toProcurementListParams` chuyển đổi đầy đủ `V2TableQuery` (gồm `column_filters`, `column_search`, `column_operators`, `date_ranges`, `sort`, `search`) sang query params JSON chuẩn V2, kết nối trực tiếp với Database QueryBuilder bên API backend (`TABLE_COLUMNS`).
  - **Drawer Chuẩn V2** (`drawers/ProcurementRequestDrawer.tsx`): Tích hợp 3 Top Navigation Tabs (`general`: Chi tiết & Dòng hàng, `audit`: Nhật ký duyệt `DrawerAuditTimeline`, `traceability`: Chứng từ PO liên kết qua `DrawerRelatedDeck`).
  - **Atomic Sections (< 180 LoC)**: Tách biệt rõ `ProcurementRequestHeaderSection.tsx`, `ProcurementLinesEditor.tsx`, `ProcurementLineRow.tsx`, `ProcurementRequestSummarySection.tsx`, `ProcurementRequestApprovalTab.tsx`, `ProcurementRequestRelatedTab.tsx`, `useProcurementDrawerActions.ts`.
  - **Hành động trực tiếp**: Ở chế độ xem (View Mode), các thao tác duyệt (Gửi duyệt, Duyệt, Từ chối, Hủy...) được kích hoạt trực tiếp từ Drawer Footer hoặc menu dropdown `Thao tác`.

```
src/v2/modules/garage-procurement-requests/
├── garageProcurementRequests.config.tsx    # Cấu hình API, tableId, renderDrawer, RBAC
├── garageProcurementRequests.locale.ts    # Tiêu đề & mô tả module
├── GarageProcurementRequestsPage.tsx      # Entry page ghép ProcurementListPage
└── index.ts

src/v2/core/procurement/
├── columns/
│   ├── procurementColumns.tsx             # Facade re-export
│   ├── procurementRequestColumns.tsx      # Cột bảng PR chuẩn V2 (< 130 LoC)
│   └── procurementOrderColumns.tsx        # Cột bảng PO (< 90 LoC)
├── components/
│   ├── molecules/
│   │   ├── procurement-pickers/           # Branch picker, Date picker
│   │   └── procurement-status-badge/      # Badge semantic No Blue (< 60 LoC)
│   ├── organisms/
│   │   └── procurement-lines-editor/      # Bảng nhập dòng hàng hóa / dịch vụ
│   │       ├── ProcurementLinesEditor.tsx # Khung bảng và nút thêm dòng (< 90 LoC)
│   │       └── ProcurementLineRow.tsx     # Dòng chi tiết nhập liệu mobile-first (< 160 LoC)
│   ├── ProcurementListPage.tsx            # Template bảng V2ModulePage (< 180 LoC)
│   └── ProcurementReasonModal.tsx         # Modal nhập lý do từ chối/hủy/đóng
├── drawers/
│   ├── sections/
│   │   ├── ProcurementRequestHeaderSection.tsx   # Thông tin đề nghị (< 120 LoC)
│   │   └── ProcurementRequestSummarySection.tsx  # Cột tổng quan phải (< 60 LoC)
│   ├── tabs/
│   │   ├── ProcurementRequestApprovalTab.tsx     # Tab nhật ký duyệt (< 90 LoC)
│   │   └── ProcurementRequestRelatedTab.tsx      # Tab chứng từ PO liên kết (< 130 LoC, DrawerRelatedDeck)
│   ├── ProcurementRequestDrawer.tsx       # V2StandardDrawer với Top Tabs (< 130 LoC)
│   ├── ProcurementRequestDrawer.hook.ts   # Hook quản lý form, mode, tabs (< 130 LoC)
│   ├── useProcurementDrawerActions.ts     # Hook quản lý nút duyệt footer (< 80 LoC)
│   └── procurementDrawer.type.ts          # Contract props
├── procurement.api.ts                     # API client & toProcurementListParams (< 130 LoC)
└── procurement.locale.ts                  # Từ điển vi/en (v2.procurement.*)
```

## 2. Quy Chuẩn V2 Đã Đáp Ứng

- **Atomic 5 Tầng & Giới hạn < 180 LoC**: 100% các file thành phần đều nằm dưới 175 LoC, phân rã rành mạch theo nguyên tắc single responsibility.
- **Không dùng Blue**: Màu sắc sử dụng bảng token ngữ nghĩa V2 (`emerald` cho duyệt/đặt đủ, `amber` cho chờ duyệt/đang đặt, `destructive` cho từ chối/hủy, `secondary` cho nháp, `outline` cho đóng/chưa đặt).
- **V2StandardTable & Header Filter**: Cột số đề nghị dùng `V2TableText` hỗ trợ copy và click mở Drawer; cột ngày dùng `headerFilter.date`; cột tổng tiền dùng `headerFilter.amount` căn phải; cột trạng thái dùng `headerFilter.select`.
- **Search & Filter Đồng Bộ Hai Chiều (Web ↔ Backend)**:
  - Frontend chuyển đổi các filter header sang `column_filters`, `column_search`, `date_ranges`, `sort` dạng JSON.
  - Backend `ListProcurementRequestsDto` kế thừa `TableQueryDto`, query service bóc tách bằng `applyTableFilters`, `applyTableSort` và `applyMultiKeywordMultiFieldFilter` lọc chính xác trên SQL TypeORM.
- **Drawer Top Tabs & Audit Timeline**: 3 tab chuyển đổi mượt mà. Tab `audit` tích hợp `DrawerAuditTimeline`, tab `traceability` dùng `DrawerRelatedDeck` chuẩn V2.
- **Thao tác duyệt ngay trong Drawer**: Người dùng có thể Duyệt, Từ chối, Gửi duyệt, Hủy trực tiếp từ Drawer Footer khi đang xem đề nghị.
- **Mobile-First Ergonomics**: Kích thước vùng bấm chạm $\ge 44\text{px}$, input font $\ge 16\text{px}$ trên mobile, responsive layout co giãn 1 cột trên điện thoại / 2 cột trên máy tính.
- **Đa ngôn ngữ 100%**: 100% chuỗi văn bản sử dụng `t()` với prefix `v2.procurement.*` và `v2.garageProcurementRequests.*`.
