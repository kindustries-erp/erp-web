import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton, Skeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { workshopDashboardApi } from "../api/workshopDashboardApi";

export interface VinfastPartsSummaryCardsProps {
  filterState: {
    dateFrom?: string;
    dateTo?: string;
    custom?: Record<string, string | undefined>;
  };
}

const COLOR_REVENUE = "#059669";
const COLOR_EXPENSE = "#ea580c";
const LINE_PROFIT = "#1e293b";

function LegendItem({
  color,
  label,
  isLine,
}: {
  color: string;
  label: string;
  isLine?: boolean;
}) {
  return (
    <div className="flex items-center text-xs">
      {isLine ? (
        <div className="w-4 h-[2px] mr-2" style={{ backgroundColor: color }} />
      ) : (
        <div
          className="w-3 h-3 rounded-[3px] mr-2"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-[color:var(--muted-fg)] font-medium">{label}</span>
    </div>
  );
}

export function VinfastPartTrendChart({
  title,
  vehicleType,
  filterState,
  groupBy,
  chartHeight = 280,
}: {
  title: string;
  vehicleType: string;
  filterState: { dateFrom?: string; dateTo?: string };
  groupBy: string;
  chartHeight?: number;
}) {
  const { t } = useTranslation("dashboard");
  const { data, isLoading } = useQuery({
    queryKey: [
      "workshop-vf-parts-trend",
      vehicleType,
      filterState.dateFrom,
      filterState.dateTo,
      groupBy,
    ],
    queryFn: () =>
      workshopDashboardApi.getVinfastPartsSummary({
        dateFrom: filterState.dateFrom,
        dateTo: filterState.dateTo,
        vehicleType:
          vehicleType && vehicleType !== "all" ? vehicleType : undefined,
        groupBy,
      }),
  });

  const trend = data?.trend || [];
  const trendLabels = trend.map((t) => t.month);
  const trendBuy = trend.map((t: any) => t.cogs || 0);
  const trendSell = trend.map((t: any) => t.revenue || 0);
  const trendProfit = trend.map((t: any) => t.grossProfit || 0);

  return (
    <Panel title={title}>
      <div className="relative" style={{ height: chartHeight }}>
        {!isLoading && trendLabels.length > 0 ? (
          <BarChart
            labels={trendLabels}
            yCallback={(v) => money(Number(v))}
            datasets={[
              {
                type: "line",
                data: trendProfit,
                color: "transparent",
                borderColor: LINE_PROFIT,
                borderWidth: 2,
                fill: false,
                label: t("vinfastParts.profit"),
              },
              {
                type: "bar",
                data: trendBuy,
                color: COLOR_EXPENSE,
                label: t("vinfastParts.buy"),
              },
              {
                type: "bar",
                data: trendSell,
                color: COLOR_REVENUE,
                label: t("vinfastParts.sell"),
              },
            ]}
          />
        ) : isLoading ? (
          <ChartSkeleton type="bar" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
            {t("common.noData")}
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-[10px] justify-center">
        <LegendItem color={COLOR_EXPENSE} label={t("vinfastParts.buy")} />
        <LegendItem color={COLOR_REVENUE} label={t("vinfastParts.sell")} />
        <LegendItem
          color={LINE_PROFIT}
          label={t("vinfastParts.profit")}
          isLine
        />
      </div>
    </Panel>
  );
}

export function VinfastPartsSummaryCards({
  filterState,
}: VinfastPartsSummaryCardsProps) {
  const groupBy = filterState.custom?.groupBy || "month";

  const { data, isLoading } = useQuery({
    queryKey: [
      "workshop-vf-parts-kpi",
      filterState.dateFrom,
      filterState.dateTo,
      groupBy,
    ],
    queryFn: () =>
      workshopDashboardApi.getVinfastPartsSummary({
        dateFrom: filterState.dateFrom,
        dateTo: filterState.dateTo,
        groupBy,
      }),
  });

  const summary = data?.summary || {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    inventoryValue: 0,
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Panel title="Doanh thu">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold mt-2 text-[#059669]">
              {money(summary.revenue)} đ
            </p>
          )}
        </Panel>
        <Panel title="Giá vốn (FIFO)">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold mt-2 text-[#ea580c]">
              {money(summary.cogs)} đ
            </p>
          )}
        </Panel>
        <Panel title="Lợi nhuận gộp">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold mt-2 text-[#1e293b]">
              {money(summary.grossProfit)} đ
            </p>
          )}
        </Panel>
        <Panel title="Giá trị tồn kho">
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className="text-2xl font-bold mt-2 text-[#475569]">
              {money(summary.inventoryValue)} đ
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
