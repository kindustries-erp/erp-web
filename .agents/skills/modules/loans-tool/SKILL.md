---
name: loans-tool-web
description: Module tri thức Frontend Quản lý Khoản Vay & Mô Phỏng Dòng Tiền (Loans & Cashflow Simulator V2) trong erp-web (v2/core/loans và v2/modules/loans). Chứa cấu trúc components Atomic 5 tầng, TanStack Query hooks, drawers, pages (public & authenticated), routing và quy chuẩn Mobile-First, No Blue.
---

# 📦 Module Tri Thức: Quản Lý Khoản Vay & Mô Phỏng Dòng Tiền (`loans`) - Frontend (`erp-web`)

## 1. Tổng quan Nghiệp vụ

Module `loans` trong `erp-web` cung cấp bộ công cụ tài chính hoàn chỉnh theo chuẩn V2 Architecture với **URL thống nhất `/loans-tool`** (URL cũ `/tools/loans` và `/loans` là alias, chuyển hướng về `/loans-tool` giữ query) cho cả khách chưa đăng nhập và người dùng ERP:
- **Chế độ Khách (Chưa đăng nhập - `/loans-tool`)**: Truy cập ngay lập tức không cần đăng nhập thông qua `V2PublicToolView` (`V2AppLayout`, `hideBottomNav={!isLoggedIn}` ẩn Bottom Nav trên Mobile, Sidebar Desktop hiển thị nhóm **CÔNG CỤ** và nút **Đăng nhập**). Khi chưa đăng nhập, nút "Đăng nhập để lưu vào ERP" lưu bản nháp vào `sessionStorage` và chuyển hướng sang `/login?redirect=/loans-tool` (tự động quay lại `/loans-tool` sau khi đăng nhập thành công).
- **Chế độ ERP (Đã đăng nhập - `/loans-tool` hoặc `/v2/loans`)**: Dành cho người dùng nội bộ có quyền `loans:read`. Render `LoansListPage` theo khung `V2ModulePage` với `variant={V2ModulePageVariant.CARD}` (Header Card có `Calculator` icon + thanh tab pill kèm `border-b`), `defaultTab={LoansTabKey.SIMULATOR}`, `syncUrl=true` đồng bộ `?tab=simulator|projection|list` (giữ lazy-load cho tab `list`) gồm 3 tab:
  1. *Mô Phỏng & Tính Nhanh* (`simulator`, `kind="dashboard"`): Nhúng trực tiếp `LoanSimulatorPage` để tính toán nhanh ngay trong phiên làm việc; khi lưu thành công chuyển sang `?tab=list`.
  2. *Dòng Tiền* (`projection`, `kind="dashboard"`): Gọi API `/api/v2/loans-tool/cashflow/projection?includeAllPeriods=true` hiển thị toàn bộ kỳ đã trả và tương lai, bộ lọc checkbox từng khoản vay (`CashflowLoanFilterPanel`), 3 thẻ KPI (`ConsolidatedCashflowKpis`: Tổng phải trả, Đã thanh toán, Dư nợ còn lại), biểu đồ `LoanCashflowChart` và bảng chi tiết `ConsolidatedCashflowTable`.
  3. *Danh Sách Hợp Đồng* (`list`, `kind="list"`): `V2ModuleListTab` + `V2StandardTable` (`mode="server"`, `tableId="loans-master-table"`, `v2ColumnPreferencesStorage`, `v2ViewPresetStorage`), nhận response `{ items, pagination: { page, pageSize, total, totalPages }, summaries }`, gửi `summary_keys` và hiển thị hàng tổng (`principalAmount`, `totalPaidPrincipal`, `remainingPrincipal`), `headerFilter` + `fetchOptions` (`/api/v2/loans-tool/column-options`), `viewModes` (`overview` / `all`), `filterGroup` (`Tất cả`, 4 trạng thái, `Đã xóa mềm`), Xóa mềm (`loans:delete`) & Xóa vĩnh viễn (`loans:purge`, ở mode `Đã xóa mềm`) kèm `V2ConfirmModal`.

---

## 2. Cấu Trúc Mã Nguồn

### 2.1. Tầng Core (`src/v2/core/loans/`)
- `domain/types/loan.types.ts`: TypeScript contracts (`LoanItem`, `LoanSchedulePeriod`, `LoanPaymentRecord`, `PortfolioLoanItem`, `PortfolioMonthlyPeriod`, `AmortizationMethod`, `LoanStatus`).
- `domain/rules/loan-amortization.rule.ts` & `loan-recalculate.rule.ts` & `loan-portfolio.rule.ts`: Client-side pure calculation engine cho khấu hao đơn lẻ (`generateAmortizationSchedule`), tính lại lịch sau thanh toán (`recalculateAmortizationSchedule`) và gộp danh mục đa nguồn (`calculatePortfolioLoans`). Co-located unit tests.
- `domain/rules/loan-format.rule.ts`: Format tiền tệ VNĐ (`formatVndCurrency`, `formatVndHelper`), options phương thức trả nợ (`getAmortizationMethodOptions`), và helper trạng thái (`getLoanStatusConfig`).
- `components/molecules/loan-kpi-summary/`: Molecule hiển thị 4 KPI thẻ tài chính (Dư nợ còn lại, Tổng phải trả, Lãi còn lại, Kỳ tiếp theo).
- `components/molecules/amortization-schedule-table/`: Bảng chi tiết từng kỳ khấu hao nợ dùng UI `@/v2/shared/ui` (`Table`, `TableRow`, `TableCell`...), hỗ trợ chuyển chế độ xem "Lịch thực tế" vs "Lịch hợp đồng" bằng `V2Button`, chân bảng 3 dòng tổng hợp (`AmortizationScheduleFooter`).
- `components/organisms/loan-cashflow-chart/`: Organism bọc trực tiếp `V2ComboChart` thể hiện dòng tiền theo từng khoản vay với bảng màu riêng No Blue (`V2_CHART_SERIES`) khi có $\ge 2$ khoản vay (hoặc Gốc/Lãi khi 1 khoản) và lộ trình giảm dần dư nợ (Line chart).
- `components/organisms/portfolio-schedule-table/`: Bảng lịch trả nợ tổng hợp theo tháng dùng `V2StandardTable` (`mode="client"`, `pageSize: 12`, `enableColumnVisibility={false}`, `max-h-[560px]`) hỗ trợ Expand Row hiển thị bảng con `PortfolioBreakdownRow` (`@/v2/shared/ui` `Table` dùng token `border-border` / `var(--border-light)`).
- `loans.locale.ts` & `locales/loans.{vi,en}.ts`: Từ điển song ngữ VI/EN (`v2.loans.*`).
- `core.manifest.json`: Manifest định danh tầng core.

### 2.2. Tầng Module (`src/v2/modules/loans-tool/`)
- `api/`: `loansApi.ts` (`toLoansListParams`, `list`, `options`, `purge`, `recordPayment`, `updatePayment`, `deletePayment`), `dtos/loan-api.types.ts` (`LoanListResponse` với `pagination` + `summaries`), `queries/useLoansQueries.ts` (`useLoansTableData`, `useCashflowProjectionQuery`), `mutations/useLoansMutations.ts` (`useRecordPaymentMutation`, `useUpdatePaymentMutation`, `useDeletePaymentMutation`), `queries/loansKeys.ts`.
- `drawers/`:
  - `loan-form-drawer/`: Form tạo mới và chỉnh sửa khoản vay 1-column layout (`V2DrawerSize.MD`, `V2DrawerMode.EDIT`, `V2DrawerLayout.ONE_COLUMN`), tách `LoanFormFields.tsx` & `LoanFormTermsSection.tsx`.
  - `loan-detail-drawer/`: Xem chi tiết khoản vay (`V2DrawerSize`, `V2DrawerMode.VIEW`, `V2DrawerLayout.ONE_COLUMN`), tích hợp KPI, Biểu đồ dòng chảy, `LoanPaymentsTabTable` (nút Sửa, Xóa thanh toán kèm `V2ConfirmModal`).
  - `record-payment-modal/`: Modal (`V2Modal`) ghi nhận và chỉnh sửa trả nợ theo kỳ (`.type.ts`, `.hook.ts`, `.tsx`, `components/RecordPaymentAmountsFields.tsx`).
- `components/organisms/`:
  - `loan-table/`: `LoansTable.columns.tsx` + `LoansTable.columns.amounts.tsx` (12 cột `headerFilter`, `V2TableText` click+copy, `summary` row, `mobileSlot`).
  - `consolidated-cashflow/`: View dòng tiền toàn doanh nghiệp `ConsolidatedCashflowView.tsx`, `CashflowLoanFilterPanel.tsx` (dùng `V2TableSelectCheckbox`), `ConsolidatedCashflowKpis.tsx` và `ConsolidatedCashflowTable.tsx`.
- `pages/`:
  - `loan-simulator/`: Trang máy tính mô phỏng đa nguồn (`LoanSimulatorPage.*`, `components/PortfolioLoanList.tsx`, `components/PortfolioLoanCard.tsx`, `components/PortfolioLoanCardFields.tsx`, `components/LoanSimulatorActionsSheet.tsx`). Trên desktop, các nút `Mặc định`, `Thêm khoản vay`, `Lưu danh mục vào hệ thống ERP` gộp chung ở header trên cùng; không còn wrapper `Danh Mục Khoản Vay` bên ngoài; 6 field input trong card xếp trên 1 hàng ngang ở desktop (`lg+`). Trên mobile, ẩn card header và gom 3 nút (`Lưu danh mục vào hệ thống ERP`, `Thêm khoản vay`, `Mặc định`) vào `V2BottomSheet` (`LoanSimulatorActionsSheet`).
  - `loans-list/`: `LoansListPage.tsx` (`V2ModulePage` preset `V2ModulePageVariant.CARD`), `LoansListPage.tabs.tsx`, `LoansListPage.hook.ts`, `LoansListPage.filter.hook.ts`, `LoansListPage.delete.hook.ts`, `LoansListPage.actions.tsx`, `loansList.enum.ts` (`LoansTabKey`, `LoansFilterKey`, `LoansViewKey`), `loansList.config.ts`. Trên mobile, `V2PageHeaderVariant.CARD` thu gọn (ẩn description dài, giữ tiêu đề + nút `+ Thêm khoản vay mới`), `TabBarPagePillView` dùng `V2BottomSheet` (`TabBarPageViewMobile`) chọn tab, và bảng danh sách dùng `V2StandardTableMobile`.

---

## 3. Điều Hướng & Routing

1. **Public Tool Route (Guest Mode)**:
   - Đăng ký trong `src/v2/app/router/publicTools.config.ts` (`PUBLIC_TOOLS` với `path: "/loans-tool"`, `aliasPaths: ["/tools/loans", "/loans"]`).
   - `src/App.tsx` dùng `resolvePublicTool(location.pathname, isLoggedIn)` render `<AppProviders allowAnonymous><V2PublicToolView tool={publicTool} isLoggedIn={false} /></AppProviders>` và chuẩn hóa alias `/tools/loans` và `/loans` về `/loans-tool`.
2. **V2 Route**:
   - `src/v2/app/router/v2RouteConfig.ts`: đăng ký `/loans-tool` và `/v2/loans` (`permission: { collection: "loans", action: "read" }`).
   - `src/v2/app/router/v2PageRegistry.tsx`: ánh xạ `"loans": () => <LoansListPage />`.
   - `src/v2/app/layouts/v2-app-layout/navigation/v2Navigation.config.ts`: mục menu sidebar thuộc nhóm `tools` (`href: "/loans-tool"`, icon `Calculator`).
3. **V1 Shell Navigation**:
   - Đăng ký `"loans"` trong `PageKey`, `ALL_PAGE_KEYS`, `pageToPath` / `pathToPage` (`LOANS_TOOL_PATH = "/loans-tool"`, nhận cả `tools/loans`), `ErpResource.LOANS`, `PAGE_COMPONENTS`, `V2ShellLayout` breadcrumb (`case "loans":` -> `Công cụ > Khoản vay & Lãi suất`), và `useV2AdaptedNavSections` (`href: "/loans-tool"`).

---

## 4. Cam Kết & Tiêu Chuẩn Kỹ Thuật

- **Quy tắc độ dài file**: 100% các file component, hook, type đều $\le 179$ dòng (tuân thủ giới hạn $< 180$ LoC).
- **Quy tắc No Blue**: 0 trường hợp sử dụng class `blue-*`. Toàn bộ dùng CSS semantic tokens (`primary`, `border`, `card`, `emerald`, `amber`).
- **Mobile-First**: Tách biệt rõ ràng `.desktop.tsx` và `.mobile.tsx` điều phối qua `useViewport()`. Touch target trên di động luôn $\ge 44$px.
- **i18n**: 100% nhãn text qua hàm `t('v2.loans.*')`.

---

## 5. Lệnh Kiểm Tra

```bash
# Typecheck toàn bộ web app
cd erp/erp-web && bunx tsc --noEmit

# Chạy test Vitest cho module loans
cd erp/erp-web && bun run test src/v2/core/loans src/v2/modules/loans-tool

# Kiểm tra cấm class màu xanh
grep -rn "blue-" erp/erp-web/src/v2/modules/loans-tool erp/erp-web/src/v2/core/loans || echo "NO_BLUE_MATCH"
```

## Hợp đồng phân trang chuẩn v2 (pagination)

- API trả `{ items, pagination, summaries? }` (list) và `{ items, pagination }` (column-options). `pagination` có `total`, `totalPages`, `next`, `previous`.
- Kiểu dùng chung: `src/v2/shared/types/v2-pagination.ts` (`V2PaginationMeta`, `V2PaginatedResponse`, `V2PaginatedResponseWithSummaries`).
- Bảng V2 vẫn nhận `V2FetchOptionsResult` (`items`, `total`, `next`). API client dùng `toFetchOptionsResult` (`src/v2/shared/utils/v2FetchOptionsAdapter.ts`) để đổi; `V2StandardTable` không đổi.
- Lớp API client V1 đổi wire sang kiểu phẳng cũ bằng `fromPaginatedWire` / `fromColumnOptionsWire` (`src/shared/types/pagination.ts`), nên màn hình V1 không đổi.

## Contract modal Ghi nhận thanh toán (cập nhật)
- Props: `payments?: LoanPaymentRecord[]` thay cho `paidPeriodNumbers`. Bỏ trống `payments` thì modal tự tải chi tiết khoản vay (`useLoanDetailQuery`), nên mở từ danh sách vẫn có kỳ đã trả.
- Hook dữ liệu: `useRecordPaymentContext.ts` (lịch tính lại bằng `recalculateAmortizationSchedule`, bản đồ kỳ đã trả, kỳ gợi ý = kỳ chưa trả đầu tiên, cờ `allPeriodsPaid`).
- Dropdown kỳ: `RecordPaymentModal.periods.ts`. Kỳ đã trả bị `disabled`, có tooltip chi tiết gốc/lãi/tổng/ngày. Chế độ sửa vẫn chọn được kỳ của chính thanh toán.
- Khi `allPeriodsPaid`: hiện thông báo và khóa nút xác nhận (`RecordPaymentFooter.submitDisabled`).
- Shared: `V2ComboboxOption.tooltip?: ReactNode` (desktop: `V2Tooltip`, mobile: dòng phụ dưới nhãn).
- Card tóm tắt dùng `V2Panel` với `border-input`, khớp viền input bên dưới.
- URL module: `LOANS_TOOL_PATH = "/loans-tool"` (`shared/utils/pageUrl.ts`).
