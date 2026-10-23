import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/shared/components/Panel";
import {
  V2ComboChart,
  type V2ComboSeries,
} from "@/v2/shared/components/organisms/v2-chart";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { format, subMonths, subWeeks, startOfWeek, endOfWeek } from "date-fns";
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
  const theme = useV2ChartTheme();
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
  const trendLabels = useMemo(() => trend.map((t) => t.month), [trend]);
  const trendBuy = useMemo(() => trend.map((t: any) => t.cogs || 0), [trend]);
  const trendSell = useMemo(
    () => trend.map((t: any) => t.revenue || 0),
    [trend],
  );
  const trendProfit = useMemo(
    () => trend.map((t: any) => t.grossProfit || 0),
    [trend],
  );

  const lineProfit = theme.mode === "dark" ? "#2dd4bf" : "#0d9488"; // Teal 400 / 600

  const series = useMemo<V2ComboSeries[]>(
    () => [
      {
        key: "buy",
        type: "bar",
        data: trendBuy,
        color: COLOR_EXPENSE,
        label: t("vinfastParts.buy"),
      },
      {
        key: "sell",
        type: "bar",
        data: trendSell,
        color: COLOR_REVENUE,
        label: t("vinfastParts.sell"),
      },
      {
        key: "profit",
        type: "line",
        data: trendProfit,
        color: lineProfit,
        borderColor: lineProfit,
        borderWidth: 2.5,
        tension: 0.3,
        label: t("vinfastParts.profit"),
      },
    ],
    [trendBuy, trendSell, trendProfit, lineProfit, t],
  );

  return (
    <Panel title={title}>
      <V2ComboChart
        labels={trendLabels}
        series={series}
        height={chartHeight}
        loading={isLoading}
        formatValue={(v) => money(Number(v))}
        ariaLabel={title}
      />
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
    totalBuy: 0,
    totalSell: 0,
    profit: 0,
    byVehicleType: {
      CAR: { revenue: 0, cogs: 0, grossProfit: 0, inventoryValue: 0 },
      MOTORBIKE: { revenue: 0, cogs: 0, grossProfit: 0, inventoryValue: 0 },
    },
  };

  const charts = data?.charts || {
    revenue: [],
    cogs: [],
    grossProfit: [],
    inventoryValue: [],
  };

  const monthLabels = React.useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const d = subMonths(new Date(), 5 - i);
      return `Tháng ${format(d, "MM/yyyy")}`;
    });
  }, []);

  const weekLabels = React.useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => {
      const d = subWeeks(new Date(), 3 - i);
      const start = startOfWeek(d, { weekStartsOn: 1 });
      const end = endOfWeek(d, { weekStartsOn: 1 });
      return `${format(start, "dd/MM")} - ${format(end, "dd/MM")}`;
    });
  }, []);

  const chartLabels = groupBy === "week" ? weekLabels : monthLabels;

  const renderBottomNode = (
    key: "revenue" | "cogs" | "grossProfit" | "inventoryValue",
  ) => {
    const carVal = summary.byVehicleType?.CAR?.[key] || 0;
    const motorVal = summary.byVehicleType?.MOTORBIKE?.[key] || 0;
    return (
      <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
            Ô tô
          </span>
          <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
            {money(carVal)}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider truncate">
            Xe máy
          </span>
          <span className="font-semibold text-foreground text-sm mt-0.5 truncate">
            {money(motorVal)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          compact
          label="Doanh thu"
          value={`${money(summary.revenue)} đ`}
          loading={isLoading}
          rightNode={
            <KpiSparkline data={charts.revenue} labels={chartLabels} />
          }
          bottomNode={renderBottomNode("revenue")}
        />
        <KpiCard
          compact
          label="Giá vốn (FIFO)"
          value={`${money(summary.cogs)} đ`}
          loading={isLoading}
          rightNode={<KpiSparkline data={charts.cogs} labels={chartLabels} />}
          bottomNode={renderBottomNode("cogs")}
        />
        <KpiCard
          compact
          label="Lợi nhuận gộp"
          value={`${money(summary.grossProfit)} đ`}
          loading={isLoading}
          rightNode={
            <KpiSparkline data={charts.grossProfit} labels={chartLabels} />
          }
          bottomNode={renderBottomNode("grossProfit")}
        />
        <KpiCard
          compact
          label="Giá trị tồn kho"
          value={`${money(summary.inventoryValue)} đ`}
          loading={isLoading}
          rightNode={
            <KpiSparkline data={charts.inventoryValue} labels={chartLabels} />
          }
          bottomNode={renderBottomNode("inventoryValue")}
        />
      </div>
    </div>
  );
}
