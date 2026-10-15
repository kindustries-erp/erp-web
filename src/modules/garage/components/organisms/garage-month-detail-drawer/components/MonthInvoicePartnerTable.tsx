import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import type { MonthInvoiceCaseRow } from "./MonthInvoiceCaseRow.type";
import {
  flattenReceivablesGroupsToCases,
  calculateCasesTotals,
} from "./MonthInvoiceCaseRow.helper";
import { useInvoiceCaseColumns } from "./MonthInvoiceCaseTable.columns";

export interface MonthInvoicePartnerTableProps {
  items: MonthlyReceivablesGroupItem[];
  tableId: string;
  totalBilled?: number;
  debtType?: "receivables" | "payables";
  emptyLabel?: string;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
  onOpenCaseDetail?: (caseCode: string) => void;
}

export const MonthInvoicePartnerTable: React.FC<
  MonthInvoicePartnerTableProps
> = ({
  items,
  tableId,
  totalBilled = 0,
  debtType = "receivables",
  emptyLabel,
  onSelectGroup,
  onOpenCaseDetail,
}) => {
  const { t } = useTranslation("garage");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const tableHook = useTableColumnState(tableId);

  // Làm phẳng groups thành danh sách từng phiếu dịch vụ / xe
  const caseRows = useMemo(
    () => flattenReceivablesGroupsToCases(items, totalBilled, debtType),
    [items, totalBilled, debtType],
  );

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook,
        items: caseRows,
        defaultAlign: "center",
      }),
    [caseRows, tableHook],
  );

  const columns = useInvoiceCaseColumns({
    headerFilter,
    debtType,
    onOpenCaseDetail,
    onSelectGroup,
  });

  const filteredItems = useMemo(
    () => filterClientItems(caseRows, tableHook),
    [caseRows, tableHook],
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const filterStateKey = JSON.stringify({
    sorts: tableHook.sorts,
    columnFilters: tableHook.columnFilters,
    columnSearch: tableHook.columnSearch,
  });

  const pageItems = useMemo(
    () => filteredItems.slice((page - 1) * pageSize, page * pageSize),
    [filteredItems, page, pageSize],
  );

  useEffect(() => {
    setPage(1);
  }, [items, filterStateKey]);

  const summaryRow = useMemo(() => {
    const totals = calculateCasesTotals(filteredItems);
    const shareRate = totalBilled > 0 ? (totals.billed / totalBilled) * 100 : 0;

    return {
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      caseCode: "",
      partner: (
        <span className="font-bold text-xs uppercase tracking-wider text-foreground">
          TỔNG CỘNG ({totals.caseCount} phiếu
          {totals.vehicleCount > 0 ? ` • ${totals.vehicleCount} xe` : ""})
        </span>
      ),
      payerType: "",
      invoiceStatus: "",
      billed: (
        <span className="font-bold text-right block tabular-nums text-foreground font-mono">
          {money(totals.billed)}
        </span>
      ),
      paid: (
        <span className="font-bold text-right block tabular-nums text-foreground font-mono">
          {money(totals.paid)}
        </span>
      ),
      remaining: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums",
            totals.remaining > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {totals.remaining > 0 ? money(totals.remaining) : "—"}
        </span>
      ),
      shareRate: (
        <span className="font-bold text-center block tabular-nums text-foreground font-mono text-xs">
          {shareRate.toFixed(1)}%
        </span>
      ),
    };
  }, [filteredItems, totalBilled]);

  return (
    <div className="w-full min-w-0">
      <DataTable
        items={pageItems}
        getRowKey={(row: MonthInvoiceCaseRow) => row.id}
        variant="spreadsheet"
        columns={columns}
        summaryRow={summaryRow}
        emptyLabel={
          emptyLabel ||
          t("progress.partnerTableEmpty", "Không có đối tượng hóa đơn")
        }
        enableColumnResizing
        tableId={tableId}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20, 50]}
        total={filteredItems.length}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        containerClassName="max-h-[360px] overflow-x-auto overflow-y-auto"
      />
    </div>
  );
};

export const MonthInvoiceCaseTable = MonthInvoicePartnerTable;
