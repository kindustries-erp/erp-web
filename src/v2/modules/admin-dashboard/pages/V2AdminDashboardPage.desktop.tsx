import * as React from "react";
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Activity,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { V2Text, V2Button } from "@/v2/shared/components";
import { V2AdminStatCard } from "@/v2/shared/components/molecules/v2-admin-stat-card";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { V2DashboardPeriod, V2AdminStatVariant } from "@/v2/shared/types";
import { cn } from "@/v2/shared/utils/cn";
import { adminDashboardApi } from "../api/adminDashboardApi";
import type { V2AdminDashboardPageProps } from "./V2AdminDashboardPage.type";

export const V2AdminDashboardPageDesktop: React.FC<
  V2AdminDashboardPageProps
> = ({ branchId }) => {
  const { t, locale } = useV2Translation();
  const [period, setPeriod] = React.useState<V2DashboardPeriod>(
    V2DashboardPeriod.MONTH,
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["v2-admin-dashboard-summary", branchId, period],
    queryFn: () => adminDashboardApi.getSummary({ branchId, period }),
    staleTime: 60000,
  });

  const kpis = data?.kpis;
  const health = data?.systemHealth;

  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  const currencyCode = locale === "vi" ? "VND" : "USD";

  const formatCurrency = (val?: number) =>
    new Intl.NumberFormat(intlLocale, {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: locale === "vi" ? 0 : 2,
    }).format(val ?? 0);

  const periodOptions = [
    {
      id: V2DashboardPeriod.MONTH,
      label: t("v2.admin.dashboard.month", "Tháng này"),
    },
    {
      id: V2DashboardPeriod.QUARTER,
      label: t("v2.admin.dashboard.quarter", "Quý này"),
    },
    {
      id: V2DashboardPeriod.YEAR,
      label: t("v2.admin.dashboard.year", "Năm nay"),
    },
  ];

  return (
    <div
      data-testid="admin-dashboard-desktop"
      className="p-6 max-w-7xl mx-auto space-y-6"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <V2Text as="h1" variant="h3" weight="bold">
            {t("v2.admin.dashboard.title", "Cổng Điều Hành Doanh Nghiệp")}
          </V2Text>
          <V2Text variant="body-sm" color="muted">
            {t(
              "v2.admin.dashboard.subtitle",
              "Tổng hợp chỉ số KPI, hiệu suất kinh doanh & an toàn hệ thống",
            )}
          </V2Text>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1 bg-muted/40 text-xs font-medium gap-1">
            {periodOptions.map((opt) => {
              const isActive = period === opt.id;
              return (
                <V2Button
                  key={opt.id}
                  type="button"
                  variant={isActive ? "secondary" : "ghost"}
                  size="xs"
                  onClick={() => setPeriod(opt.id)}
                  className={cn(
                    "h-7 px-3 text-xs transition-all",
                    isActive
                      ? "bg-background shadow-xs font-semibold text-foreground hover:bg-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <V2Text
                    as="span"
                    variant="caption"
                    weight={isActive ? "semibold" : "medium"}
                  >
                    {opt.label}
                  </V2Text>
                </V2Button>
              );
            })}
          </div>

          <V2Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="gap-1.5"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <V2Text as="span" variant="caption" weight="medium">
              {t("v2.common.refresh", "Làm mới")}
            </V2Text>
          </V2Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <V2AdminStatCard
          title={t("v2.admin.dashboard.revenue", "Doanh thu thu về")}
          value={formatCurrency(kpis?.revenue?.value)}
          growthRate={kpis?.revenue?.growthRate ?? 8.5}
          icon={DollarSign}
          variant={V2AdminStatVariant.SUCCESS}
        />
        <V2AdminStatCard
          title={t("v2.admin.dashboard.salesOrders", "Đơn bán hàng")}
          value={kpis?.salesOrdersCount?.value ?? 0}
          subtitle={`${kpis?.salesOrdersCount?.pendingCount ?? 0} ${t("v2.admin.dashboard.pendingOrders", "đơn chờ xử lý")}`}
          icon={ShoppingCart}
          variant={V2AdminStatVariant.DEFAULT}
        />
        <V2AdminStatCard
          title={t("v2.admin.dashboard.lowStock", "Cảnh báo tồn kho")}
          value={kpis?.inventoryLowStockCount?.value ?? 0}
          subtitle={t(
            "v2.admin.dashboard.lowStockHint",
            "Mặt hàng chạm ngưỡng tối thiểu",
          )}
          icon={AlertTriangle}
          variant={
            kpis?.inventoryLowStockCount?.value
              ? V2AdminStatVariant.DANGER
              : V2AdminStatVariant.DEFAULT
          }
        />
        <V2AdminStatCard
          title={t("v2.admin.dashboard.receivables", "Công nợ phải thu")}
          value={formatCurrency(kpis?.unpaidReceivables?.value)}
          icon={Activity}
          variant={V2AdminStatVariant.WARNING}
        />
      </div>

      {/* System Health Status */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck size={20} />
          </div>
          <div>
            <V2Text
              variant="body-sm"
              weight="semibold"
              className="text-foreground"
            >
              {t("v2.admin.dashboard.healthTitle", "Hệ thống vận hành an toàn")}
            </V2Text>
            <V2Text variant="caption" color="muted">
              {`${health?.activeUsers ?? 1} ${t("v2.admin.dashboard.activeUsersDesc", "người dùng nội bộ đang hoạt động")}`}
            </V2Text>
          </div>
        </div>

        <V2Text variant="caption" color="muted" className="font-mono">
          {t("v2.admin.dashboard.lastSync", "Đồng bộ lúc:")}{" "}
          {health?.lastSyncAt
            ? new Date(health.lastSyncAt).toLocaleTimeString(intlLocale)
            : t("v2.admin.dashboard.justNow", "Vừa xong")}
        </V2Text>
      </div>
    </div>
  );
};
