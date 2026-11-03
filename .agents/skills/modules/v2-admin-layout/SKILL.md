---
name: v2-admin-layout
description: Module tri thức Kiến trúc Cổng Quản trị & Điều hành ERP V2 (/v2/admin/*) và phân tách hai luồng định tuyến (Nghiệp vụ thường /v2/* vs Cổng quản trị /v2/admin/*). Bao gồm V2AdminLayout (Desktop/Mobile), AdminRouteGuard, V2WorkspaceModeToggle, V2AdminDashboardPage, hệ thống TypeScript Enums và chuẩn hóa i18n VI/EN.
---

# 🛡️ Module Tri Thức: Cổng Quản Trị & Điều Hành V2 (`/v2/admin`) - Frontend (`erp-web`)

## 1. Tổng Quan Kiến Trúc & Quy Hoạch Định Tuyến (Routing Split)

Hệ thống ERP V2 phân tách thành **2 không gian làm việc độc lập** theo persona người dùng:

1. **Không gian Nghiệp vụ & Nhập liệu (Operational / Standard Routes)**:
   - **Đường dẫn**: Trực tiếp dưới `/v2/*` (không thêm tiền tố rườm rà `/ops`), ví dụ: `/v2/sales-orders`, `/v2/purchasing`, `/v2/inventory`, `/v2/customers`, `/v2/invoices`...
   - **Bố cục**: Sử dụng `V2AppLayout` (2-Card nổi, thanh `TabBar` đa nhiệm giữ nguyên ngữ cảnh chứng từ khi làm việc, form drawer trượt).
   - **Phục vụ**: Nhân viên bán hàng, thủ kho, kế toán viên nhập chứng từ.

2. **Không gian Quản trị & Điều hành (Admin / Management Portal)**:
   - **Đường dẫn**: Quy hoạch tập trung dưới tiền tố `/v2/admin/*`:
     - `/v2/admin/dashboard`: Executive Dashboard (Doanh thu, Đơn hàng, Tồn kho tối thiểu, Công nợ, Sức khỏe hệ thống).
     - `/v2/admin/reports/*`: Báo cáo bán hàng, tồn kho, tài chính cấp cao.
     - `/v2/admin/users`: Quản lý người dùng & tài khoản.
     - `/v2/admin/roles-permissions`: Phân quyền & Ma trận vai trò (RBAC).
     - `/v2/admin/audit-logs`: Nhật ký hoạt động & Giám sát truy cập.
     - `/v2/admin/settings`: Cấu hình hệ thống, chi nhánh & công ty.
   - **Bố cục**: Sử dụng `V2AdminLayout` (Menu quản trị phân nhóm ĐIỀU HÀNH - BÁO CÁO - BẢO MẬT - HỆ THỐNG).
   - **Bảo vệ**: Bọc bởi `AdminRouteGuard` (chặn 100% người dùng không phải Super Admin).

3. **Nút chuyển đổi Cổng Quản trị (`V2WorkspaceModeToggle`)**:
   - **Vị trí**: Đặt tại TopBar (cạnh ô tìm kiếm nhanh / avatar người dùng) dạng Toggle Pill rõ ràng.
   - **Đặc quyền hiển thị**: **CHỈ DUY NHẤT** tài khoản `admin@liouni.com` (`profile?.email === 'admin@liouni.com' || employee?.email === 'admin@liouni.com'`) mới nhìn thấy nút chuyển và truy cập được vào Cổng Quản trị. Loại bỏ hoàn toàn kiểm tra `DASHBOARD.READ` để tránh rò rỉ quyền.
   - **V2 Primitives**: Tận dụng triệt để `Button` (`@/v2/shared/ui/button`) và `Badge` (`@/v2/shared/ui/badge`), không dùng thẻ HTML button thô.
   - Khi ở `/v2`: Hiển thị "🛡️ Cổng Quản trị" -> click chuyển sang `/v2/admin/dashboard`.
   - Khi ở `/v2/admin`: Hiển thị "💼 Không gian Nhập liệu" -> click chuyển sang `/v2`.

4. **Nút Thoát Đăng Nhập Hộ (`V2ImpersonationBanner`)**:
   - **Chức năng**: Hiển thị cảnh báo màu hổ phách (`amber-500`) khi tài khoản admin đang trong phiên mượn quyền người dùng khác (`impersonation?.active`).
   - **Vị trí**: Tích hợp tự động trên cả Desktop ([`V2Topbar`](file:///home/dev/repos-dev-02/erp/erp-web/src/v2/shared/components/molecules/v2-topbar/V2Topbar.tsx)) và Mobile ([`V2Header`](file:///home/dev/repos-dev-02/erp/erp-web/src/v2/shared/components/organisms/v2-header/V2Header.tsx)).
   - **Hành động**: Nút "Quay lại tài khoản gốc" gọi `stopImpersonationAction("manual")` để khôi phục tài khoản Admin tức thì. Sử dụng 100% `V2Button` và `V2Text`.

5. **Component Nền Tảng Bottom Drawer / Bottom Sheet (`V2BottomSheet`)**:
   - **Vị trí**: `src/v2/shared/components/molecules/v2-bottom-sheet/`
   - **Mục đích**: Base / Reference Primitive cho mọi bottom drawer, sheet điều hướng, catalog phân hệ, form tác vụ mobile.
   - **Tính năng**:
     - Hiệu ứng slide từ dưới lên mượt mà `animate-slide-in-from-bottom`.
     - Drag handle bar ở giữa đỉnh, bo góc trên `rounded-t-2xl`.
     - Header tiêu chuẩn với `<V2Text variant="h4">` và nút Đóng `X` (`V2Button variant="ghost"`).
     - Body tự động cuộn `overflow-y-auto`, giới hạn `max-h-[85vh]` (hoặc tùy biến qua props `maxH`).
   - **Ứng dụng**: Danh mục phân hệ trong `V2AppLayout.mobile.tsx` và mọi bottom sheet phát triển sau này.

6. **Hiệu Ứng Slide-In Cho Bottom Menu**:
   - Tích hợp class `animate-slide-in-from-bottom` trên container `<nav>` cố định cho cả `V2AdminBottomNav` và `V2BottomNav`, tạo trải nghiệm trượt mượt mà khi mount trên mobile.

---

## 2. Hệ Thống TypeScript Enums Chuẩn Hóa (`src/v2/shared/types/v2-admin.ts`)

Toàn bộ hệ thống V2 Admin loại bỏ hoàn toàn "magic strings" và sử dụng 5 Enums trung tâm:

- `V2AdminRouteId`:
  - `DASHBOARD`: `'admin-dashboard'`
  - `SALES_REPORTS`: `'admin-sales-reports'`
  - `INVENTORY_REPORTS`: `'admin-inventory-reports'`
  - `USERS`: `'admin-users'`
  - `PERMISSIONS`: `'admin-permissions'`
  - `AUDIT_LOGS`: `'admin-audit-logs'`
  - `SETTINGS`: `'admin-settings'`
- `V2AdminSectionId`:
  - `OVERVIEW`: `'admin-overview'`
  - `REPORTS`: `'admin-reports'`
  - `ACCESS`: `'admin-access'`
  - `SYSTEM`: `'admin-system'`
- `V2WorkspaceMode`:
  - `OPS`: `'ops'`
  - `ADMIN`: `'admin'`
- `V2AdminStatVariant`:
  - `DEFAULT`: `'default'`
  - `SUCCESS`: `'success'`
  - `WARNING`: `'warning'`
  - `DANGER`: `'danger'`
- `V2DashboardPeriod`:
  - `MONTH`: `'month'`
  - `QUARTER`: `'quarter'`
  - `YEAR`: `'year'`

---

## 3. Cây Thư Mục & Phân Tầng Atomic Design

```
src/v2/
├── app/
│   ├── layouts/
│   │   ├── v2-app-layout/              # [L4 Template] Layout Nghiệp vụ thường (Đa tab, Drawer)
│   │   └── v2-admin-layout/            # [L4 Template] Layout Quản trị /v2/admin
│   │       ├── components/
│   │       │   └── v2-admin-bottom-nav/# [L2 Molecule] Thanh Bottom Navigation Admin Mobile (< 90 LoC, V2Button, V2Text)
│   │       │       ├── V2AdminBottomNav.tsx
│   │       │       ├── V2AdminBottomNav.type.ts
│   │       │       ├── V2AdminBottomNav.test.tsx (PASS)
│   │       │       └── index.ts
│   │       ├── V2AdminLayout.tsx       # Switcher Platform Split (< 15 LoC)
│   │       ├── V2AdminLayout.desktop.tsx # Bố cục Floating Cards cho Admin (< 90 LoC)
│   │       ├── V2AdminLayout.mobile.tsx  # Bố cục Header + V2AdminBottomNav (< 50 LoC)
│   │       ├── V2AdminLayout.type.ts   # Props contract
│   │       ├── V2AdminLayout.test.tsx  # Co-located unit tests (PASS)
│   │       ├── v2AdminNavigation.config.ts # Menu defs (/v2/admin) dùng V2AdminRouteId
│   │       ├── v2AdminNavigation.ts    # Dynamic Section builder với i18n
│   │       └── index.ts
│   └── router/
│       ├── guards/
│       │   ├── admin-guard/            # [L3 Organism] Guard bảo vệ route /v2/admin/*
│       │   │   ├── AdminRouteGuard.tsx (Kiểm tra admin@liouni.com, < 60 LoC)
│       │   │   ├── AdminRouteGuard.test.tsx (PASS)
│       │   │   └── index.ts
│       │   └── permission-guard/
│       ├── v2RouteConfig.ts            # Khai báo routes chuẩn và routes admin qua Enums
│       ├── v2Routes.tsx                # Dynamic Layout Resolver (V2AppLayout vs V2AdminLayout)
│       └── v2PageRegistry.tsx          # Registry nạp trang V2 qua [V2AdminRouteId.DASHBOARD]
├── shared/
│   ├── types/
│   │   └── v2-admin.ts                 # 5 Enums quản trị cốt lõi
│   ├── locales/
│   │   ├── vi.ts                       # Từ điển tiếng Việt đồng bộ (v2.admin.*, v2.impersonation.*, v2.routes.*)
│   │   └── en.ts                       # Từ điển tiếng Anh đồng bộ
│   └── components/molecules/
│       ├── v2-workspace-mode-toggle/   # [L2 Molecule] Nút chuyển đổi (admin@liouni.com only, Button V2)
│       ├── v2-impersonation-banner/    # [L2 Molecule] Banner thoát Login As User (< 90 LoC, V2Button/V2Text)
│       ├── v2-admin-stat-card/         # [L2 Molecule] Thẻ KPI số liệu quản trị (< 110 LoC, V2Text)
│       └── v2-bottom-sheet/            # [L2 Molecule] Base Bottom Drawer/Sheet chuẩn V2 (< 140 LoC, V2Text/V2Button)
│           ├── V2BottomSheet.tsx
│           ├── V2BottomSheet.type.ts
│           ├── V2BottomSheet.test.tsx  (PASS)
│           └── index.ts
└── modules/
    └── admin-dashboard/                # [L5 Page] Module Dashboard Quản trị V2
        ├── api/adminDashboardApi.ts    # Endpoint /api/v2/admin/dashboard/summary (V2DashboardPeriod)
        ├── domain/adminDashboard.type.ts
        ├── pages/
        │   ├── V2AdminDashboardPage.tsx        # Switcher (< 15 LoC)
        │   ├── V2AdminDashboardPage.desktop.tsx (Dynamic locale currency/time, < 140 LoC)
        │   ├── V2AdminDashboardPage.mobile.tsx  (< 100 LoC)
        │   └── V2AdminDashboardPage.test.tsx   (PASS)
        └── index.ts
```

---

## 4. Backend API Contract Tương Ứng (`erp-api`)

Module `src/v2/admin-dashboard-core`:
- **Endpoint**: `GET /api/v2/admin/dashboard/summary`
- **Controller**: `AdminDashboardController`
- **Service**: `AdminDashboardStatsService`
- **Guard**: `JwtAuthGuard` + `CoreRbacGuard`
- **DTO**: `AdminDashboardSummaryResponseDto` (kpis, recentPendingApprovals, systemHealth)

---

## 5. Kỷ Luật & Tiêu Chuẩn

- **Kích thước file**: 100% file < 140 LoC (tuân thủ nghiêm ngặt chuẩn < 180 LoC).
- **No Blue Mandate**: 0 class `blue-*`, 100% dùng biến ngữ cảnh `primary`, `emerald`, `amber`, `rose`.
- **Đa ngôn ngữ**: 100% i18n VI/EN tại `src/v2/shared/locales/` (`v2.admin.*`, `v2.workspace.*`, `v2.guard.*`, `v2.routes.*`). Định dạng tiền tệ và thời gian động theo `locale` hiện tại.
- **Co-located Testing**: Tất cả component và service đều có file test `.test.tsx` / `.spec.ts` đi kèm và pass 100% (24/24 unit tests passed across 7 test suites).
