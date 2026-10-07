---
name: erp-invoice-web
description: Module tri thức Quản lý Hóa đơn Điện tử & Dashboard Hóa đơn (ERP Invoices & Dashboard) trong erp-web. Chứa toàn bộ cấu trúc UI, routing, DataTable columns, Drawers, Modals, XML/GDT Sync, SSE Progress, API client và các tương tác UX.
---

# 🎨 Module Tri Thức: Quản Lý Hóa Đơn Điện Tử (ERP Invoices) - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

> [!NOTE]
> Đặc tả chi tiết về Database Schema, Entity, DTOs, API Endpoints, Hạch toán Kế toán Kép Thông tư 99, 5-Slot Heartbeat Cron GDT Sync và Phân loại AI 9router của module Hóa đơn được lưu trữ tại:
> 👉 [`erp-invoice-api`](file:///home/dev/repos-dev/erp/erp-api/.agents/skills/modules/erp-invoice/SKILL.md)

Module Hóa đơn Điện tử quản lý tập trung toàn bộ hóa đơn đầu vào (`IN`), hóa đơn đầu ra (`OUT`), hóa đơn nháp (`DRAFT`), và Dashboard phân tích dòng tiền/thuế hóa đơn. Giao diện được cấu trúc theo chuẩn **Atomic Design (Atoms -> Molecules -> Organisms)** đáp ứng quy chuẩn No Blue Mandate, Tabular Numbers và Multi-tab Navigation.

- **PageKeys**:
  - `erp-invoices`: Quản lý tập trung Hóa đơn điện tử với 6 Tabs (`overview`, `in`, `in-lines`, `out`, `out-lines`, `draft`).
  - `erp-invoices-in`: (Legacy Slug) Tự động redirect sang `erp-invoices?tab=in`.
  - `erp-invoices-out`: (Legacy Slug) Tự động redirect sang `erp-invoices?tab=out`.
  - `erp-invoices-draft`: (Legacy Slug) Tự động redirect sang `erp-invoices?tab=draft`.
  - `invoice-dashboard`: (Legacy Slug) Tự động redirect sang `erp-invoices?tab=overview`.
- **Sidebar Group**: `accounting` (Kế toán & Tài chính) > **Menu Nhóm Hóa đơn (`InvoiceNavGroup` - Molecule L2)**:
  - Sub-menu 1: **"Hóa đơn"** (`/erp-invoices`) - Quản lý 6 tabs Hóa đơn điện tử (Mặc định mở `?tab=overview`).
  - Sub-menu 2: **"Công nợ theo đối tượng"** (`/invoice-debts`) - Theo dõi, đối soát giao dịch và phân tích tuổi nợ chi tiết theo từng khách hàng, nhà cung cấp (Mặc định mở `?tab=overview`).
- **Cấu trúc 6 Tabs trên giao diện chính (`/erp-invoices`)**:
  1. `tab=overview` (mặc định): **Tổng quan** (`InvoiceDashboard` - Báo cáo KPI, xu hướng dòng tiền, VAT, công nợ đối tác).
  2. `tab=in`: **Hóa đơn mua vào** (Header Table, chiều `IN`, PillTab: `tax_tab` `[ Tất cả | Mới | Thay thế | Điều chỉnh ]` + `view_mode` Combobox).
  3. `tab=in-lines`: **Chi tiết mua vào** (Lines Table, chiều `IN`, PillTab: `subcat` `[ Tất cả dòng | Hàng hóa | Chiết khấu ]`).
  4. `tab=out`: **Hóa đơn bán ra** (Header Table, chiều `OUT`, PillTab: `tax_tab` + `view_mode` Combobox).
  5. `tab=out-lines`: **Chi tiết bán ra** (Lines Table, chiều `OUT`, PillTab: `subcat`).
  6. `tab=draft`: **Hóa đơn nháp** (`ErpInvoicesDraftPage` - Quản lý hóa đơn SInvoice Viettel nháp).
- **Tiến trình Đồng bộ Tự động (5-Slot Heartbeat Cron & Live SSE)**:
  - Hệ thống backend tự động đồng bộ định kỳ tại **5 mốc giờ chuẩn: 09:15, 15:15, 16:15, 17:15, 21:15 (Asia/Ho_Chi_Minh)**.
  - Frontend kết nối thời gian thực qua Server-Sent Events (`useInvoiceSyncProgress`) để hiển thị Notification banner tiến trình đồng bộ GDT, cảnh báo mật khẩu/captcha hoặc tỷ lệ thành công.
- **Breadcrumbs**:
  - `erp-invoices`: `Kế toán` > `Hóa đơn điện tử`
- **Route Components**:
  - `src/pages/ErpInvoicesPage.tsx` (Core Container Page cho `/erp-invoices`)
  - `src/pages/ErpInvoicesInPage.tsx` & `src/pages/ErpInvoicesOutPage.tsx` (Legacy Forwarders)
  - `src/pages/ErpInvoicesDraftPage.tsx` (Forwarder & Multi-tab Embedded Page)
  - `src/pages/InvoiceDashboard.tsx` (Forwarder & Multi-tab Embedded Page)
  - `src/pages/EInvoice.tsx`

---

## 2. Cấu trúc Source Code Frontend (Atomic Design)

```text
src/modules/erp-invoices-core/
├── api/
│   ├── erpInvoicesCoreApi.ts                  # API Client chính: CRUD, Sync GDT, File R2, Bulk Net-Off, Post/Unpost
│   ├── erpInvoicesCoreApi.spec.ts             # Unit test error handling và blob parsing
│   └── erpInvoiceDashboardApi.ts              # API Client cho Dashboard KPI & đối tác
├── components/
│   ├── index.ts                               # Unified barrel export (Atoms, Molecules, Organisms)
│   ├── atoms/                                 # CÁC THÀNH PHẦN NGUYÊN TỬ CƠ BẢN (Tầng 1)
│   │   ├── adjustment-type-badge/             # Badge phân loại hóa đơn điều chỉnh (Tiền, Thông tin, Số lượng, Thay thế)
│   │   ├── original-pdf-status-badge/         # [NEW] Badge hiển thị trạng thái tải PDF gốc nhà cung cấp (VinFast, MISA, Viettel...)
│   │   └── invoice-status-badge/              # Badge trạng thái xử lý thuế, hạch toán, hóa đơn gốc
│   ├── molecules/                             # CÁC PHÂN TỬ GIAO DIỆN TÁI SỬ DỤNG (Tầng 2)
│   │   ├── adjustment-original-invoice-card/  # Thẻ hiển thị HĐ gốc (#1474 C26TGA, ngày, tiền, link mở chi tiết)
│   │   ├── adjustment-financial-summary/      # Card tóm tắt tài chính so sánh Trước -> Điều chỉnh -> Hiệu lực
│   │   ├── adjustment-info-diff-card/         # Card hiển thị khác biệt thông tin (Biển số xe, Lệnh sửa chữa)
│   │   ├── adjustment-items-table/            # Bảng so sánh chi tiết từng dòng hàng hóa điều chỉnh (StandardTable Spreadsheet)
│   │   ├── provider-lookup-info-card/         # [NEW] Card thông tin nhà cung cấp, mã tra cứu, copy 1-chạm & mở portal
│   │   ├── coming-soon-tab-content/           # Placeholder tab đang hoàn thiện
│   │   ├── erp-invoice-attachments-sub-tab/   # Sub-tab quản lý danh sách file đính kèm
│   │   ├── erp-invoice-pdf-preview/           # Khung xem trước file PDF inline
│   │   ├── invoice-attachments-cell/          # Cell hiển thị icon & số lượng file đính kèm
│   │   ├── invoice-date-range-slot/           # Slot chọn khoảng thời gian lập hóa đơn
│   │   ├── invoice-document-preview-frame/    # Khung render văn bản hóa đơn trực quan
│   │   ├── invoice-file-list/                 # Danh sách file đính kèm kèm thao tác tải/xóa
│   │   ├── invoice-file-upload-section/       # Phân khu tải lên file PDF/XML/ZIP
│   │   ├── invoice-items-popover/             # Popover xem nhanh các dòng hàng của hóa đơn
│   │   ├── invoice-no-cell/                   # Cell hiển thị số HĐ, ký hiệu và copy nhanh
│   │   ├── invoice-partner-cell/              # Cell hiển thị thông tin đối tác & MST
│   │   ├── invoice-view-mode-combobox/        # Combobox chọn chế độ xem (Tổng quan / Đối soát / Custom)
│   │   ├── settlement-progress-card/          # Card hiển thị tiến độ đối soát & thanh toán
│   │   ├── settlement-voucher-list/           # Danh sách chứng từ thanh toán đã cấn trừ
│   │   ├── smart-match-comparison-popover/    # Popover so sánh gợi ý khớp tự động
│   │   ├── smart-suggestion-card/             # Card gợi ý ghép chứng từ thông minh
│   │   ├── vietnam-invoice-template/          # Template render hóa đơn điện tử chuẩn mẫu VN
│   │   ├── voucher-netoff-input/              # Input nhập số tiền cấn trừ có format số
│   │   ├── xml-import-result-summary/         # Tóm tắt kết quả import XML (thành công/trùng/lỗi)
│   │   ├── xml-upload-dropzone/               # Vùng kéo thả upload tệp XML/ZIP
│   │   └── xml-upload-file-list/              # Danh sách tệp XML chờ phân tích
│   └── organisms/                             # CÁC KHỐI CHỨC NĂNG & MÀN HÌNH HOÀN CHỈNH (Tầng 3)
│       ├── invoice-sync-advanced-modal/       # [NEW] Modal kích hoạt đồng bộ GDT nâng cao & tải PDF gốc nhà cung cấp
│       ├── erp-invoice-adjustment-section/    # DrawerSection chuyên dụng đối soát HĐ gốc/điều chỉnh ở Cột Trái (Main)
│       ├── related-invoice-sidebar-section/   # (Legacy) Section hiển thị HĐ liên quan trong Sidebar Drawer
│       ├── erp-invoices-tab/                  # Container Header Table (/erp-invoices?tab=in / out)
│       │   ├── ErpInvoicesTab.tsx             # Main component tích hợp SpreadsheetPageTemplate
│       │   ├── ErpInvoicesTab.hook.tsx        # Custom hook điều khiển lifecycle & dữ liệu tab
│       │   ├── ErpInvoicesTab.helper.ts       # Format số liệu & export helpers
│       │   ├── ErpInvoicesTabHeaderSection.tsx# Header toolbar, PillTabs thuế, search, action buttons
│       │   ├── ErpInvoicesTabColumns.tsx      # Khai báo dynamic columns theo view preset
│       │   ├── ErpInvoicesTabDrawers.tsx      # Quản lý mount các Drawer liên quan
│       │   ├── ErpInvoicesTabBulkModals.tsx   # Quản lý mount các Modals thao tác hàng loạt
│       │   ├── columns/                       # Thư mục chứa cấu hình chi tiết từng cột
│       │   └── hooks/                         # Sub-hooks quản lý pagination, filters, selections
│       ├── erp-invoice-items-section/         # Lines Table (/erp-invoices?tab=in-lines / out-lines)
│       │   ├── ErpInvoiceItemsSection.tsx     # Bảng phẳng hiển thị toàn bộ chi tiết dòng hàng
│       │   ├── ErpInvoiceItemsSection.hook.tsx# Hook quản lý store, filters và subcategory PillTabs
│       │   ├── ErpInvoiceItemsSection.columns.tsx # Cột hiển thị chi tiết dòng mặt hàng
│       │   └── hooks/                         # Hooks hỗ trợ query dòng hàng
│       ├── erp-invoice-detail-drawer/         # Drawer Chi Tiết Hóa Đơn Chuẩn Hóa
│       │   ├── ErpInvoiceDetailDrawer.tsx     # Form drawer chính kế thừa StandardFormDrawer (2-columns, xl)
│       │   ├── ErpInvoiceDetailDrawer.hook.tsx# Hook quản lý form state, mode xem/sửa, auto-calculate
│       │   ├── ErpInvoiceDetailDrawer.state.ts# Initial state & validation schema
│       │   ├── ErpInvoiceInternalMain.tsx     # Cột Trái: ErpInvoiceAdjustmentSection (trên đầu), Bảng hàng, PDF
│       │   └── ErpInvoiceInternalSidebar.tsx  # Cột Phải: Thông tin chung, Thuộc tính mặc định, Thuộc tính tùy chỉnh
│       ├── erp-invoice-settlement-tab/        # Tab Tài chính & Đối soát hợp nhất trong Drawer
│       │   ├── ErpInvoiceSettlementTab.tsx    # Giao diện đối soát: Sub-tabs Sao kê & Sổ quỹ
│       │   ├── ErpInvoiceSettlementTab.hook.ts# Hook tính toán dư nợ, auto-match, net-off actions
│       │   └── context/                       # Context chia sẻ state chọn giao dịch & số dư
│       ├── erp-invoice-unified-settlement-table/ # Bảng hợp nhất giao dịch ngân hàng & sổ quỹ
│       ├── erp-invoice-partner-tab/           # Tab Đối tác & Chi tiết hóa đơn (Chuẩn Atomic 5 tầng < 180 LoC)
│       │   ├── ErpInvoicePartnerTab.tsx       # Root Organism (< 150 LoC) - Quản lý 4 subtabs, luôn hiển thị Sub-tab 1
│       │   ├── ErpInvoicePartnerTab.hook.ts   # Custom hook (< 150 LoC) - State sub-tabs, partner info, preview
│       │   ├── ErpInvoicePartnerTabNav.tsx    # Molecule điều hướng subtabs & view mode toggles (< 150 LoC)
│       │   ├── ErpInvoicePartnerTabEmpty.tsx  # Molecule trạng thái rỗng khi đối tác chưa có MST/Tên (< 50 LoC)
│       │   ├── ErpInvoicePartnerRightPanel.tsx# Section hồ sơ đối tác ở cột phải (< 150 LoC)
│       │   └── ErpInvoicePartnerLinesSection/ # Sub-organism cho Sub-tab 3 (Chi tiết HHDV đối tác, < 180 LoC/file)
│       ├── erp-invoice-standalone-drawer/     # Drawer xem nhanh độc lập từ các màn hình khác
│       ├── partner-invoice-drawer/            # Drawer danh sách hóa đơn theo từng đối tác
│       ├── invoice-view-config-drawer/        # Drawer cấu hình View Mode & Tùy chỉnh cột
│       ├── invoice-posting-drawer/            # Drawer hạch toán sổ cái kép 1 hóa đơn
│       ├── invoice-bulk-posting-drawer/       # Drawer hạch toán / hủy hạch toán hàng loạt
│       ├── invoice-export-drawer/             # Drawer xuất Excel tác vụ nền SSE (2 chế độ: Theo kỳ hoặc Theo filter bảng hiện tại)
│       ├── gdt-portal-auth-drawer/            # Drawer đăng nhập Cổng Thuế GDT kèm giải Captcha
│       ├── erp-attachment-select-drawer/      # Drawer chọn tệp đính kèm từ kho chung
│       ├── bulk-edit-drawer/                  # Drawer sửa hàng loạt (gán Chi nhánh, Ghi chú)
│       ├── invoice-xml-import-modal/          # Modal xác nhận import XML/PDF
│       ├── voucher-netoff-selection-modal/    # Modal chọn giao dịch ngân hàng để cấn trừ
│       ├── purchase-order-selection-modal/    # Modal chọn Đơn mua hàng (PO) liên kết
│       ├── sales-order-selection-modal/       # Modal chọn Đơn bán hàng (SO) liên kết
│       ├── garage-case-selection-modal/       # Modal chọn Phiếu dịch vụ Garage liên kết
│       ├── all-bank-transactions-table/       # Bảng hiển thị tất cả giao dịch ngân hàng
│       ├── selected-bank-transactions-table/  # Bảng giao dịch đang được chọn để cấn trừ
│       ├── voucher-netoff-right-panel/        # Panel thao tác cấn trừ phiếu chi/thu
│       ├── erp-invoice-general-info/          # Section thông tin chung hóa đơn (Số, Ngày, Chi nhánh)
│       ├── erp-invoice-detail-lines-table/    # Bảng chi tiết mặt hàng trong form drawer
│       ├── erp-invoice-netoff-section/        # Section hiển thị lịch sử cấn trừ trong form
│       ├── erp-invoice-linked-documents/      # Section chứng từ liên kết (PO/SO/Garage/Bank)
│       ├── erp-invoice-default-attributes-section/ # Section thuộc tính động & Module Config
│       ├── erp-invoice-pdf-upload/            # Section upload và quản lý file PDF đính kèm
│       ├── off-system-manual-section/         # Section xử lý chứng từ ngoài hệ thống
│       ├── related-invoice-sidebar-section/   # Section hóa đơn gốc liên quan (thay thế/điều chỉnh)
│       ├── xml-import-result-tables/          # Bảng chi tiết danh sách hóa đơn sau import XML
│       ├── invoice-document-workspace/        # Workspace xem trước văn bản hóa đơn
│       └── invoice-detail-wrapper/            # Wrapper bao bọc modal chi tiết hóa đơn
├── layout-navigation/                         # LIÊN KẾT ĐIỀU HƯỚNG SIDEBAR CHUẨN UI ATOMIC (Tầng 2 - Molecule)
│   └── invoice-nav-group/                     # Molecule L2: Nhóm menu Hóa đơn & Chi tiết theo đối tượng
│       ├── InvoiceNavGroup.tsx                # Component TSX render NavGroup + 2 sub-items
│       ├── InvoiceNavGroup.hook.ts            # Hook quản lý active routes & handlers
│       ├── InvoiceNavGroup.type.ts            # Props contract
│       └── InvoiceNavGroup.test.tsx           # Co-located unit test
├── context/
│   └── InvoicePreviewModeContext.tsx          # Context quản lý chế độ xem trước (Preview Mode)
├── hooks/
│   ├── useErpInvoiceForm.ts                   # Core Form Hook: State, validation, Module Config, auto-calc
│   ├── useErpInvoiceForm.spec.ts              # Unit tests cho useErpInvoiceForm
│   ├── useErpInvoiceListStore.ts              # Zustand store quản lý state header table (IN/OUT)
│   ├── useErpInvoiceItemsStore.ts             # Zustand store quản lý state lines table (IN/OUT)
│   ├── useErpInvoicesList.ts                  # Query & state hook cho header table kèm filterPanel
│   ├── useErpInvoiceItemsList.ts              # Query & state hook cho lines table kèm subcat
│   ├── useErpInvoiceUrlSync.ts                # Hook đồng bộ URL query params và drawer state
│   ├── useErpInvoicesParallelPrefetch.ts      # Prefetch dữ liệu song song tối ưu tốc độ chuyển tab
│   ├── useErpInvoicesQueryConfigs.ts          # Cấu hình React Query keys & caching strategies
│   ├── useInvoiceSyncProgress.ts              # SSE Hook lắng nghe tiến trình đồng bộ GDT tự động
│   ├── useInvoiceExportProgress.ts            # SSE Hook theo dõi tiến độ tác vụ xuất Excel nền
│   ├── useInvoiceXmlUpload.ts                 # Hook quản lý tiến trình upload & parse XML hàng loạt
│   ├── usePortalSync.ts                       # Hook kích hoạt đồng bộ GDT thủ công
│   └── usePortalImport.ts                     # Hook quản lý import dữ liệu Cổng Thuế
├── locales/
│   └── vi.ts                                  # Bản dịch tiếng Việt chuyên biệt cho module Hóa đơn
└── utils/
    ├── gdtCaptchaSolver.ts                    # Thuật toán OCR giải mã Captcha SVG Cổng Thuế GDT
    ├── invoiceTaxCodeAccounting.ts            # Quy tắc map tài khoản kế toán theo MST đối tác
    ├── outInvoiceDisplay.ts                   # Helper phân loại dòng hóa đơn đầu ra
    └── uom.helper.ts                          # Helper chuẩn hóa đơn vị tính
```

---

## 3. Thành phần Giao diện & Logic Trọng tâm

### 3.1. Bảng Dữ liệu Hóa đơn (`ErpInvoicesTab`)
- **Khung giao diện**: Sử dụng `<SpreadsheetPageTemplate>` với 4 Top-level Tabs và thanh tính tổng (Summary footer) cố định bên dưới.
- **Phân rã Atomic Component**:
  - `ErpInvoicesTab.tsx`: Wrapper tích hợp template.
  - `ErpInvoicesTab.hook.tsx`: Điều khiển pagination, sorting, filters, và bulk selection.
  - `ErpInvoicesTabHeaderSection.tsx`: Chứa các nút chức năng, PillTabs Thuế, Search bar, View mode combobox.
  - `ErpInvoicesTabDrawers.tsx` & `ErpInvoicesTabBulkModals.tsx`: Độc lập hóa logic mở đóng các drawers và modals.
- **PillTabs Phân loại Thuế (API-driven & Cô lập)**:
  - Các tab: `Tất cả` (`all`), `Mới` (`new`), `Thay thế` (`replacement`), `Điều chỉnh` (`adjustment`).
  - Quản lý qua `activeTaxTab` trong `useErpInvoiceListStore` theo từng chiều `IN` và `OUT` riêng biệt, không bị rò rỉ khi chuyển tab.
- **Chế độ xem & Tùy chỉnh cột (View Mode Combobox & Drawer)**:
  - `invoice-view-mode-combobox`: Cho phép chọn giữa các preset chế độ xem (`Tổng quan`, `Kiểm toán / Đối soát`, và custom views). Quản lý độc lập theo `actualTableId` (`erp-invoices-table-IN` vs `erp-invoices-table-OUT`).
  - `invoice-view-config-drawer`: Drawer cấu hình view mode chuẩn `StandardFormDrawer` layout `1-column`, chia 3 nhóm cột (*Thông tin chung*, *Thuế & Trạng thái*, *Số tiền*), hỗ trợ chỉnh sửa cả view mặc định và view tự tạo, có nút **"Khôi phục mặc định"** (Reset to factory settings).
- **Chuyển đổi Tab Sạch sẽ (`handleTabChange`)**:
  - Khi chuyển qua lại giữa các tabs, query params trên URL tự động làm sạch và chỉ phản ánh các bộ lọc / pill tabs của tab đích, đồng thời khôi phục chính xác trạng thái của tab cũ khi quay lại.

### 3.2. Bảng Chi Tiết Dòng Hàng (`ErpInvoiceItemsSection` - Tab `in-lines` / `out-lines`)
- **Khung giao diện**: Hiển thị phẳng toàn bộ các dòng mặt hàng từ các hóa đơn với thanh tính tổng `summaryRow` và `PillTabs` phân loại dòng (`Tất cả dòng`, `Hàng hóa`, `Chiết khấu`).
- **Phân rã Module**: Chia tách thành `ErpInvoiceItemsSection.tsx`, `ErpInvoiceItemsSection.hook.tsx`, `ErpInvoiceItemsSection.columns.tsx` độc lập.
- **Store & Bộ lọc Riêng biệt**: Quản lý qua `useErpInvoiceItemsStore` độc lập cho từng chiều `IN` và `OUT`. Tích hợp Right Filter Panel (`useFilterPanel`), bộ lọc ngày, thẻ nhãn `tag_id`, đối tác mà không gây ảnh hưởng tới Header table.

### 3.3. Form Drawer Chi Tiết Hóa Đơn (`erp-invoice-detail-drawer`)
- **Kiến trúc Chia tách Sub-Components**:
  - `ErpInvoiceDetailDrawer.tsx`: Form drawer chính, tích hợp `StandardFormDrawer` 2 cột hoặc full-width tùy chế độ xem.
  - `ErpInvoiceDetailDrawer.hook.tsx`: Quản lý toàn bộ state, validation, tính toán tổng tiền, và gọi API lưu.
  - `ErpInvoiceInternalMain.tsx`: Khu vực làm việc chính gồm Thông tin hóa đơn, Bảng dòng hàng, và Tab Tài chính.
  - `ErpInvoiceInternalSidebar.tsx`: Cột thông tin phụ gồm Ghi chú, Thuộc tính động Module Config, File đính kèm.
- **Các phân khu & Tabs chính**:
  1. `erp-invoice-general-info`: Số HĐ, ký hiệu, ngày lập, chi nhánh, thông tin người bán, thông tin người mua (MST, tên, địa chỉ, CCCD).
  2. `erp-invoice-detail-lines-table`: Bảng dòng mặt hàng động (Tên hàng, mã, ĐVT, số lượng, đơn giá, tiền trước thuế, thuế suất %, tiền thuế, chiết khấu, thành tiền).
  3. `erp-invoice-settlement-tab` (Tab **Tài chính**): Tích hợp trực tiếp đối soát dòng tiền vào Drawer chi tiết, gồm Sub-Tabs (`1. Sao kê` / `2. Sổ quỹ`), Quick View Presets (`Tất cả`, `Gợi ý khớp`, `Đang chọn`, `Đã cấn trừ`), Bảng hợp nhất `erp-invoice-unified-settlement-table` fit height và Right Panel tính toán công nợ/tiến độ thanh toán.
  4. `DrawerDocumentTraceability` (Tab **Chứng từ liên kết**): Mạng lưới liên kết đa tầng PO, SO, Bank Txn, Garage Cases.
  5. `erp-invoice-pdf-upload`: Danh sách các file PDF đính kèm, hỗ trợ xem trước inline qua PDF viewer (`erp-invoice-pdf-preview`) hoặc tải xuống.
  6. `erp-invoice-default-attributes-section`: Tích hợp 2 drawer sections: `Thuộc tính chung` (Global) và `Danh mục & Thuộc tính` (Category) từ Module Config.

### 3.4. Dashboard Hóa Đơn (`InvoiceDashboard.tsx`)
- **Thống kê KPI**: Tổng doanh số mua vào/bán ra, tổng thuế VAT đầu vào được khấu trừ, thuế VAT đầu ra phải nộp, chênh lệch thuế VAT ròng.
- **Biểu đồ trực quan**:
  - Biểu đồ xu hướng dòng tiền `cashTrend` (12 tháng gần nhất).
  - Chuyển đổi linh hoạt giữa chế độ xem Doanh số (`invoice`) và chế độ xem Thuế (`vat`).
- **Bảng kê Đối tác / Nhà cung cấp (`InvoicePartnersTable`)**: Bảng tổng hợp giá trị mua/bán theo từng mã số thuế, hỗ trợ click mở `partner-invoice-drawer` để xem ngay danh sách hóa đơn của đối tác đó.

### 3.5. Drawer Xuất Excel Hóa Đơn (`invoice-export-drawer`)
- **Hai chế độ xuất dữ liệu linh hoạt (`exportMode`)**:
  - `by-period` (Theo kỳ - Mặc định): Cho phép chọn theo kỳ định sẵn hoặc tùy chỉnh khoảng ngày `dateFrom` - `dateTo`.
  - `by-current-filter` (Theo filter hiện tại): Giữ nguyên toàn bộ các điều kiện lọc và tìm kiếm đang xem trên bảng (`search`, `column_filters`, `column_search`, `status`, `tag_id`, khoảng ngày bảng, `sort_by`, `sort_order`). Giao diện tự động ẩn picker ngày và hiển thị thẻ tóm tắt bộ lọc bảng (`currentFilterSummary`).
- **Tác vụ nền & Lịch sử tải lại**: Hỗ trợ Server-Sent Events (SSE) theo dõi tiến độ nền, cơ chế tái sử dụng file đã xuất trong 24h và bảng lịch sử có thể resize cột.
- **Kiến trúc Atomic Refactor (< 180 LoC, No Blue Mandate)**:
  - Phân rã triệt để thành: `InvoiceExportDrawer.tsx` (98 LoC), `InvoiceExportDrawer.columns.tsx` (158 LoC), `InvoiceExportDrawer.hook.ts` (164 LoC), `InvoiceExportDrawer.sync.hook.ts` (147 LoC), `InvoiceExportDrawer.helper.tsx` (36 LoC).
  - Molecules & Atoms: `InvoiceExportConditionSection.tsx` (120 LoC), `InvoiceExportModeSelector.tsx` (96 LoC), `InvoiceExportFilterPreview.tsx` (75 LoC), `CustomRadioIndicator.tsx` (28 LoC).
  - **No Blue Mandate**: 0% màu xanh dương. Native browser `<input type="radio">` được bọc `sr-only` và thay bằng `CustomRadioIndicator` chuẩn tone neutral `foreground` / `background`. Badge trạng thái `RUNNING` dùng `amber` tone (`bg-amber-50 text-amber-700`).

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
