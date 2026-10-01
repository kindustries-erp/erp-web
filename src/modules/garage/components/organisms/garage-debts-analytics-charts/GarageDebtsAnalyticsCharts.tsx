import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { money } from "@/shared/utils/format";
import { TrendingUp } from "lucide-react";
import type { GarageDebtsAnalyticsChartsProps } from "./GarageDebtsAnalyticsCharts.type";

export const GarageDebtsAnalyticsCharts: React.FC<
  GarageDebtsAnalyticsChartsProps
> = ({ cashTrend, agingComparison, isLoading = false }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

  // 1. Trend Chart Datasets
  const trendLabels = useMemo(() => cashTrend.map((x) => x.label), [cashTrend]);
  const trendDatasets = useMemo(
    () => [
      {
        type: "bar" as const,
        data: cashTrend.map((x) => x.cashIn),
        color: "#10b981",
        label: t("garage:debts.cashInLegend", "Doanh thu dịch vụ (Thu)"),
      },
      {
        type: "bar" as const,
        data: cashTrend.map((x) => x.cashOut),
        color: "#f59e0b",
        label: t("garage:debts.cashOutLegend", "Chi phí xưởng (Chi)"),
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

  // 2. Aging Matrix Datasets
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
    return [
      {
        type: "bar" as const,
        data: agingComparison.map((a) => a.receivableAmount),
        color: "#10b981",
        label: t("debts:dashboard.receivableLegend", "Phải thu (KH)"),
      },
      {
        type: "bar" as const,
        data: agingComparison.map((a) => a.payableAmount),
        color: "#f59e0b",
        label: t("debts:dashboard.payableLegend", "Phải trả (NCC/CP)"),
      },
    ];
  }, [agingComparison, t]);

  // 3. Donut Aging Breakdown
  const agingDonutData = useMemo(() => {
    let a0_30 = 0,
      a31_60 = 0,
      a61_90 = 0,
      aOver90 = 0;

    agingComparison.forEach((item) => {
      const tot = item.receivableAmount + item.payableAmount;
      if (item.bracket === "0_30") a0_30 = tot;
      if (item.bracket === "31_60") a31_60 = tot;
      if (item.bracket === "61_90") a61_90 = tot;
      if (item.bracket === "over_90") aOver90 = tot;
    });

    const total = a0_30 + a31_60 + a61_90 + aOver90;
    if (total <= 0) return { total: 0, items: [] };

    const items = [
      {
        id: "a0_30",
        label: "0-30 ngày",
        value: Math.round((a0_30 / total) * 100),
        amount: a0_30,
        color: "#10b981",
      },
      {
        id: "a31_60",
        label: "31-60 ngày",
        value: Math.round((a31_60 / total) * 100),
        amount: a31_60,
        color: "#f59e0b",
      },
      {
        id: "a61_90",
        label: "61-90 ngày",
        value: Math.round((a61_90 / total) * 100),
        amount: a61_90,
        color: "#ea580c",
      },
      {
        id: "aOver90",
        label: ">90 ngày",
        value: Math.round((aOver90 / total) * 100),
        amount: aOver90,
        color: "#ef4444",
      },
    ].filter((it) => it.amount > 0);

    return { total, items };
  }, [agingComparison]);

  return (
    <>
      <div className="flex items-center gap-3 mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-xs flex items-center gap-1.5 whitespace-nowrap">
          <TrendingUp className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          {t(
            "debts:dashboard.sectionAnalyticsCharts",
            "Biến động & Phân tích Công nợ",
          )}
        </h4>
        <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden sm:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        {/* Chart 1: Monthly Trend (50% = 2 cols) */}
        <div className="lg:col-span-2 xl:col-span-2">
          <Panel
            title={t(
              "garage:debts.trendChartTitle",
              "Biến động Doanh thu/Chi phí & Dòng tiền ròng",
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

        {/* Chart 2: Aging Matrix (25% = 1 col) */}
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

        {/* Chart 3: Aging Donut (25% = 1 col) */}
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
    </>
  );
};
