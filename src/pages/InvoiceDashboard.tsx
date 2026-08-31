import React from "react";
import { useQuery, useQueryClient, useIsFetching } from "@tanstack/react-query";
import { LayoutDashboard, Download } from "lucide-react";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Button } from "@/shared/components/ui/Button";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";
import { ErpResource, ErpAction } from "@/modules/system/types/rbac";
import { BranchInvoiceChart } from "./components/BranchInvoiceChart";
import { BranchVatChart } from "./components/BranchVatChart";
import { InvoiceStatsCards } from "./components/InvoiceStatsCards";
import { Switch } from "@/shared/components/ui/switch";
import { cn } from "@/shared/utils";

export function InvoiceDashboard() {
  const { employee } = useAuthStore();
  const queryClient = useQueryClient();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const hasPerm = useHasAnyPermission([ErpResource.INVOICES], ErpAction.READ);
  const canView = hasPerm || isAdminEmail;

  const [isExporting, setIsExporting] = React.useState(false);
  const [chartViewMode, setChartViewMode] = React.useState<"invoice" | "vat">(
    "invoice",
  );

  const { data: branches = [], isLoading: isLoadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

  const isFetchingStats = useIsFetching({
    queryKey: ["invoice-dashboard-stats"],
  });
  const isFetchingBranches = useIsFetching({ queryKey: ["branches"] });
  const isRefreshing =
    isLoadingBranches || isFetchingStats > 0 || isFetchingBranches > 0;

  const filterConfig = React.useMemo(() => {
    const custom: any[] = [
      {
        key: "branchId",
        label: "Chi nhánh",
        placeholder: "Tất cả chi nhánh",
        options: branches.map((b: any) => ({ value: b.id, label: b.name })),
      },
    ];

    return {
      period: true,
      noDefaultPeriod: true,
      custom,
    };
  }, [branches]);

  const filter = useFilterPanel(filterConfig, () => {});

  if (!canView) {
    return <ComingSoon />;
  }

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const params = {
        date_from: filter.state.dateFrom || undefined,
        date_to: filter.state.dateTo || undefined,
        branch_id: filter.state.custom.branchId as string | undefined,
      };

      const blob = await erpInvoiceDashboardApi.exportExcel(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
      a.download = `Bao_cao_Tong_quan_Hoa_don_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Đã tải xuống file báo cáo");
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };

  const selectedBranchId = filter.state.custom.branchId as string | undefined;

  // Determine which sections to render
  const sectionsToRender: Array<{ id: string | null; name: string }> = [];

  if (selectedBranchId) {
    const selectedBranch = branches.find((b: any) => b.id === selectedBranchId);
    if (selectedBranch) {
      sectionsToRender.push({
        id: selectedBranch.id,
        name: selectedBranch.name,
      });
    }
  } else {
    // Show all branches
    branches.forEach((b: any) => {
      sectionsToRender.push({
        id: b.id,
        name: b.name,
      });
    });
    // Plus unclassified
    sectionsToRender.push({
      id: null,
      name: "Chưa phân loại chi nhánh",
    });
  }

  return (
    <DashboardTemplate
      title="Tổng quan Hóa đơn"
      desc="Theo dõi dòng tiền hóa đơn và công nợ đối tác"
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isRefreshing}
      onRefresh={() => {
        queryClient.invalidateQueries({ queryKey: ["branches"] });
        queryClient.invalidateQueries({
          queryKey: ["invoice-dashboard-stats"],
        });
        queryClient.invalidateQueries({
          queryKey: ["erp-invoices-stats"],
        });
      }}
      extraActions={
        <Button
          onClick={handleExportExcel}
          disabled={isExporting || isLoadingBranches}
          variant="outline"
          className="h-8 gap-1"
        >
          <Download className="h-4 w-4" />
          Xuất Excel
        </Button>
      }
    >
      <div className="flex flex-col gap-6 mb-8">
        {/* KPI Summary Cards */}
        <InvoiceStatsCards direction="OUT" title="Hóa đơn Bán ra (Doanh thu)" />
        <InvoiceStatsCards direction="IN" title="Hóa đơn Mua vào (Chi phí)" />

        {/* Biểu đồ Biến động (Doanh thu / Chi phí hoặc Thuế VAT) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200/80 dark:border-slate-700 shadow-sm whitespace-nowrap">
                {chartViewMode === "vat"
                  ? "Biến động Thuế VAT (Đầu vào / Đầu ra)"
                  : "Biến động Hóa đơn (Doanh thu / Chi phí)"}
              </h4>
              <div className="h-px bg-slate-200/80 dark:bg-slate-700 flex-1 hidden sm:block" />
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <span
                className={cn(
                  "text-xs cursor-pointer select-none transition-colors",
                  chartViewMode === "invoice"
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setChartViewMode("invoice")}
              >
                Doanh thu / Chi phí
              </span>
              <Switch
                checked={chartViewMode === "vat"}
                onCheckedChange={(checked) =>
                  setChartViewMode(checked ? "vat" : "invoice")
                }
                aria-label="Chuyển đổi xem Doanh thu hoặc VAT"
              />
              <span
                className={cn(
                  "text-xs cursor-pointer select-none transition-colors",
                  chartViewMode === "vat"
                    ? "font-semibold text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setChartViewMode("vat")}
              >
                Thuế VAT
              </span>
            </div>
          </div>

          {chartViewMode === "invoice" ? (
            <>
              {!selectedBranchId && (
                <div className="mb-1">
                  <BranchInvoiceChart
                    key="chart-all"
                    branchId="all"
                    branchName="Tất cả chi nhánh (Tổng hợp)"
                    filterState={filter.state}
                    canView={canView}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sectionsToRender.map((section) => (
                  <BranchInvoiceChart
                    key={`chart-${section.id || "unclassified"}`}
                    branchId={section.id}
                    branchName={section.name}
                    filterState={filter.state}
                    canView={canView}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              {!selectedBranchId && (
                <div className="mb-4">
                  <BranchVatChart
                    key="vat-chart-all"
                    branchId="all"
                    branchName="Tất cả chi nhánh (Tổng hợp)"
                    filterState={filter.state}
                    canView={canView}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sectionsToRender.map((section) => (
                  <BranchVatChart
                    key={`vat-chart-${section.id || "unclassified"}`}
                    branchId={section.id}
                    branchName={section.name}
                    filterState={filter.state}
                    canView={canView}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardTemplate>
  );
}
