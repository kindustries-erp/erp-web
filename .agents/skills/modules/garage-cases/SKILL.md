---
name: garage-cases
description: Module tri thức Quản lý Vụ việc Dịch vụ Garage & Sửa chữa xe trên erp-web (Frontend). Chứa toàn bộ cấu trúc trang, components, Drawer, status badge, quy tắc căn gióng, column visibility, hooks và tích hợp API.
---

# 📦 Module Tri Thức: Quản Lý Phiếu Dịch Vụ Garage (Garage Cases) - Frontend (`erp-web`)

## 1. Tổng quan Nghiệp vụ Frontend

Phân hệ Quản lý Phiếu Dịch Vụ Garage (`src/modules/garage/`) cung cấp giao diện quản lý toàn diện cho các hoạt động sửa chữa, bảo dưỡng tại xưởng dịch vụ:
- **Bảng Danh sách Phiếu Dịch Vụ (`/garage/cases`)**: Xem, tìm kiếm, lọc đa chiều, ẩn/hiện cột thông minh và xuất dữ liệu phiếu dịch vụ.
- **Xem Chi tiết & Sổ Báo Giá (`GarageCaseStandaloneDrawer`)**: Xem chi tiết thông tin khách hàng, phương tiện, cố vấn, tiến độ và bản xem trước tờ phiếu Báo giá & Lợi nhuận dự kiến.
- **Đồng bộ Dữ liệu Garage (`GarageCaseSyncDrawer`)**: Kích hoạt đồng bộ phiếu dịch vụ và lợi nhuận gộp từ hệ thống KGara về ERP theo dải ngày.

---

## 2. Cấu trúc Source Code

```text
src/modules/garage/
├── api/
│   └── garageApi.ts                 # API client gọi các endpoints backend (/api/v1/kgara-cases, /api/v1/kgara-gross-profit)
├── components/
│   ├── GarageBranchSelector.tsx     # Dropdown chọn chi nhánh xưởng
│   ├── GarageCaseLinkedDocuments.tsx# Quản lý liên kết hóa đơn thuế
│   ├── GarageCasePreview.tsx        # Bản xem trước Sổ báo giá & Lợi nhuận dự kiến (bọc trong DrawerSection)
│   ├── GarageCaseStandaloneDrawer.tsx # Drawer chi tiết phiếu dịch vụ 2 cột chuẩn UI
│   ├── GarageCaseSyncDrawer.tsx     # Drawer cấu hình đồng bộ dữ liệu
│   ├── GarageGrossProfitDetailDrawer.tsx # Drawer xem lợi nhuận gộp
│   ├── GarageRecentCasesTable.tsx   # Bảng 10 phiếu dịch vụ gần nhất cho Dashboard
│   └── KgaraCaseStatusBadge.tsx     # Badge trạng thái dịch vụ với màu sắc chuẩn mực
├── hooks/
│   └── useGarage.ts                 # Custom React Query hooks (useGarageCases, useGarageCaseByCode, useSyncGarageCases, etc.)
├── locales/
│   ├── vi.ts                        # Bản dịch tiếng Việt đầy đủ
│   └── en.ts                        # Bản dịch tiếng Anh đầy đủ
├── pages/
│   ├── GarageCases.tsx              # Trang chính Quản lý Phiếu dịch vụ
│   ├── GarageDashboard.tsx          # Dashboard tổng quan hoạt động Garage
│   ├── GaragePayables.tsx           # Sổ công nợ phải trả Garage
│   └── GarageReceivables.tsx        # Sổ công nợ phải thu Garage
├── store/
│   └── garageStore.ts               # Zustand store lưu selectedBranchId
└── utils/
    └── garageCasesTable.ts          # Helper lọc và sắp xếp dữ liệu client-side
```

---

## 3. Quy chuẩn Hiển thị & Visual Encoding

### 3.1. Phân cấp Màu sắc Trạng thái (`KgaraCaseStatusBadge`)
- **Báo giá / Nháp / Chờ duyệt / Bổ sung**: `variant="secondary"` (Nền xám `bg-slate-100 text-slate-700`). Giảm nhiễu thị giác cho các phiếu chưa thi công.
- **Đang làm / Đang sửa / Tiếp nhận / Xử lý**: `variant="warning"` (Nền vàng hổ phách `bg-amber-50 text-amber-700`). Nổi bật để theo dõi xe đang trong xưởng.
- **Kết thúc / Hoàn thành / Giao xe**: `variant="success"` (Nền xanh lá `bg-emerald-50 text-emerald-700`).
- **Phiếu hủy / Từ chối / Không duyệt**: `variant="destructive"` (Nền đỏ `bg-rose-50 text-rose-700`).

### 3.2. Căn gióng Bảng Danh sách (Alignment Rules)
- **Table Headers**: 100% căn giữa (`text-center` / `align="center"`).
- **Cột Số, Tiền tệ & Biên LN**: Căn phải (`text-right font-semibold tabular-nums`). Số 0 hiển thị dấu gạch ngang `—`.
- **Cột Ngày tháng & Thời gian**: Căn phải (`text-right`).
- **Cột Trạng thái & Cột Bảo hiểm**: Căn giữa (`text-center`). Cột Bảo hiểm chỉ hiển thị icon khiên `ShieldCheck` neutral cho xe có bảo hiểm, `—` cho xe không bảo hiểm.
- **Các cột Mã, Tên, Biển số xe**: Căn trái (`text-left`).

### 3.3. Ẩn Mặc Định Cột (Default Column Visibility)
- `statusName`: `false` (Đã có icon trạng thái ngay tại cột Số chứng từ).
- `branchName`: `false`.
- `createdAt`: `false`.
- `dataAsOf`: `false`.

---

## 4. Tích hợp Drawer Chuẩn Hóa (`standardize-drawer`)

- Sử dụng `<StandardFormDrawer layout="2-columns" size="xl">`.
- **Cột trái (`leftPanel`)**: Chứa `GarageCasePreview` bọc trong `<DrawerSection title="Sổ báo giá & Lợi nhuận dự kiến" collapsible>`, căn thẳng hàng trên cùng (`align-top`) với cột phải.
- **Cột phải (`rightPanel`)**: Các `DrawerSection` thông tin (Khách hàng, Xe & Bảo hiểm, Cố vấn & Phân công, Tiến độ & Ghi chú).
