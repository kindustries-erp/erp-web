import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PanelRightOpen } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { StandardTable } from "@/shared/components/StandardTable";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";

interface BranchInvoiceTableProps {
  branchId: string | null;
  branchName: string;
  filterState: any;
  type: "receivable" | "payable";
  canView: boolean;
  onRowClick: (row: any) => void;
}

export function BranchInvoiceTable({
  branchId,
  branchName,
  filterState,
  type,
  canView,
  onRowClick,
}: BranchInvoiceTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // keep it small for side-by-side grids

  const tableState = useTableColumnState(
    `invoice-dashboard-${type}-${branchId || "all"}`,
  );

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
  };

  const renderHeaderFilter = (
    key: string,
    title: string,
    options?: { label: string; value: string }[],
  ) => (
    <TableColumnHeaderFilter
      title={title}
      align="center"
      sortState={getSortState(key)}
      onSortChange={(state) => handleSortChange(key, state)}
      searchValue={tableState.columnSearch[key] || ""}
      onSearchChange={(val) => handleSearchChange(key, val)}
      selectedFilters={tableState.columnFilters[key] || []}
      onFilterChange={(vals) => handleFilterChange(key, vals)}
      filterOptions={options}
    />
  );

  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: [
      "invoice-dashboard-partners",
      type,
      page,
      pageSize,
      filterState.dateFrom,
      filterState.dateTo,
      branchId || "null",
      tableState.columnSearch,
      tableState.columnFilters,
      tableState.sorts,
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getPartners({
        page,
        pageSize,
        date_from: filterState.dateFrom || undefined,
        date_to: filterState.dateTo || undefined,
        branch_id: branchId || "null",
        sortBy: tableState.sorts?.[0]
          ? tableState.sorts[0].replace(/^-/, "")
          : type === "receivable"
            ? "receivableAmount"
            : "payableAmount",
        sortOrder: tableState.sorts?.[0]?.startsWith("-") ? "DESC" : "ASC",
        column_search: JSON.stringify(tableState.columnSearch),
        column_filters: JSON.stringify(tableState.columnFilters),
      }),
    enabled: canView,
  });

  const taxCodeOptions = useMemo(() => {
    const options = new Set<string>();
    (partnersData?.items || []).forEach((row: any) => {
      if (row.taxCode) options.add(row.taxCode);
    });
    return Array.from(options).map((o) => ({ label: o, value: o }));
  }, [partnersData?.items]);

  const partnerNameOptions = useMemo(() => {
    const options = new Set<string>();
    (partnersData?.items || []).forEach((row: any) => {
      if (row.partnerName) options.add(row.partnerName);
    });
    return Array.from(options).map((o) => ({ label: o, value: o }));
  }, [partnersData?.items]);

  const columns = useMemo(() => {
    return [
      {
        key: "taxCode",
        header: renderHeaderFilter("taxCode", "MST", taxCodeOptions),
        size: 150,
        className: "text-left w-1/4",
        headerClassName: "text-left w-1/4",
        cell: (row: any) => (
          <div className="truncate" title={row.taxCode || ""}>
            {row.taxCode || "—"}
          </div>
        ),
      },
      {
        key: "partnerName",
        header: renderHeaderFilter(
          "partnerName",
          "Đối tác",
          partnerNameOptions,
        ),
        className: "text-left w-1/4",
        headerClassName: "text-left w-1/4",
        cell: (row: any) => (
          <div className="flex items-center gap-1.5 group w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e: any) => {
                e.stopPropagation();
                onRowClick(row);
              }}
              className="h-5 w-5 p-0 opacity-40 hover:opacity-100 hover:bg-slate-200 transition-all flex-shrink-0"
              title="Mở chi tiết"
            >
              <PanelRightOpen className="w-3.5 h-3.5 text-slate-700" />
            </Button>
            <Tooltip content={row.partnerName || "—"}>
              <span
                className="truncate flex-1 min-w-0"
                style={{ maxWidth: "calc(100% - 28px)" }}
              >
                {row.partnerName || "—"}
              </span>
            </Tooltip>
          </div>
        ),
      },
      {
        key: "totalAmount",
        header: renderHeaderFilter("totalAmount", "Tổng HĐ"),
        className: "text-right w-1/4",
        headerClassName: "text-right w-1/4",
        cell: (row: any) => {
          const amount =
            type === "receivable" ? row.totalOutAmount : row.totalInAmount;
          return <span>{money(amount)}</span>;
        },
      },
      {
        key: "amount",
        header: renderHeaderFilter(
          "amount",
          type === "receivable" ? "Còn phải thu" : "Còn phải trả",
        ),
        className: "text-right font-semibold w-1/4",
        headerClassName: "text-right w-1/4",
        cell: (row: any) => {
          const amount =
            type === "receivable" ? row.receivableAmount : row.payableAmount;
          return (
            <span
              className={
                type === "receivable" ? "text-orange-700" : "text-emerald-700"
              }
            >
              {money(amount)}
            </span>
          );
        },
      },
    ];
  }, [
    type,
    onRowClick,
    taxCodeOptions,
    partnerNameOptions,
    renderHeaderFilter,
  ]);

  const subTotalAmount = useMemo(() => {
    return (partnersData?.items || []).reduce((acc: number, row: any) => {
      const amount =
        type === "receivable" ? row.totalOutAmount : row.totalInAmount;
      return acc + (Number(amount) || 0);
    }, 0);
  }, [partnersData?.items, type]);

  const subAmount = useMemo(() => {
    return (partnersData?.items || []).reduce((acc: number, row: any) => {
      const amount =
        type === "receivable" ? row.receivableAmount : row.payableAmount;
      return acc + (Number(amount) || 0);
    }, 0);
  }, [partnersData?.items, type]);

  return (
    <div className="flex flex-col h-full">
      <h4 className="font-semibold text-sm text-slate-700 mb-2">
        {branchName}
      </h4>
      <div className="flex-1">
        <StandardTable
          items={partnersData?.items || []}
          columns={columns}
          getRowKey={(row: any) => row.taxCode}
          loading={isLoadingPartners}
          minWidth={600}
          enableColumnResizing={false}
          page={page}
          pageSize={pageSize}
          total={partnersData?.total || 0}
          totalPages={partnersData?.totalPages || 0}
          onPage={setPage}
          onPageSize={setPageSize}
          variant="spreadsheet"
          summaryRow={{
            partnerName: (
              <span className="font-semibold text-right block">Tổng</span>
            ),
            totalAmount: (
              <span className="font-semibold">{money(subTotalAmount)}</span>
            ),
            amount: (
              <span
                className={
                  type === "receivable"
                    ? "text-orange-700 font-semibold"
                    : "text-emerald-700 font-semibold"
                }
              >
                {money(subAmount)}
              </span>
            ),
          }}
        />
      </div>
    </div>
  );
}
