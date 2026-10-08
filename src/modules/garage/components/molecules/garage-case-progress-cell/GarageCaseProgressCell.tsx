import React from "react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { GarageCaseProgressCellProps } from "./GarageCaseProgressCell.type";

export function GarageCaseProgressCell({
  type,
  total,
  paid,
  balance,
}: GarageCaseProgressCellProps) {
  if (total <= 0 && balance <= 0 && paid <= 0) {
    return (
      <span className="text-muted-foreground/40 font-normal select-none">
        —
      </span>
    );
  }

  const isAllPaid = balance <= 0 && paid > 0;
  const isUnpaid = paid <= 0 && balance > 0;
  const rate =
    total > 0
      ? Math.min(100, Math.round((paid / total) * 100))
      : isAllPaid
        ? 100
        : 0;

  const paidLabel = type === "receivable" ? "Đã thu:" : "Đã trả:";
  const tooltipText =
    type === "receivable"
      ? isAllPaid
        ? `Đã thu đủ 100%: ${money(paid)}`
        : isUnpaid
          ? `Chưa thu (0%): Còn phải thu ${money(balance)} / Tổng ${money(total)}`
          : `Đã thu: ${money(paid)} / ${money(total)} (${rate}%) • Còn phải thu: ${money(balance)}`
      : isAllPaid
        ? `Đã trả đủ 100%: ${money(paid)}`
        : isUnpaid
          ? `Chưa trả (0%): Còn phải trả ${money(balance)} / Tổng ${money(total)}`
          : `Đã trả: ${money(paid)} / ${money(total)} (${rate}%) • Còn phải trả: ${money(balance)}`;

  const badgeColorClass = isAllPaid
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
    : isUnpaid
      ? "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
      : type === "receivable"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";

  const amountColorClass = isAllPaid
    ? "text-emerald-600 dark:text-emerald-400"
    : isUnpaid
      ? "text-muted-foreground"
      : type === "receivable"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-amber-700 dark:text-amber-400";

  return (
    <Tooltip content={tooltipText}>
      <div className="flex flex-col gap-0.5 w-full py-0.5 justify-center items-end text-right cursor-default select-none">
        {/* Hàng trên: Micro-label 'Đã thu:' / 'Đã trả:', Số tiền đã thanh toán, và Badge % */}
        <div className="flex items-center justify-end gap-1.5 w-full text-xs tabular-nums leading-tight">
          <span className="text-[10px] text-muted-foreground font-normal shrink-0">
            {paidLabel}
          </span>
          <span className={cn("font-semibold font-mono", amountColorClass)}>
            {money(paid)}
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-center px-1 py-0.2 rounded text-[9.5px] font-mono font-medium border leading-none shrink-0",
              badgeColorClass,
            )}
          >
            {rate}%
          </span>
        </div>
        {/* Hàng dưới: Micro-label 'Tổng:' và Số tiền tổng phát sinh */}
        <div className="flex items-center justify-end gap-1 w-full text-[11px] tabular-nums font-mono text-muted-foreground leading-tight">
          <span className="text-[10px] text-muted-foreground/70 font-normal shrink-0">
            Tổng:
          </span>
          <span className="font-medium text-foreground/85">{money(total)}</span>
        </div>
      </div>
    </Tooltip>
  );
}
