import React, { useMemo } from "react";
import {
  DataTable,
  createColumnHeaderFilter,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { TableText } from "@/shared/components/DataTable/TableText";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { GarageTimeHorizonCaseItem } from "@/modules/garage/api/garageDebtsAnalyticsApi";

export interface TimeHorizonCasesTabProps {
  items: GarageTimeHorizonCaseItem[];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onOpenCustomerDetail?: (code: string, name?: string) => void;
}

export const TimeHorizonCasesTab: React.FC<TimeHorizonCasesTabProps> = ({
  items,
  isLoading = false,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onOpenCustomerDetail,
}) => {
  const tableHook = useTableColumnState("garage-horizon-cases-table");

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook,
        items,
        defaultAlign: "left",
      }),
    [items, tableHook],
  );

  const columns: DataTableColumn<GarageTimeHorizonCaseItem>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 45,
        enableResizing: false,
        headerClassName: "text-center w-[45px] min-w-[45px]",
        className:
          "text-center w-[45px] min-w-[45px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => <span>{(page - 1) * pageSize + idx + 1}</span>,
      },
      {
        key: "soChungTu",
        header: headerFilter("soChungTu", "Số chứng từ / Phiếu DV"),
        size: 165,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-mono text-xs font-semibold text-foreground select-text">
              {row.soChungTu || "—"}
            </span>
            {row.bienSoXe && (
              <span className="text-[10px] text-muted-foreground font-mono">
                {row.bienSoXe}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "customerName",
        header: headerFilter("customerName", "Khách hàng"),
        size: 220,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        cell: (row) => (
          <TableText
            text={row.customerName || "Khách lẻ"}
            tooltip
            enableCopy
            textClassName="truncate text-foreground font-medium text-xs leading-tight select-text"
            onDetailClick={
              row.customerCode && onOpenCustomerDetail
                ? (e) => {
                    e?.stopPropagation();
                    onOpenCustomerDetail(row.customerCode!, row.customerName);
                  }
                : undefined
            }
          />
        ),
      },
      {
        key: "totalAmount",
        header: headerFilter.amount("totalAmount", "Tổng tiền", {
          align: "right",
        }),
        size: 130,
        headerClassName: "text-right font-semibold",
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <span className="font-mono text-xs font-medium tabular-nums text-foreground">
            {money(row.totalAmount || 0)}
          </span>
        ),
      },
      {
        key: "paidAmount",
        header: headerFilter.amount("paidAmount", "Đã thu", { align: "right" }),
        size: 120,
        headerClassName: "text-right font-semibold",
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <span className="font-mono text-xs tabular-nums text-emerald-600 dark:text-emerald-400">
            {money(row.paidAmount || 0)}
          </span>
        ),
      },
      {
        key: "balanceAmount",
        header: headerFilter.amount("balanceAmount", "Còn nợ", {
          align: "right",
        }),
        size: 130,
        headerClassName: "text-right font-semibold",
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <span
            className={cn(
              "font-mono text-xs font-bold tabular-nums",
              row.balanceAmount > 0
                ? "text-rose-600 dark:text-rose-400"
                : "text-emerald-600 dark:text-emerald-400",
            )}
          >
            {money(row.balanceAmount || 0)}
          </span>
        ),
      },
      {
        key: "completionDate",
        header: headerFilter("completionDate", "Ngày hoàn thành", {
          align: "right",
        }),
        size: 130,
        headerClassName: "text-right font-semibold",
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <TableDateCell date={row.completionDate || ""} format="date" />
        ),
      },
      {
        key: "agingDays",
        header: headerFilter.numeric("agingDays", "Tuổi nợ", {
          align: "center",
        }),
        size: 95,
        headerClassName: "text-center font-semibold",
        className: "text-center",
        enableResizing: true,
        cell: (row) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {row.agingDays} ngày
          </span>
        ),
      },
    ],
    [headerFilter, page, pageSize, onOpenCustomerDetail],
  );

  return (
    <div className="w-full min-w-0">
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(r) => r.id}
        loading={isLoading}
        emptyLabel="Không có vụ việc nào trong mốc thời gian này"
        variant="spreadsheet"
        enableColumnResizing
        tableId="garage-horizon-cases-table"
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 20, 50, 100]}
        total={total}
        totalPages={totalPages}
        onPage={onPageChange}
        onPageSize={onPageSizeChange}
        containerClassName="max-h-[calc(100vh-280px)] overflow-x-auto overflow-y-auto"
      />
    </div>
  );
};
