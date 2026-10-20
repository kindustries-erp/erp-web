import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
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
import {
  PaymentRemainingDebtCell,
  renderDebtAmount,
} from "../../garage-payment-progress-card/components/PaymentRemainingDebtCell";

export function MonthClassificationTable({
  rows,
  debtType,
  totalBilled,
  tableId,
  onSelectClassification,
}: MonthClassificationTableProps) {
  const { t } = useTranslation("garage");
  const tableHook = useTableColumnState(tableId);
  const isReceivable = debtType === "receivables";

  const compactHeader = (header: React.ReactNode, fullLabel: string) => (
    <Tooltip content={fullLabel} side="top">
      <span className="block min-w-0 truncate">{header}</span>
    </Tooltip>
  );

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
            {idx + 1}
          </span>
        ),
      },
      {
        key: "name",
        header: compactHeader(
          headerFilter(
            "name",
            isReceivable ? "LOẠI NGHIỆP VỤ" : "LOẠI CHI PHÍ",
            { align: "left" },
          ),
          isReceivable ? "Loại nghiệp vụ" : "Loại chi phí",
        ),
        size: 210,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        className: "text-left",
        cell: (row) => (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="flex items-center justify-start gap-2 cursor-pointer group text-left w-full h-auto py-1 px-1.5"
            onClick={() => onSelectClassification(row)}
          >
            <span className="shrink-0 group-hover:scale-110 transition-transform">
              {row.icon}
            </span>
            <span className="flex flex-col min-w-0 text-left">
              <span className="font-semibold text-foreground text-xs truncate group-hover:text-primary group-hover:underline">
                {row.name}
              </span>
              {row.subLabel && (
                <span className="text-[10px] text-muted-foreground truncate">
                  {row.subLabel}
                </span>
              )}
            </span>
          </Button>
        ),
      },
      {
        key: "caseCount",
        header: compactHeader(
          headerFilter.numeric("caseCount", "SỐ PHIẾU", { align: "center" }),
          "Số phiếu",
        ),
        size: 100,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className: "text-center tabular-nums text-muted-foreground",
        cell: (row) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
            {row.caseCount} phiếu
          </span>
        ),
      },
      {
        key: "billed",
        header: compactHeader(
          headerFilter.amount(
            "billed",
            isReceivable ? "TỔNG PHÁT SINH" : "TỔNG CHI PHÍ",
            { align: "right" },
          ),
          isReceivable ? "Tổng phát sinh" : "Tổng chi phí",
        ),
        size: 170,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums",
        cell: (row) => {
          const rate = row.rate;
          const label = isReceivable ? "thu" : "chi";
          const isAllPaid = row.remaining <= 0 && row.paid > 0;
          const isUnpaid = row.paid <= 0 && row.billed > 0;
          return (
            <Tooltip
              content={`Đã ${label}: ${money(row.paid)} / ${money(row.billed)} (${rate.toFixed(1)}%) • Còn ${isReceivable ? "thu" : "trả"}: ${money(row.remaining)}`}
            >
              <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(row.billed)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAllPaid
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : isUnpaid
                          ? "bg-transparent"
                          : isReceivable
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : "bg-slate-600 dark:bg-slate-400",
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
        header: compactHeader(
          headerFilter.amount("paid", isReceivable ? "ĐÃ THU" : "ĐÃ CHI", {
            align: "right",
          }),
          isReceivable ? "Đã thu" : "Đã chi",
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className:
          "text-right font-mono tabular-nums text-foreground font-medium",
        cell: (row) => (
          <span className="font-mono text-xs">{money(row.paid)}</span>
        ),
      },
      {
        key: "remaining",
        header: compactHeader(
          headerFilter.amount(
            "remaining",
            isReceivable ? "CÒN PHẢI THU" : "CÒN PHẢI TRẢ",
            { align: "right" },
          ),
          isReceivable ? "Còn phải thu" : "Còn phải trả",
        ),
        size: 150,
        enableResizing: true,
        headerClassName:
          "text-center bg-slate-100 dark:bg-slate-800/60 font-semibold border-r border-border/50",
        className:
          "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
        cell: (row) => (
          <PaymentRemainingDebtCell
            val={row.remaining || 0}
            prefix={isReceivable ? "Còn phải thu" : "Còn phải trả"}
          />
        ),
      },
      ...(isReceivable
        ? [
            {
              key: "remainingWithInvoice",
              header: compactHeader(
                headerFilter.amount(
                  "remainingWithInvoice",
                  "CÒN PHẢI THU CÓ HĐ",
                  { align: "right" },
                ),
                "Còn phải thu có HĐ",
              ),
              size: 160,
              enableResizing: true,
              headerClassName: "text-right font-semibold",
              className: "text-right font-medium tabular-nums font-mono",
              cell: (row: MonthClassificationRow) =>
                renderDebtAmount(row.remainingWithInvoice || 0),
            },
            {
              key: "remainingNoInvoice",
              header: compactHeader(
                headerFilter.amount(
                  "remainingNoInvoice",
                  "CÒN PHẢI THU KHÔNG HĐ",
                  { align: "right" },
                ),
                "Còn phải thu không HĐ",
              ),
              size: 165,
              enableResizing: true,
              headerClassName: "text-right font-semibold",
              className: "text-right font-medium tabular-nums font-mono",
              cell: (row: MonthClassificationRow) =>
                renderDebtAmount(row.remainingNoInvoice || 0),
            },
          ]
        : []),
      {
        key: "shareRate",
        header: compactHeader(
          headerFilter.numeric("shareRate", "TỶ TRỌNG", {
            align: "center",
          }),
          "Tỷ trọng",
        ),
        size: 90,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className: "text-center font-mono tabular-nums text-xs",
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
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      name: (
        <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
          TỔNG CỘNG
        </span>
      ),
      caseCount: (
        <span className="font-bold text-center block tabular-nums text-foreground">
          {totals.caseCount} phiếu
        </span>
      ),
      billed: (
        <Tooltip
          content={
            totals.billed > 0
              ? `Đã ${isReceivable ? "thu" : "chi"}: ${money(totals.paid)} / ${money(totals.billed)} (${rate.toFixed(1)}%) • Còn ${isReceivable ? "thu" : "trả"}: ${money(totals.remaining)}`
              : undefined
          }
          side="top"
        >
          <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
            <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
              <span className="font-bold text-foreground font-mono">
                {money(totals.billed)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  totals.remaining <= 0 && totals.paid > 0
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : totals.paid <= 0
                      ? "bg-transparent"
                      : isReceivable
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-slate-600 dark:bg-slate-400",
                )}
                style={{
                  width: `${Math.min(100, Math.max(0, rate))}%`,
                }}
              />
            </div>
          </div>
        </Tooltip>
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
      ...(isReceivable
        ? {
            remainingWithInvoice: (
              <span
                className={cn(
                  "font-mono font-bold text-right block tabular-nums",
                  totals.remainingWithInvoice > 0
                    ? "text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {totals.remainingWithInvoice > 0
                  ? money(totals.remainingWithInvoice)
                  : "—"}
              </span>
            ),
            remainingNoInvoice: (
              <span
                className={cn(
                  "font-mono font-bold text-right block tabular-nums",
                  totals.remainingNoInvoice > 0
                    ? "text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {totals.remainingNoInvoice > 0
                  ? money(totals.remainingNoInvoice)
                  : "—"}
              </span>
            ),
          }
        : {}),
      shareRate: (
        <span className="font-bold text-center block tabular-nums text-foreground font-mono text-xs">
          {totalBilled > 0
            ? `${((totals.billed / totalBilled) * 100).toFixed(1)}%`
            : "0.0%"}
        </span>
      ),
    };
  }, [filteredRows, isReceivable, totalBilled]);

  return (
    <DataTable
      items={filteredRows}
      getRowKey={(row) => row.key}
      variant="spreadsheet"
      columns={columns}
      summaryRow={summaryRow}
      emptyLabel={t(
        "progress.classificationEmpty",
        "Không tìm thấy phân loại phù hợp bộ lọc",
      )}
      enableColumnResizing
      tableId={tableId}
      containerClassName="max-h-[360px] overflow-x-auto overflow-y-auto"
      onRowClick={onSelectClassification}
    />
  );
}
