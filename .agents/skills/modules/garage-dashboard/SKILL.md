---
name: garage-dashboard
description: Module tri thức Dashboard, Báo cáo Hiệu quả Garage, Quản lý Chi phí vận hành (OPEX) & Báo cáo Lợi nhuận (P&L) trong erp-api (kgara-api-core) và erp-web. Chứa toàn bộ database schema, entities, DTOs, API endpoints, logic tính toán P&L theo ngày hoàn thành và xuất báo cáo Excel chuyên nghiệp.
---

# 📦 Module Tri Thức: Dashboard, Chi Phí Vận Hành & Báo Cáo P&L Garage (`garage-dashboard`) - Frontend (`erp-web`) & Backend (`erp-api`)

## 1. Tổng quan Nghiệp vụ

Module `garage-dashboard` (được hiện thực tại `src/kgara-api-core/` và `src/modules/garage/`) là trung tâm tình báo điều hành, phân tích tài chính xưởng dịch vụ và quản lý chi phí vận hành (OPEX) trong hệ thống ERP.

### 1.1. Các tính năng cốt lõi:
- **Quy tắc Tính toán Doanh thu & Chi phí theo Ngày hoàn thành (Strict Completion Date Rule)**:
  - **CHỈ tính** doanh thu, chi phí, lãi gộp và số vụ việc cho các phiếu dịch vụ **ĐÃ CÓ ngày hoàn thành công việc** (`c.ngay_hoan_thanh_cong_viec IS NOT NULL`).
  - Bỏ qua các phiếu bị xóa trên KGara (`c.kgara_deleted_at IS NULL`) hoặc phiếu hủy (`c.tinh_trang_dich_vu != 9`).
- **Quản lý Chi phí vận hành (OPEX), Giá vốn nhập tay & Hoa hồng**:
  - Nhập tay chi phí vận hành hàng tháng (nhân sự, thuê mặt bằng, điện nước, vật tư tiêu hao, bảo trì, khấu hao, khác), giá vốn trực tiếp (hoa hồng trực tiếp DV, chi phí trực tiếp khác) và hoa hồng (sale, dịch vụ).
  - Phân loại qua `category_key` theo 3 nhóm chi phí: `OPEX` (CP Vận hành), `COGS` (Giá vốn), `COMMISSION` (Hoa hồng), lưu trữ theo `(period_year, period_month)`.
  - Hỗ trợ phát sinh định kỳ lặp lại theo chu kỳ tháng (`monthly`) với cơ chế áp dụng linh hoạt chuẩn Google Calendar (`this` vs `this_and_future`).
  - Hỗ trợ xem danh sách bảng chuẩn `/greenway/dashboard/opex` theo đúng quy chuẩn `standardize-table-page` & `standardize-table`:
    - Cột STT (`#`) bắt đầu chính xác từ số 1.
    - Cột Kỳ báo cáo (`period`) tích hợp `<DateRangeColumnSlot>` lọc khoảng ngày/tháng và các quick presets.
    - Context Menu (Row Actions) 4 thao tác chuẩn hóa: **Xem chi tiết** (`Eye`), **Chỉnh sửa** (`Pencil`), **Nhân đôi** (`Copy` - prefill toàn bộ dữ liệu vào form tạo mới), **Xóa** (`Trash2`).
    - Xem/sửa/nhân đôi qua 1-column StandardFormDrawer (`GarageOpexDrawer.tsx`) tích hợp xem trước số tiền bằng chữ (Vietnamese Currency Words) và định dạng số.
- **Báo cáo Lợi nhuận P&L theo Tháng Đơn Lẻ (`getPnlReport`)**:
  - Khung Card giao diện sử dụng `bg-surface border border-border rounded-xl p-5 card-shadow overflow-hidden min-w-0` đồng bộ hoàn toàn hiệu ứng đổ bóng `card-shadow` trên Dashboard.
  - Tổng hợp tự động 7 chỉ mục tài chính phân cấp:
    1. `I. Doanh Thu` (Doanh thu dịch vụ đã hoàn thành)
    2. `II. Chi phí (Giá vốn)` (Phụ tùng & gia công ngoài + Direct Costs nhập tay)
    3. `III. Lợi nhuận gộp` (`Gross Profit = Revenue - COGS`, kèm % Biên LN gộp)
    4. `IV. Chi phí vận hành` (Tổng hợp các khoản OPEX trong tháng)
    5. `V. Lợi nhuận ròng (trước hoa hồng)` (`Net Profit Before Commission = Gross Profit - OPEX`)
    6. `VI. Hoa hồng` (Tổng hợp các khoản hoa hồng `HOA_HONG_*` trong tháng)
    7. `VII. Lợi nhuận ròng (sau hoa hồng)` (`Net Profit After Commission = Net Profit Before Commission - Commission`, kèm % Biên LN ròng)
  - Tự động ghép nối và đối soát dòng con chi tiết giữa 2 tháng (`mergePnlItems`), hiển thị đầy đủ số tiền tháng trước cho từng danh mục phát sinh.
- **Biểu đồ Xu hướng Tháng Đa Chiều (Doanh thu, Chi phí, Thu tiền & Trả tiền NCC)**:
  - `revenue`, `cost`, `profit`, `margin`: Chỉ số tài chính lãi gộp.
  - `paid`, `receivable`, `collectionRate`: Tiền khách đã thanh toán, công nợ phải thu và tỷ lệ hoàn tất thu tiền (%).
  - `paidCost`, `payableCost`, `costPaymentRate`: Tiền đã chi trả chi phí/NCC, công nợ phải trả NCC và tỷ lệ chi trả (%).
- **Chỉ số KPI Sparklines theo Chu kỳ (`getCheckpointKpis`)**:
  - Phân tích 3 chu kỳ: **Tháng này** (Sparkline 6 tháng), **Tuần này** (Sparkline 4 tuần), **Hôm nay** (Sparkline 7 ngày) theo Ngày hoàn thành.
  - Hỗ trợ click-to-drilldown xem danh sách phiếu dịch vụ chi tiết hoàn thành trong kỳ (`getCheckpointCases`).
- **Pipeline Dự Thu & Phễu Chuyển Đổi Dịch Vụ (`GarageConversionFunnelCard.tsx`)**:
  - Hub phân tích 3 tầng tích hợp toàn diện:
    - **Tầng 1**: 4 Cards tổng quan tiếp nhận & tiến độ (Tổng tiếp nhận, Đang xử lý, Đã hoàn thành, Hủy) kèm sub-badge Dự thu Hôm nay & Tháng này và thanh tỷ lệ chuyển đổi trực quan.
    - **Tầng 2**: Toolbar điều khiển chuyển đổi hiển thị `[$ Giá trị (VND)] / [Số lượng (Xe)]` ngay phía trên khu vực biểu đồ + Grid 12 cột chứa 3 biểu đồ song song:
      - Biểu đồ Dòng Thời Gian (6 Tháng, thứ tự Trái sang Phải, stacked bars Doanh số/SL + line % Hoàn tất, click-to-filter tháng).
      - Donut Chart Cơ Cấu Nghiệp Vụ (ERP) (4 nhóm ERP: Sửa chữa chung, Ký gửi/Nội bộ, OJ Ngoài, Khác).
      - Donut Chart Phân Bổ Trạng Thái Phiếu DV (Hoàn tất, Đang xử lý, Báo giá, Tiếp nhận, Hủy).
    - **Tầng 3**: Bảng `<DataTable variant="spreadsheet">` chi tiết 4 phân loại ERP chuẩn `/standardize-table` (STT `#` 40px center, No Blue Mandate, SubtotalSummaryCell footer).
  - Dữ liệu tính toán độc lập tại `conversionFunnel` & `conversionFunnelByMonth` trong `garage-dashboard.service.ts`, phản hồi tức thì theo kỳ tháng được chọn.
- **2 chart P&L 12 tháng trên Dashboard (cập nhật 2026-10-17)**:
  - `GaragePnlSection` render `GaragePnlChartsCard` (`components/GaragePnlCharts/`): chart "Báo cáo lợi nhuận" (cột Doanh thu/Chi phí/Lợi nhuận gộp + đường `% Lợi nhuận gộp` trên trục phụ) và chart "Tỷ trọng các chỉ số trên 100% doanh thu" (7 cột chồng `/ DT`), giống sheet Excel cùng tên; màu `PNL_CHART_PALETTE` khớp `CHART_PALETTE` của API.
  - Dữ liệu: `useGaragePnlTrend(year, month)` → `garageOpexApi.getPnlTrend` (`GET /greenway/dashboard/pnl-trend`), 12 tháng kết thúc ở kỳ chọn ở Period picker của P&L. Builder thuần: `buildPnlChartData.ts`.
  - `shared/components/charts/BarChart` có thêm prop tùy chọn `dataLabels`, `secondaryCallback`, `secondaryMin` và dataset `secondaryAxis`/`format` (nhãn vẽ bằng plugin inline `barChartDataLabels.ts`, không dùng `chartjs-plugin-datalabels`).
  - Bảng màu (cập nhật 2026-10-17, tông chart Dòng tiền, không dùng xanh dương): `#059669` xanh lá, `#EA580C` cam, `#475569` slate, `#E11D48` đỏ, `#7C3AED` tím, `#0D9488` teal, `#CA8A04` vàng; chart P&L có bản dark riêng (`getPnlPalette`), khối `GarageConversionFunnelCard` (`utils/funnelConfig.ts`, `funnelDataCalculators.ts`) dùng cùng tông, trùng `CHART_PALETTE` của Excel.
  - Đã xóa `GarageTrendChart.tsx` và `GarageRevenueProfitChart.tsx` (chart cũ dùng `stats.trend`).
- **Phễu 5 giai đoạn (cập nhật 2026-10-17)**: `GarageConversionFunnelCard` tách **Báo giá** khỏi Đang xử lý: Tổng tiếp nhận = Báo giá + Đang xử lý + Hoàn tất + Hủy. `FunnelOverviewCards` (dùng `FunnelStageCard`) hiển thị 5 thẻ (teal / tím `#7C3AED` / slate / emerald / rose), `FunnelRateProgressBar` có đoạn Báo giá, chart dòng thời gian có cột chồng Báo giá, bảng theo 4 loại nghiệp vụ có cột Báo giá, donut trạng thái tô Báo giá tím. Type: `GarageConversionFunnel.quotation`, `…ClassificationItem.quotationCount/Amount`.
- **Xuất Báo Cáo Excel Theo Kỳ (cập nhật 2026-10-16)**:
  - **Nút chính + dropdown dùng chung (cập nhật 2026-10-17)**: header tab Tổng quan dùng đúng nút chính **Đồng bộ** (split button, cần `canSyncGarage`) và dropdown "Báo cáo & Xuất file → Xuất Excel" / "Tùy chọn đồng bộ → Đồng bộ Lợi nhuận gộp" như tab Hoạt động garage. `DashboardTemplate` forward `onCreate/createLabel/createIcon/createActions` xuống `TableActionGroup`. State + quyền + action nằm ở `components/GarageHeaderActions/` (`useGarageHeaderActions`, `buildGarageHeaderActions`, `GarageHeaderActionDrawers`).
  - **Drawer xuất dùng chung** `GarageExportDrawer` (`components/GarageExportDrawer/`, hook `useGarageExportDrawerLogic`): `StandardFormDrawer` 2 cột, trái là lịch sử xuất, phải là **một section duy nhất "Điều kiện xuất dữ liệu"** (`modules/garage/export/GarageExportConditionSection`, dùng chung với drawer công nợ): tab **Loại báo cáo** (`GarageExportReportTypeField`, `PillTabs` đơn: `Báo cáo theo kỳ` | `Bảng kê phiếu dịch vụ`; với kỳ hiện thêm ô **Nội dung báo cáo** `MultiCombobox` chọn nhiều trong 6 mục, không cho để trống; đổi tab giữ lại mục kỳ đã chọn; nhãn/option từ `useGarageReportTypeOptions`) → chế độ xuất → kỳ → trường riêng (slot `children`, chỉ nhánh cases: loại ngày / phân loại / trạng thái / chi nhánh qua `GarageCaseExportConditionFields`) → nút Xuất. Loại (`export/garageExportReportTypes.ts`): `cases-list` (bảng kê phiếu dịch vụ), `period-all`, `period-business`, `period-cashflow-debts`, `period-overdue` ↔ `reportType` API `all|business|cashflow-debts|overdue`. Tab Tổng quan và `GarageCheckpointDrawer` mở với `defaultReportType="period-all"` (checkpoint kèm `initialRange`); tab Hoạt động garage mở với `cases-list`. Cùng loại + cùng kỳ ⇒ cùng payload ⇒ cùng file. `GarageDashboardExportDrawer`/`GarageCaseExportDrawer` đã xóa (chỉ còn hook `useGarageDashboardExport` và các section của cases được tái dùng). Khi đổi loại giữa cases và kỳ, kỳ đã chọn không mang sang (mỗi nhánh có state kỳ riêng).
  - Báo cáo kỳ: chỉ chọn kỳ Tuần/Tháng/Quý/Tùy chỉnh (chế độ theo filter chỉ có khi loại là bảng kê phiếu dịch vụ và bảng truyền `tableQuery`), mặc định tháng hiện tại; ghi chú nguồn số liệu hiển thị dưới bộ chọn kỳ. Nội dung file (Dashboard card + số tổng + 3 chart, báo cáo lợi nhuận 3 cấp, quy tắc gom ngày/tuần/tháng theo độ dài kỳ): xem skill API `garage-dashboard`.
  - Nhánh **bảng kê phiếu dịch vụ** có section **CỘT XUẤT DỮ LIỆU** (`export/GarageCasesExportColumnSelector`, nằm trên Lịch sử xuất): 34 cột chia 5 nhóm trong `export/garageCasesExportColumns.ts`: 29 cột mặc định (khớp `COMPLETED_CASES_COLUMNS` của API) + 5 cột tùy chọn nhóm Hệ thống/Phải thu (Thuế GTGT, Quy tắc loại trừ, Ngày tạo, Ngày cập nhật, Dữ liệu lúc); Mặc định chỉ chọn 29 cột, Chọn tất cả chọn 34, nhãn qua `exportReport.casesColumns.*`. Lựa chọn lưu localStorage `garage_cases_export_columns_v1`, gửi `selectedColumns` trong cả hai chế độ theo kỳ và theo filter; không chọn cột nào thì chặn nút Xuất. Các loại báo cáo kỳ không có section này.
  - Chế độ **Theo filter hiện tại** (bảng kê): tóm tắt liệt kê từng điều kiện `Tên cột: giá trị` từ `filtersStr` (`export/garageCaseFilterSummary.ts`); chi nhánh lấy từ chi nhánh đang xem trên bảng (`initialBranchId`), không từ state cũ của drawer.
  - Cơ chế nền dùng `useBackgroundExport` với `garageDashboardExportScope` (`/api/v1/greenway/dashboard/export`), payload `{ from, to, reportType }`, header chi nhánh từ `useGarageStore` / chi nhánh đầu tiên. `garageDashboardApi.exportExcel` (tải blob trực tiếp) đã **xóa**.
  - File Excel gồm sheet Dashboard thu chi & công nợ (card cảnh báo quá hạn + 4 KPI + 3 chart có nhãn, gọn một màn hình), sheet Báo cáo lợi nhuận (bảng P&L tháng báo cáo + 2 chart xếp dọc: combo 12 tháng và tỷ trọng chi phí), các sheet nhóm phải thu, phải trả, nợ quá hạn, thu chi trong kỳ (chi tiết ở skill API `garage-dashboard`).
  - `exportPnlExcel`: Báo cáo P&L theo tháng chi tiết từng dòng doanh thu, chi phí, OPEX, hoa hồng và lợi nhuận ròng (không đổi).

---

## 2. Database Schema & Quan hệ Dữ liệu

### 2.1. Sơ đồ Quan hệ Bảng:

```text
kgara_cases (Hồ sơ Phiếu dịch vụ)
  ├── 1:1 ── kgara_gross_profit (Sổ Lợi nhuận gộp & Chi phí vốn)
  └── 1:N ── kgara_case_services (Chi tiết phụ tùng & công thợ)

kgara_operating_expenses (Chi phí vận hành & Hoa hồng theo kỳ tháng)
```

### 2.2. Chi tiết các Bảng tham gia:

#### Bảng `kgara_operating_expenses`
| Tên Cột | Kiểu Dữ Liệu | Nullable | Mặc Định | Ràng Buộc / Index | Mô Tả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `uuid_generate_v4()` | PK | Định danh bản ghi chi phí |
| `period_year` | `smallint` | NO | — | Index `idx_kgara_opex_period` | Năm chi phí (vd: 2026) |
| `period_month` | `smallint` | NO | — | Index `idx_kgara_opex_period` | Tháng chi phí (1 - 12) |
| `category_key` | `varchar(100)` | NO | — | Index `idx_kgara_opex_category` | Mã loại CP (NHAN_SU, THUE_MAT_BANG, HOA_HONG_TRUC_TIEP, CHI_PHI_TRUC_TIEP_KHAC, HOA_HONG_SALE,...) |
| `category_name` | `varchar(255)` | NO | — | — | Tên/Diễn giải chi tiết khoản chi |
| `amount` | `numeric(18,2)` | NO | `0` | — | Số tiền chi phí (VND) |
| `note` | `text` | YES | `null` | — | Ghi chú bổ sung |
| `recurrence_type` | `varchar(20)` | YES | `null` | — | Chu kỳ lặp lại (`monthly` hoặc null) |
| `recurrence_until_year` | `smallint` | YES | `null` | — | Năm kết thúc chuỗi định kỳ |
| `recurrence_until_month`| `smallint` | YES | `null` | — | Tháng kết thúc chuỗi định kỳ |
| `recurrence_anchor_id`  | `uuid` | YES | `null` | Index `idx_kgara_opex_recurrence_anchor` | ID bản ghi gốc trong chuỗi định kỳ |
| `created_by` | `uuid` | YES | `null` | — | ID người tạo |
| `created_at` | `timestamptz` | NO | `now()` | — | Thời gian tạo |
| `updated_at` | `timestamptz` | NO | `now()` | — | Thời gian cập nhật |

#### Bảng `kgara_cases` & `kgara_gross_profit`
| Tên Bảng | Vai trò trong Dashboard | Các cột truy vấn trọng tâm |
| :--- | :--- | :--- |
| `kgara_cases` | Phiếu dịch vụ gốc | `id`, `hd_phieu_dich_vu_id`, `so_chung_tu`, `bien_so_xe`, `khach_hang_code`, `khach_hang_name`, `tinh_trang_dich_vu`, `tien_co_thue`, `tien_da_thanh_toan`, `tien_con_phai_thanh_toan`, `ngay_hoan_thanh_cong_viec`, `kgara_deleted_at` |
| `kgara_gross_profit` | Dữ liệu tài chính lãi gộp & giá vốn | `hd_phieu_dich_vu_id`, `vu_viec_code`, `doanh_thu`, `chi_phi`, `loi_nhuan` |

---

## 3. Cấu trúc Source Code

```text
erp-api/src/kgara-api-core/
├── dto/
│   └── garage-opex.dto.ts              # Create, Update, ApplyRecurring, List Query DTOs cho OPEX
├── entities/
│   └── kgara_operating_expense.entity.ts # TypeORM Entity cho kgara_operating_expenses
├── services/
│   ├── garage-opex.service.ts          # CRUD OPEX, recurring upsert & period summary (COGS/OPEX/Commission)
│   └── garage-opex.service.spec.ts     # Unit tests cho GarageOpexService (Pass 100%)
├── garage-dashboard.controller.ts      # REST Controller (Dashboard, Checkpoint, OPEX, P&L, ApplyRecurring)
├── garage-dashboard.service.ts         # Aggregation Doanh thu/COGS/DirectCost, P&L Report, ExcelJS
└── kgara-api-core.module.ts            # NestJS Module đăng ký Entity, Controllers & Services

erp-web/src/modules/garage/
├── api/
│   ├── garageDashboardApi.ts           # Axios Client gọi API stats, checkpoint-kpis, pnl-report
│   └── garageOpexApi.ts                # Axios Client gọi CRUD opex, columnOptions, applyRecurring, exportPnl
├── components/
│   ├── GaragePnlSection.tsx            # Báo cáo P&L dạng bảng phân cấp card-shadow, đối soát dòng con tháng trước
│   ├── GarageOpexDrawer.tsx            # StandardFormDrawer 1 cột tạo/sửa/nhân đôi chi phí với Vietnamese Words preview
│   └── OpexRecurringConfirmModal.tsx   # Modal xác nhận phạm vi áp dụng chuỗi định kỳ (this vs this_and_future)
├── hooks/
│   └── useGarageOpexList.ts            # Custom hook quản lý filter, dateFrom/dateTo, sorts, paging, summary
└── pages/
    ├── GarageDashboard.tsx             # Trang Dashboard xưởng dịch vụ
    └── GarageOpex.tsx                  # Bảng tính chi phí vận hành (Spreadsheet Table chuẩn hóa)
```

---

## 4. Danh sách API Endpoints & RBAC Contract

Base Path: `/api/v1/greenway/dashboard`  
Guards: `JwtAuthGuard`, `CoreRbacGuard`  
Resource RBAC: `garage`

| Method | Endpoint | Quyền yêu cầu | Query / Body | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/stats` | `{ resource: 'garage', action: 'read' }` | `date_from`, `date_to` | Xu hướng tháng, tiến độ thu/chi & phân bổ trạng thái |
| `GET` | `/checkpoint-kpis` | `{ resource: 'garage', action: 'read' }` | — | KPIs Sparkline Tháng/Tuần/Hôm nay |
| `GET` | `/checkpoint-cases` | `{ resource: 'garage', action: 'read' }` | `date_from`, `date_to`, `page`, `pageSize` | Danh sách vụ việc chi tiết theo checkpoint |
| `GET` | `/customers` | `{ resource: 'garage', action: 'read' }` | Query pagination, filters, sort | Danh sách khách hàng kèm doanh thu, lãi gộp & nợ |
| `POST` | `/export/background` | `garage:read` + `garage_debts:read` | body `{ from?, to?, reportType? }` | Job nền xuất báo cáo Garage theo kỳ (history, download, SSE cùng prefix `/export`). Thay endpoint cũ `GET /export` đã xóa |
| `GET` | `/opex` | `{ resource: 'garage', action: 'read' }` | `year`, `month`, `date_from`, `date_to`, `page`, `pageSize`, `sorts`, `columnFilters`, `columnSearch` | Danh sách chi phí vận hành có phân trang, sort, filter |
| `GET` | `/opex/column-options`| `{ resource: 'garage', action: 'read' }` | `column`, `search`, `page`, `pageSize`, `filtersStr` | Danh sách giá trị phân biệt phục vụ Header Filter |
| `GET` | `/opex/:id` | `{ resource: 'garage', action: 'read' }` | `id` (uuid) | Chi tiết một khoản chi phí vận hành |
| `POST` | `/opex` | `{ resource: 'garage', action: 'create' }`| `CreateGarageOpexDto` | Tạo mới khoản chi phí vận hành |
| `PUT` | `/opex/:id` | `{ resource: 'garage', action: 'update' }`| `UpdateGarageOpexDto` | Cập nhật khoản chi phí vận hành |
| `POST`| `/opex/:id/apply-recurring` | `{ resource: 'garage', action: 'update' }`| `ApplyRecurringOpexDto` | Áp dụng thay đổi định kỳ (This vs This and Future) |
| `DELETE`| `/opex/:id` | `{ resource: 'garage', action: 'delete' }`| `id` (uuid) | Xóa khoản chi phí vận hành |
| `GET` | `/pnl-report` | `{ resource: 'garage', action: 'read' }` | `year`, `month` | Báo cáo Lợi nhuận P&L theo tháng kèm `cogsAdjustment` |
| `GET` | `/pnl-report/export` | `{ resource: 'garage', action: 'read' }`| `year`, `month` | Xuất file Excel Báo cáo P&L theo tháng |

---

## 5. Logic Nghiệp vụ & Thuật toán Trọng tâm

### 5.1. Công thức Báo cáo Lợi nhuận (P&L):
1. **Doanh thu ($R$)**:
   $$\sum \text{COALESCE}(gp.\text{doanh\_thu}, c.\text{doanh\_thu}, c.\text{tien\_co\_thue}, 0)$$
   áp dụng cho các phiếu hoàn thành trong tháng `TO_CHAR(c.ngay_hoan_thanh_cong_viec, 'YYYY-MM') = :periodStr`.
2. **Chi phí giá vốn ($C_{COGS}$)**:
   $$C_{COGS} = \sum \text{COALESCE}(gp.\text{chi\_phi}, c.\text{chi\_phi}, 0) + \sum \text{DirectCosts}_{\text{nhập tay}}$$
   với $\text{DirectCosts}$ là các khoản OPEX có `category_key IN ('HOA_HONG_TRUC_TIEP', 'CHI_PHI_TRUC_TIEP_KHAC')`.
3. **Lợi nhuận gộp ($GP$)**:
   $$GP = R - C_{COGS}, \quad \text{Gross Margin} = \frac{GP}{R} \times 100\%$$
4. **Chi phí vận hành ($OPEX$)**:
   Tổng `amount` các bản ghi trong `kgara_operating_expenses` có `category_key NOT LIKE 'HOA_HONG_%'` và `category_key NOT IN ('CHI_PHI_TRUC_TIEP_KHAC')` trong kỳ.
5. **Lợi nhuận ròng trước hoa hồng ($NP_{pre}$)**:
   $$NP_{pre} = GP - OPEX$$
6. **Hoa hồng ($COMM$)**:
   Tổng `amount` các bản ghi trong `kgara_operating_expenses` có `category_key LIKE 'HOA_HONG_%'` và `category_key != 'HOA_HONG_TRUC_TIEP'` trong kỳ.
7. **Lợi nhuận ròng sau hoa hồng ($NP_{post}$)**:
   $$NP_{post} = NP_{pre} - COMM, \quad \text{Net Margin} = \frac{NP_{post}}{R} \times 100\%$$

---

## 6. Quy tắc Kiểm thử & Báo cáo Chất lượng (QC Mandate)

1. **TypeCheck & Linting**: Chạy `bun run check:ci` trong `erp-api/` và `erp-web/`.
2. **Backend Unit Tests**: Chạy `bunx jest src/kgara-api-core/ --forceExit` (bắt buộc pass 100%).
3. **Web Build**: Chạy `bun run build` trong `erp-web/` (bắt buộc pass 100%).

## 7. Garage Month Detail Drawer - Debt Tables (2026-10)

- `GarageMonthDetailDrawer` hiển thị đồng thời hai bảng `DataTable` chuẩn spreadsheet cho Phải thu và Phải trả; mỗi bảng có state/filter độc lập và các table ID `garage-month-detail-receivables-table` và `garage-month-detail-payables-table`.
- Tab Đối tượng HĐ hiển thị riêng hai bảng Thu khách hàng và Thu bảo hiểm, dùng lần lượt `customerPartners` và `insuranceCompanies`, với table ID `garage-month-detail-customer-partners-table` và `garage-month-detail-insurance-companies-table`.
- `CustomerDetailDebtSwitch` không còn được dùng trong hai khu vực bảng; click row vẫn mở classification hoặc partner detail drawer như trước.
- Dữ liệu Đối tượng HĐ hiện chỉ có breakdown Phải thu từ `useGarageMonthReceivablesBreakdown`; không tạo payables partner breakdown trong frontend.

## 8. Drawer Table Scroll Stacking Contract (2026-10)

- Shared drawer stacking order: `DrawerModal` header `z-40`, `DrawerTopTabBar` `sticky z-30 isolate`, and `DataTable` header `sticky z-20`.
- `DataTable` scroll containers use `isolate` with `overflow-x-auto overflow-y-auto` so nested table scrolling cannot paint over drawer headers or top tabs.
- `DrawerModal` body and `StandardFormDrawer` left content use `flex flex-col min-h-0` to keep nested scroll areas bounded by the drawer viewport.

## 9. Month Debt Drawer Column & Right-Panel Contract (2026-10)

- `MonthClassificationTable` chỉ hiển thị hai cột breakdown `remainingWithInvoice` và `remainingNoInvoice` cho `debtType="receivables"`; bảng payables chỉ hiển thị tổng `remaining` (`Còn phải trả`).
- Right panel dùng chung cho hai tab Phải thu và chỉ hiển thị `DrawerSection` `Cơ cấu Thu KH vs Thu BH` chứa `MonthPayerKpiGrid`.
- Tab `partner_breakdown` hiển thị nhãn `Phân loại theo đối tượng`; không cấp right panel riêng theo tab.
- `MonthPayerKpiGrid` xếp hai card Thu Khách hàng và Thu Bảo hiểm theo một cột để vừa right panel rộng 300–360px; không render trùng ở left content.

## 10. Standardize Drawer contract (2026-10)

- `MonthClassificationTable` chỉ trả về `DataTable`; parent đặt bảng Phải thu và Phải trả trong hai `DrawerSection` riêng.
- Cột `caseCount`/`Số phiếu` đứng ngay sau `name`; breakdown hóa đơn chỉ thuộc bảng receivables. Header style dùng `containerClassName` scoped để giữ nền đặc và bỏ blur.
- Right panel dùng chung cho hai tab Phải thu, chỉ chứa `Cơ cấu Thu KH vs Thu BH`; tab partner hiển thị là `Phân loại theo đối tượng`. Khi không có breakdown, truyền `undefined` để ẩn panel.

## 11. Drawer table pagination contract (2026-10)

- Bốn bảng month-detail dùng header label ngắn kèm tooltip; không sửa style `DataTable` toàn cục.
- Classification tables dùng viewport khoảng 5 dòng và giữ sticky/vertical/horizontal scroll.
- Partner tables paginate sau filter client-side với state độc lập, mặc định 5 dòng/trang và options 5/10/20; summary tính trên toàn bộ dữ liệu đã lọc.

## 12. Partner drawer sections (2026-10)

- Thu khách hàng và Thu bảo hiểm phải nằm trong hai `DrawerSection` độc lập, mỗi section chứa trực tiếp một `DataTable`.
- Partner tables dùng cùng DataTable/scroll/header contract với monthly detail tables; không gom hai bảng vào một section wrapper.
- Cột Loại nghiệp vụ của classification table dùng `justify-start`/`text-left`.

## 13. Sơ đồ quy trình Garage Hub (2026-10-19)

- Nút "Xem sơ đồ quy trình" nằm trong nhóm "Báo cáo & Xuất file" của dropdown `GarageHeaderActions` (dùng chung tab Tổng quan và Hoạt động garage), mở `GarageWorkflowDrawer`.
- Drawer là một `StandardFormDrawer` (`size="xl"`) không có thanh tab; việc chọn sơ đồ (End user hoặc Dev) làm bằng dropdown ngay trên toolbar của canvas:
  - **Người dùng cuối**: lưới ô cờ ca-rô, hàng là bộ phận (`r1`..`r6`), cột là giai đoạn (`c1`..`c5`).
  - **Kỹ thuật (Dev)**: 4 khung module: **Hoạt động garage** (trái: sync KGara, phiếu dịch vụ, cấn trừ, P&L), **Garage Hub** (giữa), **Thu chi** và **OPEX** (phải), cộng dải lớp chỉ đọc "Báo cáo & phân tích" (ẩn mặc định). Mũi tên tô màu theo **luồng tự động** A–D (A: Kết thúc → sinh Dự thu; B: lưu phiếu chi HHBH/vật tư → ghi OPEX; C: mở báo cáo P&L → sinh phiếu hoa hồng; D: lưu phiếu gắn phiếu dịch vụ → tự cấn trừ, đặt lại Dự thu) và luồng thủ công M. Số thứ tự theo từng luồng (A1, B2...); bấm chip luồng ở thanh công cụ để làm nổi một luồng, các luồng khác mờ đi (ảnh xuất PNG/PDF theo đúng trạng thái đang hiển thị). Nhãn mũi tên ghi cơ chế gọi (DI, cron, HTTP, ghi DB...) ở dòng dưới.
- Thư mục `src/modules/garage/components/GarageWorkflowDrawer/`:
  - `garageWorkflowTypes.ts`: kiểu dữ liệu lane, cột, node, edge; `step` (số thứ tự) và `description` của canvas.
  - `endUserCanvasData.ts`, `devCanvasData.ts`: dữ liệu tĩnh của từng canvas. `garageWorkflowData.ts` ghép hai canvas và thứ tự tab.
  - `GarageWorkflowCanvas.tsx`, `WorkflowNodeCard.tsx`, `WorkflowEdge.tsx`: React Flow readonly, màu hex tường minh (bảng màu trầm, icon theo bộ phận ở `workflowIcons.ts`), nhãn mũi tên là HTML có vòng số.
  - `edgeRouter.ts`: định tuyến mũi tên trực giao trên lưới 10px bằng A* (tránh thẻ, ít rẽ). Canvas tính đường đi trước khi vẽ và đưa vào `data.points`; `edgeRoutes.spec.ts` kiểm tra không mũi tên nào cắt thẻ trên dữ liệu thật. Lớp xếp: lane/cột `zIndex -1`, thẻ `10`, tiêu đề xuất `20`, mũi tên `30`. Số thứ tự: end-user là vòng số trên thẻ, dev là tiền tố trên nhãn mũi tên.
  - `edgeLabels.ts`: đặt nhãn trên đường đi, tránh đè thẻ, đè nhãn khác, ưu tiên ít cắt mũi tên khác. `routeEdges` định tuyến cả batch và phạt đi chồng lên mũi tên đã đi trước.
  - `workflowPalette.ts`: màu lane lấy từ bảng chart dashboard (`PNL_PALETTE_LIGHT`), pha nhạt bằng `tonePalette`.
  - Mũi tên có `kind: "read"` (chỉ đọc dữ liệu) ẩn mặc định, bật bằng nút trên thanh công cụ. Thanh công cụ nằm trên khung canvas, không đè sơ đồ.
  - `WorkflowCanvasToolbar.tsx` (zoom, full screen, % zoom), `WorkflowLegend.tsx` (panel "Cách đọc", không vào ảnh xuất), `useCanvasFullscreen.ts` (Fullscreen API cho đúng khung canvas).
  - `canvasBounds.ts`: khung bao canvas; `withHeading` cộng khối tiêu đề khi xuất.
  - `useWorkflowExport.ts`: xuất PNG và PDF A3 (tự chọn ngang hoặc dọc) theo khung bao toàn bộ sơ đồ, nền trắng cố định, lọc controls/minimap/panel. Khi xuất, drawer bật `exportMode` để vẽ khối tiêu đề + mô tả phía trên sơ đồ, chờ 2 frame rồi chụp, sau đó tắt.
- **Dữ liệu tĩnh**: sơ đồ không đọc backend. Khi đổi rule Hub, cashflow, hoa hồng, sync hoặc báo cáo ở API, phải cập nhật `endUserCanvasData.ts` / `devCanvasData.ts` và nhánh `workflow` trong `locales/vi.ts` + `en.ts`.
- `statusCode` chỉ gắn cho mã đã xác minh trong code: `3` = Kết thúc (`KGARA_STATUS_COMPLETED`, tên hiển thị theo KGara), `9` = Hủy.
- Test: `garageWorkflowData.spec.ts` (vị trí, chồng lấn, key), `workflowEdgeHandles.spec.ts`, `useWorkflowExport.spec.ts`, `garageWorkflowLocales.spec.ts` (parity vi/en), `GarageHeaderActions/buildGarageHeaderActions.spec.tsx`.
- `KgaraCaseStatusBadge.tsx` dùng đúng mã của API skill: `0` Tiếp nhận, `1` Báo giá, `2` Đang sửa, `3` Kết thúc, `9` Đã hủy. Nếu đổi mã ở API thì sửa badge và test cùng lúc.
- **Hiển thị mũi tên**: thẻ có chiều cao tối thiểu chung (`WORKFLOW_CARD_MIN_HEIGHT` = 112) để các thẻ cùng hàng có tâm cạnh thẳng hàng. Canvas đo chiều cao thật của thẻ (`useNodesInitialized` + `node.measured`) rồi mới định tuyến; đầu và cuối mũi tên căn đúng tâm cạnh thẻ, đoạn nằm trong khe giữa các cột/hàng thẻ được căn về giữa khe (`edgeGutters.ts`, nhiều mũi tên cùng khe chia slot đối xứng). Nhãn mũi tên là HTML `zIndex: 1000` nên luôn nằm trên mọi mũi tên.
- **Lớp chỉ đọc**: thẻ/cột `layer: "read"` và mũi tên `kind: "read"` ẩn mặc định; trạng thái `showRead` nằm ở `GarageWorkflowDrawer` (theo từng canvas) để khung bao khi xuất PNG/PDF khớp với màn hình (`canvasBounds(canvas, { showRead })`).
- **End user: các khoản tiền** (đối chiếu `garage-cashflow-payment-rules.ts`): thẻ riêng cho **Dự thu** (phiếu thu `EXPECTED`, hạn +7 ngày, chưa tính thực thu), **Thực thu**, **Dự chi** (`PENDING`/`APPROVED`), **Thực chi** (`PAID`, khóa), **HHBH** (nội dung `4. HHBH`, P&L mục 4.2) và **Vật tư tiêu hao** (nội dung `10. Vật tư tiêu hao`, mã cũ `8.`, P&L Giá vốn). HHBH và vật tư tiêu hao không trừ công nợ, ghi OPEX khi `APPROVED`/`PAID`.
- **Thanh công cụ một hàng**: dropdown **Sơ đồ**, dropdown **Luồng tự động** (cả 2 sơ đồ đều có; Tất cả luồng, A–D, M), zoom `−`/`+`, nút có chữ "Vừa khung" và "Toàn màn hình" (icon khác nhau), nút luồng đọc, nút "Bỏ chọn thẻ" khi đang chọn thẻ, chú giải. Dropdown dùng `Combobox` chung; khi canvas ở chế độ toàn màn hình truyền `portalContainer` (khung canvas) để dropdown không bị ẩn.
- **Luồng tự động dùng chung** (`garageAutoFlows.ts`, key `workflow.flows.*`): A Kết thúc → sinh Dự thu, B phiếu chi HHBH/vật tư → ghi OPEX, C mở P&L → sinh hoa hồng, D phiếu gắn phiếu dịch vụ → cấn trừ + đặt lại Dự thu, M thủ công. Mũi tên có `flows` và `steps` theo từng luồng.
- **Làm nổi bật** (`workflowFocus.ts`, hàm thuần `computeFocus`): chọn luồng thì chỉ luồng đó sáng và chạy animation; bấm một thẻ thì thẻ đó và các thẻ nối trực tiếp (hai chiều) sáng, mũi tên chạm thẻ chạy animation (`animated`), phần còn lại mờ; bấm vùng trống, bấm lại thẻ hoặc "Bỏ chọn thẻ" để xoá. Đổi sơ đồ thì tự xoá chọn và fit lại; ảnh PNG/PDF xuất đúng trạng thái đang hiển thị.
- **v8 bố cục và dropdown**: khe giữa khung Thu chi và OPEX = 120px, OPEX có 2 hàng thẻ (`OPEX_ROW_1/2` trong `devCanvasData.ts`), đáy 3 khung thẳng hàng. `canvasHeaderRects.ts` coi thanh tiêu đề khung/cột/ô góc là vật cản cho cả `routeEdges` và `placeLabels`. Dropdown `w-40`/`w-56`, mỗi option có `tooltipContent` (luồng có `description`, key `workflow.flowDescriptions.*`). Tiêu đề Dev: "Kiến trúc module Garage".
- **PDF kèm tài liệu hướng dẫn** (chỉ PDF, PNG chỉ có sơ đồ): trang 1 = sơ đồ A3; trang sau = A4 dọc do `guide/WorkflowGuideDocument.tsx` dựng (HTML ẩn ngoài màn hình, pha 1 đo chiều cao đơn vị, pha 2 xếp trang bằng `packGuideUnits`), `exportPdf(container, bounds, name, guidePages)` chụp từng trang rồi `addPage("a4","portrait")`. Chữ trong PDF là ảnh (jsPDF không có font tiếng Việt), không bôi chọn được.
  - Nội dung: `guide/guideContent.ts` (phần viết tay, key `workflow.guide.*` trong `locales/vi.ts` + `en.ts`) ghép với phần sinh từ dữ liệu sơ đồ trong `guide/buildGuide.ts` (các bước theo `step`, thẻ theo khung, bước theo luồng). Đổi rule hay thêm thẻ/luồng thì tài liệu tự theo; chỉ phần viết tay phải sửa tay. `garageWorkflowLocales.spec.ts` kiểm tra đủ key vi/en và không thừa.
- **Tài liệu PDF có mục lục và đánh số**: `flattenGuide` đánh số mục `1`, `1.1`, `1.1.1` và dựng mục lục (cấp 1 và mục cấp 2 có tiêu đề, kèm số trang tra từ kết quả xếp trang). Mỗi mục cấp 2 có lời giải thích và khối **Ví dụ** cụ thể: viết ở `guide/guideDetails.ts` (`GUIDE_DETAILS`, tra theo key i18n, quy ước key ghi ở đầu file) và `locales` nhánh `workflow.guide.*`. Thêm thẻ/luồng/mục mới thì thêm key tương ứng; `buildGuide.spec.ts` báo mục cấp 2 nào thiếu ví dụ.

---

## 1.10. Quản lý Công nợ Garage (`garage-debts`) & Tích hợp Tạo Phiếu Thu/Chi Trực Tiếp (`garage-cashflow`)

### A. Context Menu / Row Actions Tạo Phiếu Thu/Chi
- **Tab `receivables` (`GarageDebtsTable`)**: Chuột phải hoặc action menu trên dòng khách hàng cung cấp nhóm `PHIẾU THU / CHI`:
  - `Tạo phiếu thu` (`RECEIPT`): Điền sẵn `partnerName`, `licensePlate`, `amount` (dư nợ `balanceAmount`), `customerCode`.
  - `Tạo phiếu chi` (`PAYMENT`): Chi hoàn tiền/chi khác.
- **Tab `payables` (`GaragePayablesTable`)**: Chuột phải hoặc action menu trên dòng NCC/đối tác:
  - `Tạo phiếu chi` (`PAYMENT`): Điền sẵn `partnerName`, `licensePlate`, `amount`, `supplierId`, `customerCode`.
  - `Tạo phiếu thu` (`RECEIPT`): Thu hoàn chi phí.
- **Chi tiết Vụ việc (`CustomerCasesTableTab`)**: Action trên từng vụ việc hỗ trợ "Tạo phiếu thu vụ việc..." và "Tạo phiếu chi vụ việc..." gắn sẵn `caseId`.
- **RBAC Guard**: Kiểm tra quyền `ErpResource.GARAGE_CASHFLOW` - `ErpAction.CREATE`.

### B. Mở Drawer & Điều Phối Dòng Tiền
- Component: `GarageCashflowDrawer` gắn trực tiếp trên `GarageDebts.tsx`.
- Quản lý qua hook `useGarageDebtsCashflow`: Tự động pre-fill `initialData` khi mở `initialMode="create"`.
- Khi tạo thành công: Tự động invalidate các query: `garage-customers-debt`, `garage-suppliers-debt`, `garage-debts-analytics`, `garage-dashboard-stats`, `garage/customers`, `garage/suppliers`.

### C. Cơ Chế Hiển Thị Ưu Tiên Phiếu Dịch Vụ Của Đối Tượng (`GarageCaseCombobox`)
- Props nhận ngữ cảnh: `customerCode`, `licensePlate`, `supplierId`, `partnerName`.
- `useGarageCaseCombobox`:
  - Tự động query các phiếu dịch vụ của đối tượng (`getCasesByCustomer`, `getCasesBySupplier`, hoặc query theo `licensePlate`).
  - Đưa danh sách lên đầu combobox dưới nhóm ưu tiên: **"⭐ Phiếu dịch vụ của [Khách hàng/BKS]"** kèm tooltip chi tiết (Số chứng từ, BKS, Doanh thu, Chi phí, Dư nợ).
  - Khi chọn case: Tự động bind `caseId`, cập nhật `licensePlate`, `partnerName`, và nếu `amount` chưa có thì gợi ý điền số tiền của vụ việc.
- Tuân thủ `/ui-atomic-refactor`: File helper `GarageCaseCombobox.helper.tsx` độc lập, hook $< 160\text{ LoC}$, 0 class `blue-*`, 100% i18n, co-located test.

