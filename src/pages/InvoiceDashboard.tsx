import React, { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
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

  const tableState = useTableColumnState("dashboard-partners");

  const getSortState = (key: string) => {
    if (tableState.sorts.includes(key)) return "asc";
    if (tableState.sorts.includes(`-${key}`)) return "desc";
    return "none";
  };
  const handleSortChange = (key: string, state: "asc" | "desc" | "none") => {
    tableState.setSort(key, state);
    setPage(1);
  };
  const handleSearchChange = (key: string, val: string) => {
    tableState.setColumnSearch(key, val);
    setPage(1);
  };
  const handleFilterChange = (key: string, vals: string[]) => {
    tableState.setColumnFilter(key, vals);
    setPage(1);
  };

  const fetchPartnerOptions = useCallback(
    async ({
      columnKey,
      search,
      pageParam,
    }: {
      columnKey: string;
      search: string;
      pageParam: number;
    }) => {
      if (columnKey !== "taxCode" && columnKey !== "partnerName") {
        return { items: [], total: 0, next: null };
      }
      const res = await erpInvoiceDashboardApi.getPartners({
        page: pageParam,
        pageSize: 20,
        search: search || undefined,
        date_from: filter.state.dateFrom || undefined,
        date_to: filter.state.dateTo || undefined,
        branch_id: (filter.state.custom.branchId as string) || undefined,
      });
      const items = res.items.map((p: any) => {
        const valStr = columnKey === "taxCode" ? p.taxCode : p.partnerName;
        return { label: valStr || "—", value: valStr || "" };
      });
      const uniqueItems = Array.from(
        new Map(items.map((item) => [item.value, item])).values(),
      );
      return {
        items: uniqueItems.filter((i) => i.value !== ""),
        total: res.total,
        next: res.page < res.totalPages ? res.page + 1 : null,
      };
    },
    [filter.state],
  );

  const combinedSearch =
    tableState.columnSearch["taxCode"] ||
    tableState.columnSearch["partnerName"] ||
    (tableState.columnFilters["taxCode"]?.length
      ? tableState.columnFilters["taxCode"][0]
      : undefined) ||
    (tableState.columnFilters["partnerName"]?.length
      ? tableState.columnFilters["partnerName"][0]
      : undefined) ||
    filter.inputs.search ||
    undefined;

  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: [
      "invoice-dashboard-partners",
      page,
      pageSize,
      combinedSearch,
      filter.state.dateFrom,
      filter.state.dateTo,
      filter.state.custom.branchId,
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getPartners({
        page,
        pageSize,
        search: combinedSearch,
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
      header: (
        <TableColumnHeaderFilter
          title="Mã số thuế"
          sortState={getSortState("taxCode")}
          onSortChange={(state) => handleSortChange("taxCode", state)}
          searchValue={tableState.columnSearch["taxCode"] || ""}
          onSearchChange={(val) => handleSearchChange("taxCode", val)}
          selectedFilters={tableState.columnFilters["taxCode"] || []}
          onFilterChange={(vals) => handleFilterChange("taxCode", vals)}
          align="center"
          columnKey="taxCode"
          requireSearchToFetchOptions={false}
          queryKeyPrefix="dashboard-invoice-options"
          allFilters={tableState.columnFilters}
          fetchOptions={fetchPartnerOptions}
        />
      ),
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
      header: (
        <TableColumnHeaderFilter
          title="Tên đối tác"
          sortState={getSortState("partnerName")}
          onSortChange={(state) => handleSortChange("partnerName", state)}
          searchValue={tableState.columnSearch["partnerName"] || ""}
          onSearchChange={(val) => handleSearchChange("partnerName", val)}
          selectedFilters={tableState.columnFilters["partnerName"] || []}
          onFilterChange={(vals) => handleFilterChange("partnerName", vals)}
          align="center"
          columnKey="partnerName"
          requireSearchToFetchOptions={false}
          queryKeyPrefix="dashboard-invoice-options"
          allFilters={tableState.columnFilters}
          fetchOptions={fetchPartnerOptions}
        />
      ),
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
      header: (
        <TableColumnHeaderFilter
          title="HĐ Đầu vào"
          sortState={getSortState("totalInAmount")}
          onSortChange={(state) => handleSortChange("totalInAmount", state)}
          searchValue={tableState.columnSearch["totalInAmount"] || ""}
          onSearchChange={(val) => handleSearchChange("totalInAmount", val)}
          selectedFilters={[]}
          onFilterChange={() => {}}
          align="center"
        />
      ),
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
      header: (
        <TableColumnHeaderFilter
          title="HĐ Đầu ra"
          sortState={getSortState("totalOutAmount")}
          onSortChange={(state) => handleSortChange("totalOutAmount", state)}
          searchValue={tableState.columnSearch["totalOutAmount"] || ""}
          onSearchChange={(val) => handleSearchChange("totalOutAmount", val)}
          selectedFilters={[]}
          onFilterChange={() => {}}
          align="center"
        />
      ),
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
      header: (
        <TableColumnHeaderFilter
          title="Còn phải trả"
          sortState={getSortState("payableAmount")}
          onSortChange={(state) => handleSortChange("payableAmount", state)}
          searchValue={tableState.columnSearch["payableAmount"] || ""}
          onSearchChange={(val) => handleSearchChange("payableAmount", val)}
          selectedFilters={[]}
          onFilterChange={() => {}}
          align="center"
        />
      ),
      size: 150,
      className: "text-right font-semibold text-emerald-700",
      cell: (row: any) => money(row.payableAmount),
    },
    {
      key: "receivableAmount",
      header: (
        <TableColumnHeaderFilter
          title="Còn phải thu"
          sortState={getSortState("receivableAmount")}
          onSortChange={(state) => handleSortChange("receivableAmount", state)}
          searchValue={tableState.columnSearch["receivableAmount"] || ""}
          onSearchChange={(val) => handleSearchChange("receivableAmount", val)}
          selectedFilters={[]}
          onFilterChange={() => {}}
          align="center"
        />
      ),
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
