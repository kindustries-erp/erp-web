---
name: loans-web
description: Module tri thức Frontend Quản lý Khoản Vay & Mô Phỏng Dòng Tiền (Loans & Cashflow Simulator V2) trong erp-web (v2/core/loans và v2/modules/loans). Chứa cấu trúc components Atomic 5 tầng, TanStack Query hooks, drawers, pages (public & authenticated), routing và quy chuẩn Mobile-First, No Blue.
---

# 📦 Module Tri Thức: Quản Lý Khoản Vay & Mô Phỏng Dòng Tiền (`loans`) - Frontend (`erp-web`)

## 1. Tổng quan Nghiệp vụ

Module `loans` trong `erp-web` cung cấp bộ công cụ tài chính hoàn chỉnh theo chuẩn V2 Architecture với **URL thống nhất `/tools/loans`** cho cả khách chưa đăng nhập và người dùng ERP:
- **Chế độ Khách (Chưa đăng nhập - `/tools/loans`)**: Truy cập ngay lập tức không cần đăng nhập thông qua `V2PublicToolView` (`V2AppLayout`, `hideBottomNav={!isLoggedIn}` ẩn Bottom Nav trên Mobile, Sidebar Desktop hiển thị nhóm **CÔNG CỤ** và nút **Đăng nhập**). Khi chưa đăng nhập, nút "Đăng nhập để lưu vào ERP" lưu bản nháp vào `sessionStorage` và chuyển hướng sang `/login?redirect=/tools/loans` (tự động quay lại `/tools/loans` sau khi đăng nhập thành công).
- **Chế độ ERP (Đã đăng nhập - `/tools/loans` hoặc `/v2/loans`)**: Dành cho người dùng nội bộ có quyền `loans:read`. Render `LoansListPage` gồm 3 tab:
  1. *Mô Phỏng & Tính Nhanh*: Nhúng trực tiếp `LoanSimulatorPage` để tính toán nhanh ngay trong phiên làm việc.
  2. *Dự Báo Dòng Tiền Tương Lai*: Gọi API `/api/v2/loans/cashflow-projection` để vẽ biểu đồ `V2ComboChart` (mỗi khoản vay 1 scheme màu phân biệt khi có $\ge 2$ khoản vay + đường Dư nợ tích lũy) và bảng chi tiết dòng tiền theo tháng của toàn doanh nghiệp.
  3. *Danh Sách Hợp Đồng*: Bảng `V2StandardTable` phẳng không wrapper, `enableColumnVisibility={false}`, quản lý các hợp đồng nợ vay, mở Drawer xem chi tiết và tạo/cập nhật hợp đồng.

---

## 2. Cấu Trúc Mã Nguồn

### 2.1. Tầng Core (`src/v2/core/loans/`)
- `domain/types/loan.types.ts`: TypeScript contracts (`LoanItem`, `LoanSchedulePeriod`, `LoanPaymentRecord`, `PortfolioLoanItem`, `PortfolioMonthlyPeriod`, `AmortizationMethod`, `LoanStatus`).
- `domain/rules/loan-amortization.rule.ts` & `loan-portfolio.rule.ts`: Client-side pure calculation engine cho 4 phương thức khấu hao đơn lẻ (`generateAmortizationSchedule`) và gộp danh mục đa nguồn (`calculatePortfolioLoans`). Co-located unit tests.
- `domain/rules/loan-format.rule.ts`: Format tiền tệ VNĐ (`formatVndCurrency`, `formatVndHelper`), options phương thức trả nợ (`getAmortizationMethodOptions`), và helper trạng thái (`getLoanStatusConfig`).
- `components/molecules/loan-kpi-summary/`: Molecule hiển thị 4 KPI thẻ tài chính (Kỳ đầu, Trung bình tháng, Tổng lãi, Tổng nghĩa vụ).
- `components/molecules/amortization-schedule-table/`: Bảng chi tiết từng kỳ khấu hao nợ dùng UI `@/v2/shared/ui` (`Table`, `TableRow`, `TableCell`...), kèm nút Trả kỳ.
- `components/organisms/loan-cashflow-chart/`: Organism bọc trực tiếp `V2ComboChart` thể hiện dòng tiền theo từng khoản vay với bảng màu riêng No Blue (`V2_CHART_SERIES`) khi có $\ge 2$ khoản vay (hoặc Gốc/Lãi khi 1 khoản) và lộ trình giảm dần dư nợ (Line chart).
- `components/organisms/portfolio-schedule-table/`: Bảng lịch trả nợ tổng hợp theo tháng dùng `V2StandardTable` (`mode="client"`, `pageSize: 12`, `enableColumnVisibility={false}`, `max-h-[560px]`) hỗ trợ Expand Row hiển thị bảng con `PortfolioBreakdownRow` (`@/v2/shared/ui` `Table` dùng token `border-border` / `var(--border-light)`).
- `loans.locale.ts` & `locales/loans.{vi,en}.ts`: Từ điển song ngữ VI/EN (`v2.loans.*`).
- `core.manifest.json`: Manifest định danh tầng core.

### 2.2. Tầng Module (`src/v2/modules/loans/`)
- `api/`: `loansApi.ts`, `dtos/loan-api.types.ts`, `queries/useLoansQueries.ts`, `mutations/useLoansMutations.ts`, `queries/loansKeys.ts`.
- `drawers/`:
  - `loan-form-drawer/`: Form tạo mới và chỉnh sửa khoản vay 1-column layout (`V2DrawerSize.MD`, `V2DrawerMode.EDIT`, `V2DrawerLayout.ONE_COLUMN`), tách `LoanFormFields.tsx` & `LoanFormTermsSection.tsx`.
  - `loan-detail-drawer/`: Xem chi tiết khoản vay (`V2DrawerSize`, `V2DrawerMode.VIEW`, `V2DrawerLayout.ONE_COLUMN`), tích hợp KPI, Biểu đồ dòng chảy và `LoanPaymentsTabTable`.
  - `record-payment-modal/`: Modal (`V2Modal`) ghi nhận trả nợ theo kỳ (`.type.ts`, `.hook.ts`, `.tsx`).
- `components/organisms/`:
  - `loan-table/`: Định nghĩa cột bảng `LoansTable.columns.tsx` cho `V2StandardTable`.
  - `consolidated-cashflow/`: View dự báo dòng tiền tương lai `ConsolidatedCashflowView.tsx` & `ConsolidatedCashflowTable.tsx` (dùng chung `PortfolioScheduleTable` có expand row).
- `pages/`:
  - `loan-simulator/`: Trang máy tính mô phỏng đa nguồn (`LoanSimulatorPage.*`, `components/PortfolioLoanList.tsx`, `components/PortfolioLoanCard.tsx`, `components/PortfolioLoanCardFields.tsx`, `components/LoanSimulatorActionsSheet.tsx`). Trên desktop, các nút `Mặc định`, `Thêm khoản vay`, `Lưu danh mục vào hệ thống ERP` gộp chung ở header trên cùng; không còn wrapper `Danh Mục Khoản Vay` bên ngoài; 6 field input trong card xếp trên 1 hàng ngang ở desktop (`lg+`). Trên mobile, ẩn card header và gom 3 nút (`Lưu danh mục vào hệ thống ERP`, `Thêm khoản vay`, `Mặc định`) vào `V2BottomSheet` (`LoanSimulatorActionsSheet`).
  - `loans-list/`: Trang danh sách và tổng quan V2 (`LoansListPage.desktop.tsx`, `.mobile.tsx`, `.mobile-card.tsx`, `.actions.tsx`, `.hook.ts`). Đồng bộ `?tab=simulator|projection|list` qua `useV2ModuleTabState`; trên mobile dùng `V2TabBar` (`variant="page"`) mở `V2BottomSheet` chọn tab giống `garage-procurement?tab`, ẩn card header và nút `Thêm`.

---

## 3. Điều Hướng & Routing

1. **Public Tool Route (Guest Mode)**:
   - Đăng ký trong `src/v2/app/router/publicTools.config.ts` (`PUBLIC_TOOLS` với `path: "/tools/loans"`, `aliasPaths: ["/loans"]`).
   - `src/App.tsx` dùng `resolvePublicTool(location.pathname, isLoggedIn)` render `<AppProviders allowAnonymous><V2PublicToolView tool={publicTool} isLoggedIn={false} /></AppProviders>` và chuẩn hóa alias `/loans` về `/tools/loans`.
2. **V2 Route**:
   - `src/v2/app/router/v2RouteConfig.ts`: đăng ký `/tools/loans` và `/v2/loans` (`permission: { collection: "loans", action: "read" }`).
   - `src/v2/app/router/v2PageRegistry.tsx`: ánh xạ `"loans": () => <LoansListPage />`.
   - `src/v2/app/layouts/v2-app-layout/navigation/v2Navigation.config.ts`: mục menu sidebar thuộc nhóm `tools` (`href: "/tools/loans"`, icon `Calculator`).
3. **V1 Shell Navigation**:
   - Đăng ký `"loans"` trong `PageKey`, `ALL_PAGE_KEYS`, `pageToPath` / `pathToPage` (`"tools/loans"`), `ErpResource.LOANS`, `PAGE_COMPONENTS`, `V2ShellLayout` breadcrumb (`case "loans":` -> `Công cụ > Khoản vay & Lãi suất`), và `useV2AdaptedNavSections` (`href: "/tools/loans"`).

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
cd erp/erp-web && bun run test src/v2/core/loans src/v2/modules/loans

# Kiểm tra cấm class màu xanh
grep -rn "blue-" erp/erp-web/src/v2/modules/loans erp/erp-web/src/v2/core/loans || echo "NO_BLUE_MATCH"
```
