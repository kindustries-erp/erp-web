import React from "react";
import { BarChart3, ReceiptText } from "lucide-react";
import { useGarageCashflowDashboardStats } from "../../../hooks/useGarageCashflowDashboardStats";
import { Panel } from "@/shared/components/Panel";
import { KpiCard } from "@/shared/components/KpiCard";
import { BarChart } from "@/shared/components/charts/BarChart";
import { DonutChart, DonutLegend } from "@/shared/components/charts/DonutChart";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { EmptyState } from "@/shared/components/EmptyState";
import { PageLayout, type TabItem } from "@/shared/components/PageLayout";

export interface GarageCashflowDashboardProps {
  tabs?: TabItem[];
  activeTab?: string;
  onTabChange?: (val: string) => void;
}

export const GarageCashflowDashboard: React.FC<
  GarageCashflowDashboardProps
> = ({ tabs, activeTab, onTabChange }) => {
  const { data, isLoading } = useGarageCashflowDashboardStats();

  const kpi = data?.kpi || { totalIn: 0, totalOut: 0, net: 0 };
  const trend = data?.trend || [];
  const breakdown = data?.breakdown || { in: [], out: [] };

  const donutColors = ["#0f172a", "#10b981", "#f59e0b", "#8b5cf6", "#64748b"];

  const getDonutItems = (items: { method: string; amount: number }[]) => {
    return items.map((item, index) => ({
      id: item.method,
      label: item.method,
      value: item.amount,
      color: donutColors[index % donutColors.length],
    }));
  };

  const donutIn = getDonutItems(breakdown.in);
  const donutOut = getDonutItems(breakdown.out);

  return (
    <PageLayout
      title="Thu chi xưởng"
      desc="Quản lý Thu/Chi nội bộ tại xưởng và đối soát với dòng tiền ERP"
      icon={<ReceiptText className="w-5 h-5 text-slate-700" />}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <KpiCard
            label="Tổng Thu (VNĐ)"
            value={kpi.totalIn.toLocaleString("vi-VN")}
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <KpiCard
            label="Tổng Chi (VNĐ)"
            value={kpi.totalOut.toLocaleString("vi-VN")}
            icon={<BarChart3 className="w-4 h-4" />}
          />
          <KpiCard
            label="Lợi Nhuận Gộp (VNĐ)"
            value={kpi.net.toLocaleString("vi-VN")}
            icon={<BarChart3 className="w-4 h-4 text-emerald-600" />}
          />
        </div>

        <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_320px_320px] gap-3 mb-4">
          <Panel title="Xu Hướng Thu/Chi">
            <div className="relative h-[260px]">
              {isLoading ? (
                <ChartSkeleton />
              ) : trend.length > 0 ? (
                <BarChart
                  labels={trend.map((t: any) => t.month)}
                  datasets={[
                    {
                      label: "Thu",
                      data: trend.map((t: any) => t.in),
                      color: "#10b981",
                    },
                    {
                      label: "Chi",
                      data: trend.map((t: any) => t.out),
                      color: "#f59e0b",
                    },
                  ]}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="Chưa có dữ liệu biểu đồ" size="sm" />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Cơ cấu Thu">
            <div className="relative h-[260px] flex flex-col justify-between">
              {isLoading ? (
                <ChartSkeleton />
              ) : donutIn.length > 0 ? (
                <>
                  <div className="h-[180px] flex items-center justify-center">
                    <DonutChart items={donutIn} />
                  </div>
                  <DonutLegend items={donutIn} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="Chưa có dữ liệu" size="sm" />
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Cơ cấu Chi">
            <div className="relative h-[260px] flex flex-col justify-between">
              {isLoading ? (
                <ChartSkeleton />
              ) : donutOut.length > 0 ? (
                <>
                  <div className="h-[180px] flex items-center justify-center">
                    <DonutChart items={donutOut} />
                  </div>
                  <DonutLegend items={donutOut} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <EmptyState message="Chưa có dữ liệu" size="sm" />
                </div>
              )}
            </div>
          </Panel>
        </div>
      </div>
    </PageLayout>
  );
};
