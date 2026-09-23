import React from "react";
import type { TFunction } from "i18next";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { PaymentProgressTotals } from "../types";

export function getReceiptSummaryRow(
  totals: PaymentProgressTotals,
  t: TFunction,
) {
  return {
    index: (
      <span className="w-full block text-center font-bold text-muted-foreground">
        Σ
      </span>
    ),
    label: (
      <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
        {t("progress.summary.total", "TỔNG CỘNG")}
      </span>
    ),
    caseCount: (
      <span className="font-bold text-center block tabular-nums text-foreground">
        {totals.caseCount} phiếu
      </span>
    ),
    revenue: (
      <span className="font-bold text-right block tabular-nums text-foreground font-mono">
        {money(totals.revenue)}
      </span>
    ),
    tienCoThue: (
      <Tooltip
        content={
          totals.billed > 0
            ? `Đã thu: ${money(totals.paid)} / ${money(totals.billed)} (${(totals.billed > 0 ? (totals.paid / totals.billed) * 100 : 0).toFixed(1)}%) • Còn phải thu: ${money(totals.receivable)}`
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
                totals.receivable <= 0 && totals.paid > 0
                  ? "bg-emerald-500 dark:bg-emerald-400"
                  : totals.paid <= 0
                    ? "bg-transparent"
                    : "bg-emerald-600 dark:bg-emerald-500",
              )}
              style={{
                width: `${Math.min(100, Math.max(0, totals.billed > 0 ? (totals.paid / totals.billed) * 100 : 0))}%`,
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
    receivable: (
      <span
        className={cn(
          "font-mono font-bold text-right block tabular-nums",
          totals.receivable > 0
            ? "text-foreground"
            : "text-muted-foreground/60",
        )}
      >
        {money(totals.receivable)}
      </span>
    ),
    receivableWithInvoice: (
      <span
        className={cn(
          "font-mono font-bold text-right block tabular-nums",
          totals.receivableWithInvoice > 0
            ? "text-foreground"
            : "text-muted-foreground/60",
        )}
      >
        {money(totals.receivableWithInvoice)}
      </span>
    ),
    receivableNoInvoice: (
      <span
        className={cn(
          "font-mono font-bold text-right block tabular-nums",
          totals.receivableNoInvoice > 0
            ? "text-foreground"
            : "text-muted-foreground/60",
        )}
      >
        {money(totals.receivableNoInvoice)}
      </span>
    ),
  };
}

export function getPaymentSummaryRow(
  totals: PaymentProgressTotals,
  t: TFunction,
) {
  return {
    index: (
      <span className="w-full block text-center font-bold text-muted-foreground">
        Σ
      </span>
    ),
    label: (
      <span className="font-bold text-center block uppercase tracking-wider text-xs text-foreground">
        {t("progress.summary.total", "TỔNG CỘNG")}
      </span>
    ),
    caseCount: (
      <span className="font-bold text-center block tabular-nums text-foreground">
        {totals.caseCount} phiếu
      </span>
    ),
    cost: (
      <Tooltip
        content={
          totals.cost > 0
            ? `Đã trả: ${money(totals.paidCost)} / ${money(totals.cost)} (${(totals.cost > 0 ? (totals.paidCost / totals.cost) * 100 : 0).toFixed(1)}%) • Còn phải trả: ${money(totals.payableCost)}`
            : undefined
        }
        side="top"
      >
        <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
          <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
            <span className="font-bold text-foreground font-mono">
              {money(totals.cost)}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                totals.payableCost <= 0 && totals.paidCost > 0
                  ? "bg-emerald-500 dark:bg-emerald-400"
                  : totals.paidCost <= 0
                    ? "bg-transparent"
                    : "bg-slate-600 dark:bg-slate-400",
              )}
              style={{
                width: `${Math.min(100, Math.max(0, totals.cost > 0 ? (totals.paidCost / totals.cost) * 100 : 0))}%`,
              }}
            />
          </div>
        </div>
      </Tooltip>
    ),
    paidCost: (
      <span className="font-bold text-right block tabular-nums text-foreground font-mono">
        {money(totals.paidCost)}
      </span>
    ),
    payableCost: (
      <span
        className={cn(
          "font-mono font-bold text-right block tabular-nums",
          totals.payableCost > 0
            ? "text-foreground"
            : "text-muted-foreground/60",
        )}
      >
        {money(totals.payableCost)}
      </span>
    ),
    payableCostWithInvoice: (
      <span
        className={cn(
          "font-mono font-bold text-right block tabular-nums",
          totals.payableCostWithInvoice > 0
            ? "text-foreground"
            : "text-muted-foreground/60",
        )}
      >
        {money(totals.payableCostWithInvoice)}
      </span>
    ),
    payableCostNoInvoice: (
      <span
        className={cn(
          "font-mono font-bold text-right block tabular-nums",
          totals.payableCostNoInvoice > 0
            ? "text-foreground"
            : "text-muted-foreground/60",
        )}
      >
        {money(totals.payableCostNoInvoice)}
      </span>
    ),
  };
}
