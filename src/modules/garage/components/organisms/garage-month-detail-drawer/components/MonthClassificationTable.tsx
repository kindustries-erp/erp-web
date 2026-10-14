import React, { useMemo } from "react";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/Button";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type {
  MonthClassificationRow,
  MonthClassificationTableProps,
} from "./MonthClassificationTable.type";

export function MonthClassificationTable({
  rows,
  debtType,
  totalBilled,
  tableId,
  title,
  onSelectClassification,
}: MonthClassificationTableProps) {
  const tableHook = useTableColumnState(tableId);
  const isReceivable = debtType === "receivables";

  const headerFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: tableHook,
        items: rows,
        defaultAlign: "center",
      }),
    [rows, tableHook],
  );

  const filteredRows = useMemo(
    () => filterClientItems(rows, tableHook),
    [rows, tableHook],
  );

  const columns = useMemo<DataTableColumn<MonthClassificationRow>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_row, idx) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "name",
        header: headerFilter("name", "Loại nghiệp vụ", { align: "left" }),
        size: 210,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        className: "text-left",
        cell: (row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 cursor-pointer group text-left w-full"
            onClick={() => onSelectClassification(row)}
          >
            <span className="shrink-0 group-hover:scale-110 transition-transform">
              {row.icon}
            </span>
            <span className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-xs truncate group-hover:text-primary group-hover:underline">
                {row.name}
              </span>
              {row.subLabel && (
                <span className="text-[10px] text-muted-foreground truncate">
                  {row.subLabel}
                </span>
              )}
            </span>
            {row.caseCount > 0 && (
              <Badge
                variant="outline"
                className="ml-auto text-[10px] px-1.5 py-0 shrink-0"
              >
                {row.caseCount}p
              </Badge>
            )}
          </Button>
        ),
      },
      {
        key: "billed",
        header: headerFilter.amount("billed", "Tổng phát sinh", {
          align: "right",
        }),
        size: 150,
        enableResizing: true,
        className: "text-right font-mono tabular-nums",
        cell: (row) => {
          const rate = row.rate;
          const label = isReceivable ? "thu" : "trả";
          return (
            <Tooltip
              content={`Đã ${label}: ${money(row.paid)} / ${money(row.billed)} (${rate.toFixed(1)}%)`}
            >
              <div className="flex flex-col gap-1 w-full">
                <span className="font-semibold text-xs">
                  {money(row.billed)}
                </span>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      row.remaining <= 0 && row.paid > 0
                        ? "bg-emerald-500"
                        : isReceivable
                          ? "bg-emerald-600"
                          : "bg-slate-600",
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: "paid",
        header: headerFilter.amount(
          "paid",
          isReceivable ? "Đã thu" : "Đã chi",
          { align: "right" },
        ),
        size: 140,
        enableResizing: true,
        className: "text-right font-mono tabular-nums",
        cell: (row) => (
          <span className="font-semibold text-xs">{money(row.paid)}</span>
        ),
      },
      {
        key: "remaining",
        header: headerFilter.amount(
          "remaining",
          isReceivable ? "Còn phải thu" : "Còn phải trả",
          { align: "right" },
        ),
        size: 140,
        enableResizing: true,
        className: "text-right font-mono tabular-nums",
        cell: (row) => (
          <span
            className={cn(
              "text-xs",
              row.remaining > 0
                ? isReceivable
                  ? "font-bold text-amber-600"
                  : "font-bold text-orange-600"
                : "text-muted-foreground/60",
            )}
          >
            {row.remaining > 0 ? money(row.remaining) : "—"}
          </span>
        ),
      },
      {
        key: "remainingWithInvoice",
        header: headerFilter.amount(
          "remainingWithInvoice",
          isReceivable ? "Còn phải thu có HĐ" : "Còn phải trả có HĐ",
          { align: "right" },
        ),
        size: 150,
        enableResizing: true,
        className: "text-right font-mono tabular-nums",
        cell: (row) =>
          row.remainingWithInvoice > 0 ? money(row.remainingWithInvoice) : "—",
      },
      {
        key: "remainingNoInvoice",
        header: headerFilter.amount(
          "remainingNoInvoice",
          isReceivable ? "Còn phải thu không HĐ" : "Còn phải trả không HĐ",
          { align: "right" },
        ),
        size: 160,
        enableResizing: true,
        className: "text-right font-mono tabular-nums",
        cell: (row) =>
          row.remainingNoInvoice > 0 ? money(row.remainingNoInvoice) : "—",
      },
      {
        key: "shareRate",
        header: headerFilter.numeric("shareRate", "Tỷ trọng", {
          align: "center",
        }),
        size: 90,
        enableResizing: true,
        className: "text-center tabular-nums",
        cell: (row) => `${row.shareRate.toFixed(1)}%`,
      },
    ],
    [headerFilter, isReceivable, onSelectClassification],
  );

  const summaryRow = useMemo(() => {
    const totals = filteredRows.reduce(
      (acc, row) => ({
        billed: acc.billed + row.billed,
        paid: acc.paid + row.paid,
        remaining: acc.remaining + row.remaining,
        remainingWithInvoice:
          acc.remainingWithInvoice + row.remainingWithInvoice,
        remainingNoInvoice: acc.remainingNoInvoice + row.remainingNoInvoice,
        caseCount: acc.caseCount + row.caseCount,
      }),
      {
        billed: 0,
        paid: 0,
        remaining: 0,
        remainingWithInvoice: 0,
        remainingNoInvoice: 0,
        caseCount: 0,
      },
    );
    const rate = totals.billed > 0 ? (totals.paid / totals.billed) * 100 : 0;

    return {
      index: <span className="font-bold text-center block">Σ</span>,
      name: (
        <span className="font-bold text-xs uppercase">
          TỔNG CỘNG ({totals.caseCount} phiếu)
        </span>
      ),
      billed: (
        <Tooltip
          content={`Đã thanh toán: ${money(totals.paid)} (${rate.toFixed(1)}%)`}
        >
          <span className="font-bold tabular-nums">{money(totals.billed)}</span>
        </Tooltip>
      ),
      paid: (
        <span className="font-bold tabular-nums">{money(totals.paid)}</span>
      ),
      remaining: (
        <span className="font-bold tabular-nums">
          {totals.remaining > 0 ? money(totals.remaining) : "—"}
        </span>
      ),
      remainingWithInvoice:
        totals.remainingWithInvoice > 0
          ? money(totals.remainingWithInvoice)
          : "—",
      remainingNoInvoice:
        totals.remainingNoInvoice > 0 ? money(totals.remainingNoInvoice) : "—",
      shareRate: `${totalBilled > 0 ? ((totals.billed / totalBilled) * 100).toFixed(1) : "0.0"}%`,
    };
  }, [filteredRows, totalBilled]);

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">
          {filteredRows.length}/{rows.length} phân loại
        </span>
      </div>
      <DataTable
        items={filteredRows}
        getRowKey={(row) => row.key}
        variant="spreadsheet"
        columns={columns}
        summaryRow={summaryRow}
        emptyLabel="Không tìm thấy phân loại phù hợp bộ lọc"
        enableColumnResizing
        tableId={tableId}
        onRowClick={onSelectClassification}
      />
    </section>
  );
}
