import * as React from "react";
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Activity,
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

export const V2AdminDashboardPageMobile: React.FC<
  V2AdminDashboardPageProps
> = ({ branchId }) => {
  const { t, locale } = useV2Translation();
  const [period, setPeriod] = React.useState<V2DashboardPeriod>(
    V2DashboardPeriod.MONTH,
  );

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["v2-admin-dashboard-summary-mobile", branchId, period],
    queryFn: () => adminDashboardApi.getSummary({ branchId, period }),
    staleTime: 60000,
  });

  const kpis = data?.kpis;
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
      label: t("v2.admin.dashboard.month", "Tháng"),
    },
    {
      id: V2DashboardPeriod.QUARTER,
      label: t("v2.admin.dashboard.quarter", "Quý"),
    },
    { id: V2DashboardPeriod.YEAR, label: t("v2.admin.dashboard.year", "Năm") },
  ];

  return (
    <div data-testid="admin-dashboard-mobile" className="space-y-4 pb-4">
      {/* Mobile Title & Refresh */}
      <div className="flex items-center justify-between gap-2">
        <V2Text as="h1" variant="h4" weight="bold">
          {t("v2.admin.dashboard.title", "Cổng Quản Trị")}
        </V2Text>
        <V2Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
          className="h-8 px-2.5"
        >
          <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
        </V2Button>
      </div>

      {/* Period Tabs */}
      <div className="flex rounded-lg border border-border p-1 bg-muted/40 text-xs font-medium w-full gap-1">
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
                "flex-1 h-7 text-xs transition-all",
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

      {/* Stacked KPI Cards */}
      <div className="space-y-3">
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
          icon={ShoppingCart}
          variant={V2AdminStatVariant.DEFAULT}
        />
        <V2AdminStatCard
          title={t("v2.admin.dashboard.lowStock", "Cảnh báo tồn kho")}
          value={kpis?.inventoryLowStockCount?.value ?? 0}
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
    </div>
  );
};

V2AdminDashboardPageMobile.displayName = "V2AdminDashboardPageMobile";
