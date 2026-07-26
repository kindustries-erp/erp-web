import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PanelRightOpen } from "lucide-react";
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
        size: 150,
        className: "text-left",
        headerClassName: "text-left",
        cell: (row: any) => (
          <div className="truncate" title={row.taxCode || ""}>
            {row.taxCode || "—"}
          </div>
        ),
      },
      {
        key: "partnerName",
        header: "Đối tác",
        className: "text-left w-full",
        headerClassName: "w-full text-left",
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
          variant="spreadsheet"
        />
      </div>
    </div>
  );
}
