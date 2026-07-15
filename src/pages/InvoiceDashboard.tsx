import React from "react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { DashboardTemplate } from "@/shared/components/DashboardTemplate";
import { Panel, PanelMore } from "@/shared/components/Panel";
import { ChartSkeleton } from "@/shared/components/Skeleton";
import { BarChart } from "@/shared/components/charts/BarChart";
import { useFilterPanel } from "@/shared/hooks/useFilterPanel";
import { getBranchesApi } from "@/modules/branches/api/branchApi";
import { money } from "@/shared/utils/format";
import { StandardTable } from "@/shared/components/StandardTable";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { PartnerInvoiceDrawer } from "@/modules/erp-invoices-core/components/PartnerInvoiceDrawer";
import { useAuthStore } from "@/modules/auth/domain/authStore";
import { ComingSoon } from "@/pages/ComingSoon";
import { useHasAnyPermission } from "@/shared/hooks/useHasPermission";

export function InvoiceDashboard() {
  const { employee } = useAuthStore();
  const isAdminEmail = employee?.email === "admin@liouni.com";

  const hasPerm = useHasAnyPermission(["invoices"], "read");
  const canView = hasPerm || isAdminEmail;

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [selectedPartner, setSelectedPartner] = React.useState<{
    taxCode: string;
    partnerName: string;
  } | null>(null);

  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(20);

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getBranchesApi(),
  });

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
      search: {
        placeholder: "Tìm đối tác (MST, tên)...",
      },
      custom,
    };
  }, [branches]);

  const filter = useFilterPanel(filterConfig, () => {
    setPage(1);
  });

  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: [
      "invoice-dashboard-stats",
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getStats({
        date_from: filter.state.dateFrom || undefined,
        date_to: filter.state.dateTo || undefined,
        branch_id: (filter.state.custom.branchId as string) || undefined,
      }),
    enabled: canView,
  });

  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: [
      "invoice-dashboard-partners",
      page,
      pageSize,
      filter.inputs.search,
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getPartners({
        page,
        pageSize,
        search: filter.inputs.search || undefined,
        date_from: filter.state.dateFrom || undefined,
        date_to: filter.state.dateTo || undefined,
        branch_id: (filter.state.custom.branchId as string) || undefined,
      }),
    enabled: canView,
  });

  const barIn = "#059669"; // Emerald 600
  const barOut = "#ea580c"; // Orange 600

  const cashTrendLabels = statsData?.cashTrend?.map((t: any) => t.label) || [];
  const cashTrendIn = statsData?.cashTrend?.map((t: any) => t.cashIn) || []; // Đầu ra
  const cashTrendOut = statsData?.cashTrend?.map((t: any) => t.cashOut) || []; // Đầu vào

  const handleRowClick = (row: any) => {
    if (row.taxCode) {
      setSelectedPartner({
        taxCode: row.taxCode,
        partnerName: row.partnerName,
      });
      setDrawerOpen(true);
    }
  };

  const partnerColumns = [
    {
      key: "taxCode",
      header: "Mã số thuế",
      size: 120,
      className: "font-medium text-left",
      cell: (row: any) => (
        <Button
          variant="link"
          onClick={(e: any) => {
            e.stopPropagation();
            handleRowClick(row);
          }}
          className="font-medium text-primary hover:underline p-0 h-auto"
        >
          {row.taxCode}
        </Button>
      ),
    },
    {
      key: "partnerName",
      header: "Tên đối tác",
      size: 250,
      className: "text-left",
      cell: (row: any) => (
        <div className="truncate max-w-[250px]" title={row.partnerName}>
          {row.partnerName || "—"}
        </div>
      ),
    },
    {
      key: "totalInAmount",
      header: "HĐ Đầu vào",
      size: 150,
      className: "text-right",
      cell: (row: any) => (
        <span
          className={
            row.totalInAmount > 0 ? "text-emerald-600 font-medium" : ""
          }
        >
          {money(row.totalInAmount)}
        </span>
      ),
    },
    {
      key: "totalOutAmount",
      header: "HĐ Đầu ra",
      size: 150,
      className: "text-right",
      cell: (row: any) => (
        <span
          className={
            row.totalOutAmount > 0 ? "text-orange-600 font-medium" : ""
          }
        >
          {money(row.totalOutAmount)}
        </span>
      ),
    },
    {
      key: "payableAmount",
      header: "Còn phải trả",
      size: 150,
      className: "text-right font-semibold text-emerald-700",
      cell: (row: any) => money(row.payableAmount),
    },
    {
      key: "receivableAmount",
      header: "Còn phải thu",
      size: 150,
      className: "text-right font-semibold text-orange-700",
      cell: (row: any) => money(row.receivableAmount),
    },
  ];

  if (!canView) {
    return <ComingSoon />;
  }

  return (
    <DashboardTemplate
      title="Tổng quan Hóa đơn"
      desc="Theo dõi dòng tiền hóa đơn và công nợ đối tác"
      icon={<LayoutDashboard className="h-4 w-4" />}
      filterConfig={filterConfig}
      filter={filter}
      loading={isLoadingStats || isLoadingPartners}
    >
      <div className="grid grid-cols-1 gap-3 mb-6">
        <Panel title="Biến động Hóa đơn Đầu vào / Đầu ra" extra={<PanelMore />}>
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
            <LegendItem color={barIn} label="HĐ Đầu vào (Chi phí)" />
            <LegendItem color={barOut} label="HĐ Đầu ra (Doanh thu)" />
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-3">
            Tình hình công nợ theo đối tác
          </h3>
          <div>
            <StandardTable
              items={partnersData?.items || []}
              columns={partnerColumns}
              getRowKey={(row: any) => row.taxCode}
              loading={isLoadingPartners}
              variant="spreadsheet"
              minWidth={900}
              enableColumnResizing={true}
              page={page}
              pageSize={pageSize}
              total={partnersData?.total || 0}
              totalPages={partnersData?.totalPages || 0}
              onPage={setPage}
              onPageSize={setPageSize}
            />
          </div>
        </div>
      </div>

      <PartnerInvoiceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        taxCode={selectedPartner?.taxCode}
        partnerName={selectedPartner?.partnerName}
        filterState={filter.state}
      />
    </DashboardTemplate>
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
