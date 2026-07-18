import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { StandardTable } from "@/shared/components/StandardTable";
import { erpInvoiceDashboardApi } from "@/modules/erp-invoices-core/api/erpInvoiceDashboardApi";
import { Tooltip } from "@/core/components/ui/Tooltip";

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

  const { data: partnersData, isLoading: isLoadingPartners } = useQuery({
    queryKey: [
      "invoice-dashboard-partners",
      type,
      page,
      pageSize,
      filterState.dateFrom,
      filterState.dateTo,
      branchId || "null",
    ],
    queryFn: () =>
      erpInvoiceDashboardApi.getPartners({
        page,
        pageSize,
        date_from: filterState.dateFrom || undefined,
        date_to: filterState.dateTo || undefined,
        branch_id: branchId || "null",
        sortBy: type === "receivable" ? "receivableAmount" : "payableAmount",
        sortOrder: "DESC",
      }),
    enabled: canView,
  });

  const columns = useMemo(() => {
    return [
      {
        key: "taxCode",
        header: "MST",
        className: "text-left w-[110px]",
        headerClassName: "w-[110px]",
        cell: (row: any) =>
          row.taxCode ? (
            <Button
              variant="link"
              onClick={(e: any) => {
                e.stopPropagation();
                onRowClick(row);
              }}
              className="font-bold underline text-primary p-0 h-auto inline-block truncate max-w-[100px]"
              title={row.taxCode}
            >
              {row.taxCode}
            </Button>
          ) : (
            "—"
          ),
      },
      {
        key: "partnerName",
        header: "Đối tác",
        className: "text-left w-full",
        headerClassName: "w-full text-left",
        cell: (row: any) => (
          <Tooltip content={row.partnerName || "—"}>
            <div className="truncate max-w-[250px]">
              {row.partnerName || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "totalAmount",
        header: "Tổng HĐ",
        className: "text-right w-[110px]",
        headerClassName: "text-right w-[110px]",
        cell: (row: any) => {
          const amount =
            type === "receivable" ? row.totalOutAmount : row.totalInAmount;
          return <span>{money(amount)}</span>;
        },
      },
      {
        key: "amount",
        header: type === "receivable" ? "Còn phải thu" : "Còn phải trả",
        className: "text-right font-semibold w-[120px]",
        headerClassName: "text-right w-[120px]",
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
  }, [type, onRowClick]);

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
          minWidth={280}
          enableColumnResizing={false}
          page={page}
          pageSize={pageSize}
          total={partnersData?.total || 0}
          totalPages={partnersData?.totalPages || 0}
          onPage={setPage}
          onPageSize={setPageSize}
        />
      </div>
    </div>
  );
}
