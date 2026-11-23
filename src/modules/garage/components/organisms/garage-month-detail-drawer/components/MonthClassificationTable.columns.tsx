import React from "react";
import { Button } from "@/shared/components/ui/Button";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { V2Column } from "@/v2/shared/components/organisms/v2-standard-table";
import { TableColumnAlign } from "@/v2/shared/types/v2-table";
import type { MonthClassificationRow } from "./MonthClassificationTable.type";
import {
  PaymentRemainingDebtCell,
  renderDebtAmount,
} from "../../garage-payment-progress-card/components/PaymentRemainingDebtCell";

interface UseMonthClassificationColumnsParams {
  isReceivable: boolean;
  onSelectClassification: (row: MonthClassificationRow) => void;
}

export function createMonthClassificationColumns({
  isReceivable,
  onSelectClassification,
}: UseMonthClassificationColumnsParams): V2Column<MonthClassificationRow>[] {
  return [
    {
      key: "name",
      label: isReceivable ? "Loại nghiệp vụ" : "Loại chi phí",
      size: 210,
      align: TableColumnAlign.LEFT,
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
      summary: {
        variant: "label",
        label: "TỔNG CỘNG",
      },
    },
    {
      key: "caseCount",
      label: "Số phiếu",
      size: 100,
      align: TableColumnAlign.CENTER,
      className: "text-center tabular-nums text-muted-foreground",
      cell: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
          {row.caseCount} phiếu
        </span>
      ),
      summary: {
        variant: "amount",
        accessor: (r) => r.caseCount,
        unit: "phiếu",
      },
    },
    {
      key: "billed",
      label: isReceivable ? "Tổng phát sinh" : "Tổng chi phí",
      size: 170,
      align: TableColumnAlign.RIGHT,
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
      summary: {
        variant: "amount",
        accessor: (r) => r.billed,
      },
    },
    {
      key: "paid",
      label: isReceivable ? "Đã thu" : "Đã chi",
      size: 140,
      align: TableColumnAlign.RIGHT,
      className:
        "text-right font-mono tabular-nums text-foreground font-medium",
      cell: (row) => (
        <span className="font-mono text-xs">{money(row.paid)}</span>
      ),
      summary: {
        variant: "amount",
        accessor: (r) => r.paid,
      },
    },
    {
      key: "remaining",
      label: isReceivable ? "Còn phải thu" : "Còn phải trả",
      size: 150,
      align: TableColumnAlign.RIGHT,
      className:
        "text-right font-medium tabular-nums bg-slate-50 dark:bg-slate-800/30 border-r border-border/30",
      cell: (row) => (
        <PaymentRemainingDebtCell
          val={row.remaining || 0}
          prefix={isReceivable ? "Còn phải thu" : "Còn phải trả"}
        />
      ),
      summary: {
        variant: "amount",
        accessor: (r) => r.remaining,
      },
    },
    ...(isReceivable
      ? [
          {
            key: "remainingWithInvoice",
            label: "Còn phải thu có HĐ",
            size: 160,
            align: TableColumnAlign.RIGHT,
            className: "text-right font-medium tabular-nums font-mono",
            cell: (row: MonthClassificationRow) =>
              renderDebtAmount(row.remainingWithInvoice || 0),
            summary: {
              variant: "amount" as const,
              accessor: (r: MonthClassificationRow) =>
                r.remainingWithInvoice || 0,
            },
          },
          {
            key: "remainingNoInvoice",
            label: "Còn phải thu không HĐ",
            size: 165,
            align: TableColumnAlign.RIGHT,
            className: "text-right font-medium tabular-nums font-mono",
            cell: (row: MonthClassificationRow) =>
              renderDebtAmount(row.remainingNoInvoice || 0),
            summary: {
              variant: "amount" as const,
              accessor: (r: MonthClassificationRow) =>
                r.remainingNoInvoice || 0,
            },
          },
        ]
      : []),
    {
      key: "shareRate",
      label: "Tỷ trọng",
      size: 90,
      align: TableColumnAlign.CENTER,
      className: "text-center font-mono tabular-nums text-xs",
      cell: (row) => `${row.shareRate.toFixed(1)}%`,
    },
  ];
}
