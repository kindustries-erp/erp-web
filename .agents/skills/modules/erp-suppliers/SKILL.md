---
name: erp-suppliers
description: Module tri thức Quản lý Đối Tác Kinh Doanh (Khách Hàng & Nhà Cung Cấp / Business Partners) trong erp-web. Chứa cấu trúc components, hooks, api client, chuẩn hóa SpreadsheetPageTemplate, headerFilter, StandardFormDrawer và kết nối với erp-customers / erp-suppliers.
---

# 🏢 Module Tri Thức Frontend: Quản Lý Đối Tác Kinh Doanh (`erp-suppliers` & `erp-customers`)

## 1. Tổng quan Nghiệp vụ Frontend

Phân hệ Quản lý Đối Tác Kinh Doanh trên `erp-web` phục vụ 2 màn hình chính:
- **Khách hàng (`/erp-customers`)**: `partnerType = 'CUSTOMER'`, quản lý hồ sơ khách hàng.
- **Nhà cung cấp (`/erp-suppliers`)**: `partnerType = 'VENDOR'`, quản lý hồ sơ nhà cung cấp.

Cả hai màn hình đều sử dụng chung component chuẩn hóa `BusinessPartnersListPage` kết hợp với custom hook `useBusinessPartnersList` và drawer `BusinessPartnerDetailDrawer`.

---

## 2. Cấu trúc Source Code Frontend

```text
src/modules/business-partners-core/
├── api/
│   └── businessPartnersCoreApi.ts       # Client API wrapper (list, get, create, update, remove, getColumnOptions)
├── hooks/
│   └── useBusinessPartnersList.ts       # TanStack Query hook quản lý phân trang, bộ lọc, tìm kiếm
└── components/
    ├── BusinessPartnersListPage.tsx     # Bảng dữ liệu chuẩn hóa SpreadsheetPageTemplate
    └── BusinessPartnerDetailDrawer.tsx  # Drawer chi tiết / chỉnh sửa chuẩn StandardFormDrawer
src/pages/
└── ErpBusinessPartnersPage.tsx          # Export ErpCustomersPage và ErpSuppliersPage
```

---

## 3. Quy Chuẩn Giao Diện Bảng (`standardize-table`)

1. **Cột STT (Index)**: Rộng đúng `40px`, căn giữa cả Header (`#`) và Cell, bắt đầu từ 1.
2. **100% Cột Tích Hợp Header Filter Popover**: Dùng `createColumnHeaderFilter` kết nối API `getColumnOptions`.
3. **Cột Mã Code**: Dùng `<TableText enableCopy tooltip onDetailClick>`, có badge `INACTIVE` căn phải khi ngưng hoạt động.
4. **Cột MST**: Dùng `<TableText enableCopy tooltip>` cho phép sao chép nhanh trực tiếp tại ô dữ liệu.
5. **Cột Trạng Thái**: Dùng `<StatusBadge status={row.status} className="w-[88px] inline-flex items-center justify-center text-center truncate" />` bọc trong `<Tooltip>`.
6. **Cột Ngày Tạo**: Dùng `headerFilter.date` kết hợp `<TableDateCell className="justify-end w-full" />`.
7. **Floated Action Menu**: Hover theo dòng hiển thị 2 Quick Actions đầu tiên: 👁️ Xem chi tiết (`view` mode) và ✏️ Chỉnh sửa (`edit` mode), kèm menu ba chấm `...` (Xem chi tiết, Chỉnh sửa, Xóa).
8. **Drawer Chi Tiết**: Tách riêng `BusinessPartnerDetailDrawer.tsx` theo chuẩn `standardize-drawer` (kích thước `md`, bố cục 1-column, chuyển đổi linh hoạt chế độ xem/sửa).
9. **View Presets & Toàn Màn Hình**: Tích hợp `<ViewModeCombobox>` và `enableFullscreen={true}`.

---

## 4. ERP Web V2 Business Partners

- Hai route `/v2/customers` và `/v2/suppliers` dùng chung `src/v2/modules/business-partners/`; `partnerType` lần lượt là `CUSTOMER` và `VENDOR`.
- Page dùng `V2ModulePage` và `V2StandardTable` server mode. Bảng có 10 cột nghiệp vụ cộng cột STT tích hợp, hỗ trợ search, filter, sort, pagination, fullscreen và view preset.
- Adapter preference tiếp tục dùng table ID V1: `erp-customers-table` và `erp-vendors-table`, vì vậy preset/cột đã lưu được chia sẻ giữa V1 và V2.
- Drawer dùng `V2StandardDrawer` một cột với ba section: định danh; liên hệ và địa chỉ; trạng thái và ghi chú. Luồng create/edit/delete làm mới query list; dirty form dùng confirm modal.
- Route và action kiểm tra resource `business_partners`. Mobile mở Khách hàng/Nhà cung cấp qua mục `Danh mục`, còn bộ lọc bảng mở trong modal mobile.
- Locale của module đăng ký namespace `partners` cho VI/EN; component business dùng primitive V2 hiện có và không tạo design system riêng.
