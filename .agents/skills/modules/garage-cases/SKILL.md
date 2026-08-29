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
│   ├── GarageCaseSettlementDrawerModal.tsx # Wrapper cấn trừ dòng tiền & sổ ngoài sử dụng VoucherNetoffSelectionModal
│   ├── GarageCaseSettlementSection.tsx # Section quản lý cấn trừ thu/chi dòng tiền vụ việc
│   ├── GarageCaseStandaloneDrawer.tsx # Drawer chi tiết phiếu dịch vụ 2 cột chuẩn UI
│   ├── GarageCaseSyncDrawer.tsx     # Drawer cấu hình đồng bộ dữ liệu
│   ├── GarageCaseViewConfigDrawer.tsx # Drawer cấu hình & tùy biến cột cho Chế độ xem (View Presets)
│   ├── GarageCaseViewModeCombobox.tsx # Combobox chọn nhanh Chế độ xem (Tổng quan / Đối soát / Tiến độ & Dòng tiền / Custom)
│   ├── GarageCustomerDetailDrawer.tsx # Drawer 2 cột chi tiết công nợ khách hàng, danh sách phiếu dịch vụ & tuổi nợ
│   ├── GarageGrossProfitDetailDrawer.tsx # Drawer xem lợi nhuận gộp
│   ├── GarageRecentCasesTable.tsx   # Bảng 10 phiếu dịch vụ gần nhất cho Dashboard
│   ├── GarageSupplierDetailDrawer.tsx # Drawer 2 cột chi tiết công nợ nhà cung cấp (TK 331), vụ việc & bút toán
│   └── KgaraCaseStatusBadge.tsx     # Badge trạng thái dịch vụ với màu sắc chuẩn mực
├── hooks/
│   ├── useGarage.ts                 # Custom React Query hooks (useGarageCases, useGarageCaseByCode, useSyncGarageCases, etc.)
│   ├── useGarageCustomersList.ts    # Hook quản lý state, phân trang, lọc server-side & summary công nợ khách hàng (từ 07/2026)
│   └── useGarageSuppliersList.ts    # Hook quản lý state, phân trang, lọc server-side & summary công nợ nhà cung cấp (từ 07/2026)
├── locales/
│   ├── vi.ts                        # Bản dịch tiếng Việt đầy đủ
│   └── en.ts                        # Bản dịch tiếng Anh đầy đủ
├── pages/
│   ├── GarageCases.tsx              # Trang chính Quản lý Phiếu dịch vụ
│   ├── GarageCustomers.tsx          # Trang Quản lý Công nợ Khách hàng (SpreadsheetPageTemplate)
│   ├── GarageDashboard.tsx          # Dashboard tổng quan hoạt động Garage
│   ├── GaragePayables.tsx           # Sổ công nợ phải trả Garage (legacy)
│   ├── GarageReceivables.tsx        # Sổ công nợ phải thu Garage (legacy)
│   └── GarageSuppliers.tsx          # Trang Quản lý Công nợ Nhà cung cấp (SpreadsheetPageTemplate)
├── store/
│   └── garageStore.ts               # Zustand store lưu selectedBranchId
└── utils/
    ├── garageCasesTable.ts          # Helper lọc và sắp xếp dữ liệu client-side & width helper
    ├── garageCasesTable.test.ts     # Unit tests cho helper bảng
    └── garageCaseViewPresets.ts     # Cấu hình Presets mặc định (Tổng quan, Đối soát, Tiến độ & Dòng tiền)

---

## 3. Quy chuẩn Hiển thị & Visual Encoding

### 3.1. Phân cấp Màu sắc Trạng thái (`KgaraCaseStatusBadge`)
- **Báo giá / Nháp / Chờ duyệt / Bổ sung**: `variant="secondary"` (Nền xám `bg-slate-100 text-slate-700`). Giảm nhiễu thị giác cho các phiếu chưa thi công.
- **Đang làm / Đang sửa / Tiếp nhận / Xử lý**: `variant="warning"` (Nền vàng hổ phách `bg-amber-50 text-amber-700`). Nổi bật để theo dõi xe đang trong xưởng.
- **Kết thúc / Hoàn thành / Giao xe**: `variant="success"` (Nền xanh lá `bg-emerald-50 text-emerald-700`).
- **Phiếu hủy / Từ chối / Không duyệt**: `variant="destructive"` (Nền đỏ `bg-rose-50 text-rose-700`).

### 3.2. Thứ tự Cột & Căn gióng Bảng Danh sách (Column Order & Alignment Rules)
- **Thứ tự Cột Bảng `/garage/cases`**:
  1. `#` (`index`): STT 1-based (50px, `text-center`).
  2. `caseDate`: Ngày tiếp nhận (150px, `text-right`, lọc popup khoảng ngày `DateRangeColumnSlot`).
  3. `ngayHoanThanhCongViec`: Ngày kết thúc (150px, `text-right`, lọc popup khoảng ngày `DateRangeColumnSlot`).
  4. `caseCode`: Số chứng từ (170px, `text-left`, link mở chi tiết & tooltip).
  5. `licensePlate`: Biển số xe (140px, font mono kèm icon Car).
  6. `customerCode` & `customerName`: Mã & Tên khách hàng.
  7. `doanhThu`, `chiPhi`, `loiNhuan`, `margin`: Nhóm chỉ số tài chính (căn phải, định dạng tiền tệ / %).
  8. `classification`: Phân loại nghiệp vụ (căn giữa, badge tương tác).
  9. `statusName`: Trạng thái dịch vụ (căn giữa, `KgaraCaseStatusBadge`).
  10. `collectionProgress` & `costProgress`: Tiến độ thu/chi dòng tiền.
- **Table Headers**: 100% căn giữa (`text-center` / `align="center"`).
- **Cột Số, Tiền tệ & Biên LN**: Căn phải (`text-right font-semibold tabular-nums`). Số 0 hiển thị dấu gạch ngang `—`.
- **Cột Ngày tháng & Thời gian**: Căn phải (`text-right`).
- **Cột Trạng thái & Cột Bảo hiểm**: Căn giữa (`text-center`). Cột Bảo hiểm chỉ hiển thị icon khiên `ShieldCheck` neutral cho xe có bảo hiểm, `—` cho xe không bảo hiểm.
- **Các cột Mã, Tên, Biển số xe**: Căn trái (`text-left`).

### 3.3. Ẩn Mặc Định Cột (Default Column Visibility)
- `branchName`: `false`.
- `createdAt`: `false`.
- `updatedAt`: `false`.
- `dataAsOf`: `false`.

---

## 4. Tích hợp Drawer Chuẩn Hóa (`standardize-drawer` & `standardize-table`)

### 4.1. Phiếu Dịch Vụ (`GarageCaseStandaloneDrawer`)
- Sử dụng `<StandardFormDrawer layout="2-columns" size="xl">`.
- **Cột trái (`leftPanel`)**: Chứa `GarageCasePreview` bọc trong `<DrawerSection title="Sổ báo giá & Lợi nhuận dự kiến" collapsible>`, căn thẳng hàng trên cùng (`align-top`) với cột phải.
- **Cột phải (`rightPanel`)**: Các `DrawerSection` thông tin (Khách hàng, Xe & Bảo hiểm, Cố vấn & Phân công, Tiến độ & Ghi chú).

### 4.2. Công Nợ Đối Tác (`GarageCustomerDetailDrawer` & `GarageCasePartnerTab`)
- Sử dụng `<StandardFormDrawer layout="2-columns" size="xl">` và tuân thủ chặt chẽ workflow `/standardize-table`.
- **Bảng danh sách phiếu dịch vụ trong Drawer**:
  - Quản lý trạng thái lọc/sort bền vững bằng `useTableColumnState`.
  - Bộ lọc cột thông minh với `createColumnHeaderFilter`: `headerFilter.date` cho ngày tiếp nhận, `headerFilter.amount` cho số tiền, lọc bracket tuổi nợ (`0-30`, `31-60`, `61-90`, `>90`, `PAID`).
  - Lọc và sắp xếp client-side qua `filterClientItems`.
  - Dòng tổng cộng `summaryRow` hiển thị tổng phát sinh, đã thu, còn nợ.
  - Nút **Bỏ lọc** (`clearFilters`) và đếm số bộ lọc active trên tiêu đề section.

### 4.3. Liên Kết Hóa Đơn VAT (`InvoiceSelectionDrawer`)
- Sử dụng `<StandardFormDrawer layout="2-columns" size="xl" collapsibleRightPanel={true}>`.
- **Cột trái (`leftPanel`)**: Bọc trong `<DrawerSection title="Danh sách hóa đơn điện tử">`, bảng hóa đơn chuẩn font monospace, nút xóa nhanh bộ lọc `FilterButton`, thanh phân trang cố định ở đáy.
- **Cột phải (`rightPanel`)**:
  - `DrawerSection` **Tiến độ & Mục tiêu liên kết**: Hiển thị Doanh thu/Chi phí mục tiêu, Đã chọn và Chênh lệch.
  - `DrawerSection` **Hóa đơn đã chọn**: Danh sách card hóa đơn đã chọn kèm nút gỡ bỏ nhanh. Hóa đơn đã chọn sẽ không nằm trong section gợi ý và ngược lại (mutual exclusion).
  - `DrawerSection` **Gợi ý hóa đơn thông minh**: Danh sách gợi ý AI dựa trên số tiền, biển số xe và mã lệnh quyết toán.

---

## 5. Chế độ Xem Bảng Đa Dạng (View Mode Presets & ViewModeCombobox)

### 5.1. Các Presets Chuẩn Hóa (`garageCaseViewPresets.ts`)
1. **Tổng quan (`overview`)**: Tối ưu tra cứu nhanh tiến độ, ngày tiếp nhận, ngày kết thúc, xe, khách hàng, doanh thu và hóa đơn liên kết.
2. **Đối soát / Lợi nhuận gộp (`audit`)**: Tập trung vào các chỉ số tài chính sâu (Doanh thu, Chi phí, Lợi nhuận, Biên LN %, Hóa đơn đầu vào/đầu ra, Phân loại nghiệp vụ).
3. **Tiến độ & Dòng tiền (`financial_progress`)**: Theo dõi sát sao tiến độ thanh toán thực tế (Đã thu, Còn phải thu, Tiến độ %, Ngày hoàn thành, Cố vấn dịch vụ).

### 5.2. Tùy Biến Chế Độ Xem (`GarageCaseViewConfigDrawer`)
- Cho phép người dùng tạo chế độ xem cá nhân hóa (Custom View), đổi tên, chọn nhanh bộ cột, sắp xếp thứ tự hiển thị và lưu trữ bền vững vào App Setting (`core_user_preferences`) lẫn LocalStorage cache.
- Tích hợp `ViewModeCombobox` dùng chung (`src/shared/components/ViewModeCombobox/ViewModeCombobox.tsx`) với đầy đủ các thao tác Chọn nhanh, Chỉnh sửa (Pencil) và Xóa (Trash).



