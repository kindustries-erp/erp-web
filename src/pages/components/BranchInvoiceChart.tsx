import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { money } from "@/shared/utils/format";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";

interface BranchInvoiceChartProps {
  branchId: string | null; // null means "Unclassified", "all" means all branches
  branchName: string;
  filterState: any;
  canView: boolean;
}

export function BranchInvoiceChart({
  branchId,
  branchName,
  filterState,
  canView,
}: BranchInvoiceChartProps) {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "invoice-dashboard-stats",
      filterState.dateFrom,
      filterState.dateTo,
      branchId === "all" ? "all" : branchId || "null",
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getStats({
        date_from: filterState.dateFrom || undefined,
        date_to: filterState.dateTo || undefined,
        branch_id: branchId === "all" ? undefined : branchId || "null",
      }),
    enabled: canView,
  });

  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  const cashTrendLabels = statsData?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t: any) => t.cashIn) || []; // Đầu ra
  const cashTrendOut = statsData?.cashTrend?.map((t: any) => t.cashOut) || []; // Đầu vào

  return (
    <Panel title={branchName} extra={<PanelMore />}>
      <div className="relative h-[280px]">
        {!isLoadingStats && cashTrendLabels.length > 0 ? (
          <BarChart
            labels={cashTrendLabels}
            yCallback={(v) => money(Number(v))}
            datasets={[
              {
                data: cashTrendOut,
                color: barIn, // Hóa đơn đầu vào
                label: "HĐ Đầu vào (Chi phí)",
              },
              {
                data: cashTrendIn,
                color: barOut, // Hóa đơn đầu ra
                label: "HĐ Đầu ra (Doanh thu)",
              },
            ]}
          />
        ) : isLoadingStats ? (
          <ChartSkeleton type="bar" />
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-[color:var(--muted-fg)]">
            Chưa có dữ liệu
          </div>
        )}
      </div>
      <div className="flex gap-4 mt-[10px] justify-center">
        <LegendItem color={barIn} label="Đầu vào" />
        <LegendItem color={barOut} label="Đầu ra" />
      </div>
    </Panel>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center text-xs">
      <div
        className="w-3 h-3 rounded-[3px] mr-2"
        style={{ backgroundColor: color }}
      />
      <span className="text-[color:var(--muted-fg)] font-medium">{label}</span>
    </div>
  );
}
