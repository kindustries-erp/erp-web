import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { shortMoney } from "@/shared/utils/format";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { V2ComboChart, type V2ComboSeries } from "@/v2/shared/components";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";

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
  const theme = useV2ChartTheme();
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

  const colorRevenue = "#059669"; // Emerald 600 (Đầu ra)
  const colorExpense = "#ea580c"; // Orange 600 (Đầu vào)
  const lineDiff = theme.mode === "dark" ? "#2dd4bf" : "#0d9488"; // Teal 400 / 600

  const cashTrendLabels = useMemo(
    () => statsData?.cashTrend?.map((t: any) => t.label) || [],
    [statsData],
  );
  const vatIn = useMemo(
    () => statsData?.cashTrend?.map((t: any) => -t.vatIn) || [],
    [statsData],
  );
  const vatOut = useMemo(
    () => statsData?.cashTrend?.map((t: any) => t.vatOut) || [],
    [statsData],
  );
  const vatDiff = useMemo(
    () => statsData?.cashTrend?.map((t: any) => t.vatOut - t.vatIn) || [],
    [statsData],
  );

  const series = useMemo<V2ComboSeries[]>(
    () => [
      {
        key: "vat-in",
        type: "bar",
        data: vatIn,
        color: colorExpense,
        label: "VAT Đầu vào",
      },
      {
        key: "vat-out",
        type: "bar",
        data: vatOut,
        color: colorRevenue,
        label: "VAT Đầu ra",
      },
      {
        key: "vat-diff",
        type: "line",
        data: vatDiff,
        color: lineDiff,
        borderColor: lineDiff,
        borderWidth: 2.5,
        tension: 0.3,
        label: "Chênh lệch (Đầu ra - Đầu vào)",
      },
    ],
    [vatIn, vatOut, vatDiff, colorExpense, colorRevenue, lineDiff],
  );

  return (
    <Panel title={branchName} extra={<PanelMore />}>
      <V2ComboChart
        labels={cashTrendLabels}
        series={series}
        height={280}
        loading={isLoadingStats}
        formatValue={(v) => shortMoney(Number(v))}
        ariaLabel={`Biểu đồ thuế VAT chi nhánh ${branchName}`}
      />
    </Panel>
  );
}
