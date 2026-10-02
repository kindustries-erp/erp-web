import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/ChartSkeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { money } from "@/shared/utils/format";
import type { GarageAgingComparisonItem } from "@/modules/garage/api/garageDebtsAnalyticsApi";

interface GarageDebtsAgingMatrixChartProps {
  agingComparison: GarageAgingComparisonItem[];
  isLoading?: boolean;
}

export const GarageDebtsAgingMatrixChart: React.FC<
  GarageDebtsAgingMatrixChartProps
> = ({ agingComparison, isLoading = false }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);

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

  return (
    <Panel
      title={t("debts:dashboard.agingMatrixTitle", "Ma trận so sánh Tuổi nợ")}
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
              message={t("debts:dashboard.noData", "Chưa có dữ liệu biểu đồ")}
              size="sm"
            />
          </div>
        )}
      </div>
    </Panel>
  );
};
