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
  Brain,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { PillTabs } from "@/shared/components/PillTabs";
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
import { InvoiceTimeHorizonDetailDrawer } from "./InvoiceTimeHorizonDetailDrawer";
import { DebtAgingExplanationPopover } from "./DebtAgingExplanationPopover";
import type { TimeHorizonKey } from "../api/invoiceDashboardApi";

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
  const [viewMode, setViewMode] = useState<"aging" | "forecast">("aging");
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizonKey | null>(
    null,
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
    forecastHorizons,
    cashTrend,
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

      {/* ── SECTION 2: Aging Allocation & Algorithmic Cashflow Forecast Grid ── */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <BarChart2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              {t(
                "debts:dashboard.sectionAgingAndForecast",
                "Phân bổ & Dự báo Công nợ",
              )}
            </h4>
            <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden sm:block" />
          </div>

          <div className="flex items-center gap-2">
            <PillTabs<"aging" | "forecast">
              value={viewMode}
              onValueChange={setViewMode}
              size="sm"
              items={[
                {
                  value: "aging",
                  label: t("debts:dashboard.viewAgingMode", "Phân bổ Tuổi nợ"),
                  icon: Clock,
                },
                {
                  value: "forecast",
                  label: t(
                    "debts:dashboard.viewForecastMode",
                    "Dự báo Thuật toán",
                  ),
                  icon: Brain,
                },
              ]}
              className="w-auto"
            />
            <DebtAgingExplanationPopover />
          </div>
        </div>

        <div className="flex items-center justify-between -mt-1">
          <span className="text-[11px] text-muted-foreground/70 font-normal hidden sm:inline">
            {t(
              "debts:dashboard.horizonClickHint",
              "Click vào từng thẻ để xem chi tiết hóa đơn & đối tác",
            )}
          </span>
        </div>

        {viewMode === "aging" ? (
          /* ── VIEW 1: Phân Bổ Tuổi Nợ Danh Nghĩa ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Horizon 1: Mới phát sinh (≤ 7 ngày) */}
            <div
              onClick={() => setSelectedHorizon("nextWeekDue")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {t("debts:dashboard.freshDebt7", "Mới phát sinh (≤ 7 ngày)")}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80">
                  {t("debts:dashboard.freshBadge", "Mới")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedIn", "Phải thu (KH)")}:
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{money(timeHorizons?.nextWeekDue?.receivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedOut", "Phải trả (NCC)")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(timeHorizons?.nextWeekDue?.payable || 0)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
                <span className="text-muted-foreground font-medium">
                  {t("debts:dashboard.netFlow", "Chênh lệch")}:
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

            {/* Horizon 2: Trong hạn chuẩn (≤ 30 ngày) */}
            <div
              onClick={() => setSelectedHorizon("nextMonthDue")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {t(
                    "debts:dashboard.standardDebt30",
                    "Trong hạn chuẩn (≤ 30 ngày)",
                  )}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {t("debts:dashboard.standardBadge", "Chuẩn")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedIn", "Phải thu (KH)")}:
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{money(timeHorizons?.nextMonthDue?.receivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedOut", "Phải trả (NCC)")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(timeHorizons?.nextMonthDue?.payable || 0)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
                <span className="text-muted-foreground font-medium">
                  {t("debts:dashboard.netFlow", "Chênh lệch")}:
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
            <div
              onClick={() => setSelectedHorizon("overdue30To90")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-orange-400/60 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-orange-700 dark:text-orange-400 flex items-center gap-1 group-hover:text-orange-600 transition-colors">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {t("debts:dashboard.overdue30To90", "Quá hạn 31-90 ngày")}
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300">
                  {t("debts:dashboard.urgentBadge", "Đôn đốc")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.receivableLegend", "Phải thu (KH)")}:
                  </span>
                  <span className="font-mono font-semibold text-orange-700 dark:text-orange-400">
                    +{money(timeHorizons?.overdue30To90?.receivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.payableLegend", "Phải trả (NCC)")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(timeHorizons?.overdue30To90?.payable || 0)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
                <span className="text-muted-foreground font-medium">
                  {t("debts:dashboard.netFlow", "Chênh lệch")}:
                </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    (timeHorizons?.overdue30To90?.net || 0) >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {(timeHorizons?.overdue30To90?.net || 0) >= 0 ? "+" : ""}
                  {money(timeHorizons?.overdue30To90?.net || 0)}
                </span>
              </div>
            </div>

            {/* Horizon 4: Quá hạn >90 ngày */}
            <div
              onClick={() => setSelectedHorizon("criticalOverdue90Plus")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-rose-400/60 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-rose-700 dark:text-rose-400 flex items-center gap-1 group-hover:text-rose-600 transition-colors">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {t(
                    "debts:dashboard.criticalOverdue90Plus",
                    "Quá hạn >90 ngày",
                  )}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  {t("debts:dashboard.warningBadge", "Cảnh báo")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.receivableLegend", "Phải thu (KH)")}:
                  </span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    +
                    {money(
                      timeHorizons?.criticalOverdue90Plus?.receivable || 0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.payableLegend", "Phải trả (NCC)")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(timeHorizons?.criticalOverdue90Plus?.payable || 0)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
                <span className="text-muted-foreground font-medium">
                  {t("debts:dashboard.netFlow", "Chênh lệch")}:
                </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    (timeHorizons?.criticalOverdue90Plus?.net || 0) >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {(timeHorizons?.criticalOverdue90Plus?.net || 0) >= 0
                    ? "+"
                    : ""}
                  {money(timeHorizons?.criticalOverdue90Plus?.net || 0)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ── VIEW 2: Dự Báo Dòng Tiền Thuật Toán (Algorithmic Forecast) ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Forecast 1: Dự báo Tuần tới (7 ngày) */}
            <div
              onClick={() => setSelectedHorizon("forecastNext7Days")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-emerald-500/50 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  {t(
                    "debts:dashboard.forecastNext7Days",
                    "Dự báo Tuần tới (7 ngày)",
                  )}
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80">
                  {t("debts:dashboard.forecastT7Badge", "T+7 (Lag)")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedIn", "Dự thu")}:
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{money(forecastHorizons?.next7Days?.receivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedOut", "Dự chi")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(forecastHorizons?.next7Days?.payable || 0)}
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
                    (forecastHorizons?.next7Days?.net || 0) >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {(forecastHorizons?.next7Days?.net || 0) >= 0 ? "+" : ""}
                  {money(forecastHorizons?.next7Days?.net || 0)}
                </span>
              </div>
            </div>

            {/* Forecast 2: Kế hoạch Tháng tới (30 ngày) */}
            <div
              onClick={() => setSelectedHorizon("forecastNext30Days")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-primary/50 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {t(
                    "debts:dashboard.forecastNext30Days",
                    "Kế hoạch Tháng tới (30 ngày)",
                  )}
                </span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {t("debts:dashboard.forecastT30Badge", "T+30 (Lag)")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedIn", "Dự thu")}:
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +{money(forecastHorizons?.next30Days?.receivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedOut", "Dự chi")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(forecastHorizons?.next30Days?.payable || 0)}
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
                    (forecastHorizons?.next30Days?.net || 0) >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {(forecastHorizons?.next30Days?.net || 0) >= 0 ? "+" : ""}
                  {money(forecastHorizons?.next30Days?.net || 0)}
                </span>
              </div>
            </div>

            {/* Forecast 3: Dòng tiền Kỳ vọng (IFRS 9) */}
            <div
              onClick={() => setSelectedHorizon("expectedCashflow")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-violet-500/50 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-violet-700 dark:text-violet-400 flex items-center gap-1 group-hover:text-violet-600 transition-colors">
                  <Brain className="w-3.5 h-3.5" />
                  {t(
                    "debts:dashboard.expectedCashflow",
                    "Dòng tiền Kỳ vọng (IFRS 9)",
                  )}
                </span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 border border-violet-200/80">
                  {t("debts:dashboard.forecastExpectedBadge", "Kỳ vọng")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedIn", "Thu kỳ vọng")}:
                  </span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    +
                    {money(forecastHorizons?.expectedCashflow?.receivable || 0)}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.expectedOut", "Chi kỳ vọng")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -{money(forecastHorizons?.expectedCashflow?.payable || 0)}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
                <span className="text-muted-foreground font-medium">
                  {t("debts:dashboard.netFlow", "Ròng kỳ vọng")}:
                </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    (forecastHorizons?.expectedCashflow?.net || 0) >= 0
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-destructive",
                  )}
                >
                  {(forecastHorizons?.expectedCashflow?.net || 0) >= 0
                    ? "+"
                    : ""}
                  {money(forecastHorizons?.expectedCashflow?.net || 0)}
                </span>
              </div>
            </div>

            {/* Forecast 4: Dự phòng Rủi ro Nợ (IFRS 9) */}
            <div
              onClick={() => setSelectedHorizon("defaultRiskProvision")}
              className="bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:border-rose-400/60 hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-rose-700 dark:text-rose-400 flex items-center gap-1 group-hover:text-rose-600 transition-colors">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {t(
                    "debts:dashboard.defaultRiskProvision",
                    "Dự phòng Rủi ro Nợ",
                  )}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                  {t("debts:dashboard.forecastRiskBadge", "Rủi ro")}
                </span>
              </div>
              <div className="space-y-1 my-1">
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.receivableLegend", "Rủi ro Phải thu")}:
                  </span>
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                    +
                    {money(
                      forecastHorizons?.defaultRiskProvision?.receivableRisk ||
                        0,
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs tabular-nums">
                  <span className="text-muted-foreground">
                    {t("debts:dashboard.payableLegend", "Rủi ro Phải trả")}:
                  </span>
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    -
                    {money(
                      forecastHorizons?.defaultRiskProvision?.payableRisk || 0,
                    )}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
                <span className="text-muted-foreground font-medium">
                  {t("debts:dashboard.netFlow", "Chênh lệch rủi ro")}:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {money(forecastHorizons?.defaultRiskProvision?.netRisk || 0)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 3: Deep-Dive Analytics Charts Grid ── */}
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
          <TrendingUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          {t(
            "debts:dashboard.sectionAnalyticsCharts",
            "Biến động & Phân tích Công nợ",
          )}
        </h4>
        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden sm:block" />
      </div>

      {/* ── HÀNG 1: BIỂU ĐỒ DÒNG TIỀN (50%) + MA TRẬN TUỔI NỢ (25%) + CƠ CẤU TUỔI NỢ (25%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {/* Chart 1: Monthly Cashflow Trend & Net Position (Chiếm 2 cột = 50% width) */}
        <div className="lg:col-span-2 xl:col-span-2">
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
        </div>

        {/* Chart 2: Aging Matrix Comparison (Chiếm 1 cột = 25% width) */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Panel
            title={t(
              "debts:dashboard.agingMatrixTitle",
              "Ma trận so sánh Tuổi nợ",
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
        </div>

        {/* Chart 3: System-wide Debt Aging Breakdown (Donut - Chiếm 1 cột = 25% width) */}
        <div className="lg:col-span-1 xl:col-span-1">
          <Panel
            title={t(
              "debts:dashboard.agingChartTitle",
              "Cơ cấu Phân bổ Tuổi nợ",
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
        </div>
      </div>

      {/* ── SECTION 4: Time Horizon Detail Drawer ── */}
      <InvoiceTimeHorizonDetailDrawer
        open={Boolean(selectedHorizon)}
        onClose={() => setSelectedHorizon(null)}
        horizon={selectedHorizon}
        dateFrom={filter.state.dateFrom || undefined}
        dateTo={filter.state.dateTo || undefined}
        onOpenPartnerDetail={onOpenPartnerDetail}
      />
    </DashboardTemplate>
  );
}
