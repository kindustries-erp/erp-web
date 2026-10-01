import React, { useMemo } from "react";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
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
  const columns: DataTableColumn<GarageTimeHorizonCaseItem>[] = useMemo(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        className:
          "text-center w-[40px] min-w-[40px] font-mono text-xs text-muted-foreground",
        cell: (_, idx) => <span>{(page - 1) * pageSize + idx}</span>,
      },
      {
        key: "soChungTu",
        header: "Số chứng từ / Phiếu DV",
        size: 160,
        enableResizing: true,
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
        header: "Khách hàng",
        size: 220,
        enableResizing: true,
        cell: (row) => (
          <TableText
            text={row.customerName || "Khách lẻ"}
            tooltip={true}
            enableCopy={true}
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
        header: "Tổng tiền",
        size: 130,
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
        header: "Đã thu",
        size: 120,
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
        header: "Còn nợ",
        size: 130,
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
        header: "Ngày hoàn thành",
        size: 120,
        className: "text-right",
        enableResizing: true,
        cell: (row) => (
          <TableDateCell date={row.completionDate || ""} format="date" />
        ),
      },
      {
        key: "agingDays",
        header: "Tuổi nợ",
        size: 100,
        className: "text-center",
        enableResizing: true,
        cell: (row) => (
          <span className="font-mono text-xs font-semibold tabular-nums text-foreground">
            {row.agingDays} ngày
          </span>
        ),
      },
    ],
    [page, pageSize, onOpenCustomerDetail],
  );

  return (
    <div className="flex-1 min-h-[300px] flex flex-col">
      <DataTable
        items={items}
        columns={columns}
        getRowKey={(r) => r.id}
        loading={isLoading}
        emptyLabel="Không có vụ việc nào trong mốc thời gian này"
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPage={onPageChange}
        onPageSize={onPageSizeChange}
      />
    </div>
  );
};
