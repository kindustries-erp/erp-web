import React from "react";
import { useTranslation } from "react-i18next";
import { TrendingUp } from "lucide-react";
import type { GarageDebtsAnalyticsChartsProps } from "./GarageDebtsAnalyticsCharts.type";
import { GarageDebtsCashTrendChart } from "./GarageDebtsCashTrendChart";
import { GarageDebtsAgingMatrixChart } from "./GarageDebtsAgingMatrixChart";
import { GarageDebtsAgingDonutPanel } from "./GarageDebtsAgingDonutPanel";

export const GarageDebtsAnalyticsCharts: React.FC<
  GarageDebtsAnalyticsChartsProps
> = ({ cashTrend, agingComparison, isLoading = false }) => {
  const { t } = useTranslation(["debts", "common"]);

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
          <GarageDebtsCashTrendChart
            cashTrend={cashTrend}
            isLoading={isLoading}
          />
        </div>

        {/* Chart 2: Aging Matrix (25% = 1 col) */}
        <div className="lg:col-span-1 xl:col-span-1">
          <GarageDebtsAgingMatrixChart
            agingComparison={agingComparison}
            isLoading={isLoading}
          />
        </div>

        {/* Chart 3: Aging Donut (25% = 1 col) */}
        <div className="lg:col-span-1 xl:col-span-1">
          <GarageDebtsAgingDonutPanel
            agingComparison={agingComparison}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
};
