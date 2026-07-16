import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { money } from "@/shared/utils/format";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";

interface BranchVatChartProps {
  branchId: string | null;
  branchName: string;
  filterState: any;
  canView: boolean;
}

export function BranchVatChart({
  branchId,
  branchName,
  filterState,
  canView,
}: BranchVatChartProps) {
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
  const lineDiff = "#2563eb"; // Blue 600

  const cashTrendLabels = statsData?.cashTrend?.map((t: any) => t.label) || [];
  const vatIn = statsData?.cashTrend?.map((t: any) => t.vatIn) || []; // VAT đầu vào
  const vatOut = statsData?.cashTrend?.map((t: any) => t.vatOut) || []; // VAT đầu ra
  const vatDiff =
    statsData?.cashTrend?.map((t: any) => t.vatOut - t.vatIn) || []; // Đầu ra - Đầu vào

  return (
    <Panel title={branchName} extra={<PanelMore />}>
      <div className="relative h-[280px]">
        {!isLoadingStats && cashTrendLabels.length > 0 ? (
          <BarChart
            labels={cashTrendLabels}
            yCallback={(v) => money(Number(v))}
            datasets={[
              {
                type: "line",
                data: vatDiff,
                color: "transparent",
                borderColor: lineDiff,
                borderWidth: 2,
                fill: false,
                label: "Chênh lệch (Đầu ra - Đầu vào)",
              },
              {
                type: "bar",
                data: vatIn,
                color: barIn,
                label: "VAT Đầu vào",
              },
              {
                type: "bar",
                data: vatOut,
                color: barOut,
                label: "VAT Đầu ra",
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
        <LegendItem color={barIn} label="VAT Đầu vào" />
        <LegendItem color={barOut} label="VAT Đầu ra" />
        <LegendItem color={lineDiff} label="Chênh lệch" isLine={true} />
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
        <div className="w-4 h-1 mr-2" style={{ backgroundColor: color }} />
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
