---
name: app-store
description: Module tri thức Quản lý App State, Multi-tab Navigation, Routing, Themes & Core Stores (useAppStore) trong erp-web (core/config/appStore). Chứa toàn bộ cấu trúc atomic slices, state interface, routing constants, tab normalization, theme helper, cross-store migrations và các API tích hợp toàn hệ thống.
---

# 📦 Module Tri Thức: App Store & Navigation Core - Frontend (`erp-web`)

## 1. Tổng quan & Trách nhiệm Hệ thống

`appStore` (`src/core/config/appStore/`) là "trái tim" điều phối trạng thái toàn cục của ứng dụng web Liouni ERP (`erp-web`), đóng vai trò:
- **Quản lý Vòng đời Multi-tab & Điều hướng (Tabs Lifecycle & Routing)**: Quản lý danh sách các tab đang mở (`openTabs`), tab hiện tại (`currentPage`, `currentInstanceId`), cơ chế nhân đôi tab (`duplicateTab` với `_i=2`), đóng tab (đóng tab hiện tại, đóng tab khác, đóng tab bên phải, đóng tất cả ngoại trừ `STATIC_TABS`), và sắp xếp kéo thả tab (`reorderTabs`).
- **Định nghĩa Hằng số Điều hướng & Metadata (Routing Constants)**: Tập hợp danh mục trang tĩnh không thể đóng (`STATIC_TABS`), gốc phân hệ điều hướng (`SECTION_ROOTS`), phân cấp đường dẫn chỉ mục (`BREADCRUMBS`), và các trang hỗ trợ mở đồng thời nhiều bản ghi (`DUPLICATABLE_PAGES`).
- **Quản lý Giao diện & Chủ đề (Themes Engine)**: Quản lý 4 chủ đề giao diện (`classic`, `shell`, `orcaq`, `midnight`) thông qua enum `AppThemeEnum`, chuyển đổi nhanh, cập nhật class CSS trên `document.documentElement` và tự động đồng bộ lên backend `PATCH /api/v1/app/preferences`.
- **Đa ngôn ngữ & Tùy chọn Hệ thống (Locale & User Settings)**: Quản lý ngôn ngữ hiển thị (`vi` / `en`), trạng thái sidebar (mở rộng / thu gọn / mobile drawer), drawer cấu hình thuộc tính động (`customFieldsDrawerOpen`).
- **Trạng thái Xác thực & Phân quyền (Auth & Access Control)**: Lưu trữ trạng thái đăng nhập (`isLoggedIn`), cấm truy cập (`forbidden: 403`), chi nhánh hiện tại (`currentBranchId`), và reset toàn bộ tabs về dashboard khi đăng xuất.
- **Bảo toàn Dữ liệu & Lưu trữ Trình duyệt (Persist Store)**: Tích hợp middleware `zustand/middleware/persist` lưu `sidebarCollapsed`, `appTheme`, `locale`, `isLoggedIn`, `currentBranchId` vào `localStorage` (`name: "erp-app"`).

---

## 2. Cấu Trúc Atomic Source Code (`src/core/config/appStore/`)

Module được chia tách theo chuẩn `/erp-atomic-refactor`:

```text
src/core/config/appStore/
├── types.ts            # Type definitions, AppThemeEnum và interface AppState
├── themeHelper.ts      # Hàm applyDocumentTheme gắn class CSS lên document.documentElement
├── constants.ts        # STATIC_TABS, SECTION_ROOTS, BREADCRUMBS, DUPLICATABLE_PAGES
├── tabHelpers.ts       # getPathWithPreservedSearch, normalizeTabInstances & cross-store migrations
├── appStore.ts         # Hook Zustand useAppStore cốt lõi tích hợp middleware persist
└── index.ts            # Barrel export toàn bộ constants, helpers, types, enums, store

src/core/config/appStore.ts # Root barrel re-export giữ 100% tương thích ngược
```

---

## 3. Chi Tiết Các Thành Phần Cốt Lõi

### 3.1. Types & Enums (`types.ts`)
- **`AppTheme`**: `"classic" | "shell" | "orcaq" | "midnight"`
- **`AppThemeEnum`**:
  ```typescript
  export enum AppThemeEnum {
    CLASSIC = "classic",
    SHELL = "shell",
    ORCAQ = "orcaq",
    MIDNIGHT = "midnight",
  }
  ```
- **`AppState`**: Khai báo trạng thái và danh sách actions:
  - Navigation: `navigate(page, instanceIndex)`, `duplicateTab(page)`, `syncFromUrl(page, tab, instanceIndex)`
  - Tabs Management: `closeTab(idOrKey)`, `closeOtherTabs(idOrKey)`, `closeAllTabs()`, `closeTabsToRight(idOrKey)`, `reorderTabs(sourceId, targetId)`, `preloadTab(page)`
  - UI State: `toggleSidebar()`, `setMobileSidebarOpen(open)`, `setCompanyProfileOpen(open)`, `openCustomFieldsDrawer(...)`, `closeCustomFieldsDrawer()`
  - Theme & Locale: `toggleAppTheme()`, `setAppTheme(theme)`, `toggleLocale()`, `setLocale(locale)`
  - Auth: `login()`, `logout()`, `setForbidden(value)`, `setCurrentBranchId(id)`
  - Breadcrumbs: `setCustomBreadcrumbs(crumbs)`

### 3.2. Cấu hình Điều hướng Tĩnh (`constants.ts`)
- **`STATIC_TABS`**:
  - `dashboard`: Trang tổng quan, `closable: false` (không bao giờ được phép đóng).
- **`SECTION_ROOTS`**: Ánh xạ `PageKey` tới nhóm chức năng (`group`) và translation key (`labelKey`):
  - Nhóm `inventory`: `inventory-dashboard`, `erp-inventory-stock`, `erp-inventory-tracking`, `erp-inventory-vouchers`, `erp-goods-issues`, `erp-inventory-items`
  - Nhóm `sales`: `erp-sales-orders`, `sales-report-dashboard`, `erp-customers`, `after-sales`
  - Nhóm `purchasing`: `purchasing`, `erp-suppliers`, `purchasing-report-dashboard`
  - Nhóm `manufacturing`: `mfg-items`, `mfg-purchase-orders`, `mfg-vehicles`, `erp-bom`, `erp-production`
  - Nhóm `accounting`: `settings-accounts`, `invoice-dashboard`, `erp-invoices`, `erp-invoices-in`, `erp-invoices-out`, `bank-statement`, `cash-statement`, `cashflow-dashboard`, `opex`
  - Nhóm `garage`: `garage-dashboard`, `garage-cases`, `garage-opex`, `garage-customers`, `garage-receivables`, `garage-payables`
  - Nhóm `vinfast`: `vinfast-parts`, `vinfast-parts-dashboard`, `vinfast-parts-stock`, `vinfast-parts-oto-stock`, `vinfast-parts-xemay-stock`
  - Nhóm `settings`: `erp-users`, `erp-permissions-core`, `erp-activity-logs`, `settings-branch`, `settings-bank`, `settings-cash-fund`, `sys-tags`, `attachments`
- **`BREADCRUMBS`**: Đường dẫn breadcrumbs 2-cấp chuẩn xác cho từng `PageKey` (VD: `opex: [["nav.items.accounting"], ["budget:pageTitle"]]`).
- **`DUPLICATABLE_PAGES`**: Các trang được phép mở instance thứ 2 (`_i=2`):
  - `erp-invoices`, `erp-invoices-in`, `erp-invoices-out`.

### 3.3. Xử lý Tab & Chuẩn hóa URL (`tabHelpers.ts`)
- **`getPathWithPreservedSearch(pageKey, instanceIndex)`**:
  - Tự động giữ nguyên các tham số tìm kiếm URL hiện tại, đồng thời thêm/xóa tham số instance `_i=2`.
- **`normalizeTabInstances(tabs, currentInstanceId)`**:
  - Khi một tab chính (`instanceIndex: 1`) bị đóng nhưng tab nhân bản (`instanceIndex: 2`) vẫn tồn tại, hàm này tự động giáng cấp tab phụ thành tab chính (`instanceIndex: 1`) để bảo toàn URL và dữ liệu.
  - Tự động gọi **Cross-Store Migrations** sang `useTableColumnStore` và `useErpInvoiceListStore` để chuyển dời cấu hình cột bảng và danh sách hóa đơn từ instance 2 về instance 1 an toàn không mất dữ liệu.

---

## 4. Tích hợp Liên Module & Consumers

Có hơn 40 components và modules trong toàn hệ sinh thái `erp-web` phụ thuộc trực tiếp vào `appStore`:
- **App Shell & Layout**:
  - [`src/App.tsx`](file:///home/dev/repos-dev/erp/erp-web/src/App.tsx): Đồng bộ URL khi khởi động (`syncFromUrl`), điều hướng trang 403 Forbidden.
  - [`src/core/components/layout/TabBar.tsx`](file:///home/dev/repos-dev/erp/erp-web/src/core/components/layout/TabBar.tsx): Render tabs, kéo thả tab, menu chuột phải (close/duplicate/close other).
  - [`src/core/components/layout/Topbar.tsx`](file:///home/dev/repos-dev/erp/erp-web/src/core/components/layout/Topbar.tsx): Render dynamic breadcrumb.
  - [`src/core/components/layout/sidebar/`](file:///home/dev/repos-dev/erp/erp-web/src/core/components/layout/sidebar/): Active link navigation và đóng mở sidebar.
  - [`src/core/components/layout/ThemePopover.tsx`](file:///home/dev/repos-dev/erp/erp-web/src/core/components/layout/ThemePopover.tsx): Bảng điều khiển đổi theme trực quan.
- **Tích hợp Backend API & Preferences**:
  - Khi `appTheme` hoặc `locale` thay đổi, store gọi `updateUserPreferencesApi()` để lưu trực tiếp vào database PostgreSQL (`core_user_preferences`).

---

## 5. Quy tắc Kiểm Thử & QC Mandate

Khi thực hiện thay đổi cấu trúc hoặc bổ sung action/routing vào `appStore`:
1. **Typecheck 100%**:
   ```bash
   bun run type:check
   ```
2. **Kiểm tra Unit Tests Liên Quan**:
   ```bash
   bun run test src/core/components/__tests__/TabBar.test.tsx
   bun run test src/core/components/__tests__/ThemePopover.test.tsx
   bun run test src/__tests__/App.forbidden.test.tsx
   ```
3. **Full Test Suite Verification**:
   ```bash
   bun run test
   ```
4. **Git Workflow Guard**: Tuân thủ quy trình Git an toàn theo `/erp-git-workflow` (Pass tests -> Knowledge Sync -> Pull Rebase -> Push từ `./erp/erp-web`).
