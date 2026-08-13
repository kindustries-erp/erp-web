---
name: standardize-dashboard-page
description: Scaffold or refactor a standard Dashboard page following the ERP project's UI standards. Use this skill whenever you need to create a new dashboard or refactor an existing dashboard UI for a new module.
---

# 📋 Dashboard Page Standards

Khi tạo mới hoặc chỉnh sửa một trang Dashboard trong hệ thống, bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau để đảm bảo UI/UX đồng nhất và chuẩn chỉnh như trang `invoice-dashboard`.

## 1. Cấu trúc trang (Page Structure)

- **Sử dụng DashboardTemplate**: Toàn bộ nội dung trang phải được bọc trong component `<DashboardTemplate>` từ `@/shared/components/DashboardTemplate`.
- **Props bắt buộc của DashboardTemplate**:
  - `title`: Tiêu đề trang (vd: `t("title", "Tổng quan Hóa đơn")`).
  - `desc`: Mô tả ngắn gọn về trang (vd: `t("desc", "...")`).
  - `icon`: Icon đại diện cho trang (sử dụng lucide-react, vd: `<LayoutDashboard className="h-4 w-4" />`).
  - `filterConfig` & `filter`: Cấu hình bộ lọc sử dụng `useFilterPanel`.
  - `loading`: Trạng thái loading chung của trang.
  - `onRefresh`: Hàm gọi lại để refetch tất cả các query trong trang.

## 2. Breadcrumb & TabBar — BẮT BUỘC

### 2.1. Breadcrumb đúng cấp (Topbar)

Breadcrumb hiển thị trên Topbar phản ánh cấu trúc menu Sidebar. Mỗi trang **BẮT BUỘC** đăng ký breadcrumb theo đúng cấp độ sidebar (Module Group → Sub-group → Page Name). Có 2 cách:

**Cách 1 — Static (ưu tiên)**: Thêm entry vào `BREADCRUMBS` trong `src/core/config/appStore.ts`.

Format: `Array<[i18nKey, pageKey?]>` — nếu có `pageKey` thì breadcrumb đó clickable (navigate được).

```ts
// Trong BREADCRUMBS object tại appStore.ts:
"[module]-dashboard": [
  ["breadcrumb.accounting"],          // Level 1: Module Group (từ breadcrumb locale)
  ["nav.items.cashflow", "cashflow-dashboard"], // Level 2: Sub-group (clickable)
  ["nav.items.[module]Dashboard"],    // Level 3: Tên trang hiện tại (cuối cùng, không link)
],
```

Ví dụ thực tế (Kế toán > Dòng tiền > Sao kê ngân hàng):

```ts
"bank-statement": [
  ["breadcrumb.accounting"],
  ["nav.items.cashflow", "cashflow-dashboard"],
  ["bankStatement.bankTitle"],
],
```

**Cách 2 — Dynamic** (khi breadcrumb cần thay đổi theo state, vd: tên record cụ thể): Dùng `setCustomBreadcrumbs` từ `useAppStore` trong `useEffect`:

```tsx
import { useAppStore } from "@/core/config/appStore";

const { setCustomBreadcrumbs } = useAppStore();

useEffect(() => {
  setCustomBreadcrumbs([
    ["breadcrumb.accounting"],
    ["nav.items.cashflow", "cashflow-dashboard"],
    ["nav.items.[module]Dashboard"],
  ]);
  return () => setCustomBreadcrumbs(null); // Cleanup khi unmount
}, [setCustomBreadcrumbs]);
```

### 2.2. TabBar — Đăng ký PageKey và Label

Tab trên TabBar hiển thị tên trang, được lấy từ `SECTION_ROOTS` trong `appStore.ts`. Khi tạo page mới:

**Bước 1**: Thêm `PageKey` mới vào type `PageKey` trong `src/shared/types/index.ts`:

```ts
export type PageKey =
  // ... existing keys
  "[module]-dashboard" | "[module]-list";
```

**Bước 2**: Đăng ký label cho tab trong `SECTION_ROOTS` tại `appStore.ts`:

```ts
export const SECTION_ROOTS: Partial<Record<PageKey, SectionRoot>> = {
  // ... existing entries
  "[module]-dashboard": {
    labelKey: "nav.items.[module]Dashboard", // key trong nav locale
    group: "accounting", // group của sidebar section (accounting, inventory, sales, ...)
  },
};
```

**Bước 3**: Thêm i18n key cho `labelKey` vào file `src/core/locale/system/nav/vi.ts` và `en.ts`:

```ts
// nav/vi.ts
items: {
  // ... existing items
  "[module]Dashboard": "Tổng quan [Tên Module]",
}

// nav/en.ts
items: {
  // ... existing items
  "[module]Dashboard": "[Module Name] Dashboard",
}
```

**Bước 4**: Thêm key breadcrumb vào `src/core/locale/system/breadcrumb/vi.ts` và `en.ts`:

```ts
// breadcrumb/vi.ts
export const breadcrumbVi = {
  // ... existing
  "[module]Dashboard": "Tổng quan [Tên Module]",
};
```

## 3. Đa ngôn ngữ (i18n) — BẮT BUỘC

- Tất cả text hiển thị (title, desc, label, button, section heading, empty state message...) **BẮT BUỘC** phải được bọc bằng hàm `t` từ `useTranslation("namespace")`.
- **KHÔNG** hardcode tiếng Việt hay tiếng Anh trực tiếp trong JSX.
- Tạo file locale đi kèm tại `src/core/locale/[module]/vi.ts` và `src/core/locale/[module]/en.ts`.

**Mẫu đúng:**

```tsx
const { t } = useTranslation("exampleDashboard");

// ✅ Đúng
<h3>{t("revenueCharts", "Biểu đồ doanh thu")}</h3>
<EmptyState message={t("noChartData", "Chưa có dữ liệu biểu đồ")} />

// ❌ Sai
<h3>Biểu đồ doanh thu</h3>
```

## 4. Các thành phần bên trong Dashboard

### 3.1. KPI Cards

- Sử dụng component `KpiCard` có sẵn trong app nếu cần hiển thị các chỉ số KPI.
- **Shadow bắt buộc**: Tất cả card/box phải có `box-shadow` để nổi bật. Dùng class `shadow-sm` hoặc `shadow-md`.
- **Naming Convention**: Đặt tên rõ ràng theo pattern `[Entity][Metric]KpiCard` (vd: `RevenueSummaryKpiCard`).
- **Empty State cho KPI**: Nếu data chưa có, hiển thị `<EmptyState>` với `size="sm"`.

### 3.2. Biểu đồ (Charts)

- Dashboard bắt buộc phải có ít nhất 1 biểu đồ nếu dữ liệu phù hợp (dùng thư viện chart đã có sẵn trong app, như Recharts).
- **Naming Convention**: Tên component theo pattern `[Entity][Metric]Chart` (vd: `BranchInvoiceChart`, `BranchVatChart`).
- Tách riêng thành component con trong thư mục `components/` cùng cấp với page (vd: `src/pages/components/`).
- Bố cục biểu đồ nằm trong grid responsive: `<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">`.
- **Empty State cho Chart**: Khi data trả về rỗng, **BẮT BUỘC** hiển thị `<EmptyState>` thay cho vùng trắng. Không để trống.

```tsx
import { EmptyState } from "@/shared/components/EmptyState";

// Trong Chart component:
if (!data || data.length === 0) {
  return (
    <div className="rounded-lg border shadow-sm p-4">
      <h4 className="text-sm font-medium mb-2">{title}</h4>
      <EmptyState message={t("noChartData", "Chưa có dữ liệu")} size="sm" />
    </div>
  );
}
```

### 3.3. Bảng dữ liệu trong Dashboard

- Component bảng nên được tách riêng (vd: `BranchInvoiceTable`).
- Tuân thủ kỹ năng `standardize-table`.
- **Empty State bắt buộc**: Bảng trong Dashboard phải truyền `emptyLabel` **và** khi data rỗng sau khi load xong, cũng có thể thay thế bằng `<EmptyState>` nếu muốn giao diện đẹp hơn.

## 5. Tạo Hooks kèm theo (BẮT BUỘC)

Khi tạo trang Dashboard, bạn **PHẢI** tự động tạo sẵn các hook đi kèm:

- `use[Module]DashboardStats` — hook lấy dữ liệu thống kê/KPI cho dashboard.
- Đặt trong thư mục `src/modules/[module-name]/hooks/`.
- Dù hiện tại chỉ là mock data, vẫn phải tạo file hook với cấu trúc đúng để dev có thể điền API vào sau.

**Mẫu Hook:**

```ts
// src/modules/[module]/hooks/use[Module]DashboardStats.ts
import { useQuery } from "@tanstack/react-query";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

export function use[Module]DashboardStats(params: { dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ["[module]-dashboard-stats", params],
    queryFn: () => {
      // TODO: return [module]Api.getDashboardStats(params);
      return Promise.resolve({ total: 0, data: [] });
    },
  });
}
```

## 6. Mẫu code cơ bản (Dashboard Boilerplate)

```tsx
import React from "react";
import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/components/EmptyState";
// import { use[Module]DashboardStats } from "@/modules/[module]/hooks/use[Module]DashboardStats";

export function ExampleDashboard() {
  const { t } = useTranslation("exampleDashboard");

  // const { data, isFetching, refetch } = use[Module]DashboardStats({ dateFrom, dateTo });

  const filterConfig = React.useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      custom: [
        // Thêm các filter tuỳ chỉnh ở đây
      ],
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig, () => {});

  return (
    <DashboardTemplate
      title={t("title", "Tổng quan")}
      desc={t("desc", "Mô tả tổng quan module")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={false /* isFetching */}
      onRefresh={() => {
        // refetch();
      }}
    >
      <div className="flex flex-col gap-8 mb-8">
        {/* KPI Cards Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("kpiSection", "Chỉ số quan trọng")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Thay bằng KpiCard hoặc custom card có shadow-sm */}
            <div className="p-4 bg-white rounded-lg shadow-sm border">
              <p className="text-muted-foreground text-sm">
                {t("totalRecords", "Tổng số bản ghi")}
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("chartSection", "Biểu đồ thống kê")}
          </h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Nếu không có data, bắt buộc dùng EmptyState */}
            <div className="rounded-lg border shadow-sm p-4">
              <EmptyState
                message={t("noChartData", "Chưa có dữ liệu biểu đồ")}
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Table / List Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t("recentData", "Dữ liệu gần đây")}
          </h3>
          {/* <ExampleTable filterState={filter.state} /> */}
          <EmptyState
            message={t("noRecentData", "Chưa có dữ liệu gần đây")}
            description={t(
              "noRecentDataDesc",
              "Dữ liệu sẽ hiển thị khi có bản ghi mới",
            )}
          />
        </div>
      </div>
    </DashboardTemplate>
  );
}
```

## Summary Checklist trước khi hoàn thành

### Breadcrumb & TabBar

- [ ] Đã thêm `PageKey` mới vào type trong `src/shared/types/index.ts` chưa?
- [ ] Đã đăng ký `SECTION_ROOTS` với `labelKey` và `group` trong `appStore.ts` chưa?
- [ ] Đã đăng ký `BREADCRUMBS` theo đúng level (Module Group > Sub-group > Tên trang) trong `appStore.ts` chưa?
- [ ] Đã thêm i18n key `nav.items.[module]Dashboard` vào `nav/vi.ts` và `nav/en.ts` chưa?
- [ ] Đã thêm breadcrumb key vào `breadcrumb/vi.ts` và `breadcrumb/en.ts` chưa?

### i18n

- [ ] Sử dụng `<DashboardTemplate>` với đầy đủ props (title, desc, icon, filter, loading, onRefresh) chưa?
- [ ] Text tĩnh có dùng `useTranslation` (`t(...)`) chưa? **KHÔNG hardcode.**
- [ ] Đã tạo file locale module `vi.ts` và `en.ts` đi kèm chưa?

### UI Components

- [ ] Các card / box thành phần có box-shadow (`shadow-sm` hoặc `shadow-md`) chưa?
- [ ] Biểu đồ (Chart) khi data rỗng đã dùng `<EmptyState size="sm">` thay cho vùng trắng chưa?
- [ ] Bảng (Table) con nếu có, khi rỗng đã có `emptyLabel` hoặc `<EmptyState>` chưa?
- [ ] Đã tách riêng biểu đồ thành component con (`[Entity][Metric]Chart`) chưa?

### Hooks

- [ ] Đã tạo sẵn hook `use[Module]DashboardStats` trong `src/modules/[module]/hooks/` chưa?
