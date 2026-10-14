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
import { useInvoicePartnerColumns } from "./useInvoicePartnerColumns";

interface MonthInvoicePartnerTableProps {
  items: MonthlyReceivablesGroupItem[];
  tableId: string;
  totalBilled?: number;
  onSelectGroup?: (group: MonthlyReceivablesGroupItem) => void;
}

export const MonthInvoicePartnerTable: React.FC<
  MonthInvoicePartnerTableProps
> = ({ items, tableId, totalBilled = 0, onSelectGroup }) => {
  const { t } = useTranslation("garage");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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
    <div className="w-full min-w-0">
      <DataTable
        items={pageItems}
        getRowKey={(row) => row.key}
        variant="spreadsheet"
        columns={columns}
        summaryRow={summaryRow}
        emptyLabel={t(
          "progress.partnerTableEmpty",
          "Không có đối tượng hóa đơn",
        )}
        enableColumnResizing
        tableId={tableId}
        page={page}
        pageSize={pageSize}
        pageSizeOptions={[5, 10, 20]}
        total={filteredItems.length}
        totalPages={totalPages}
        onPage={setPage}
        onPageSize={(nextPageSize) => {
          setPageSize(nextPageSize);
          setPage(1);
        }}
        containerClassName="max-h-[360px] overflow-x-auto overflow-y-auto [--table-header-bg:var(--surface)] [&_thead]:!bg-[var(--surface)] [&_thead]:!backdrop-blur-none [&_thead]:!shadow-[0_1px_0_0_var(--border)] [&_th]:border-border/80"
        onRowClick={(row) => onSelectGroup?.(row)}
      />
    </div>
  );
};
