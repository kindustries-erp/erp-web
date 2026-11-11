---
name: loans-web
description: Module tri thức Frontend Quản lý Khoản Vay & Mô Phỏng Dòng Tiền (Loans & Cashflow Simulator V2) trong erp-web (v2/core/loans và v2/modules/loans). Chứa cấu trúc components Atomic 5 tầng, TanStack Query hooks, drawers, pages (public & authenticated), routing và quy chuẩn Mobile-First, No Blue.
---

# 📦 Module Tri Thức: Quản Lý Khoản Vay & Mô Phỏng Dòng Tiền (`loans`) - Frontend (`erp-web`)

## 1. Tổng quan Nghiệp vụ

Module `loans` trong `erp-web` cung cấp bộ công cụ tài chính hoàn chỉnh theo chuẩn V2 Architecture:
- **Trang Mô Phỏng Công Khai (`/loans`)**: Bất kỳ ai cũng có thể truy cập ngay lập tức từ trình duyệt không cần đăng nhập để mô phỏng tính toán khoản vay ngân hàng (lãi suất, kỳ hạn, phương thức trả nợ, dòng chảy tiền và bảng khấu hao). Nếu chưa đăng nhập, nút "Lưu vào ERP" sẽ lưu bản nháp vào `sessionStorage` và điều hướng về trang `/login?redirect=/v2/loans`.
- **Trang Quản Lý Khoản Vay V2 (`/v2/loans`)**: Dành cho người dùng nội bộ có quyền `loans:read`. Gồm 3 tab:
  1. *Danh Sách Khoản Vay*: Bảng `V2StandardTable` quản lý các hợp đồng nợ vay, tìm kiếm, lọc theo trạng thái, mở Drawer xem chi tiết và tạo mới.
  2. *Dự Báo Dòng Tiền Tương Lai*: Gọi API `/api/v2/loans/cashflow-projection` để vẽ biểu đồ `V2ComboChart` (cột chồng Gốc + Lãi, đường Dư nợ tích lũy) và bảng chi tiết dòng tiền theo tháng của toàn doanh nghiệp.
  3. *Mô Phỏng & Tính Nhanh*: Nhúng trực tiếp `LoanSimulatorPage` để tính toán nhanh ngay trong phiên làm việc.

---

## 2. Cấu Trúc Mã Nguồn

### 2.1. Tầng Core (`src/v2/core/loans/`)
- `domain/types/loan.types.ts`: TypeScript contracts (`LoanItem`, `LoanSchedulePeriod`, `LoanPaymentRecord`, `AmortizationMethod`, `LoanStatus`).
- `domain/rules/loan-amortization.rule.ts`: Client-side pure calculation engine cho 4 phương thức khấu hao (`generateAmortizationSchedule`). Co-located unit test `loan-amortization.rule.test.ts`.
- `domain/rules/loan-format.rule.ts`: Format tiền tệ VNĐ (`formatVndCurrency`, `formatVndHelper`) và options phương thức trả nợ (`getAmortizationMethodOptions`).
- `components/molecules/loan-kpi-summary/`: Molecule hiển thị 4 KPI thẻ tài chính (Kỳ đầu, Trung bình tháng, Tổng lãi, Tổng nghĩa vụ).
- `components/molecules/amortization-schedule-table/`: Bảng chi tiết từng kỳ khấu hao nợ (Kỳ, Ngày trả, Dư nợ đầu, Gốc, Lãi, Tổng trả, Dư nợ cuối).
- `components/organisms/loan-cashflow-chart/`: Organism bọc `V2ComboChart` thể hiện trực quan dòng tiền (Gốc/Lãi stacked bars) và lộ trình giảm dần dư nợ (Line chart).
- `loans.locale.ts`: Từ điển song ngữ VI/EN (`v2.loans.*`).
- `core.manifest.json`: Manifest định danh tầng core.

### 2.2. Tầng Module (`src/v2/modules/loans/`)
- `api/`: `loansApi.ts`, `dtos/loan-api.types.ts`, `queries/useLoansQueries.ts`, `mutations/useLoansMutations.ts`, `queries/loansKeys.ts`.
- `drawers/`:
  - `loan-form-drawer/`: Form tạo mới và chỉnh sửa khoản vay (`.type.ts`, `.hook.ts`, `.desktop.tsx`, `.mobile.tsx`, `.tsx`, `LoanFormFields.tsx`).
  - `loan-detail-drawer/`: Xem chi tiết khoản vay, tích hợp KPI, Biểu đồ dòng chảy và Lịch sử thanh toán.
  - `record-payment-modal/`: Modal (`V2Modal`) ghi nhận trả nợ theo kỳ (`.type.ts`, `.hook.ts`, `.tsx`).
- `components/organisms/`:
  - `loan-table/`: Định nghĩa cột bảng `LoansTable.columns.tsx` cho `V2StandardTable`.
  - `consolidated-cashflow/`: View dự báo dòng tiền tương lai toàn công ty `ConsolidatedCashflowView.tsx`.
- `pages/`:
  - `loan-simulator/`: Trang máy tính mô phỏng (`LoanSimulatorPage.desktop.tsx`, `.mobile.tsx`, `.tsx`, `.test.tsx`).
  - `loans-list/`: Trang danh sách và tổng quan V2 (`LoansListPage.desktop.tsx`, `.mobile.tsx`, `.tsx`).

---

## 3. Điều Hướng & Routing

1. **Public Route**:
   - Khai báo trong `src/App.tsx` qua hàm `isPublicLoansRoute()` khớp đường dẫn `/loans` hoặc `/public/loans`.
   - Render `<LoanSimulatorPage />` trong scroll container `h-screen w-full overflow-y-auto overflow-x-hidden bg-background` (vì `#root` đang khóa `overflow: hidden`).
2. **V2 Route**:
   - `src/v2/app/router/v2RouteConfig.ts`:
     ```ts
     {
       id: "loans",
       path: "/v2/loans",
       title: "Khoản vay & Dòng tiền",
       permission: { collection: "loans", action: "read" },
     }
     ```
   - `src/v2/app/router/v2PageRegistry.tsx`: ánh xạ `"loans": () => <LoansListPage />`.
   - `src/v2/app/layouts/v2-app-layout/navigation/v2Navigation.config.ts`: mục menu sidebar thuộc nhóm `tools` (icon `Calculator`).
3. **V1 Shell Navigation**:
   - Đăng ký `"loans"` trong `PageKey` (`src/shared/types/index.ts`), `ALL_PAGE_KEYS` (`src/shared/utils/pageUrl.ts`), `ErpResource.LOANS` (`src/modules/system/types/rbac.ts`), `PAGE_COMPONENTS` (`src/App.tsx`), `SECTION_ROOTS` & `BREADCRUMBS` (`src/core/config/appStore/constants.ts`).
   - Mục **"Khoản vay & Lãi suất"** hiển thị trong nhóm **CÔNG CỤ** (component `ToolsNavSection`) đặt dưới nhóm **QUẢN TRỊ** tại `SidebarNav.tsx`.

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
