---
name: garage-cases
description: Module tri thức Quản lý Vụ việc Dịch vụ Garage & Sửa chữa xe trên erp-web (Frontend). Chứa toàn bộ cấu trúc trang, components, Drawer, status badge, quy tắc căn gióng, column visibility, hooks, tích hợp API và trang Tiến độ xưởng /garage-workshop-progress (status v2, status nhỏ, nhật ký, quyền garage_workshop).
---

# 📦 Module Tri Thức: Quản Lý Phiếu Dịch Vụ Garage (Garage Cases) - Frontend (`erp-web`)

## 1. Tổng quan Nghiệp vụ Frontend

Phân hệ Quản lý Phiếu Dịch Vụ Garage (`src/modules/garage/`) cung cấp giao diện quản lý toàn diện cho các hoạt động sửa chữa, bảo dưỡng tại xưởng dịch vụ:
- **Bảng Danh sách Phiếu Dịch Vụ (`/garage/cases`)**: Xem, tìm kiếm, lọc đa chiều, ẩn/hiện cột thông minh và xuất dữ liệu phiếu dịch vụ.
- **Xem Chi tiết & Sổ Báo Giá (`GarageCaseStandaloneDrawer`)**: Xem chi tiết thông tin khách hàng, phương tiện, cố vấn, tiến độ và bản xem trước tờ phiếu Báo giá & Lợi nhuận dự kiến.
- **Đồng bộ Dữ liệu Garage (`GarageCaseSyncDrawer`)**: Kích hoạt đồng bộ phiếu dịch vụ, lợi nhuận gộp và chi tiết từ KGara về ERP theo dải ngày. Không còn dropdown chi nhánh: bấm "Bắt đầu đồng bộ" khởi động job nền trên **mọi chi nhánh** (`POST /greenway/sync/all-branches`, `scope` = mode của drawer). Khoảng ngày mặc định là preset **6 tháng gần nhất** (`RECENT_MONTHS_PRESET = "recent-6m"`, `getRecentMonthsRange` trong `GarageCaseSyncDrawer.hook.ts`: từ đúng ngày này 6 tháng trước, `subMonths`, đến hôm nay), vẫn chọn được 2 tháng trước qua `getPastMonthPresets(2)`; drawer hiện thông báo `cases.syncDrawer.chunkNotice` (backend tách theo tháng, tháng mới trước). Drawer giữ mở và hiển thị `GarageBulkSyncProgress` (x/y chi nhánh, chi nhánh đang chạy, `x/y tháng` + khoảng tháng đang chạy từ `totalChunks`/`completedChunks`/`currentChunk`, danh sách "Tháng lỗi" từ `failedChunks`; lỗi chi nhánh đã có trong danh sách tháng thì không lặp lại). Trạng thái poll mỗi 2 giây khi `running` (`useGarageBulkSyncStatus`, `useStartGarageBulkSync` trong `hooks/useGarageBulkSync.ts`); khi xong thì làm mới `garage*` và báo toast một lần. Tùy chọn `GarageCaseSyncOptions.tsx` chỉ còn tải chi tiết và force ở mode `all`.
- **Không còn chi nhánh KGara ở luồng đọc V1 (2026-11-25, KINDU-1998)**: `garageApi` bỏ tham số `branchId` và header `x-greenway-branch-id` ở mọi hàm đọc, báo cáo, công nợ và xuất (`getCases`, `getCaseColumnOptions`, `getCaseServicesList`, `getCaseServiceColumnOptions`, `exportCaseServicesExcel`, `exportCompletedCasesExcel`, `getGrossProfitReport`, `getCustomersDebt*`, `getSuppliersDebt*`, `getCasesByCustomer(customerCode, licensePlate?)`, `getCasesBySupplier(supplierId)`, `getCaseByExternalId(externalId)`); drawer xuất không gửi header (`branchHeaders` đã xóa). Chỉ giữ header ở đồng bộ (`syncCases`, `syncGrossProfit`, `syncCaseDetail`, `syncCaseDetails`) và 3 lời gọi thẳng KGara (`getDashboard`, `getGrossProfit`, `getGrossProfitJournal`). Trang và hook không còn chặn `enabled` theo chi nhánh và không tự chọn `branches[0]`; `GarageBranchSelector` đã xóa; modal chọn vụ việc của hóa đơn (`GarageCaseSelectionModal`) bỏ ô chi nhánh. Đồng bộ chi tiết một phiếu lấy chi nhánh KGara từ chính phiếu (`branchExternalId`). Xe OJ tách bằng phân loại `OJ`. `garageStore.selectedBranchId` vẫn còn nhưng không còn nơi gán (luôn rỗng). E2E: `bun run e2e:garage-v1-no-branch`.

---

## 2. Cấu trúc Source Code

```text
src/modules/garage/
├── api/
│   └── garageApi.ts                 # API client gọi các endpoints backend (/api/v1/kgara-cases, /api/v1/kgara-gross-profit)
├── components/
│   ├── molecules/                   # Các molecule nguyên tử tái sử dụng
│   │   ├── garage-case-progress-cell/ # Molecule hiển thị tiến độ thu/chi tiền kèm progress bar & tooltip
│   │   └── ...
│   ├── organisms/                   # Các organism phức hợp chuẩn hóa < 180 LoC
│   │   ├── garage-cases-table/      # Bảng danh sách phiếu dịch vụ (GarageCasesTable) phân rã atomic
│   │   │   ├── GarageCasesTable.tsx # L3 Organism bọc DataTable
│   │   │   ├── GarageCasesTable.type.ts # Type contract & ColumnContext
│   │   │   ├── GarageCasesTable.columns.tsx # Aggregator kết hợp các nhóm cột
│   │   │   ├── GarageCasesTable.date-columns.tsx # Nhóm 5 cột ngày tháng
│   │   │   ├── GarageCasesTable.general-columns.tsx # Nhóm 11 cột thông tin chung (tích hợp Exclamation Tooltip phân loại KGara trong cột ERP)
│   │   │   ├── GarageCasesTable.vehicle-columns.tsx # 5 cột Số khung, Hãng xe, Dòng xe, Năm SX, Đối tượng thanh toán (mặc định ẩn), dựng từ cấu hình core
│   │   │   ├── GarageCasesTable.progress-columns.tsx # Nhóm 4 cột tiến độ thu/chi
│   │   │   ├── GarageCasesTable.financial-columns.tsx # Nhóm 10 cột tài chính P&L
│   │   │   └── GarageCasesTable.test.tsx # Unit tests kiểm tra 23 cột khớp view presets
│   │   └── ...
│   ├── garage-case-details-tab/     # Tab hợp nhất Chi tiết & Chi tiết theo đối tượng (PillTabs, sub-tab quote & partner)
│   ├── GarageCaseLinkedDocuments.tsx# Quản lý liên kết hóa đơn thuế
│   ├── GarageCasePreview.tsx        # Re-export mỏng của organism garage-case-preview
│   ├── organisms/
│   │   ├── garage-case-preview/     # Organism Sổ báo giá & Lợi nhuận dự kiến (Atomic 5 tầng, < 180 LoC)
│   │   │   ├── GarageCasePreview.tsx # Container DrawerSection bọc View Switch & Dual Views (Document / Table)
│   │   │   ├── GarageCasePreview.hook.ts # Hook quản lý mode, lọc dòng chi tiết, tính toán tài chính & lợi nhuận
│   │   │   ├── GarageCasePreview.type.ts # Contract types (QuoteLineItem, QuoteFinancialItem, QuoteProfitSummaryData)
│   │   │   ├── GarageCasePreview.helper.ts # Parsers & formatters tách biệt
│   │   │   ├── GarageCaseFinancial.helper.ts # Bóc tách danh mục tài chính (hoa hồng BH, môi giới, công nợ, thuế)
│   │   │   ├── components/
│   │   │   │   ├── QuotePreviewViewSwitch.tsx # Molecule switch Bản in (Document) ⇄ Bảng dữ liệu (Table)
│   │   │   │   ├── QuotePreviewDocument.tsx # Chế độ Bản in chuẩn hóa gồm Header, InfoGrid, Tables, Summary, Signatures
│   │   │   │   ├── QuotePreviewTables.tsx # Chế độ Bảng dữ liệu: 2 bảng StandardTable variant="spreadsheet"
│   │   │   │   ├── document/        # Sub-components < 150 LoC cho bản in (Header, InfoGrid, Tables, Summary, Signatures)
│   │   │   │   └── tables/          # Sub-components < 180 LoC cho 2 bảng (QuoteLinesTable, QuoteFinancialsTable)
│   ├── GarageCaseSettlementDrawerModal.tsx # Wrapper cấn trừ dòng tiền & sổ ngoài sử dụng VoucherNetoffSelectionModal
│   ├── GarageCaseSettlementSection.tsx # Section quản lý cấn trừ thu/chi dòng tiền vụ việc
│   ├── GarageCaseStandaloneDrawer.tsx # Drawer chi tiết phiếu dịch vụ 4 tab Top-level chuẩn UI
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
│   ├── GarageCases.tsx              # Trang chính Quản lý Phiếu dịch vụ (nhãn UI từ 2026-10-17: "Hoạt động garage")
│   ├── GarageCustomers.tsx          # Trang Quản lý Công nợ Khách hàng (SpreadsheetPageTemplate)
│   ├── GarageDashboard.tsx          # Dashboard tổng quan hoạt động Garage
│   ├── GaragePayables.tsx           # Sổ công nợ phải trả Garage (legacy)
│   ├── GarageReceivables.tsx        # Sổ công nợ phải thu Garage (legacy)
│   └── GarageSuppliers.tsx          # Trang Quản lý Công nợ Nhà cung cấp (SpreadsheetPageTemplate)
├── store/
│   └── garageStore.ts               # Zustand store `selectedBranchId` (không còn nơi gán từ 2026-11-25, luôn rỗng)
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
  6. `customerCode` & `customerName`: Mã & Tên khách hàng. Khi tên trên phiếu (`tenKhachHang` V1 / `voucherCustomerName` V2) khác tên danh mục, `GarageCaseCustomerCell` hiện thêm dòng phụ "Tên trên phiếu: …"; drawer thông tin chung có dòng "Tên trên phiếu"; bộ chọn cột export có `tenKhachHang` (mặc định 31 cột). V2 dùng `GarageVoucherNameText` / `voucherNameIfDiffers` từ `@/v2/core/cases-garage` (Kanban, popover xe, thẻ tiến độ xưởng, danh sách xe dashboard).
  7. `doanhThu`, `chiPhi`, `loiNhuan`, `margin`: Nhóm chỉ số tài chính (căn phải, định dạng tiền tệ / %).
  8. `classification`: Phân loại ERP (170px, căn giữa, dropdown đổi nhanh tích hợp button icon exclamation kèm Tooltip hiển thị Phân loại KGara khi hover).
  9. `statusName`: Trạng thái dịch vụ (căn giữa, `KgaraCaseStatusBadge`).
  10. `collectionProgress` & `costProgress`: Tiến độ thu/chi dòng tiền.
- **Table Headers**: 100% căn giữa (`text-center` / `align="center"`).
- **Bộ lọc Cột Ngày (`DateRangeColumnSlot`)**: Đã được nâng cấp chuẩn kiến trúc Molecule L2 (`/erp-ui-structure`, folder-per-component `< 140 LoC`), tích hợp đầy đủ:
  - **Hàng 1 (`Chọn nhanh`)**: DropdownMenu các presets động (*Hôm nay*, *Hôm qua*, *Tháng này*, *Tháng trước*, *Quý này*, *Quý trước*, *Năm nay*, *Tất cả*).
  - **Hàng 2 (`Kỳ`)**: Combobox chọn nhanh 24 tháng gần nhất (`PERIOD_OPTS`) có ô tìm kiếm chuẩn như Drawer Xuất Excel.
  - **Hàng 3 & 4 (`Từ ngày` / `Đến ngày`)**: Hai ô `DatePicker` độc lập, đồng bộ 2 chiều trơn tru với cả 2 hàng trên.
  - **Bảo vệ footer duy nhất**: Bắt buộc cấu hình `hideFilter: true` và `hideFooter: true` (đồng thời được bảo vệ bởi cơ chế tự động fallback `effectiveHideFooter = hideFooter ?? (Boolean(dateRangeSlot) && hideFilter)` trong `TableColumnHeaderFilter`) để ngăn ngừa lặp đôi button "Xóa bộ lọc" và "Áp dụng".
- **Cột Số, Tiền tệ & Biên LN**: Căn phải (`text-right font-semibold tabular-nums`). Số 0 hiển thị dấu gạch ngang `—`.
- **Cột Ngày tháng & Thời gian**: Căn phải (`text-right`).
- **Cột Trạng thái & Cột Bảo hiểm**: Căn giữa (`text-center`). Cột Bảo hiểm chỉ hiển thị icon khiên `ShieldCheck` neutral cho xe có bảo hiểm, `—` cho xe không bảo hiểm.
- **Các cột Mã, Tên, Biển số xe**: Căn trái (`text-left`).

### 3.3. Cấu hình Chế Độ Xem & Ẩn/Hiện Cột (View Presets & Column Visibility)
- **Tổng quan (`overview`)**: Hiển thị mặc định 13 cột nghiệp vụ cốt lõi:
  - `caseDate` (Ngày tiếp nhận), `ngayHoanThanhCongViec` (Ngày kết thúc), `caseCode` (Số chứng từ), `customer` (Khách hàng), `statusName` (Trạng thái), `classification` (Phân loại ERP), `hasInvoice` (VAT), `doanhThu` (DT), `chiPhi` (CP), `loiNhuan` (Lợi nhuận), `margin` (Biên LN), `collectionProgress` (Tổng phải thu), `costProgress` (Tổng phải trả).
  - Ẩn mặc định các cột chi tiết công nợ lẻ: `exclusionRules`, `phaiThuKhachHang`, `phaiThuBaoHiem`, `tienConPhaiThanhToan`, `tienConPhaiChi`, `branchName`, `createdAt`, `updatedAt`, `dataAsOf`.
- **Đối soát (`audit`)**: Bật `collectionProgress: true` (Tổng phải thu), đặt ngay bên trái cột `tienConPhaiThanhToan` (Còn phải thu).
- **Tất cả cột (`all_columns`)**: Hiển thị toàn bộ 22 cột dữ liệu phiếu dịch vụ.
- **Bảo vệ Cột Ngày (`DateRangeColumnSlot` & `TableColumnHeaderFilter`)**: `TableColumnHeaderFilter` có cơ chế `shouldFetchOptions = Boolean(columnKey) && !hideFilter && !hideFilterList`. Khi cột ngày truyền `hideFilter: true`, `useInfiniteQuery` hoàn toàn bị vô hiệu hóa, ngăn chặn triệt để việc tự ý gọi API Kho `/api/v1/inventory/stock/column-options` gây lỗi 403 Forbidden đối với normal user.

---

## 4. Tích hợp Drawer Chuẩn Hóa (`standardize-drawer` & `standardize-table`)

### 4.1. Phiếu Dịch Vụ (`GarageCaseStandaloneDrawer`)
- Sử dụng `<StandardFormDrawer layout="2-columns" size="xl">` chuẩn hóa phân cấp theo **3 Main Tabs** (đồng nhất 100% với `ErpInvoiceDetailDrawer`):
  1. **Chi tiết (`quote_details`)**: Quản lý toàn bộ chi tiết và nghiệp vụ của vụ việc hiện tại, bên trong gồm 3 Sub-Tabs (`V2TabBar` variant SUB):
     - `Chi tiết báo giá` (`details`): Hiển thị `GarageCasePreview` bọc trong `DrawerSection title="Sổ báo giá & Lợi nhuận dự kiến"`.
     - `Tài chính` (`financials`): Hiển thị `GarageCaseFinancialsTab` (Bảng Phải thu/Phải trả cấn trừ & chi tiết dòng tiền), kèm `financialsBadgeCount`. Khi active sub-tab này, cột phải chuyển sang `GarageCaseFinancialsRightPanel`.
     - `Chứng từ liên kết` (`linked_docs`): Mạng lưới Canvas Graph truy xuất nguồn gốc chứng từ đa chặng (`DrawerDocumentTraceability`), kèm `linkedDocsBadgeCount`. Kiến trúc 3 lớp: engine `v2-document-traceability` (shared, không biết phân hệ) → core `src/v2/core/cases-garage` (`buildGarageCaseTraceabilityGraph`, `resolveGarageAddLink`, `resolveGarageUnlink`, hàm thuần) → drawer V1 giữ state sửa/modal/API. Đồ thị gộp server + hóa đơn/khoản thu chi đang sửa qua `mergeTraceabilityGraph` (dedupe cạnh theo cặp node, node thủ công id `manual-<id>`, giữ node chặng sau còn nối root). Khi active sub-tab này, cột phải tự động ẩn (`hideRightPanel: true`) để biểu đồ mở rộng 100% chiều ngang.
  2. **Chi tiết theo Khách hàng (`customer_details`)**: Main Tab độc lập hiển thị toàn bộ lịch sử phiếu dịch vụ, công nợ và tuổi nợ của khách hàng này (`GarageCasePartnerTab`), kèm `badgeCount` số phiếu (`partnerCasesCount`).
  3. **Lịch sử & Đồng bộ (`sync_history`)**: Timeline kiểm toán và đồng bộ từ KGara (`DrawerAuditTimeline`).
- **Cột phải (`rightPanel`) linh hoạt**: Mặc định hiển thị `GarageCaseGeneralInfoSection`, `GarageCaseDefaultAttributesSection`, `ModuleEntityCustomFieldsSection` và `GarageCaseBusinessPerformanceSection`. Tự động switch sang `GarageCaseFinancialsRightPanel` ở sub-tab Tài chính, hoặc ẩn ở sub-tab Chứng từ liên kết.
- **Tương thích ngược (Backward Compatibility)**: Hook `useGarageCaseDrawerLogic` tự động map `initialTabKey="financials"` sang `mainTab: "quote_details", subTab: "financials"`; map `initialTabKey="partner_details"` sang `mainTab: "customer_details"`.


### 4.2. Công Nợ Đối Tác (`GarageCustomerDetailDrawer` & `GarageCasePartnerTab`)
- Sử dụng `<StandardFormDrawer layout="2-columns" size="xl">` và tuân thủ chặt chẽ workflow `/standardize-table`.
- **Bảng danh sách phiếu dịch vụ trong Drawer**:
  - Quản lý trạng thái lọc/sort bền vững bằng `useTableColumnState`.
  - Bộ lọc cột thông minh với `createColumnHeaderFilter`: `headerFilter.date` cho ngày tiếp nhận, `headerFilter.amount` cho số tiền, lọc bracket tuổi nợ (`0-30`, `31-60`, `61-90`, `>90`, `PAID`).
  - Lọc và sắp xếp client-side qua `filterClientItems`.
  - Dòng tổng cộng `summaryRow` hiển thị tổng phát sinh, đã thu, còn nợ.
  - Nút **Bỏ lọc** (`clearFilters`) và đếm số bộ lọc active trên tiêu đề section.
  - **Context Menu (`rowHoverActions`) chuẩn hóa 100% khớp bảng ngoài**:
    - **TRA CỨU**: `Xem chi tiết` (`Eye`), `Chi tiết theo đối tượng` (`Users`).
    - **THAO TÁC**: `Chỉnh sửa` (`Pencil`), `Phân loại` (`SlidersHorizontal`), `Đối soát` (`Scale` - Mở Drawer chuyển thẳng vào tab **Tài chính (`financials`)** và tự động kích hoạt sẵn **Edit Mode**).

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

## 6. RBAC Tách Công Nợ khỏi Vụ Việc

- `GARAGE` (`garage`) dành cho màn hình vụ việc và các thao tác chỉnh sửa case.
- `GARAGE_DEBTS` (`garage_debts`) dành cho trang công nợ, analytics, danh sách phải thu/phải trả và menu debts.
- `GaragePartners` là page gate: user chỉ có `GARAGE_DEBTS:READ` vẫn truy cập được debts; thiếu quyền render `Forbidden`.
- `GARAGE_CASHFLOW` tiếp tục kiểm soát riêng tab và bảng thu chi xưởng.
- Navigation Garage render từng item theo permission độc lập; không dùng `GARAGE:READ` làm điều kiện bắt buộc cho debts.
- Test RBAC co-located tại `GaragePartners.test.tsx`, `GarageNavSection.test.tsx` và `SidebarNav.rbac.test.tsx`.



---

## 7. Thuộc tính Mặc định vs Tùy chỉnh trong Drawer (từ 2026-10-14)

- `GarageCaseDefaultAttributesSection`: phân loại + 2 cờ loại trừ (built-in, lưu cột `kgara_cases`). Dropdown phân loại lấy **hoàn toàn từ API categories** (value = category id, lọc `isActive !== false`); không còn fallback hard-code (hằng `GARAGE_CASE_CLASSIFICATIONS` chỉ còn dùng cho màu/nhãn badge).
- `ModuleEntityCustomFieldsSection`: thuộc tính tùy chỉnh. `useGarageCaseDrawerLogic` khởi tạo/so sánh draft bằng `extractCaseCustomValues` (`utils/garageCaseCustomValues.ts`) từ `custom.byCode` + `attributeValues`, khóa theo `attrDefId`; lưu chỉ gửi `customAttributes` một lần (bỏ `attributes`).
- Cần API trả `custom.byCode`: deploy **API trước, web sau**.
- Trang `/custom-fields`: nút xóa thuộc tính hệ thống đã ẩn; category có `semanticKey` bị server chặn xóa (409).

### 7.1. Draft phân loại (2026-10-14)
- `useDraftCategorySelection` (`components/drawer/hooks/`): state nháp `categoryId` + `classification`. `setDraftCategoryId(null)` xóa luôn `classification` nháp; `reset` dùng cho khởi tạo/Hủy.
- `useUpdateGarageCaseConfig` invalidate thêm `["garage-case-code"]` để drawer không giữ dữ liệu cũ sau khi đổi phân loại ở danh sách.

## 8. Xuất Excel nền (cases & công nợ) — lớp dùng chung `shared/export-jobs`

Cùng cơ chế với "Xuất Excel hóa đơn": tạo job nền → tiến độ SSE → tự tải khi xong → lịch sử 24 giờ tải lại. Lớp dùng chung nằm ở `src/shared/export-jobs/` (không phụ thuộc garage):
- `createExportProgressStore()` — mỗi luồng 1 store zustand (cases, công nợ KH, công nợ NCC) trong `modules/garage/export/garageExportScopes.ts`.
- `useBackgroundExportProgress(scope, store, enabled)` — kết nối SSE (`fetchEventSource` + Bearer) và `downloadReadyFile`.
- `useBackgroundExport({ scope, useStore, open, messages })` — `useMutation` tạo job (body đúng DTO API, `forbidNonWhitelisted`), `useQuery` lịch sử (poll 10s khi SSE mất), tự tải chỉ job do phiên này tạo, tái dùng file (`reused`) tải ngay.
- `ExportModeSelector` (`by-period` | `by-current-filter`), `ExportHistoryTable` (nhãn truyền qua props, i18n ở `garage:exportJobs.*`).
- `exportPeriod.ts` (hàm thuần, có test biên: tuần ISO vắt năm, tháng 2 nhuận, quý) + `useExportPeriod` + `ExportPeriodPicker`: tab **Tuần | Tháng | Quý | Tùy chỉnh**; tuần = 12 tuần gần nhất (thứ Hai–Chủ nhật), tháng = 24 tháng, quý = 3 năm; chỉ tab Tùy chỉnh mở khóa ô ngày. Kết quả luôn là `dateFrom/dateTo` (`YYYY-MM-DD`) nên payload API không đổi.
- Drawer cases và công nợ **dùng chung bố cục** qua `modules/garage/export/GarageExportSections.tsx` (`GarageExportModeAndPeriod`, `GarageExportStartButton`, `GarageExportHistoryPanel`): `layout="2-columns"`, trái = lịch sử, phải = chế độ + kỳ + nút Xuất. Cases thêm nhóm "Loại ngày / Phân loại / Trạng thái" (`GarageCaseExportExtraFields`, chỉ ở chế độ theo kỳ); công nợ thêm PillTabs đối tượng KH/NCC, mặc định Tùy chỉnh từ `2026-07-01` đến hôm nay.
- Invoice **chưa** chuyển sang lớp này (vẫn dùng `useInvoiceExportProgress` + `useInvoiceExportProgressStore`); có thể gộp sau.

**Cột xuất Excel (Cases)**: danh sách cột và nhóm nằm ở `modules/garage/export/garageCasesExportColumns.ts` (khớp `COMPLETED_CASES_ALL_COLUMNS` phía API). Thuế GTGT (`vatAmount`) là cột mặc định, đứng ngay trái Doanh thu (nhóm `profit`); các cột tùy chọn còn lại là `exclusionRules`, `createdAt`, `updatedAt`, `dataAsOf`. Lựa chọn lưu localStorage key `garage_cases_export_columns_v2`; `loadSavedGarageCasesExportColumns` đọc v2, nếu chưa có thì chuyển một lần từ v1 bằng cách chèn `vatAmount` trước `doanhThu`. Đã lưu v2 thì không chèn lại, nên người dùng bỏ tick VAT vẫn được giữ.

**Cases**: drawer xuất là `GarageExportDrawer` (dùng chung với tab Tổng quan, Combobox Loại báo cáo, mặc định `cases-list`; nhánh cases vẫn dùng `useGarageCaseExportLogic` và đặt các trường riêng (loại ngày / phân loại / trạng thái; ô chi nhánh chỉ xem, luôn "Tất cả chi nhánh") vào slot của `GarageExportConditionSection` qua `GarageCaseExportConditionFields`) và nhận `tableQuery` (từ `useGarageCasesTable().exportQuery`: `date_from/date_to` = `caseDate`, `filtersStr`, `sorts`) qua `GarageCasesTable.onExportExcel(query)` → `GarageCases` mở drawer qua `useGarageHeaderActions().openExport` (`GarageHeaderActionDrawers` render cả drawer đồng bộ + drawer xuất). Dropdown của nút chính "Đồng bộ" do `buildGarageHeaderActions` dựng (`buildGarageCaseCreateActions` chỉ còn là wrapper), dùng chung với tab Tổng quan. Chế độ `by-current-filter` chỉ hiện khi có `tableQuery`; không gửi chi nhánh (API V1 xuất mọi phiếu). Lịch sử localStorage cũ đã bỏ, thay bằng lịch sử server.

**Công nợ**: `GarageDebtsExportDrawer` (đối tượng KH/NCC, kỳ mặc định từ `GARAGE_DEBT_BASELINE_DATE = 2026-07-01`) nhận `context` = `buildGarageDebtsExportContext(kind, listHook)` do `GarageDebtsTable`/`GaragePayablesTable` truyền qua `onOpenExportDrawer(context)`. Đổi đối tượng khác bảng đang mở thì tự về `by-period`. CSV client-side (`*.export.ts`) đã gỡ.


## Đổi nhãn điều hướng (cập nhật 2026-10-17)
- Nhãn UI của màn hình `garage-cases` đổi từ "Phiếu dịch vụ" thành **"Hoạt động garage"** (EN: "Garage Activities") ở sidebar (`nav.items.garageCases`), breadcrumb, tab `tabs.cases`, tiêu đề `cases.title`, nhãn tổng hợp `cases.summary.items`, command palette. Route `garage-cases` và key i18n giữ nguyên. Chuỗi nghiệp vụ như "Phiếu dịch vụ gần đây", "Phiếu dịch vụ Garage (RO)" giữ nguyên.
- Thứ tự mục sidebar GARAGE không đổi: Thu chi garage → Hoạt động garage → Công nợ garage → Chi phí vận hành Garage.

## Sơ đồ quy trình Garage Hub & Chuẩn hóa UI Atomic (cập nhật 2026-10-20)
- **Action Menu Xem sơ đồ quy trình**: Dropdown nút chính "Đồng bộ" tại tab Hoạt động garage (`garage-cases?tab=cases`) kết nối callback `onOpenWorkflow` xuyên suốt từ `GarageCases` (Page L5 qua `useGarageHeaderActions().openWorkflow`) xuống `GarageCasesTable` (Organism L3) và `buildGarageCaseCreateActions` (`GarageCasesTable.actions.tsx`), kích hoạt mở `GarageWorkflowDrawer` hiển thị sơ đồ quy trình toàn diện.
- **Chuẩn hóa UI Atomic (< 180 LoC)**:
  - `GarageCasesTable.tsx` được tinh gọn từ 211 LoC xuống 170 LoC (< 180 LoC).
  - Tách sub-component phân tầng `GarageCaseViewTabs` (`GarageCasesTable.view-tabs.tsx`, 33 LoC) quản lý cụm view presets combobox & status tabs.
  - Tách hàm tính toán nhãn tổng hợp `resolveTotalLabelCol` vào `GarageCasesTable.summary.tsx`.
  - Tuân thủ No Blue Mandate: loại bỏ hoàn toàn các class `blue-*` khỏi bảng và summary row.

### Cột xe & đối tượng thanh toán (KINDU-1433)
- Phần dùng chung nằm ở `src/v2/core/cases-garage/vehicle/` (`GARAGE_CASE_VEHICLE_COLUMNS`, `buildVehicleInfoRows`, `formatVehicleBrand/Model/Payer/ModelYear`, `GarageCaseVehicleCell`, `GarageCasePayerCell`, locale `v2.garageCases.vehicle.*`). Bảng V1 (`GarageCasesTable.vehicle-columns.tsx`) và drawer (`GarageCaseGeneralInfoSection`) chỉ ghép; khi migrate V2 chỉ cần đọc lại cấu hình này.
- Khóa cột = khóa lọc/sắp xếp API: `soKhung`, `hangXe`, `dongXe`, `namSanXuat`, `doiTuongThanhToan`. Mặc định ẩn ở view Tổng quan và Đối soát, bật ở "Tất cả cột". Xuất Excel chưa có 5 cột này.
- Xuất Excel: `garageCasesExportColumns.ts` có nhóm `vehicle` (5 cột trên), nằm ngoài bộ mặc định (`OPTIONAL_GARAGE_CASES_EXPORT_KEYS`); nhãn locale `exportReport.casesColumns.*`. Tổng cột chọn được: 39 (mặc định 30).

---

## 9. Tab Tiến độ công việc (Kanban Board) trong Drawer Chi Tiết Vụ Việc (KINDU-1598)

- **V2 Shared Organism `v2-kanban-board`** (`src/v2/shared/components/organisms/v2-kanban-board/`):
  - Tái sử dụng chung cho toàn bộ dự án ERP, hỗ trợ kéo thả thẻ qua `@dnd-kit/core` và `@dnd-kit/sortable`.
  - Hỗ trợ cuộn ngang giữa các cột, cuộn dọc bên trong cột, header có icon, tiêu đề, badge đếm, subtotal và `DragOverlay`.
  - Cấu hình cảm biến an toàn `PointerSensor({ activationConstraint: { distance: 5 } })` chống drag nhầm khi click xem chi tiết hoặc Popover.
- **V2 Core Garage Cases Kanban** (`src/v2/core/cases-garage/kanban/` và `components/garage-cases-kanban/`):
  - 5 làn tiến độ: Tiếp nhận (`INTAKE`), Báo giá (`QUOTATION`), Đang làm (`IN_PROGRESS`), Hoàn thành (`COMPLETED`), Hủy (`CANCELLED`).
  - Mỗi card đại diện cho **1 xe** (gom nhóm theo `bienSoXe`). Xe có nhiều phiếu trong kỳ được thể hiện bằng nút Popover (`GarageVehicleCasesPopover`), click mở popover xem danh sách phiếu đầy đủ, click số phiếu gọi `onOpenCaseDetail`.
  - Card hiển thị biển số xe phong cách dập nổi (`bg-amber-400/10`), tên khách hàng, mã phiếu, ngày hoàn thành/phát sinh, doanh thu phát sinh và nợ còn lại (hoặc badge "Đã thu đủ").
  - Kéo thả xe giữa các cột cập nhật mốc tiến độ trực quan, bắn toast thông báo kèm i18n đầy đủ.
- **Tích hợp Drawer**:
  - Nhúng trực tiếp tại `GarageCasesDetailDrawer.tabs.tsx` qua tab `"kanban"` kế bên tab `"cases"` ("Danh sách xe") khi mở ở chế độ checkpoint overview.
  - `GarageCasesKanbanContainer` nhận `branchId?` (chi nhánh ERP, header `x-erp-branch-id`). Trong drawer V1 tab KHÔNG truyền chi nhánh: danh sách xe lấy từ API V1 (mọi phiếu, không lọc chi nhánh từ Phase 5), nên đọc và ghi V2 phải cùng phạm vi mọi chi nhánh, nếu không kéo xe GR khi shell chọn GN sẽ 404 (E2E `garage-kanban` 2026-11-25).
  - **Tối ưu kéo thả 60fps & Khắc phục kẹt cuộn**:
    - `GarageVehicleKanbanCard.tsx`, `V2KanbanCardWrapper.tsx`, `V2KanbanLane.tsx` được memo hóa, tắt transition CSS khi kéo (`transition: none` khi isDragging), áp dụng biến đổi dịch chuyển mượt mà `CSS.Translate.toString(transform)`.
    - `<DragOverlay>` được render qua `createPortal(..., document.body)` với `zIndex={1000}` giải quyết triệt để lỗi lệch tọa độ Offset Y khi bọc trong Dialog/Drawer có `transform`/`backdrop-filter`.
    - Thuật toán va chạm 2 tầng `pointerWithin` -> `closestCorners` chống giật lag và nhảy lane bất thường khi kéo thẻ qua các ranh giới cột.
    - Khắc phục xung đột `react-remove-scroll` của Radix Dialog V2 khi có Drawer V1 hoặc Popover mở chồng lên bằng cờ `modal={!hasNestedOpenDrawer}` trên `V2StandardDrawer` và `modal={false}` trên `GarageVehicleCasesPopover`.
  - **Chuẩn hóa UI & Design Tokens `/erp-ui-structure`**:
    - Màu accent các làn được quản lý tập trung qua `GARAGE_KANBAN_LANE_ACCENTS` (`garageCaseKanban.config.ts`), sử dụng design token chuẩn (`var(--kanban-*)`) và fallback semantic, tuyệt đối không hardcode mã hex.
    - Tắt hoàn toàn `backdrop-blur` (`0px`) và khử kênh alpha (opacity 100% solid) trên toàn bộ Floating Surface (Drawer V2, Modal V2, Popover, Card) giúp GPU không phải chạy Gaussian blur / framebuffer readback liên tục khi kéo thả thẻ.
    - Bọc toàn bộ bảng Kanban trong `DrawerSection` chuẩn với `fillHeight={true}`, căn chỉnh fit 100% viewport drawer không sinh scroll ngoài.
    - Đồng bộ vị trí ô tìm kiếm `V2SearchInput` (`w-48 sm:w-64`) tại góc trên bên phải của cả 2 tab Danh sách xe và Tiến độ công việc.
    - Cải tiến Panel phải của Drawer bằng `GarageVehicleProgressRightPanel` thể hiện các chỉ số thực tế: Tiến độ xử lý xe (4 mốc), Cơ cấu Top Hãng xe vào xưởng, và Dòng tiền dịch vụ xe.

## 10. Trang Tiến độ xưởng `/garage-workshop-progress` (KINDU-1858…1888, 2026-11-24)
- **Mục đích**: nhân viên xưởng theo dõi và cập nhật tiến độ từng xe trong ngày. Mọi status hiển thị lấy từ **status v2** (`CaseStatus`), không dùng nhãn KGara (`KgaraCaseStatusBadge`). Khác với tab Kanban ở mục 9 (thẻ vẫn hiện nhãn KGara).
- **Route**: PageKey `garage-workshop-progress` (`shared/types`, `pageUrl.ts` ALL_PAGE_KEYS, `appStore/constants.ts` label + breadcrumb, `V2ShellLayout`, `useV2AdaptedTabs` icon `Wrench`, sidebar `useV2AdaptedNavSections` nhóm Garage theo quyền `garage_workshop:read`, `useV2MobileNav.helper` ghim mặc định). `App.tsx` lazy `modules/garage/pages/GarageWorkshopProgressRoute.tsx`: cầu nối V1 đọc `appStore.currentBranchId` và truyền thẳng `branchId` (chi nhánh ERP) vào trang V2 (V2 không import store shell). Từ 2026-11-25 (KINDU-1958) không còn tra liên kết KGara (`useKgaraBranchExternalId` đã xóa). Shell luôn có chi nhánh (`useEnsureValidCurrentBranch`), nên trang có ô "Phạm vi chi nhánh" (`GarageWorkshopProgressPage.filters.tsx`): mặc định "Chi nhánh đang chọn", chọn "Tất cả chi nhánh" thì đọc và sửa không gửi chi nhánh (mọi xe), riêng xe tạo mới (`track-new`) vẫn gắn chi nhánh shell (`useCaseWorkshopMutations(branchId, createBranchId)`). Cùng hàng có ô "Phân loại" (`V2Combobox`, mặc định Tất cả, "Xe OJ" → `classification=OJ`); lọc ra rỗng thì hiện "Không có xe khớp bộ lọc" (`filterEmpty`), không hiện gợi ý thêm xe. Đổi phạm vi hoặc phân loại thì đóng xe đang mở; board chỉ giữ dữ liệu cũ (`placeholderData`) khi cùng chi nhánh. Giới hạn: board lấy tối đa 200 xe (`pageSize: 200`, không phân trang); state phạm vi/phân loại nằm trong thân trang nên đổi desktop ↔ mobile sẽ reset; Kanban V2 trong drawer V1 tải tiến độ mọi chi nhánh.
- **Quyền** (`ErpResource.GARAGE_WORKSHOP` = `garage_workshop`, nhóm "Garage & Xưởng dịch vụ" của Permission Matrix, `FALLBACK_RESOURCES`): `read` xem board/nhật ký; `update` ghi công đoạn, ghi chú, sửa giờ, xóa nhật ký. Kéo thẻ sang cột khác (đổi status cha) cần `garage:update`; không có thì khóa kéo và báo toast.
- **Core** `src/v2/core/cases-garage/workshop/` (config `WORKSHOP_STATUSES` 5 status + status nhỏ khớp backend `case-progress-stage.map.ts`, token màu theme, ngưỡng đồng hồ 8h/24h; helper thời gian, lọc, xếp theo status nhỏ, chuyển `yyyy-MM-ddTHH:mm` ↔ ISO; fixtures cho test/story) và `components/garage-workshop/` (`GarageWorkshopBoard` desktop V2KanbanBoard, `GarageWorkshopMobileList` tab PILL + thẻ một cột, `GarageWorkshopCard`, `GarageWorkshopStatusBadge`, `GarageWorkshopClock` + `useNowTick` nhích mỗi phút, `GarageWorkshopDrawer` (V2StandardDrawer SM, V2ConfirmModal khi xóa), `GarageWorkshopLogForm` (+ `.hook`, `GarageWorkshopStagePicker`, `GarageWorkshopTimeFields`), `GarageWorkshopTimeline`). Locale `v2.garageCases.workshop.*` VI/EN trong `garageCases.locale.ts`; story `Core/CasesGarage/*`.
- **Module** `src/v2/modules/cases-garage/`: `api/caseWorkshopApi.ts` (`workshop/board`, `workshop/workers`, `:id/progress-logs`, `progress-logs/:logId`, header tùy chọn `x-erp-branch-id` qua `api/garageRequest.ts` `branchHeaders`/`compactParams`, dùng chung với `caseProgressApi.ts`; không gửi = mọi chi nhánh), `api/queries/caseWorkshopKeys.ts` + `useCaseWorkshopQueries.ts` (board tự làm mới 60 giây) + `useCaseWorkshopMutations.ts` (đổi status lạc quan, hoàn lại khi lỗi; mọi lệnh invalidate workshop, progress, dashboard), `domain/caseWorkshop.type.ts` + `caseWorkshop.mapper.ts`, `hooks/useGarageWorkshopProgress.ts` (quyền, toast `useV2ToastStore`, lỗi lưu ném lại để form giữ dữ liệu), page `GarageWorkshopProgressPage{,.desktop,.mobile,.body}.tsx` (Platform Split theo `useViewport`).
- **Đưa xe vào bảng (vòng 2, KINDU-1889…1912)**: board chỉ hiện xe đã được nhân viên chọn (`workshopTrackedAt` khác null); xe đã xong tự ẩn sau 7 ngày. Nút "Thêm xe vào bảng" (cần `garage_workshop:update`; chi nhánh không bắt buộc) mở `GarageWorkshopAddVehicleModal` (V2Modal): `V2SearchInput` biển số (≥ 2 ký tự, `GET workshop/candidates`) → `GarageWorkshopCandidatePicker` (V2RadioCardGroup; xe đã trên bảng bị khóa; lựa chọn "Tạo xe mới {{plate}}" khi có `garage:create`) → `GarageWorkshopTrackStatusPicker` (trạng thái cho phép theo `allowedTrackStatuses`: không có `garage:update` thì chỉ giữ trạng thái hiện tại; xe KGara đổi tự do kèm gợi ý "chỉ đổi trên ERP"; xe NATIVE theo `WORKSHOP_NATIVE_TRANSITIONS`; xe mới từ INTAKE). Gửi `POST workshop/track` hoặc `workshop/track-new` (409 khi trùng biển số xe đang mở), thêm xong mở drawer của xe. Bỏ khỏi bảng: nút trong drawer → `V2ConfirmModal` cấp trang (`z-[700]`/`z-[699]`) → `DELETE workshop/track/:caseId` (lạc quan, giữ vụ việc và nhật ký). Logic ở `hooks/useGarageWorkshopTracking.ts`; dialog ghép ở `GarageWorkshopProgressPage.dialogs.tsx`; core helper `workshop/garageWorkshop.track.ts`.
- **Trang**: thân trang dùng `V2PageLayout` (icon Wrench, desc số xe, actions Thêm xe + Làm mới, `middleContent` ô tìm); bảng rỗng thì `V2EmptyState` hướng dẫn thêm xe.
- **Người làm** (vòng 3, KINDU-1923): `GarageWorkshopWorkerField` dùng `V2AutocompleteInput` (molecule dùng chung): gõ tên hiện gợi ý nhân viên ngay dưới ô (`GET workshop/workers?search=`, nhãn tên, mô tả `mã · chức danh`); chọn gợi ý thì gắn `workerId`, gõ tên không có trong danh sách thì giữ tên với `workerId=null`, sửa tên sau khi chọn thì bỏ gắn. Không còn công tắc "Người ngoài danh sách". Mặc định người đăng nhập (`useWorkshopDefaultWorker`, chỉ điền khi ô trống và không sửa dòng).
- **Công đoạn và nhật ký** (vòng 3, KINDU-1922/1924): `GarageWorkshopStagePicker` dùng `DrawerField` + `V2Combobox` `searchable={false}` (mobile mở bottom sheet; trigger ≥ 44px qua `[&_[role=combobox]]:min-h-11`); `GarageWorkshopTimeline` dùng `V2ActivityTimeline` (badge "Đang làm · thời lượng", chỉ báo "Đang chỉnh dòng này", nút Sửa/Xóa trong `workshop-log-{id}`). Giờ bắt đầu/kết thúc dùng `V2DateTimePicker` (molecule dùng chung: `V2DatePicker` + `V2TimePicker` (vòng 4, KINDU-1942: shadcn Popover + Tailwind, hai cột giờ/phút bước 5, mobile bottom sheet, `noFuture` khóa giờ sau hiện tại của hôm nay) + nút chọn nhanh "Bây giờ/15/30 phút/1 giờ trước", giá trị `yyyy-MM-ddTHH:mm` giờ máy, `noFuture`); nhãn ô con là "Bắt đầu lúc – Ngày"/"Bắt đầu lúc – Giờ".
- **Vòng 4 (KINDU-1932…1945, sửa code-review)**: xe mới chỉ vào trạng thái khác Tiếp nhận khi có `garage:update` (`allowedTrackStatuses("new", canChange)`, API cũng chặn 403); sửa dòng nhật ký chỉ gửi `startedAt`/`endedAt` khi đổi giờ; ghi tiến độ khi không có xe đang chọn báo lỗi (không báo đã lưu).
- **Đổi trạng thái trong drawer** (vòng 3, KINDU-1925…1927): API trả `origin` trên thẻ board; core `allowedStatuses({origin,status}, canChange)` (dùng chung với `allowedTrackStatuses`). `GarageWorkshopDrawerSummary` có `GarageWorkshopStatusSelect` (V2Combobox, trạng thái sai bảng chuyển bị khóa, xe KGara có gợi ý "chỉ đổi trên ERP", không có `garage:update` thì khóa ô) để mobile đổi trạng thái không cần kéo thả. Hủy (từ drawer hoặc kéo thẻ) luôn qua `GarageWorkshopCancelConfirm` (`V2ConfirmModal` `z-[700]`/`z-[699]`, `pages/GarageWorkshopProgressPage.cancel.tsx`); kéo thẻ sang cột sai bảng chuyển bị chặn ở client (`onInvalidMove` → toast `error.invalidMove`). Logic ở `hooks/useWorkshopStatusChange.ts`.
- **Test**: vitest `src/v2/core/cases-garage` + `src/v2/modules/cases-garage` (42 file, 167 test sau vòng 3); test sidebar V1 `useV2AdaptedNavSections.test.ts` chạy bằng config tạm vì `test:all` (`--include`) không chạy với vitest v4.

## Cơ cấu chi phí và chiết khấu 521 trong drawer phiếu (KINDU-1623, cập nhật 2026-11-21)
- `GarageCasePreview.helper.ts` (`calculateProfitSummary`) không tự parse `journal_items` nữa: dùng `costBreakdown` do backend trả (`grossProfit.costBreakdown`, rồi `caseData.costBreakdown`), chuẩn hóa tên (`externalCost`→`outsourceCost`, `warehousePartsCost`→`inventoryPartCost`).
- `QuoteDocumentCostSummary` hiển thị "Chiết khấu (giảm trừ doanh thu, TK 521)" thành dòng riêng ngoài cụm chi phí (`data-testid="cost-summary-discount"`); "Tổng chi phí" không cộng chiết khấu. Biên lợi nhuận do backend tính trên doanh thu thuần.
- Test V1 của thư mục này không nằm trong `vitest.config.ts` mặc định; chạy bằng config tạm trỏ `src/modules/garage/components/organisms/garage-case-preview/**`.


## Nhãn OJ có hóa đơn (KINDU-2262, 2026-11-28)

- `getClassificationDisplayMeta` thêm hậu tố `cases.classification.ojHasInvoice` ("OJ · Có hóa đơn" / "OJ · Invoiced") khi API trả `ojHasInvoice === true` (`null` = không phải OJ).
- Cờ "Loại khỏi công nợ" của phiếu OJ do API tính theo hóa đơn đầu ra; thao tác đổi tay trên UI bị API bỏ qua (UI chưa khóa nút).
- `vite.config` chỉ chạy một số thư mục test garage; test của dropdown phân loại đặt ở `modules/garage/components/__tests__/`.
