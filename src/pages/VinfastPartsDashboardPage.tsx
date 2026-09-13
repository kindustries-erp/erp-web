import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { ComingSoon } from "@/pages/ComingSoon";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import React from "react";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { Panel } from "@/shared/components/Panel";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { KpiCard } from "@/shared/components/KpiCard";
import { KpiSparkline } from "@/shared/components/KpiSparkline";
import { format, subMonths, subWeeks, startOfWeek, endOfWeek } from "date-fns";
import { money } from "@/shared/utils/format";
import { useHasPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import type { TabItem } from "@/shared/components/PageLayout";

export interface VinfastPartsDashboardPageProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

export function VinfastPartsDashboardPage({
  tabs,
  activeTab,
  onTabChange,
}: VinfastPartsDashboardPageProps = {}) {
  const hasVinfastPerm = useHasPermission(ErpResource.VINFAST, ErpAction.READ);

  const queryClient = useQueryClient();
  const isFetchingCount = useIsFetching({
    queryKey: ["vinfast-parts-dashboard"],
  });

  const filterConfig = React.useMemo(() => {
    return {
      period: true,
      noDefaultPeriod: true,
      custom: [
        {
          key: "groupBy",
          label: "Chu kỳ",
          placeholder: "Chọn chu kỳ",
          options: [
            { value: "month", label: "Theo tháng" },
            { value: "week", label: "Theo tuần" },
          ],
          initialValue: "month",
        },
      ],
    };
  }, []);

  const filter = useFilterPanel(filterConfig, () => {});
  const groupBy = filter.state.custom.groupBy || "month";

  const { data: allData } = useQuery({
    queryKey: [
      "vinfast-parts-dashboard",
      "all",
      filter.state.dateFrom,
      filter.state.dateTo,
      groupBy,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.state.dateFrom)
        params.append("dateFrom", filter.state.dateFrom);
      if (filter.state.dateTo) params.append("dateTo", filter.state.dateTo);
      if (groupBy) params.append("groupBy", groupBy as string);
      const res = await api.get(
        `/api/v1/reports/vinfast-parts-dashboard?${params}`,
      );
      return res.data;
    },
  });

  const summary = allData?.summary || {
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    inventoryValue: 0,
    byVehicleType: {
      CAR: { revenue: 0, cogs: 0, grossProfit: 0, inventoryValue: 0 },
      MOTORBIKE: { revenue: 0, cogs: 0, grossProfit: 0, inventoryValue: 0 },
    },
  };

  const charts = allData?.charts || {
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

  if (!hasVinfastPerm) {
    return <ComingSoon />;
  }

  return (
    <DashboardTemplate
      title="Tổng quan phụ tùng"
      desc="Báo cáo tổng hợp tình hình mua bán phụ tùng Vinfast"
      icon={<LayoutDashboard className="h-4 w-4" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      filterConfig={filterConfig}
      filter={filter}
      loading={isFetchingCount > 0}
      onRefresh={() => {
        queryClient.invalidateQueries({
          queryKey: ["vinfast-parts-dashboard"],
        });
        queryClient.invalidateQueries({
          queryKey: ["vinfast-parts-dashboard-table"],
        });
      }}
    >
      <div className="flex flex-col gap-8 mb-8">
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            compact
            label="Doanh thu"
            value={`${money(summary.revenue)} đ`}
            rightNode={
              <KpiSparkline data={charts.revenue} labels={chartLabels} />
            }
            bottomNode={renderBottomNode("revenue")}
          />
          <KpiCard
            compact
            label="Giá vốn (FIFO)"
            value={`${money(summary.cogs)} đ`}
            rightNode={<KpiSparkline data={charts.cogs} labels={chartLabels} />}
            bottomNode={renderBottomNode("cogs")}
          />
          <KpiCard
            compact
            label="Lợi nhuận gộp"
            value={`${money(summary.grossProfit)} đ`}
            rightNode={
              <KpiSparkline data={charts.grossProfit} labels={chartLabels} />
            }
            bottomNode={renderBottomNode("grossProfit")}
          />
          <KpiCard
            compact
            label="Giá trị tồn kho"
            value={`${money(summary.inventoryValue)} đ`}
            rightNode={
              <KpiSparkline data={charts.inventoryValue} labels={chartLabels} />
            }
            bottomNode={renderBottomNode("inventoryValue")}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">
            Biến động Mua / Bán phụ tùng
          </h3>

          <div className="mb-4">
            <VinfastPartTrendChart
              title="Tất cả phụ tùng (Tổng hợp)"
              vehicleType="all"
              filterState={filter.state}
              groupBy={groupBy as string}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <VinfastPartTrendChart
              title="Phụ tùng Ô tô"
              vehicleType="CAR"
              filterState={filter.state}
              groupBy={groupBy as string}
            />
            <VinfastPartTrendChart
              title="Phụ tùng Xe máy"
              vehicleType="MOTORBIKE"
              filterState={filter.state}
              groupBy={groupBy as string}
            />
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}

export function VinfastPartTrendChart({
  title,
  vehicleType,
  filterState,
  groupBy,
  itemCode,
  chartHeight = 300,
  variant = "panel",
}: {
  title: string;
  vehicleType: string;
  filterState: any;
  groupBy: string;
  itemCode?: string;
  chartHeight?: number;
  variant?: "panel" | "drawer";
}) {
  const { data, isLoading } = useQuery({
    queryKey: [
      "vinfast-parts-dashboard",
      vehicleType,
      filterState.dateFrom,
      filterState.dateTo,
      groupBy,
      itemCode,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterState.dateFrom) params.append("dateFrom", filterState.dateFrom);
      if (filterState.dateTo) params.append("dateTo", filterState.dateTo);
      if (vehicleType && vehicleType !== "all")
        params.append("vehicleType", vehicleType);
      if (groupBy) params.append("groupBy", groupBy);
      if (itemCode) params.append("itemCode", itemCode);
      const res = await api.get(
        `/api/v1/reports/vinfast-parts-dashboard?${params}`,
      );
      return res.data;
    },
  });

  const trend = data?.trend || [];
  const trendLabels = trend.map((t: any) => t.month);
  const trendBuy = trend.map((t: any) => t.cogs);
  const trendSell = trend.map((t: any) => t.revenue);
  const trendProfit = trend.map((t: any) => t.grossProfit);

  const colorRevenue = "#059669"; // Emerald 600 (Doanh thu)
  const colorExpense = "#ea580c"; // Orange 600 (Giá vốn)
  const lineProfit = "#1e293b"; // Slate 800 (Lợi nhuận gộp)

  const content = (
    <>
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
                borderColor: lineProfit,
                borderWidth: 2,
                fill: false,
                label: "Lợi nhuận gộp",
              },
              {
                type: "bar",
                data: trendBuy,
                color: colorExpense,
                label: "Giá vốn",
              },
              {
                type: "bar",
                data: trendSell,
                color: colorRevenue,
                label: "Doanh thu",
              },
            ]}
          />
        ) : isLoading ? (
          <ChartSkeleton type="bar" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
            Chưa có dữ liệu
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-[10px] justify-center flex-wrap">
        <LegendItem color={colorExpense} label="Giá vốn" />
        <LegendItem color={colorRevenue} label="Doanh thu" />
        <LegendItem color={lineProfit} label="Lợi nhuận gộp" isLine={true} />
      </div>
    </>
  );

  if (variant === "drawer") {
    return <DrawerSection title={title}>{content}</DrawerSection>;
  }

  return <Panel title={title}>{content}</Panel>;
}

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
