import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { shortMoney } from "@/shared/utils/format";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { V2ComboChart, type V2ComboSeries } from "@/v2/shared/components";
import { useV2ChartTheme } from "@/v2/shared/hooks/useV2ChartTheme";

interface BranchInvoiceChartProps {
  branchId: string | null; // null means "Unclassified", "all" means all branches
  branchName: string;
  filterState: any;
  canView: boolean;
  mode?: "all" | "revenue";
}

export function BranchInvoiceChart({
  branchId,
  branchName,
  filterState,
  canView,
  mode = "all",
}: BranchInvoiceChartProps) {
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
  const lineProfit = theme.mode === "dark" ? "#2dd4bf" : "#0d9488"; // Teal 400 / 600

  const cashTrendLabels = useMemo(
    () => statsData?.cashTrend?.map((t: any) => t.label) || [],
    [statsData],
  );
  const cashTrendIn = useMemo(
    () => statsData?.cashTrend?.map((t: any) => t.cashIn) || [],
    [statsData],
  );
  const cashTrendOut = useMemo(
    () => statsData?.cashTrend?.map((t: any) => -t.cashOut) || [],
    [statsData],
  );
  const cashProfit = useMemo(
    () => statsData?.cashTrend?.map((t: any) => t.cashIn - t.cashOut) || [],
    [statsData],
  );

  const series = useMemo(() => {
    const list: V2ComboSeries[] = [];

    if (mode === "all") {
      list.push({
        key: "expense",
        type: "bar",
        data: cashTrendOut,
        color: colorExpense,
        label: "HĐ Đầu vào (Chi phí)",
      });
    }

    list.push({
      key: "revenue",
      type: "bar",
      data: cashTrendIn,
      color: colorRevenue,
      label: "HĐ Đầu ra (Doanh thu)",
    });

    if (mode === "all") {
      list.push({
        key: "profit",
        type: "line",
        data: cashProfit,
        color: lineProfit,
        borderColor: lineProfit,
        borderWidth: 2.5,
        tension: 0.3,
        label: "Lợi nhuận (Đầu ra - Đầu vào)",
      });
    }

    return list;
  }, [
    mode,
    cashTrendOut,
    cashTrendIn,
    cashProfit,
    colorExpense,
    colorRevenue,
    lineProfit,
  ]);

  return (
    <Panel title={branchName} extra={<PanelMore />}>
      <V2ComboChart
        labels={cashTrendLabels}
        series={series}
        height={280}
        loading={isLoadingStats}
        formatValue={(v) => shortMoney(Number(v))}
        ariaLabel={`Biểu đồ biến động hóa đơn chi nhánh ${branchName}`}
      />
    </Panel>
  );
}
