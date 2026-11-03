import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Panel } from "@/shared/components/Panel";
import { money } from "@/shared/utils/format";
import type { GarageCashTrendItem } from "@/modules/garage/api/garageDebtsAnalyticsApi";
import { V2ComboChart, type V2ComboSeries } from "@/v2/shared/components";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";

interface GarageDebtsCashTrendChartProps {
  cashTrend: GarageCashTrendItem[];
  isLoading?: boolean;
}

export const GarageDebtsCashTrendChart: React.FC<
  GarageDebtsCashTrendChartProps
> = ({ cashTrend, isLoading = false }) => {
  const { t } = useTranslation(["garage", "debts", "common"]);
  const theme = useV2ChartTheme();

  const trendLabels = useMemo(() => cashTrend.map((x) => x.label), [cashTrend]);
  const lineNet = theme.mode === "dark" ? "#2dd4bf" : "#0d9488"; // Teal 400 / 600

  const series = useMemo<V2ComboSeries[]>(
    () => [
      {
        key: "cash-in",
        type: "bar",
        data: cashTrend.map((x) => x.cashIn),
        color: "#10b981",
        label: t("garage:debts.cashInLegend", "Đã thu"),
      },
      {
        key: "cash-out",
        type: "bar",
        data: cashTrend.map((x) => x.cashOut),
        color: "#f59e0b",
        label: t("garage:debts.cashOutLegend", "Đã chi"),
      },
      {
        key: "net-cash",
        type: "line",
        data: cashTrend.map((x) => x.netCash ?? x.cashIn - x.cashOut),
        color: lineNet,
        borderColor: lineNet,
        borderWidth: 2.5,
        tension: 0.3,
        label: t("debts:dashboard.netCash", "Dòng tiền ròng"),
      },
    ],
    [cashTrend, lineNet, t],
  );

  const title = t(
    "garage:debts.trendChartTitle",
    "Biến động Đã thu/Đã chi & Dòng tiền ròng",
  );

  return (
    <Panel title={title}>
      <V2ComboChart
        labels={trendLabels}
        series={series}
        height={280}
        loading={isLoading}
        formatValue={(v) => money(Number(v))}
        ariaLabel={title}
      />
    </Panel>
  );
};
