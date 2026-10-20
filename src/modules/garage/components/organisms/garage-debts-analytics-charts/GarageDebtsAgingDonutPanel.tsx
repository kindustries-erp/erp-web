import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Panel } from "@/shared/components/Panel";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import type { GarageAgingComparisonItem } from "@/modules/garage/api/garageDebtsAnalyticsApi";

interface GarageDebtsAgingDonutPanelProps {
  agingComparison: GarageAgingComparisonItem[];
  isLoading?: boolean;
}

export const GarageDebtsAgingDonutPanel: React.FC<
  GarageDebtsAgingDonutPanelProps
> = ({ agingComparison, isLoading = false }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

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
    <Panel
      title={t("debts:dashboard.agingChartTitle", "Cơ cấu Phân bổ Tuổi nợ")}
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
  );
};
