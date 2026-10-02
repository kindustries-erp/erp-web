import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { money } from "@/shared/utils/format";
import type { GarageCashTrendItem } from "@/modules/garage/api/garageDebtsAnalyticsApi";

interface GarageDebtsCashTrendChartProps {
  cashTrend: GarageCashTrendItem[];
  isLoading?: boolean;
}

export const GarageDebtsCashTrendChart: React.FC<
  GarageDebtsCashTrendChartProps
> = ({ cashTrend, isLoading = false }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

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

  return (
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
              message={t("debts:dashboard.noData", "Chưa có dữ liệu biểu đồ")}
              size="sm"
            />
          </div>
        )}
      </div>
    </Panel>
  );
};
