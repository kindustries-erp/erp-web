---
name: erp-invoice
description: Module tri thức Quản lý Hóa đơn Điện tử & Dashboard Hóa đơn (ERP Invoices & Dashboard) trong erp-web. Chứa toàn bộ cấu trúc UI, routing, DataTable columns, Drawers, Modals, XML/GDT Sync, SSE Progress, API client và các tương tác UX.
---

# 🎨 Module Tri Thức: Quản Lý Hóa Đơn Điện Tử (ERP Invoices) - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

Module Hóa đơn Điện tử quản lý tập trung toàn bộ hóa đơn đầu vào (`IN`), hóa đơn đầu ra (`OUT`), hóa đơn nháp (`DRAFT`), và Dashboard phân tích dòng tiền/thuế hóa đơn.

- **PageKeys**:
  - `erp-invoices-in`: Hóa đơn đầu vào (Mua hàng / Nhà cung cấp).
  - `erp-invoices-out`: Hóa đơn đầu ra (Bán hàng / Khách hàng).
  - `erp-invoices-draft`: Hóa đơn nháp.
  - `invoice-dashboard`: Báo cáo & Phân tích Dashboard Hóa đơn.
  - `e-invoice`: Quản lý phát hành hóa đơn SInvoice Viettel.
- **Sidebar Group**: `accounting` (Kế toán & Tài chính).
- **Tên hiển thị tab**:
  - Hóa đơn đầu vào: `breadcrumb.inbound` (Icon: `Receipt`)
  - Hóa đơn đầu ra: `breadcrumb.outbound` (Icon: `Receipt`)
  - Hóa đơn nháp: `Hóa đơn nháp`
  - Dashboard: `Dashboard Hóa đơn` (Icon: `LayoutDashboard`)
- **Breadcrumbs**:
  - `erp-invoices-in`: `Kế toán` > `Hóa đơn đầu vào`
  - `erp-invoices-out`: `Kế toán` > `Hóa đơn đầu ra`
  - `erp-invoices-draft`: `Kế toán` > `Hóa đơn nháp`
- **Route Components**:
  - `src/pages/ErpInvoicesInPage.tsx` (Render `<ErpInvoicesTab direction="IN" />`)
  - `src/pages/ErpInvoicesOutPage.tsx` (Render `<ErpInvoicesTab direction="OUT" />`)
  - `src/pages/ErpInvoicesDraftPage.tsx`
  - `src/pages/InvoiceDashboard.tsx`
  - `src/pages/EInvoice.tsx`

---

## 2. Cấu trúc Source Code Frontend

```text
src/
├── modules/erp-invoices-core/
│   ├── api/
│   │   ├── erpInvoicesCoreApi.ts              # API Client chính: CRUD, Sync GDT, File R2, Bulk Net-Off, Post/Unpost
│   │   ├── erpInvoicesCoreApi.spec.ts         # Unit test error handling và blob parsing
│   │   └── erpInvoiceDashboardApi.ts          # API Client cho Dashboard KPI & đối tác
│   ├── components/
│   │   ├── ErpInvoicesTab.tsx                 # Core Table Page: Bảng dữ liệu, bộ lọc, thanh công cụ, bulk actions
│   │   ├── InvoiceViewModeCombobox.tsx        # Combobox chọn chế độ xem (Tổng quan / Đối soát / Custom)
│   │   ├── InvoiceViewConfigDrawer.tsx        # Drawer 1-column cấu hình tên view & tùy chỉnh cột hiển thị
│   │   ├── ErpInvoiceInternalDrawer.tsx       # Drawer quản lý chi tiết hóa đơn (kế thừa DrawerModal)
│   │   ├── ErpInvoiceStandaloneDrawer.tsx     # Drawer xem độc lập nhanh hóa đơn từ các trang khác
│   │   ├── PartnerInvoiceDrawer.tsx           # Drawer danh sách hóa đơn theo từng đối tác/MST
│   │   ├── InvoicePostingDrawer.tsx           # Drawer hạch toán kế toán kép 1 hóa đơn (Nợ/Có)
│   │   ├── InvoiceBulkPostingDrawer.tsx       # Drawer hạch toán / hủy hạch toán hàng loạt
│   │   ├── InvoiceBulkNetOffDrawer.tsx        # Drawer cấn trừ hàng loạt hóa đơn với sao kê
│   │   ├── VoucherNetoffSelectionModal.tsx    # Modal chọn giao dịch ngân hàng / phiếu chi để cấn trừ
│   │   ├── InvoiceImportSyncDrawer.tsx        # Drawer tích hợp đồng bộ GDT và Import XML/PDF/ZIP
│   │   ├── GdtPortalAuthDrawer.tsx            # Drawer đăng nhập Cổng Thuế GDT
│   │   ├── GdtPortalAuthForm.tsx              # Form nhập MST, mật khẩu, captcha (hỗ trợ OCR solver)
│   │   ├── InvoiceExportDrawer.tsx            # Drawer xuất file Excel trực tiếp hoặc tác vụ nền (SSE)
│   │   ├── ErpInvoicePdfUpload.tsx            # Component tải lên & xem danh sách file PDF đính kèm
│   │   ├── ErpInvoiceFormGeneral.tsx          # Phân khu form thông tin chung hóa đơn
│   │   ├── ErpInvoiceFormItems.tsx            # Phân khu bảng nhập chi tiết dòng mặt hàng
│   │   ├── ErpInvoiceLinkedDocuments.tsx      # Phân khu liên kết Đơn mua (PO) / Đơn bán (SO)
│   │   ├── ErpInvoiceNetOffSection.tsx        # Phân khu chi tiết cấn trừ giao dịch ngân hàng
│   │   ├── ErpAttachmentSelectDrawer.tsx      # Drawer chọn file đính kèm từ kho chung
│   │   ├── BulkEditDrawer.tsx                 # Drawer sửa hàng loạt (gán Chi nhánh, cập nhật Ghi chú)
│   │   ├── VietnamInvoiceTemplate.tsx         # Template render hóa đơn điện tử trực quan chuẩn mẫu VN
│   │   └── xml-upload/                        # Phân hệ tải & xem trước XML/PDF/ZIP
│   │       ├── ImportPreviewModal.tsx         # Modal xem trước danh sách XML/PDF trước khi lưu
│   │       ├── UploadDropzone.tsx             # Vùng kéo thả file
│   │       ├── UploadFileList.tsx             # Danh sách file đã chọn kèm trạng thái parse
│   │       ├── ImportResultSummary.tsx        # Bảng tóm tắt kết quả import (thành công/trùng/lỗi)
│   │       └── ImportResultTables.tsx         # Bảng chi tiết từng hóa đơn import
│   ├── hooks/
│   │   ├── useErpInvoicesList.ts              # TanStack Query hook fetch danh sách hóa đơn + phân trang + lọc
│   │   ├── useErpInvoiceForm.ts               # Hook quản lý form state và submit tạo/sửa hóa đơn
│   │   ├── useInvoiceSyncProgress.ts          # SSE Hook lắng nghe tiến trình đồng bộ GDT thời gian thực
│   │   ├── useInvoiceExportProgress.ts        # SSE Hook theo dõi tiến độ tác vụ xuất Excel nền
│   │   ├── useInvoiceXmlUpload.ts             # Hook quản lý tiến trình upload & parse XML hàng loạt
│   │   ├── usePortalSync.ts                   # Hook kích hoạt sync GDT
│   │   └── usePortalImport.ts                 # Hook nhập dữ liệu từ GDT portal
│   ├── locales/
│   │   └── vi.ts                              # Bản dịch tiếng Việt chuyên biệt cho module Hóa đơn
│   └── utils/
│       ├── gdtCaptchaSolver.ts                # Thuật toán OCR giải mã Captcha SVG của Cổng Thuế GDT
│       └── outInvoiceDisplay.ts               # Helper phân loại dòng hóa đơn đầu ra
└── pages/
    ├── ErpInvoicesInPage.tsx                  # Page tab hóa đơn đầu vào
    ├── ErpInvoicesOutPage.tsx                 # Page tab hóa đơn đầu ra
    ├── ErpInvoicesDraftPage.tsx               # Page tab hóa đơn nháp
    ├── InvoiceDashboard.tsx                   # Page Dashboard thống kê hóa đơn & dòng tiền
    └── components/
        ├── BranchInvoiceChart.tsx             # Biểu đồ cột/đường hóa đơn theo chi nhánh
        ├── BranchVatChart.tsx                 # Biểu đồ theo dõi thuế VAT theo chi nhánh
        └── InvoiceStatsCards.tsx              # Các thẻ KPI tổng tiền, thuế, chiết khấu
```

---

## 3. Thành phần Giao diện & Logic Trọng tâm

### 3.1. Bảng Dữ liệu Hóa đơn (`ErpInvoicesTab.tsx`)
- **Khung giao diện**: Sử dụng `<SpreadsheetPageTemplate>` với thanh công cụ điều khiển phía trên và thanh tính tổng (Summary footer) cố định bên dưới.
- **PillTabs Phân loại Thuế (API-driven)**:
  - Các tab: `Tất cả` (`all`), `Mới` (`new`), `Thay thế` (`replacement`), `Điều chỉnh` (`adjustment`).
  - Quản lý qua `activeTaxTab` trong `useErpInvoiceListStore`, khởi tạo đồng bộ từ URL `?view=...` trên initial load/F5 reload.
  - Tách bạch hoàn toàn khỏi `columnFilters` để tránh xung đột khi người dùng xóa filter.
- **Chế độ xem & Tùy chỉnh cột (View Mode Combobox & Drawer)**:
  - `InvoiceViewModeCombobox`: Đặt cạnh PillTabs, cho phép chọn giữa các preset chế độ xem (`Tổng quan`, `Kiểm toán / Đối soát`, và custom views). Hỗ trợ icon sửa và xóa view kèm `ConfirmModal` xác nhận an toàn.
  - `InvoiceViewConfigDrawer`: Drawer cấu hình view mode chuẩn `StandardFormDrawer` layout `1-column`, chia 3 nhóm cột (*Thông tin chung*, *Thuế & Trạng thái*, *Số tiền*), hỗ trợ khởi tạo từ `currentColumnVisibility`.
- **Tùy chọn lọc cột theo ngữ cảnh Tab (Context-Aware Column Options)**:
  - `fetchInvoiceOptions`: Tự động truyền `taxInvoiceStatus` tương ứng với `activeTaxTab` khi gọi API lấy danh sách gợi ý lọc cột.
  - Cột `taxInvoiceStatus`: Danh sách filter options hiển thị tương ứng theo tab (Mới -> Mới; Thay thế -> Thay thế / Bị thay thế; Điều chỉnh -> Điều chỉnh / Bị điều chỉnh; Tất cả -> Đủ 6 trạng thái).
- **Danh sách cột chuẩn**:
  1. `select`: Checkbox chọn nhiều dòng để thực hiện bulk actions.
  2. `actions`: `ActionDropdown` (Xem chi tiết, Sửa, Hạch toán, In/Xem PDF, Tải XML, Xóa/Hủy).
  3. `invoiceDate`: Ngày lập hóa đơn kèm bộ lọc ngày `TableColumnHeaderFilter`.
  4. `serialNo`: Ký hiệu hóa đơn (`serial_no`).
  5. `invoiceNo`: Số hóa đơn dạng `TableText` highlight.
  6. `partner`: Tên người bán (đối với `IN`) hoặc người mua (đối với `OUT`).
  7. `taxCode`: Mã số thuế đối tác.
  8. `description`: Trích yếu diễn giải nội dung hóa đơn.
  9. `preVatAmount`: Tiền trước thuế (`tabular-nums`, căn phải).
  10. `vatRate` / `vatAmount`: Thuế suất & tiền thuế VAT.
  11. `totalAmount`: Tổng tiền thanh toán đã gồm VAT.
  12. `postingStatus`: Trạng thái hạch toán (`POSTED` - xanh, `UNPOSTED` - xám).
  13. `branchId`: Chi nhánh hạch toán (Badge hiển thị tên chi nhánh).
  14. `licensePlate`: Biển số xe trích xuất tự động (nếu có).
  15. `settlementOrder`: Số quyết toán / lệnh sửa chữa.
  16. `notes`: Ghi chú nội bộ.
- **Thanh công cụ & Tác vụ Hàng loạt (Batch Operations)**:
  - **Tải lên XML/PDF**: Mở `InvoiceImportSyncDrawer`.
  - **Đồng bộ Thuế GDT**: Mở `GdtPortalAuthDrawer` và hiển thị thanh tiến độ SSE.
  - **Hạch toán hàng loạt**: Mở `InvoiceBulkPostingDrawer` hạch toán nhiều hóa đơn cùng lúc.
  - **Cấn trừ hàng loạt**: Mở `InvoiceBulkNetOffDrawer` cấn trừ với sao kê ngân hàng.
  - **Gán chi nhánh / Sửa ghi chú hàng loạt**: Mở `BulkEditDrawer`.
  - **Xuất Excel / Tải file ZIP**: Xuất dữ liệu đồng bộ hoặc chạy ngầm.

### 3.2. Form Drawer Chi Tiết Hóa Đơn (`ErpInvoiceInternalDrawer.tsx`)
- Hỗ trợ 2 chế độ: **Xem chi tiết** (Read-only kèm template trực quan `VietnamInvoiceTemplate`) và **Chỉnh sửa/Tạo mới**.
- **Các phân khu chính**:
  1. `ErpInvoiceFormGeneral`: Số HĐ, ký hiệu, ngày lập, chi nhánh, thông tin người bán, thông tin người mua (MST, tên, địa chỉ, CCCD).
  2. `ErpInvoiceFormItems`: Bảng dòng mặt hàng động (Tên hàng, mã, ĐVT, số lượng, đơn giá, tiền trước thuế, thuế suất %, tiền thuế, chiết khấu, thành tiền).
  3. `ErpInvoiceLinkedDocuments`: Liên kết đơn mua hàng PO / đơn bán hàng SO.
  4. `ErpInvoiceNetOffSection`: Danh sách các giao dịch ngân hàng đã cấn trừ kèm số tiền và nút gán nhanh.
  5. `ErpInvoicePdfUpload`: Danh sách các file PDF đính kèm, hỗ trợ xem trước inline qua PDF viewer hoặc tải xuống.

### 3.3. Dashboard Hóa Đơn (`InvoiceDashboard.tsx`)
- **Thống kê KPI**: Tổng doanh số mua vào/bán ra, tổng thuế VAT đầu vào được khấu trừ, thuế VAT đầu ra phải nộp, chênh lệch thuế VAT ròng.
- **Biểu đồ trực quan**:
  - Biểu đồ xu hướng dòng tiền `cashTrend` (12 tháng gần nhất).
  - Chuyển đổi linh hoạt giữa chế độ xem Doanh số (`invoice`) và chế độ xem Thuế (`vat`).
- **Bảng kê Đối tác / Nhà cung cấp (`InvoicePartnersTable`)**: Bảng tổng hợp giá trị mua/bán theo từng mã số thuế, hỗ trợ click mở `PartnerInvoiceDrawer` để xem ngay danh sách hóa đơn của đối tác đó.

---

## 4. API Client Interface (`erpInvoicesCoreApi.ts`)

### 4.1. Các TypeScript Types chính
```typescript
export interface ErpInvoice {
  id: string;
  branchId?: string | null;
  invoiceNo: string;
  serialNo?: string | null;
  invoiceDate: string;
  direction: "IN" | "OUT";
  status: string;
  preVatAmount: string;
  vatRate?: string | null;
  vatAmount: string;
  totalAmount: string;
  postingStatus?: string | null;
  postingDate?: string | null;
  sellerName?: string | null;
  sellerTaxCode?: string | null;
  buyerName?: string | null;
  buyerTaxCode?: string | null;
  licensePlate?: string | null;
  settlementOrder?: string | null;
  items?: ErpInvoiceItem[];
  voucherNetOffs?: ErpInvoiceVoucherNetOff[];
  pdfFiles?: any[];
}
```

### 4.2. Danh sách hàm gọi API trong `erpInvoicesCoreApi`
- `list(params)`: Lấy danh sách hóa đơn phân trang, tìm kiếm, lọc đa cột.
- `get(id)`: Lấy chi tiết 1 hóa đơn kèm items, cấn trừ, files.
- `create(payload)` / `update(id, payload)`: Tạo mới hoặc cập nhật hóa đơn.
- `remove(id)` / `cancel(id)`: Xóa mềm hoặc hủy hóa đơn.
- `postInvoice(id, payload)` / `unpostInvoice(id)`: Hạch toán hoặc hủy hạch toán sổ cái.
- `bulkSetBranch(ids, branchId)`: Gán chi nhánh hàng loạt.
- `bulkSetNotes(ids, notes)`: Cập nhật ghi chú hàng loạt.
- `linkVouchers(id, payload)` / `unlinkVoucher(id, voucherId)`: Gán/Hủy cấn trừ sao kê.
- `syncPortal(dto)` / `loginPortal(dto)` / `getPortalCaptcha()`: Tương tác Cổng thuế GDT.
- `bulkImportBuyerXml(formData)` / `bulkImportSellerXml(formData)`: Upload hàng loạt XML/PDF.
- `bulkDownloadFiles(query, types)` / `bulkDownloadSelected(ids, types)`: Tải ZIP hàng loạt.
- `startExportExcelBackground(query)` / `getExportExcelBackgroundHistory()`: Quản lý xuất Excel nền.

---

## 5. Tích hợp Liên Module

1. **`purchase-orders-core`**:
   - Sử dụng `PurchaseInvoicePickerDrawer` để chọn và gán hóa đơn vào Đơn mua hàng PO.
   - Nhận diện `supplier_invoice_no` trên PO liên kết với `invoice_no` của hóa đơn.
2. **`accounting`**:
   - Tương tác với hệ thống chứng từ Sổ cái kép (`JournalEntry`).
   - Tích hợp với `SinvoiceDraftDrawer` và `sinvoiceApi` khi phát hành HĐĐT trực tiếp sang Viettel SInvoice.
3. **`bank-transactions-core` / `cashflow`**:
   - Xem chi tiết sao kê qua `BankTransactionDetailDrawer` ngay từ bảng cấn trừ hóa đơn.
4. **`branches`**:
   - Đồng bộ danh sách chi nhánh qua `getBranchesApi` cho bộ lọc và gán chi nhánh hóa đơn.
5. **`system / attachments`**:
   - Lưu trữ và tải tệp tin thông qua `attachmentsApi`.
6. **`module-config` (Thuộc tính động & Thuộc tính chung)**:
   - Nhúng `ModuleEntityCustomFieldsSection` vào `ErpInvoiceInternalInfo` hiển thị 2 drawer sections: `Thuộc tính chung` (Global) và `Danh mục & Thuộc tính` (Category).
   - `useErpInvoiceForm` tự động khởi tạo form state từ `customAttributes`/`globalAttributes` trả về bởi API `/api/v1/erp-invoices`, validate các trường `isRequired` trước khi lưu và hiển thị banner lỗi `setFormError` + `toast.error`.

---

## 6. Quy tắc Kiểm tra & QC UI Mandate

### 6.1. Tiêu chuẩn UI & Tương thích
- Tuân thủ cấu trúc component nguyên tử (Atomic UI components): bảng sử dụng `SpreadsheetPageTemplate`, drawer sử dụng `DrawerModal` / `StandardFormDrawer`.
- Luôn hiển thị trạng thái hạch toán `postingStatus` và trạng thái hợp lệ `isValid` bằng `Badge` màu tiêu chuẩn.
- Các cột số tiền phải format bằng font số chuẩn `tabular-nums` và căn lề phải.
- Xử lý mượt mà Server-Sent Events (SSE) với cờ keep-alive ping 15s để tránh timeout kết nối.

### 6.2. Lệnh Kiểm thử & Typecheck
```bash
# Chạy vitest cho module hóa đơn trong erp-web
bun run test src/modules/erp-invoices-core

# Kiểm tra TypeScript typecheck toàn bộ web app
bun run type:check

# Kiểm tra lint và format code
bun run lint:check
```
