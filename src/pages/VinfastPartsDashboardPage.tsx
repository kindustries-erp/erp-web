import { LayoutDashboard } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { ComingSoon } from "@/pages/ComingSoon";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import React from "react";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import api from "@/core/api/axiosInstance";
import { Panel } from "@/shared/components/Panel";
import { BarChart } from "@/shared/components/charts/BarChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { money } from "@/shared/utils/format";
import { useHasPermission } from "@/shared/hooks/useHasPermission";

export function VinfastPartsDashboardPage() {
  const hasVinfastPerm = useHasPermission("vinfast_parts_reports", "read");

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
  };

  if (!hasVinfastPerm) {
    return <ComingSoon />;
  }

  return (
    <DashboardTemplate
      title="Tổng quan phụ tùng"
      desc="Báo cáo tổng hợp tình hình mua bán phụ tùng Vinfast"
      icon={<LayoutDashboard className="h-4 w-4" />}
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
          <Panel title="Doanh thu">
            <p className="text-2xl font-bold mt-2 text-[#059669]">
              {money(summary.revenue)} đ
            </p>
          </Panel>
          <Panel title="Giá vốn (FIFO)">
            <p className="text-2xl font-bold mt-2 text-[#ea580c]">
              {money(summary.cogs)} đ
            </p>
          </Panel>
          <Panel title="Lợi nhuận gộp">
            <p className="text-2xl font-bold mt-2 text-[#1e293b]">
              {money(summary.grossProfit)} đ
            </p>
          </Panel>
          <Panel title="Giá trị tồn kho">
            <p className="text-2xl font-bold mt-2 text-[#475569]">
              {money(summary.inventoryValue)} đ
            </p>
          </Panel>
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
}: {
  title: string;
  vehicleType: string;
  filterState: any;
  groupBy: string;
  itemCode?: string;
  chartHeight?: number;
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
      <div className="flex gap-4 mt-[10px] justify-center">
        <LegendItem color={colorExpense} label="Giá vốn" />
        <LegendItem color={colorRevenue} label="Doanh thu" />
        <LegendItem color={lineProfit} label="Lợi nhuận gộp" isLine={true} />
      </div>
    </Panel>
  );
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
