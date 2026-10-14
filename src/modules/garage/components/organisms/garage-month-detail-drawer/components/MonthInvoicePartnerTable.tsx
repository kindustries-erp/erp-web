import React, { useMemo } from "react";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { MonthlyReceivablesGroupItem } from "../../../../api/garageDashboardApi";
import { useInvoicePartnerColumns } from "./useInvoicePartnerColumns";

interface MonthInvoicePartnerTableProps {
  items: MonthlyReceivablesGroupItem[];
  title: string;
  tableId: string;
  totalBilled?: number;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
}

export const MonthInvoicePartnerTable: React.FC<
  MonthInvoicePartnerTableProps
> = ({ items, title, tableId, totalBilled = 0, onSelectGroup }) => {
  const tableHook = useTableColumnState(tableId);
  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook,
        items,
        defaultAlign: "center",
      }),
    [items, tableHook],
  );
  const columns = useInvoicePartnerColumns({ headerFilter, onSelectGroup });
  const filteredItems = useMemo(
    () => filterClientItems(items, tableHook),
    [items, tableHook],
  );

  const summaryRow = useMemo(() => {
    const totals = filteredItems.reduce(
      (acc, row) => ({
        billed: acc.billed + row.billed,
        paid: acc.paid + row.paid,
        remaining: acc.remaining + row.remaining,
        caseCount: acc.caseCount + row.caseCount,
      }),
      { billed: 0, paid: 0, remaining: 0, caseCount: 0 },
    );
    const shareRate = totalBilled > 0 ? (totals.billed / totalBilled) * 100 : 0;

    return {
      index: <span className="font-bold text-center block">Σ</span>,
      payerType: "",
      title: (
        <span className="font-bold text-xs uppercase tracking-wider">
          TỔNG CỘNG ({totals.caseCount} vụ việc)
        </span>
      ),
      hasInvoice: "",
      caseCount: (
        <span className="font-bold text-center block">{totals.caseCount}</span>
      ),
      billed: (
        <span className="font-bold tabular-nums">{money(totals.billed)}</span>
      ),
      paid: (
        <span className="font-bold tabular-nums text-emerald-600">
          {money(totals.paid)}
        </span>
      ),
      remaining: (
        <span
          className={cn(
            "font-bold tabular-nums",
            totals.remaining > 0
              ? "text-amber-600"
              : "text-muted-foreground/60",
          )}
        >
          {totals.remaining > 0 ? money(totals.remaining) : "—"}
        </span>
      ),
      shareRate: `${shareRate.toFixed(1)}%`,
      actions: "",
    };
  }, [filteredItems, totalBilled]);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {filteredItems.length}/{items.length} đối tượng
        </span>
      </div>
      <DataTable
        items={filteredItems}
        getRowKey={(row) => row.key}
        variant="spreadsheet"
        columns={columns}
        summaryRow={summaryRow}
        emptyLabel="Không có đối tượng hóa đơn"
        enableColumnResizing
        tableId={tableId}
        onRowClick={(row) => onSelectGroup?.(row)}
      />
    </section>
  );
};
