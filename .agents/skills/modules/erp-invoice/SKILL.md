---
name: erp-invoice-web
description: Module tri thức Quản lý Hóa đơn Điện tử & Dashboard Hóa đơn (ERP Invoices & Dashboard) trong erp-web. Chứa toàn bộ cấu trúc UI, routing, DataTable columns, Drawers, Modals, XML/GDT Sync, SSE Progress, API client và các tương tác UX.
---

# 🎨 Module Tri Thức: Quản Lý Hóa Đơn Điện Tử (ERP Invoices) - Frontend (`erp-web`)

## 1. Tổng quan & Đăng ký Giao diện

> [!NOTE]
> Đặc tả chi tiết về Database Schema, Entity, DTOs, API Endpoints, Hạch toán Kế toán Kép Thông tư 99, 5-Slot Heartbeat Cron GDT Sync và Phân loại AI 9router của module Hóa đơn được lưu trữ tại:
> 👉 [`erp-invoice-api`](erp/erp-api/.agents/skills/modules/erp-invoice/SKILL.md)

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
  2. `tab=in`: **Hóa đơn mua vào** (Header Table, chiều `IN`, Unified View & Filter Dropdown: `tax_tab` `[ Tất cả | Mới | Thay thế | Điều chỉnh ]` gom chung với `view_mode` Presets).
  3. `tab=in-lines`: **Bảng kê HHDV mua vào** (Lines Table, chiều `IN`, PillTab: `subcat` `[ Tất cả dòng | Hàng hóa | Chiết khấu ]`).
  4. `tab=out`: **Hóa đơn bán ra** (Header Table, chiều `OUT`, Unified View & Filter Dropdown: `tax_tab` gom chung với `view_mode` Presets).
  5. `tab=out-lines`: **Bảng kê HHDV bán ra** (Lines Table, chiều `OUT`, PillTab: `subcat`).
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
│       │   ├── ErpInvoiceDetailDrawer.tsx     # Vỏ V2StandardDrawer (3 Top Tabs, 2-columns, xl); dùng chung cho list và standalone
│       │   ├── ErpInvoiceDetailDrawer.presentation.hook.tsx # Ghép nội dung/tab/panel phải và trạng thái trình bày
│       │   ├── ErpInvoiceDrawerTabs.tsx       # Helper/Hook builder 3 Top Navigation Tabs cho Drawer (< 160 LoC)
│       │   ├── ErpInvoiceDetailDrawerModals.tsx# Sub-organism gom 4 selection modals (Bank NetOff, PO, SO, Case < 80 LoC)
│       │   ├── ErpInvoiceDetailDrawer.hook.tsx# Hook quản lý form state, mode xem/sửa, deep links & auto-calculate
│       │   ├── ErpInvoiceDetailDrawer.state.ts# Initial state & validation schema
│       │   ├── ErpInvoiceAccountingSection.tsx# Section hạch toán kế toán chuẩn DrawerSection (tiêu đề, icon BookOpen, badge trạng thái)
│       │   ├── ErpInvoiceInternalMain.tsx     # Cột Trái: ErpInvoiceAdjustmentSection (trên đầu), Bảng hàng, PDF
│       │   └── ErpInvoiceInternalSidebar.tsx  # Cột Phải: Tra cứu/PDF, Thông tin chung, debtSlot, Thuộc tính mặc định & tùy chỉnh
│       ├── erp-invoice-settlement-right-panel/# Cột phải tab Chứng từ & Tài chính (tái sử dụng Sidebar + DebtSection)
│       │   ├── ErpInvoiceSettlementRightPanel.tsx # Container kết hợp Sidebar với debtSlot
│       │   └── ErpInvoiceSettlementDebtSection.tsx# Section Công nợ & Mục tiêu cấn trừ
│       ├── erp-invoice-settlement-tab/        # Tab Tài chính & Đối soát hợp nhất trong Drawer
│       │   ├── ErpInvoiceSettlementTab.tsx    # Giao diện đối soát: Sub-tabs Sao kê & Sổ quỹ
│       │   ├── ErpInvoiceSettlementTab.hook.ts# Hook tính toán dư nợ, auto-match, net-off actions
│       │   └── context/                       # Context chia sẻ state chọn giao dịch & số dư
│       ├── erp-invoice-unified-settlement-table/ # Bảng hợp nhất giao dịch ngân hàng & sổ quỹ
│       ├── erp-invoice-partner-tab/           # Tab Đối tác & Chi tiết hóa đơn (Chuẩn Atomic 5 tầng < 180 LoC)
│       │   ├── ErpInvoicePartnerTab.tsx       # Root Organism điều phối 3 sub-views (details, accounting, linked_docs < 110 LoC)
│       │   ├── ErpInvoicePartnerTab.hook.ts   # Custom hook - state tab chính/tab con, partner info, preview
│       │   ├── ErpInvoiceDetailTabNav.tsx     # Molecule điều hướng 3 sub-pills (Chi tiết HĐ, Hạch toán, Chứng từ liên kết < 100 LoC)
│       │   ├── ErpInvoicePartnerTabNav.tsx    # Barrel & Sub-nav của tab Đối tác (< 100 LoC)
│       │   ├── ErpInvoiceLinkedDocsSection.tsx# Sub-organism Sơ đồ luồng chứng từ liên kết & Traceability (< 110 LoC)
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
  - `ErpInvoiceDetailDrawer.tsx`: Form drawer chính, tích hợp `V2StandardDrawer` layout 2 cột, size `xl`; cùng component phục vụ drawer từ danh sách và standalone.
  - `ErpInvoiceDetailDrawer.presentation.hook.tsx`: Quản lý sub-tab chi tiết, tiêu đề/trạng thái và ánh xạ các tab V1 sang `V2StandardDrawer`, bao gồm panel phải theo từng tab.
  - `ErpInvoiceDetailDrawer.hook.tsx`: Quản lý toàn bộ state, validation, tính toán tổng tiền, và gọi API lưu.
  - `ErpInvoiceInternalMain.tsx`: Khu vực làm việc chính gồm Thông tin hóa đơn, Bảng dòng hàng, và Tab Tài chính.
  - `ErpInvoiceInternalSidebar.tsx`: Cột thông tin phụ gồm Tra cứu/PDF gốc NCC, Thông tin chung, `debtSlot` (khi có), Thuộc tính mặc định Module Config, Thuộc tính tùy chỉnh.
  - `erp-invoice-settlement-right-panel/`: Gồm `ErpInvoiceSettlementRightPanel.tsx` (tái sử dụng `ErpInvoiceInternalSidebar` kèm `debtSlot`) và `ErpInvoiceSettlementDebtSection.tsx` (Section Công nợ & Mục tiêu cấn trừ).
- **Quy chuẩn Cột Phải (Right Panel) Đồng Nhất**:
  - Các tabs trong drawer (`invoice_details`, `invoice_partner`, `history`) đều hiển thị các drawer section ở cột phải:
    1. *Thông tin tra cứu & PDF gốc NCC* (`ProviderLookupInfoCard` - tự động ẩn nếu không có).
    2. *Thông tin chung hóa đơn* (`ErpInvoiceGeneralInfoSection`: số HĐ, ngày ký, mẫu số, chi nhánh, tags...).
    3. *Thuộc tính mặc định* (`ErpInvoiceDefaultAttributesSection`: trạng thái thuế, loại hóa đơn...).
    4. *Thuộc tính tùy chỉnh* (`ModuleEntityCustomFieldsSection`: custom attributes đa module).
  - Riêng khi ở sub-tab **Chứng từ liên kết** (`linked_docs`), Right Panel tự động chuyển sang `ErpInvoiceSettlementRightPanel`, bổ sung thêm drawer section **Công nợ & Mục tiêu cấn trừ** (`ErpInvoiceSettlementDebtSection`: tiến độ thanh toán, nợ còn lại, progress bar, nút xác nhận cấn trừ đợt này...) qua prop `debtSlot`.
- **Các phân khu & Tabs chính**:
  1. `erp-invoice-general-info`: Số HĐ, ký hiệu, ngày lập, chi nhánh, thông tin người bán, thông tin người mua (MST, tên, địa chỉ, CCCD).
  2. `erp-invoice-detail-lines-table`: Bảng dòng mặt hàng động (Tên hàng, mã, ĐVT, số lượng, đơn giá, tiền trước thuế, thuế suất %, tiền thuế, chiết khấu, thành tiền).
  3. `erp-invoice-settlement-tab` (Drawer **Sao kê / Sổ quỹ** mở từ dropdown "Ghép nối chứng từ" → Bank Txn, hoặc action "Đối soát dòng tiền" qua `activeTabKey="financials"`): Tích hợp đối soát dòng tiền, gồm Sub-Tabs (`1. Sao kê` / `2. Sổ quỹ`), Quick View Presets (`Tất cả`, `Gợi ý khớp`, `Đang chọn`, `Đã cấn trừ`), Bảng hợp nhất `erp-invoice-unified-settlement-table`.
  4. `DrawerDocumentTraceability` (nằm trong sub-tab **Chứng từ liên kết** của tab Chi tiết): Sơ đồ liên kết đa tầng PO, SO, Bank Txn, Garage Cases bọc trong `ErpInvoiceLinkedDocsSection` (DrawerSection collapsible). Dropdown "Ghép nối chứng từ" chọn loại nào thì mở modal chọn tương ứng (Bank → Sao kê, PO, SO, Garage Case).
  - **3 Top Tabs chính của drawer** (tinh gọn chuẩn hóa):
    - `invoice_details` (**Chi tiết**): Chứa hàng điều hướng Molecule `ErpInvoiceDetailTabNav` gồm 3 sub-pills:
      1. `[Chi tiết hóa đơn]` (mặc định): nội dung HĐ, chi tiết mặt hàng, bảng kê và 2 buttons căn phải `[Xem trước HĐ thuần]` | `[Tài liệu & PDF]`.
      2. `[Hạch toán kế toán]`: `ErpInvoiceAccountingSection` bọc chuẩn `DrawerSection` (icon BookOpen, badge ĐÃ HẠCH TOÁN/ĐANG BẬT/CHƯA HẠCH TOÁN, hỗ trợ view summary & edit định khoản Nợ/Có).
      3. `[Chứng từ liên kết]`: `ErpInvoiceLinkedDocsSection` (Sơ đồ luồng chứng từ liên kết & Traceability Graph), kèm badge đếm tổng số chứng từ liên kết, tự động chuyển Right Panel sang `ErpInvoiceSettlementRightPanel`.
    - `invoice_partner` (**Chi tiết theo NCC/KH**, `ErpInvoicePartnerSection`: 3 sub-pill `[Chi tiết theo đối tượng]` | `[Bảng kê HHDV]` | `[Biến động & Phân tích]`).
    - `history` (**Lịch sử & Kiểm duyệt**): Nhật ký kiểm toán bọc trong `DrawerSection` collapsible (`DrawerAuditTimeline`).

- Hai nút bên phải bind `activeTabKey` với `detailViewMode` (`template`/`pdf`); cùng mode đó điều khiển nội dung preview qua `InvoicePreviewModeContext`. Default là `template`; active có nền token V2 còn inactive để nền trong suốt.
  - **Deep links tương thích**:
    - `activeTabKey="financials"` (action "Đối soát dòng tiền"): chuyển sang tab `invoice_details`, tự động kích hoạt sub-tab `linked_docs` và mở modal Sao kê.
    - `activeTabKey="linked_docs"`: tự động chuyển hướng sang tab `invoice_details` với sub-tab `linked_docs`.
    - `activeTabKey="accounting"`: tự động chuyển hướng sang tab `invoice_details` với sub-tab `accounting`.
    - `partnerViewMode` `lines`/`invoices`: mở tab `invoice_partner`.
  - **Tối ưu hiệu năng đã áp dụng (drawer chi tiết)**:
    - `ErpInvoiceSettlementProvider` nhận `loadSelectionData={false}` từ drawer: không tải 50 dòng sao kê và gợi ý cấn trừ khi mở drawer; chỉ dữ liệu công nợ được nạp. Query `getTransactions` vẫn chỉ bật khi sub-tab `bank_statement` đang mở.
    - `onOpenNetOffModal`/`onOpenPoModal`/`onOpenSoModal`/`onOpenGarageCaseModal` là `useCallback` ổn định, và `setTraceabilityCount` chỉ cập nhật khi số đếm đổi, để `CanvasView` không tính lại layout khi drawer render.
    - `settlementRightPanel` dùng chung cây `div > ErpInvoiceInternalSidebar` với `defaultRightPanel` (chỉ thêm `debtSlot`), nên đổi sub-tab "Chứng từ liên kết" không mount lại sidebar.
    - `useTraceabilityLogic` chỉ gọi `fetchGraph` một lần khi mount; refetch silent chỉ khi thoát edit mode (chuyển true → false).
  - **Sơ đồ V2 (chưa nối)**: `src/v2/shared/components/organisms/v2-document-traceability/` đã có canvas, pipeline, bảng kê, thanh công cụ, xác nhận gỡ liên kết và entry `V2DocumentTraceability`. Drawer hóa đơn vẫn dùng bản V1 cho đến khi nối (Task 3.1). Mở chứng từ qua callback `onOpenDocument`, không dùng event `window` của V1.
  5. `erp-invoice-pdf-upload`: Danh sách các file PDF đính kèm, hỗ trợ xem trước inline qua PDF viewer (`erp-invoice-pdf-preview`) hoặc tải xuống.
  6. `erp-invoice-default-attributes-section`: Tích hợp 2 drawer sections: `Thuộc tính chung` (Global) và `Danh mục & Thuộc tính` (Category) từ Module Config.

### 3.4. Dashboard Hóa Đơn (`InvoiceDashboard.tsx`)
- **Thống kê KPI**: Tổng doanh số mua vào/bán ra, tổng thuế VAT đầu vào được khấu trừ, thuế VAT đầu ra phải nộp, chênh lệch thuế VAT ròng.
- **Biểu đồ trực quan**:
  - Biểu đồ xu hướng dòng tiền `cashTrend` (12 tháng gần nhất).
  - Chuyển đổi linh hoạt giữa chế độ xem Doanh số (`invoice`) và chế độ xem Thuế (`vat`).
- **Bảng kê Đối tác / Nhà cung cấp (`InvoicePartnersTable`)**: Bảng tổng hợp giá trị mua/bán theo từng mã số thuế, hỗ trợ click mở `partner-invoice-drawer` để xem ngay danh sách hóa đơn của đối tác đó.

### 3.5. Drawer Xuất Excel Hóa Đơn (`invoice-export-drawer`)
- **Bố cục 2 Cột Chuẩn Hóa (`layout="2-columns"`)**:
  - **Cột Trái (Left Panel)**: Gom 2 `DrawerSection` gồm:
    1. `DrawerSection` **Cột xuất dữ liệu** (`InvoiceExportColumnSelector`): Bật/tắt 22 cột trên Sheet 1 ("Bảng kê") theo 5 nhóm nghiệp vụ, hiển thị lưới 3 cột `grid-cols-1 sm:grid-cols-2 md:grid-cols-3` thoáng đẹp, có nút Chọn tất cả/Mặc định/Bỏ chọn, tự động ghi nhớ vào `localStorage` (`erp_invoice_export_selected_columns`). Mở sẵn `defaultCollapsed={false}`.
    2. `DrawerSection` **Lịch sử xuất file** (`StandardTable`): Danh sách các file kết quả xuất trong 24 giờ, tiến độ SSE thời gian thực và nút tải lại.
  - **Cột Phải (Right Panel)**: Tập trung vào `DrawerSection` **Điều kiện xuất dữ liệu** (`InvoiceExportConditionSection`):
    - Chế độ xuất: `by-period` (Theo kỳ) hoặc `by-current-filter` (Theo filter bảng hiện tại).
    - Chuyển đổi kỳ bằng component chuẩn `<PillTabs<"month" | "quarter" | "custom">>` (`variant="pill"`, `size="sm"`): `[Theo tháng] | [Theo quý] | [Tùy chỉnh]` khớp với thiết kế sub-tabs trong Detail Drawer.
    - Lựa chọn Tháng/Quý tự động tính `dateFrom` - `dateTo`.
    - Nút bấm chính "Xuất Excel" kích hoạt tác vụ nền.
- **Tác vụ nền & Lịch sử tải lại**: Hỗ trợ Server-Sent Events (SSE) theo dõi tiến độ nền, cơ chế tái sử dụng file đã xuất trong 24h và bảng lịch sử có thể resize cột.
- **Kiến trúc Atomic Refactor (< 180 LoC, No Blue Mandate)**:
  - Phân rã triệt để thành: `InvoiceExportDrawer.tsx` (~110 LoC), `InvoiceExportDrawer.columns.tsx` (158 LoC), `InvoiceExportDrawer.hook.ts` (~92 LoC), `InvoiceExportDrawer.scope.hook.ts` (~120 LoC), `InvoiceExportDrawer.sync.hook.ts` (147 LoC), `InvoiceExportDrawer.helper.tsx` (~115 LoC).
  - Molecules & Atoms: `InvoiceExportConditionSection.tsx` (~140 LoC), `InvoiceExportColumnSelector.tsx` (~160 LoC), `InvoiceExportModeSelector.tsx` (96 LoC), `InvoiceExportFilterPreview.tsx` (75 LoC), `CustomRadioIndicator.tsx` (28 LoC).
  - **No Blue Mandate**: 0% màu xanh dương. Native browser `<input type="radio">` và `<input type="checkbox">` được bọc `sr-only` và custom chuẩn tone neutral `foreground` / `background`. Badge trạng thái `RUNNING` dùng `amber` tone (`bg-amber-50 text-amber-700`).

### 3.6. Drawer Xuất PDF / Tải ZIP Hóa Đơn (`invoice-file-export-drawer`) & thành phần xuất dùng chung
- **Dùng chung với drawer Excel** (nằm trong `invoice-export-drawer/`): `InvoiceExportDrawerShell` (khung `StandardFormDrawer` 2 cột: trái = lịch sử/thông tin, phải = điều kiện), `InvoiceExportConditionSection` (props mới: `modes`, `selectedCount`, `startLabel`, `startIcon`, `children`), `InvoiceExportModeSelector` (thêm mode `selected`, data-driven theo `modes[]`), `InvoiceExportFileTypeSelector` (checkbox PDF/XML), hook `useInvoiceExportScope` (`InvoiceExportDrawer.scope.hook.ts`: state kỳ/ngày/mode + `buildScopeQuery()`).
- **`InvoiceFileExportDrawer`** (`invoice-file-export-drawer/`): nút "Tải hóa đơn" (ZIP đồng bộ, không job nền, không lịch sử). Gói chỉ chứa đúng loại đã tick: PDF → chỉ PDF thật; XML → file .xml (kể cả khi nhà cung cấp gửi zip). Mode `selected` (chỉ khi có `selectedIds`, mặc định khi có chọn) gọi `bulkDownloadSelected`; `by-period` / `by-current-filter` gọi `bulkDownloadFiles` (backend chỉ áp `date_from`, `date_to`, `direction`, `status`, `search`).
- **Điểm mở**: menu header "Xuất PDF" (`handleExportPdf`) và bulk dropdown "Xuất PDF / Tải ZIP" (tiêu đề drawer giữ nguyên); cùng state `fileExportDrawerOpen` trong `useInvoiceBulkActions`, render trong `InvoiceBulkModals`. Đã thay `DrawerModal` "Tải ZIP N hóa đơn đã chọn" cũ; drawer "Tải hàng loạt theo tháng" giữ nguyên.

### 3.7. Biểu Đồ Dashboard Tổng Quan (`InvoiceDashboard` & `V2ComboChart`)
- **`BranchInvoiceChart`**: Hiển thị biến động Hóa đơn (Doanh thu `OUT` - Cột Emerald `#059669`, Chi phí `IN` - Cột Orange `#ea580c`, Lợi nhuận gộp - Đường Line Teal `#2dd4bf` Dark / `#0d9488` Light với `tension: 0.3` mềm mại).
- **`BranchVatChart`**: Hiển thị biến động Thuế VAT (VAT Đầu vào, VAT Đầu ra, Chênh lệch).
- **Chuẩn hóa V2**: Sử dụng component `V2ComboChart` kế thừa `V2ChartFrame` hỗ trợ chuyển đổi tức thì giữa chế độ xem Biểu đồ (Chart View) và Bảng chi tiết (Table View), dot viền tương phản `theme.surface`, và tooltip gom đa chuỗi `interaction: { mode: "index" }`.

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
- Tab "Tài liệu & PDF" (`InvoiceDocumentWorkspace.helper.ts` → `normalizeInvoiceDocuments`): gộp `pdfFileKey`, `pdfFiles`, `attachments` và zip gốc từ `xmlFileKey` (nhãn theo tên file, chỉ tải, không xem trước). Zip gốc không tạo dòng attachment, nên HĐ từ cổng thuế vẫn hiện file dù không có `erp_invoice_attachments`.
- Drawer "Tải hóa đơn" có 3 loại file: PDF, XML, ZIP (gói gốc NCC). Gửi `types` tương ứng lên `bulk-download-*`.
- **Chỉnh sửa hàng loạt** (`bulk-edit-drawer/`): state phân loại/chi nhánh/ghi chú nằm ở `useBulkEditAssignments.ts`, seed snapshot một lần mỗi lần mở (không seed lại khi mảng HĐ đổi identity), nên không mất chỉnh sửa. Ghi chú bulk ghi vào `notes` (API `bulk-set-notes`).
- **Ghi chú** trên thẻ "THÔNG TIN CHUNG" đọc `notes` (không đọc `description`, vốn là diễn giải/tên hàng từ cổng thuế). Ô sửa tay chỉ ghi `notes`.
- `startExportExcelBackground(query)` / `getExportExcelBackgroundHistory()`: Quản lý xuất Excel nền.

---

### 4.1 Thông tin tra cứu & upload PDF (hóa đơn mua vào)

- Hook React Query (`hooks/`): `useOriginalPdfLookupInfo(id)` (useQuery, key `erp-invoice-lookup-info`), `useDownloadOriginalPdf()`, `useManualUploadPdf()` (useMutation, invalidate `erp-invoices`).
- Thẻ `molecules/provider-lookup-info-card/`: Chuẩn hóa bằng `<DrawerSection>` (V2) collapsible, hiển thị tên NCC + badge trạng thái PDF (`OriginalPdfStatusBadge` dùng V2 Badge & `V2Tooltip`) trên header; mã tra cứu và hints (`LookupHintRow` dùng `V2Button`), nút mở cổng (`V2Button`), tải PDF gốc (`V2Button`), tải lên PDF đã tải (`ManualPdfUploadButton` dùng `V2Button`, chỉ chấp nhận PDF ≤10MB). Props nhận dữ liệu từ parent, không gọi API trực tiếp.
- Drawer chi tiết: `ErpInvoiceInternalSidebar` hiển thị thẻ cho mọi hóa đơn mua vào, lấy dữ liệu từ `useOriginalPdfLookupInfo`.
- Danh sách: hành động "Thông tin tra cứu" trên dòng hóa đơn mua vào chưa có PDF, điều kiện trong `lookupAction.helper.ts` (`shouldShowLookupAction`).
- i18n: key `lookup*`, `downloadPdf*`, `uploadPdf*`, `invalidPdfFile` trong `locales/vi/lookup.ts` và `core/locale/accounting/erpInvoices/en.ts`.

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
- Tuân thủ cấu trúc component nguyên tử (Atomic UI components): bảng sử dụng `SpreadsheetPageTemplate`; drawer chi tiết hóa đơn dùng `V2StandardDrawer`, các drawer nghiệp vụ khác tiếp tục dùng primitive hiện hành của chúng.
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

## Đa chi nhánh (branchIds)

- API gán chi nhánh: `erpInvoicesCoreApi.bulkSetBranch(ids, branchIds: string[])`; `[]` = bỏ gán. Hiển thị cột chi nhánh nối tên bằng ", " từ `branchIds`.
- Bộ lọc cột chi nhánh là multi-select có lựa chọn "(Trống)" = `__BLANK__`.
- Component chọn nhiều dùng chung: `V2MultiCombobox` (`src/v2/shared/components/molecules/v2-multi-combobox/`), và filter type `multi-combobox` trong `FilterPanel`.
- Form chi tiết hóa đơn (`ErpInvoiceGeneralInfoEdit`, field "Chi nhánh") dùng `V2MultiCombobox` với `branchIds`; khi đổi, đồng bộ `branchId = branchIds[0]` để `ErpInvoiceAccountingSection` đọc đúng.
- Lưu ý popover trong drawer: `V2MultiCombobox` dùng Radix Popover nằm trong `V2DrawerSheet` (Radix Dialog modal). Các package `@radix-ui/react-focus-scope`, `react-dismissable-layer`, `react-focus-guards`, `react-portal`, `react-presence` phải chỉ có 1 bản (khai báo trong `overrides` của `package.json`); nhiều bản làm focus trap đóng popover ngay khi mở (không chọn được option).
- Chưa làm: drawer bulk-edit vẫn chọn đơn (gửi 0/1 phần tử); cần chuyển sang `V2MultiCombobox`.

---

## 7. Trang V2 Hóa đơn (tạm dừng, giữ code)

**Trạng thái hiện tại**: erp-invoice dùng **V1** (`ErpInvoicesPage`, `SpreadsheetPageTemplate`). Route `/v2/invoices` và đăng ký page V2 đã gỡ khỏi `v2RouteConfig.ts` và `v2PageRegistry.tsx` nên /v2/invoices hiện không có trang. Code module V2 vẫn giữ tại `src/v2/modules/finance-invoice/` để làm tiếp khi có thời gian; không có file nào bị xóa.

### 7.1. Phạm vi đã làm sẵn trên V2 (chưa đăng ký route)
- **Tab**: Tổng quan (`InvoiceShapeDashboard`), Hóa đơn mua vào (`IN`), Hóa đơn bán ra (`OUT`).
- **Drawer chi tiết** (`InvoiceShapeDetailDrawer`): chỉ đọc, mở qua `?overlay=invoice:<id>`, dữ liệu từ `useInvoiceDetailQuery`.
- **Chưa có** (đợt sau): sửa, hạch toán, bulk, net-off, đồng bộ/import, xuất Excel/PDF, tab Tài chính và Chứng từ liên kết, tải PDF gốc.

### 7.2. Dữ liệu và API
- Client: `api/financeInvoiceV2Api.ts` qua `v2HttpClient`, đường dẫn `/api/v1/erp-invoices`. Module V2 **không import code V1** (kiểm tra bằng grep `from "@/modules` trong `src/v2/modules/finance-invoice`).
- Endpoint dùng: `GET /` (list), `GET /:id` (chi tiết, bọc `data`), `GET /column-options`, `GET /stats?direction` (KPI tháng), `GET /dashboard/stats` (cashTrend cashIn/cashOut/vatIn/vatOut), `GET /dashboard/partners`.
- DTO: `api/dtos/invoice.dto.ts`. Số tiền API là chuỗi decimal; `api/adapters/invoiceRowAdapter.ts` (`toInvoiceRow`, `invoiceTotalsToSummary`) chuyển sang shape cột V2 `FakeInvoice`. Tổng toàn bộ kết quả là `grandTotal*`.
- Dashboard: `domain/rules/invoiceDashboard.logic.ts` (thuần, có test) dựng KPI (VAT = tổng - trước thuế; VAT ròng = VAT đầu ra - VAT đầu vào), chuỗi biểu đồ và cơ cấu đối tác top 5 theo số bán ra.
- Dữ liệu mẫu (`api/sampleMode.ts`, `isInvoiceSampleMode`) chỉ dùng khi `MODE=test` hoặc thiếu `VITE_API_BASE_URL`. **Lỗi API thật không được thay bằng dữ liệu mẫu.**

### 7.3. Bảng và preference
- Table IDs: `erp-invoices-table-IN` / `erp-invoices-table-OUT`. Preference qua `v2ColumnPreferencesStorage` / `v2ViewPresetStorage` (store riêng `useV2TablePreferencesStore`). Cấu hình V1 chỉ được **chép một lần** sang V2 (`migrateV1TablePreferences`, bỏ alias `_2`/`__n`); sau đó không đồng bộ ngược. Sort và filter cột không nằm trong preference V2.
- Header filter động: `createInvoiceFetchOptions` (`api/queries/useInvoiceColumnOptions.ts`) gọi `financeInvoiceV2Api.getColumnOptions`.
- Cầu nối query V1⇄V2 (`erp-invoices-tab/hooks/useInvoiceV2Bridge.ts`) và cột V2 cho V1 (`useInvoiceV2Columns.tsx`) hiện không còn được V1 dùng; giữ file để tham khảo khi làm tiếp.

### 7.4. Kiểm thử
- Unit: `invoiceRowAdapter.test.ts`, `financeInvoiceV2Api.test.ts` (khóa đường dẫn API), `invoiceDashboard.logic.test.ts`, `useInvoiceV2Bridge.test.ts`.
- Integration: `tests/integration/ErpInvoiceV2ModulePage.test.tsx` (dữ liệu mẫu).
- Chưa kiểm tay trên trình duyệt với dữ liệu thật.

---

## 8. Cấu trúc i18n & Cơ chế Đồng Bộ Ngôn Ngữ V1/V2 (Dual-Run Locale Bridge)

### 8.1. Cầu nối đồng bộ tự động 2 chiều (react-i18n.ts)
- **Vấn đề đã xử lý**: Trong kiến trúc Dual-Run, `ErpInvoiceDetailDrawer` (V1) nhúng `V2StandardDrawer` và `DrawerConfirmCloseModal` (V2). `V2StandardDrawer` đọc ngôn ngữ qua `useV2Translation()` (`useV2LocaleStore`), còn app V1 dùng `useAppStore` (`erp-app`) và `react-i18next`. Trước đây 2 store này bị lệch, dẫn đến việc Confirm Close Modal hiển thị tiếng Anh ("Confirm closing form") trong khi giao diện app đang là tiếng Việt.
- **Giải pháp**: Thiết lập cầu nối 2 chiều tại `src/core/i18n/react-i18n.ts`:
  1. Khi app nạp: `useV2LocaleStore` đồng bộ ngay với `useAppStore.getState().locale`.
  2. Khi `useAppStore` đổi: tự động gọi `useV2LocaleStore.getState().setLocale(state.locale)`.
  3. Khi `useV2LocaleStore` đổi (từ V2 language switcher): tự động cập nhật `useAppStore.setLocale(state.locale)` và `i18n.changeLanguage(state.locale)`.
  4. Unit test bảo vệ: `src/core/i18n/__tests__/reactI18nSync.test.ts`.

### 8.2. Chuẩn hóa i18n Drawer chi tiết hóa đơn (`erp-invoices-core`)
- **Drawer Title**: Dùng `t("internalTitle", "Thông tin nội bộ")` (khai báo tại `actions.ts` và `en.ts`).
- **Action Groups**: Menu 3 chấm dùng `t("groupSync", "ĐỒNG BỘ")`, `t("syncGdt", "Đồng bộ từ GĐT")`, `t("groupExport", "XUẤT DỮ LIỆU")`, `t("exportInvoiceExcel", "Xuất Excel hóa đơn")`.
- **Status Badges**: `formatTaxInvoiceStatus(status, t)` hỗ trợ đa ngôn ngữ linh hoạt ("Mới" / "New", "Thay thế" / "Replaced", "Điều chỉnh" / "Adjusted", "Bị thay thế" / "Was Replaced", "Bị điều chỉnh" / "Was Adjusted", "Bị hủy" / "Cancelled").
- **Toasts**: Các thao tác liên kết PO, SO, ngân hàng và vụ việc garage sử dụng các khóa `toastLinkedBankSuccess`, `toastLinkedPoSuccess`, `toastLinkedSoSuccess`, `toastLinkedCaseSuccess`.

