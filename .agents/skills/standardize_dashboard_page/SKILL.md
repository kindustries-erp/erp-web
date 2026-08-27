---
name: standardize-dashboard-page
description: Scaffold or refactor a standard Dashboard page following the ERP project's UI standards. Use this skill whenever you need to create a new dashboard or refactor an existing dashboard UI for a new module.
---

# 📋 Dashboard Page Standards

Khi tạo mới hoặc chỉnh sửa một trang Dashboard/Báo cáo tổng quan trong hệ thống (như `invoice-dashboard`, `sales-report-dashboard`, `inventory-dashboard`, `garage-dashboard`), bạn **BẮT BUỘC** tuân thủ các nguyên tắc sau.

---

## 1. Cấu trúc trang (Page Structure)

- **Wrapper `<DashboardTemplate>`**: Toàn bộ nội dung trang phải được bọc trong component `<DashboardTemplate>` từ `@/shared/components/DashboardTemplate`.
- **Props chuẩn của `<DashboardTemplate>`**:
  - `title`: Tiêu đề trang (vd: `t("nav.items.[module]Dashboard", "Tổng quan...")`).
  - `desc`: Mô tả ngắn gọn (tùy chọn).
  - `icon`: Icon đại diện (lucide-react, vd: `<LayoutDashboard className="h-4 w-4" />` — **Tùy chọn**, có thể lược bỏ để header gọn gàng, tinh tế).
  - `filterConfig` & `filter`: Quản lý bộ lọc ngày/tháng/tùy biến qua hook `useFilterPanel` (**Tùy chọn**, nếu các Section hoặc Chart bên trong đã có bộ lọc cục bộ chuyên biệt như Combobox Kỳ hoặc DateRange Picker thì bỏ filter toàn trang ở topbar để tránh trùng lặp).
  - `loading`: Trạng thái loading chung (`isFetching` từ TanStack Query).
  - `onRefresh`: Hàm refetch dữ liệu khi người dùng click icon làm mới.
  - `extraActions`: Nút bấm mở rộng (ví dụ: Nút "Xuất Excel" 📥 / "Tải báo cáo").

### 1.1. Nguyên tắc Bộ Lọc Cục Bộ (Section-Level Filtering)
- Khi Dashboard chứa nhiều Section báo cáo có ngữ cảnh thời gian khác nhau (ví dụ: P&L theo từng tháng cụ thể với Combobox, Bảng tiến độ theo toàn chu kỳ, Biểu đồ xu hướng có DateRange cục bộ):
  - **Lược bỏ `filterConfig` & `filter` ở cấp độ trang**, giao quyền lọc trực tiếp cho từng Section/Panel.
  - Section Báo cáo P&L: Tích hợp Combobox Kỳ (Dropdown chọn tháng) ngay tại header của Section.
  - Biểu đồ Xu hướng (Charts): Tích hợp `<DatePicker>` (Từ ngày - Đến ngày) ngay trong prop `extra` của `<Panel>`.
  - Giúp giao diện sạch sẽ, chuyên nghiệp, không gây rối mắt cho người điều hành.

---

## 2. Breadcrumb & TabBar — BẮT BUỘC

### 2.1. Breadcrumb đúng cấp (Topbar)

Mỗi trang Dashboard **BẮT BUỘC** đăng ký breadcrumb theo đúng cấu trúc 3 cấp độ menu Sidebar:
`Module Group → Sub-group (clickable) → Tên trang Dashboard`.

**Đăng ký Static trong `src/core/config/appStore.ts`**:

```ts
// appStore.ts — BREADCRUMBS:
"[module]-dashboard": [
  ["breadcrumb.accounting"],                          // Level 1: Module Group
  ["nav.items.[module]Group", "[module]-dashboard"], // Level 2: Sub-group (có link)
  ["nav.items.[module]Dashboard"],                    // Level 3: Tên trang hiện tại (cuối, không link)
],
```

### 2.2. TabBar — Đăng ký PageKey và Label

1. **Thêm `PageKey`**: trong `src/shared/types/index.ts` (vd: `"[module]-dashboard"`).
2. **Đăng ký `SECTION_ROOTS`**: trong `appStore.ts` (`labelKey: "nav.items.[module]Dashboard"`, `group: "accounting" | "sales" | ...`).
3. **Khai báo i18n**: Thêm key vào `src/core/locale/system/nav/` và `breadcrumb/` (`vi.ts`, `en.ts`).

---

## 3. Quản lý Bộ Lọc Toàn Trang (Toàn cục khi không dùng Section Filter)

- Khi áp dụng bộ lọc toàn trang, sử dụng hook `useFilterPanel` từ `@/shared/hooks/useFilterPanel`:
  - `period: true`: Kích hoạt bộ lọc khoảng thời gian (Hôm nay, Tuần này, Tháng này, Quý này, Năm nay, Tùy chọn).
  - `noDefaultPeriod: true`: Không ép buộc ngày mặc định nếu muốn xem toàn thời gian hoặc theo tháng hiện tại.
  - `custom`: Danh sách các dropdown filter tùy biến (ví dụ: Chi nhánh, Nhóm hàng, Trạng thái).
- **Gắn state vào Query Key**: Truyền `filter.state.dateFrom`, `filter.state.dateTo` và các custom filter vào TanStack Query key để tự động refetch khi người dùng đổi bộ lọc.

---

## 4. Các Thành Phần UI Chuẩn trong Dashboard

### 4.1. Khối KPI Cards (Chỉ số quan trọng)
- Sử dụng thẻ card với design token chuẩn ERP: `bg-surface border border-border rounded-xl card-shadow p-4`.
- **Label**: `text-xs text-[color:var(--muted-fg)] uppercase tracking-[0.05em] mb-2 font-medium`.
- **Value**: `text-2xl font-semibold text-foreground tabular-nums`.
- Bố cục Grid responsive: `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">`.

```tsx
function KpiCard({ label, value, subtext }: { label: string; value: string; subtext?: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-xl card-shadow p-4 transition-all hover:border-border/80">
      <div className="text-xs text-[color:var(--muted-fg)] uppercase tracking-[0.05em] mb-2 font-medium">
        {label}
      </div>
      <div className="text-2xl font-semibold text-foreground tabular-nums">{value}</div>
      {subtext && <div className="mt-1 text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}
```

### 4.2. Khối Biểu đồ (Charts) & Container `<Panel>`
- Bọc từng biểu đồ hoặc bảng trong `<Panel>` (`@/shared/components/Panel`) để có header và viền chuẩn:
  `<Panel title={t("trendTitle", "Xu hướng...")} titleExtra={...}>`.
- Sử dụng các chart components chuẩn từ `@/shared/components/charts`:
  - `<BarChart labels={...} datasets={...} />`
  - `<DonutChart items={...} />` kết hợp `<DonutLegend items={...} />`
  - `<LineChart ... />`
- **Xử lý 3 Trạng thái bắt buộc cho Biểu đồ**:
  1. **Loading**: Hiển thị `<ChartSkeleton />` từ `@/shared/components/Skeleton`.
  2. **Empty**: Khi data rỗng, **BẮT BUỘC** hiển thị `<EmptyState message={t("noData", "Chưa có dữ liệu")} size="sm" />`.
  3. **Success**: Render chart trong khung có chiều cao cố định (`h-[240px]` hoặc `h-[280px]`).

### 4.3. Bảng Dữ liệu Tổng hợp trong Dashboard (Sub-tables)
- Nếu Dashboard có bảng Top 10 đối tác, Top sản phẩm hoặc bảng phân tích chi tiết:
  - Bắt buộc tuân thủ [`standardize-table`](../standardize_table/SKILL.md):
    - Cột STT rộng `40px`, **bắt đầu từ 1 và căn giữa cả header lẫn cell**.
    - Số lượng/tiền tệ căn phải `text-right tabular-nums font-semibold`.
    - Trạng thái dùng `<Badge>` fixed width, bọc `<Tooltip>`.
    - Bảng có `emptyLabel` và `summaryRow` tổng cộng nếu có cột số liệu.

---

## 5. Hook Thống kê & API Layer

- Tạo sẵn custom hook `use[Module]DashboardStats` trong `src/modules/[module]/hooks/`.
- Kết nối API `[module]Api.getDashboardStats(...)` bằng TanStack Query.

```ts
// src/modules/[module]/hooks/use[Module]DashboardStats.ts
import { useQuery } from "@tanstack/react-query";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

export interface DashboardFilterParams {
  dateFrom?: string;
  dateTo?: string;
  branchId?: string;
}

export function use[Module]DashboardStats(params: DashboardFilterParams) {
  return useQuery({
    queryKey: ["[module]-dashboard-stats", params],
    queryFn: () => {
      // return [module]Api.getDashboardStats(params);
      return Promise.resolve({
        kpi: { totalRecords: 0, totalAmount: 0, completionRate: 0 },
        trend: [],
        breakdown: [],
      });
    },
  });
}
```

---

## 6. Mẫu code cơ bản (Dashboard Page Boilerplate)

```tsx
import React, { useMemo } from "react";
import { LayoutDashboard, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { Button } from "@/shared/components/ui/Button";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { useTranslation } from "react-i18next";
// import { [module]Api } from "@/modules/[module]/api/[module]Api";

export function ExampleDashboardPage() {
  const { t } = useTranslation("exampleModule");

  const filterConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      custom: [],
    }),
    [],
  );
  const filter = useFilterPanel(filterConfig, () => {});

  const { data, isFetching, isLoading, refetch } = useQuery({
    queryKey: [
      "example-dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
    ],
    queryFn: () => {
      // return [module]Api.getDashboardStats({
      //   dateFrom: filter.state.dateFrom || undefined,
      //   dateTo: filter.state.dateTo || undefined,
      // });
      return Promise.resolve({
        kpi: { totalOrders: 0, totalAmount: 0, completionRate: 0 },
        trend: [] as { month: string; value: number }[],
        statusBreakdown: [] as { status: string; count: number }[],
      });
    },
  });

  const handleExportExcel = () => {
    // Xử lý xuất Excel báo cáo
  };

  const trendLabels = (data?.trend || []).map((t) => t.month);
  const trendValues = (data?.trend || []).map((t) => t.value);

  const donutColors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const donutItems = (data?.statusBreakdown || []).map((item, idx) => ({
    id: item.status,
    label: t(`status.${item.status}`, item.status),
    value: item.count,
    color: donutColors[idx % donutColors.length],
  }));

  return (
    <DashboardTemplate
      title={t("dashboardTitle", "Tổng quan Báo cáo")}
      desc={t("dashboardDesc", "Phân tích và theo dõi các chỉ số quan trọng")}
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={() => {
        void refetch();
      }}
      extraActions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportExcel}
          className="gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          {t("exportExcel", "Xuất Excel")}
        </Button>
      }
    >
      {/* ── 1. KPI Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <div className="bg-surface border border-border rounded-xl card-shadow p-4">
          <div className="text-xs text-[color:var(--muted-fg)] uppercase tracking-[0.05em] mb-2 font-medium">
            {t("totalOrders", "Tổng số đơn hàng")}
          </div>
          <div className="text-2xl font-semibold text-foreground tabular-nums">
            {data?.kpi.totalOrders?.toLocaleString("vi-VN") || 0}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl card-shadow p-4">
          <div className="text-xs text-[color:var(--muted-fg)] uppercase tracking-[0.05em] mb-2 font-medium">
            {t("totalAmount", "Tổng giá trị")}
          </div>
          <div className="text-2xl font-semibold text-primary tabular-nums">
            {data?.kpi.totalAmount?.toLocaleString("vi-VN") || 0} đ
          </div>
        </div>

        <div className="bg-surface border border-border rounded-xl card-shadow p-4">
          <div className="text-xs text-[color:var(--muted-fg)] uppercase tracking-[0.05em] mb-2 font-medium">
            {t("completionRate", "Tỷ lệ hoàn tất")}
          </div>
          <div className="text-2xl font-semibold text-emerald-600 tabular-nums">
            {(data?.kpi.completionRate || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ── 2. Charts Grid ── */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_320px] gap-3 mb-4">
        {/* Trend Bar Chart */}
        <Panel title={t("trendTitle", "Xu hướng tăng trưởng")}>
          <div className="relative h-[260px]">
            {isLoading ? (
              <ChartSkeleton />
            ) : trendLabels.length > 0 ? (
              <BarChart
                labels={trendLabels}
                datasets={[
                  {
                    data: trendValues,
                    color: "#3b82f6",
                    label: t("amount", "Doanh số"),
                  },
                ]}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState message={t("noData", "Chưa có dữ liệu biểu đồ")} size="sm" />
              </div>
            )}
          </div>
        </Panel>

        {/* Status Donut Chart */}
        <Panel title={t("statusBreakdown", "Cơ cấu trạng thái")}>
          <div className="relative h-[260px] flex flex-col justify-between">
            {isLoading ? (
              <ChartSkeleton />
            ) : donutItems.length > 0 ? (
              <>
                <div className="h-[180px] flex items-center justify-center">
                  <DonutChart items={donutItems} />
                </div>
                <DonutLegend items={donutItems} />
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState message={t("noData", "Chưa có dữ liệu")} size="sm" />
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardTemplate>
  );
}
```

---

## Summary Checklist trước khi hoàn thành

### Breadcrumb & TabBar
- [ ] Đã thêm `PageKey` mới vào type trong `src/shared/types/index.ts` chưa?
- [ ] Đã đăng ký `SECTION_ROOTS` (`labelKey`, `group`) và `BREADCRUMBS` (3 cấp chuẩn) trong `appStore.ts` chưa?
- [ ] Đã thêm i18n key cho `nav/` và `breadcrumb/` (`vi.ts`, `en.ts`) chưa?

### Bộ lọc & Layout Template
- [ ] Trang đã bọc bằng `<DashboardTemplate>` với đầy đủ props (`title`, `icon`, `filterConfig`, `filter`, `loading`, `onRefresh`) chưa?
- [ ] Bộ lọc `useFilterPanel` đã được kết nối với Query Key để tự động refetch theo ngày chưa?
- [ ] Nếu có tính năng Xuất Excel, đã truyền Button vào `extraActions` chưa?

### KPI & Biểu đồ (Charts)
- [ ] KPI Cards đã dùng card token chuẩn (`card-shadow`, `tabular-nums`, `uppercase tracking-[0.05em]`) chưa?
- [ ] Biểu đồ đã được bọc trong `<Panel>` có tiêu đề rõ ràng chưa?
- [ ] Đã xử lý đầy đủ 3 trạng thái của biểu đồ: **Loading** (`<ChartSkeleton />`), **Empty** (`<EmptyState size="sm" />`), **Success** (chiều cao cố định) chưa?

### Sub-table & Đa ngôn ngữ (i18n)
- [ ] Bảng con nếu có đã tuân thủ `standardize-table` (STT 1-based căn giữa, format số tiền `tabular-nums text-right font-semibold`, badge trạng thái) chưa?
- [ ] Tất cả text hiển thị đã được bọc bằng hàm `t(...)` từ `useTranslation`, không hardcode tiếng Việt/Anh chưa?
