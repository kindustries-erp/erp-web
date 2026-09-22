import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ReceiptText,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  Clock,
  AlertTriangle,
  AlertOctagon,
  ExternalLink,
} from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { KpiCard, KpiBadge } from "@/shared/components/KpiCard";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { TabItem } from "@/shared/components/PageLayout";
import { useInvoiceDebtsDashboard } from "../hooks/useInvoiceDebtsDashboard";

export interface InvoiceDebtsDashboardTabProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
  onExportClick?: () => void;
  onOpenPartnerDetail?: (taxCode: string, partnerName?: string) => void;
}

export function InvoiceDebtsDashboardTab({
  tabs,
  activeTab,
  onTabChange,
  onExportClick,
  onOpenPartnerDetail,
}: InvoiceDebtsDashboardTabProps) {
  const { t } = useTranslation(["debts", "common"]);
  const [topRiskTab, setTopRiskTab] = useState<"customers" | "suppliers">(
    "customers",
  );

  const filterConfig = useMemo(
    () => ({
      period: true,
      noDefaultPeriod: true,
      custom: [],
    }),
    [],
  );

  const filter = useFilterPanel(filterConfig, () => {});

  const {
    summary,
    agingComparison,
    timeHorizons,
    cashTrend,
    topReceivableCustomers,
    topPayableSuppliers,
    isLoading,
    isFetching,
    refetch,
  } = useInvoiceDebtsDashboard({
    dateFrom: filter.state.dateFrom || undefined,
    dateTo: filter.state.dateTo || undefined,
  });

  // 1. Chart 1: Monthly Cashflow Trend & Net Position (Mixed Bar & Line)
  const trendLabels = useMemo(() => cashTrend.map((x) => x.label), [cashTrend]);
  const trendDatasets = useMemo(
    () => [
      {
        type: "bar" as const,
        data: cashTrend.map((x) => x.cashIn),
        color: "#10b981",
        label: t("debts:dashboard.cashIn", "Bán ra (Thu)"),
      },
      {
        type: "bar" as const,
        data: cashTrend.map((x) => x.cashOut),
        color: "#f59e0b",
        label: t("debts:dashboard.cashOut", "Mua vào (Chi)"),
      },
      {
        type: "line" as const,
        data: cashTrend.map((x) => x.netCash ?? x.cashIn - x.cashOut),
        color: "#0f172a",
        borderColor: "#0f172a",
        borderWidth: 2,
        label: t("debts:dashboard.netCash", "Dòng tiền ròng"),
      },
    ],
    [cashTrend, t],
  );

  // 2. Chart 2: Aging Matrix Comparison (Receivables vs Payables)
  const agingLabels = useMemo(
    () => [
      t("debts:dashboard.aging0_30", "0-30 ngày"),
      t("debts:dashboard.aging31_60", "31-60 ngày"),
      t("debts:dashboard.aging61_90", "61-90 ngày"),
      t("debts:dashboard.agingOver90", ">90 ngày"),
    ],
    [t],
  );

  const agingMatrixDatasets = useMemo(() => {
    const rAmounts = agingComparison.map((a) => a.receivableAmount);
    const pAmounts = agingComparison.map((a) => a.payableAmount);

    return [
      {
        type: "bar" as const,
        data: rAmounts,
        color: "#10b981",
        label: t("debts:dashboard.receivableLegend", "Phải thu (KH)"),
      },
      {
        type: "bar" as const,
        data: pAmounts,
        color: "#f59e0b",
        label: t("debts:dashboard.payableLegend", "Phải trả (NCC)"),
      },
    ];
  }, [agingComparison, t]);

  // 3. Chart 3: Donut Chart - Combined Aging Breakdown
  const agingDonutData = useMemo(() => {
    let a0_30 = 0,
      a31_60 = 0,
      a61_90 = 0,
      aOver90 = 0;

    agingComparison.forEach((item) => {
      const total = item.receivableAmount + item.payableAmount;
      if (item.bracket === "0_30") a0_30 = total;
      if (item.bracket === "31_60") a31_60 = total;
      if (item.bracket === "61_90") a61_90 = total;
      if (item.bracket === "over_90") aOver90 = total;
    });

    const total = a0_30 + a31_60 + a61_90 + aOver90;

    if (total <= 0) {
      return { total: 0, items: [] };
    }

    const items = [
      {
        id: "aging0_30",
        label: t("debts:dashboard.aging0_30", "0-30 ngày"),
        value: Math.round((a0_30 / total) * 100),
        amount: a0_30,
        color: "#10b981",
      },
      {
        id: "aging31_60",
        label: t("debts:dashboard.aging31_60", "31-60 ngày"),
        value: Math.round((a31_60 / total) * 100),
        amount: a31_60,
        color: "#f59e0b",
      },
      {
        id: "aging61_90",
        label: t("debts:dashboard.aging61_90", "61-90 ngày"),
        value: Math.round((a61_90 / total) * 100),
        amount: a61_90,
        color: "#ea580c",
      },
      {
        id: "agingOver90",
        label: t("debts:dashboard.agingOver90", ">90 ngày"),
        value: Math.round((aOver90 / total) * 100),
        amount: aOver90,
        color: "#ef4444",
      },
    ].filter((item) => item.amount > 0);

    return { total, items };
  }, [agingComparison, t]);

  const activeTopRiskList =
    topRiskTab === "customers" ? topReceivableCustomers : topPayableSuppliers;

  return (
    <DashboardTemplate
      title={t("debts:title", "Công nợ")}
      desc={t(
        "debts:dashboard.desc",
        "Tổng hợp tình hình phải thu, phải trả, dự báo dòng tiền theo mốc thời gian và rủi ro tuổi nợ",
      )}
      icon={<ReceiptText className="w-5 h-5 text-primary" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetching}
      onRefresh={() => {
        void refetch();
      }}
      extraActions={
        onExportClick ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportClick}
            className="gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            {t("debts:exportExcel", "Xuất Excel")}
          </Button>
        ) : undefined
      }
    >
      {/* ── SECTION 1: Executive KPI Cards Row (Vị Thế Tài Chính & Công Nợ Ròng) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
        {/* Card 1: Phải thu Khách hàng */}
        <KpiCard
          label={t("debts:dashboard.totalReceivable", "Phải thu Khách hàng")}
          value={money(summary?.remainingReceivable || 0)}
          sub={`${t("common:total", "Tổng")}: ${money(summary?.totalReceivable || 0)} • ${t("debts:dashboard.collectionRate", "Tỷ lệ thu hồi")}: ${(summary?.collectionRate || 0).toFixed(1)}%`}
          icon={<ArrowUpRight className="w-4 h-4 text-emerald-600" />}
          badge={
            <KpiBadge variant="up">
              {`${(summary?.collectionRate || 0).toFixed(0)}% ${t("debts:received", "Đã thu")}`}
            </KpiBadge>
          }
          loading={isLoading}
        />

        {/* Card 2: Phải trả Nhà cung cấp */}
        <KpiCard
          label={t("debts:dashboard.totalPayable", "Phải trả Nhà cung cấp")}
          value={money(summary?.remainingPayable || 0)}
          sub={`${t("common:total", "Tổng")}: ${money(summary?.totalPayable || 0)} • ${t("debts:dashboard.paymentRate", "Tỷ lệ chi trả")}: ${(summary?.paymentRate || 0).toFixed(1)}%`}
          icon={<ArrowDownLeft className="w-4 h-4 text-amber-600" />}
          badge={
            <KpiBadge variant="warn">
              {`${(summary?.paymentRate || 0).toFixed(0)}% ${t("debts:paid", "Đã trả")}`}
            </KpiBadge>
          }
          loading={isLoading}
        />

        {/* Card 3: Vị thế Công nợ Ròng */}
        <KpiCard
          label={t("debts:dashboard.netDebtPosition", "Vị thế Công nợ ròng")}
          value={`${(summary?.netBalance || 0) >= 0 ? "+" : ""}${money(summary?.netBalance || 0)}`}
          sub={t(
            "debts:dashboard.netDifference",
            "Chênh lệch Phải thu - Phải trả",
          )}
          icon={<Wallet className="w-4 h-4 text-primary" />}
          badge={
            (summary?.netBalance || 0) >= 0 ? (
              <span className="text-[10px] px-2 py-[3px] rounded-[20px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80">
                {t("debts:dashboard.netSurplus", "Thặng dư phải thu")}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-[3px] rounded-[20px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/80">
                {t("debts:dashboard.netDeficit", "Áp lực chi trả")}
              </span>
            )
          }
          loading={isLoading}
        />
      </div>

      {/* ── SECTION 2: Time Horizons Grid (Dự Báo Dòng Tiền Theo Mốc Thời Gian) ── */}
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-primary" />
          {t(
            "debts:dashboard.timeHorizonsTitle",
            "Dự báo & Phân bổ Dòng tiền theo Mốc thời gian",
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Horizon 1: Tuần tới */}
          <div className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-border/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                {t("debts:dashboard.nextWeekDue", "Dự báo Tuần tới (7 ngày)")}
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-foreground">
                T+7
              </span>
            </div>
            <div className="space-y-1 my-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.expectedIn", "Dự thu")}:
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  +{money(timeHorizons?.nextWeekDue?.receivable || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.expectedOut", "Dự chi")}:
                </span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  -{money(timeHorizons?.nextWeekDue?.payable || 0)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
              <span className="text-muted-foreground font-medium">
                {t("debts:dashboard.netFlow", "Ròng")}:
              </span>
              <span
                className={cn(
                  "font-mono font-bold",
                  (timeHorizons?.nextWeekDue?.net || 0) >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-destructive",
                )}
              >
                {(timeHorizons?.nextWeekDue?.net || 0) >= 0 ? "+" : ""}
                {money(timeHorizons?.nextWeekDue?.net || 0)}
              </span>
            </div>
          </div>

          {/* Horizon 2: Tháng tới */}
          <div className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-border/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {t(
                  "debts:dashboard.nextMonthDue",
                  "Kế hoạch Tháng tới (30 ngày)",
                )}
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-foreground">
                T+30
              </span>
            </div>
            <div className="space-y-1 my-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.expectedIn", "Dự thu")}:
                </span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  +{money(timeHorizons?.nextMonthDue?.receivable || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.expectedOut", "Dự chi")}:
                </span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  -{money(timeHorizons?.nextMonthDue?.payable || 0)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
              <span className="text-muted-foreground font-medium">
                {t("debts:dashboard.netFlow", "Ròng")}:
              </span>
              <span
                className={cn(
                  "font-mono font-bold",
                  (timeHorizons?.nextMonthDue?.net || 0) >= 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-destructive",
                )}
              >
                {(timeHorizons?.nextMonthDue?.net || 0) >= 0 ? "+" : ""}
                {money(timeHorizons?.nextMonthDue?.net || 0)}
              </span>
            </div>
          </div>

          {/* Horizon 3: Quá hạn 31-90 ngày */}
          <div className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-border/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-orange-700 dark:text-orange-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t("debts:dashboard.overdue30To90", "Quá hạn 31-90 ngày")}
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                Đôn đốc
              </span>
            </div>
            <div className="space-y-1 my-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.receivableLegend", "Phải thu (KH)")}:
                </span>
                <span className="font-mono font-semibold text-orange-700 dark:text-orange-400">
                  {money(timeHorizons?.overdue30To90?.receivable || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.payableLegend", "Phải trả (NCC)")}:
                </span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  {money(timeHorizons?.overdue30To90?.payable || 0)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
              <span className="text-muted-foreground font-medium">
                {t("debts:dashboard.netFlow", "Chênh lệch")}:
              </span>
              <span className="font-mono font-bold text-foreground">
                {money(timeHorizons?.overdue30To90?.net || 0)}
              </span>
            </div>
          </div>

          {/* Horizon 4: Quá hạn >90 ngày */}
          <div className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-border/80 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <AlertOctagon className="w-3.5 h-3.5" />
                {t("debts:dashboard.criticalOverdue90Plus", "Quá hạn >90 ngày")}
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                Cảnh báo
              </span>
            </div>
            <div className="space-y-1 my-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.receivableLegend", "Phải thu (KH)")}:
                </span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                  {money(timeHorizons?.criticalOverdue90Plus?.receivable || 0)}
                </span>
              </div>
              <div className="flex justify-between text-xs tabular-nums">
                <span className="text-muted-foreground">
                  {t("debts:dashboard.payableLegend", "Phải trả (NCC)")}:
                </span>
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  {money(timeHorizons?.criticalOverdue90Plus?.payable || 0)}
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
              <span className="text-muted-foreground font-medium">
                {t("debts:dashboard.netFlow", "Chênh lệch")}:
              </span>
              <span className="font-mono font-bold text-foreground">
                {money(timeHorizons?.criticalOverdue90Plus?.net || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Deep-Dive Analytics Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Chart 1: Monthly Cashflow Trend & Net Position */}
        <Panel
          title={t(
            "debts:dashboard.trendChartTitle",
            "Biến động Dòng tiền Mua/Bán & Vị thế ròng theo tháng",
          )}
        >
          <div className="relative h-[280px]">
            {isLoading ? (
              <ChartSkeleton />
            ) : trendLabels.length > 0 ? (
              <BarChart
                labels={trendLabels}
                datasets={trendDatasets}
                showLegend={true}
                yCallback={(v) => money(Number(v))}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  message={t(
                    "debts:dashboard.noData",
                    "Chưa có dữ liệu biểu đồ",
                  )}
                  size="sm"
                />
              </div>
            )}
          </div>
        </Panel>

        {/* Chart 2: Aging Matrix Comparison (Receivables vs Payables) */}
        <Panel
          title={t(
            "debts:dashboard.agingMatrixTitle",
            "Ma trận so sánh Tuổi nợ (Phải thu vs Phải trả)",
          )}
        >
          <div className="relative h-[280px]">
            {isLoading ? (
              <ChartSkeleton />
            ) : agingComparison.length > 0 ? (
              <BarChart
                labels={agingLabels}
                datasets={agingMatrixDatasets}
                showLegend={true}
                yCallback={(v) => money(Number(v))}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  message={t(
                    "debts:dashboard.noData",
                    "Chưa có dữ liệu biểu đồ",
                  )}
                  size="sm"
                />
              </div>
            )}
          </div>
        </Panel>

        {/* Chart 3: System-wide Debt Aging Breakdown (Donut) */}
        <Panel
          title={t(
            "debts:dashboard.agingChartTitle",
            "Cơ cấu Phân bổ Tuổi nợ Toàn hệ thống",
          )}
        >
          <div className="relative h-[280px] flex flex-col justify-between">
            {isLoading ? (
              <ChartSkeleton />
            ) : agingDonutData.items.length > 0 ? (
              <>
                <div className="h-[180px] flex items-center justify-center">
                  <DonutChart
                    items={agingDonutData.items}
                    valueFormatter={(val) => `${val}%`}
                  />
                </div>
                <DonutLegend
                  items={agingDonutData.items}
                  valueFormatter={(val) => `${val}%`}
                />
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  message={t("debts:dashboard.noData", "Chưa có dữ liệu")}
                  size="sm"
                />
              </div>
            )}
          </div>
        </Panel>

        {/* Chart 4: Top 5 Debt Risk Exposures Panel */}
        <Panel
          title={t(
            "debts:dashboard.topRiskTitle",
            "Top 5 Đầu mối Rủi ro & Áp lực Công nợ",
          )}
          extra={
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/30">
              <button
                type="button"
                onClick={() => setTopRiskTab("customers")}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                  topRiskTab === "customers"
                    ? "bg-surface shadow-xs text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("debts:dashboard.topCustomersTab", "Khách hàng")}
              </button>
              <button
                type="button"
                onClick={() => setTopRiskTab("suppliers")}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                  topRiskTab === "suppliers"
                    ? "bg-surface shadow-xs text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t("debts:dashboard.topSuppliersTab", "Nhà cung cấp")}
              </button>
            </div>
          }
        >
          <div className="min-h-[280px] flex flex-col justify-between">
            {isLoading ? (
              <div className="space-y-3 py-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 bg-muted/40 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : activeTopRiskList.length > 0 ? (
              <div className="space-y-2 py-1">
                {activeTopRiskList.map((partner, idx) => {
                  const hasOverdue = partner.overdueAmount > 0;
                  return (
                    <div
                      key={partner.taxCode + idx}
                      onClick={() =>
                        onOpenPartnerDetail?.(
                          partner.taxCode,
                          partner.partnerName,
                        )
                      }
                      className="group flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/10 hover:bg-muted/30 hover:border-primary/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold flex items-center justify-center shrink-0 text-muted-foreground group-hover:text-primary">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                            <span className="truncate">
                              {partner.partnerName}
                            </span>
                            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-primary" />
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {partner.taxCode} •{" "}
                            {t("debts:dashboard.maxAgingLabel", "Tuổi nợ")}:{" "}
                            {partner.maxAgingDays} ngày
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-semibold font-mono text-foreground tabular-nums">
                          {money(partner.balanceAmount)}
                        </div>
                        {hasOverdue && (
                          <div className="text-[10px] font-mono text-rose-600 dark:text-rose-400">
                            {t("debts:dashboard.overdueLabel", "Quá hạn")}:{" "}
                            {money(partner.overdueAmount)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center py-10">
                <EmptyState
                  message={t("debts:dashboard.noData", "Chưa có dữ liệu")}
                  size="sm"
                />
              </div>
            )}
          </div>
        </Panel>
      </div>
    </DashboardTemplate>
  );
}
