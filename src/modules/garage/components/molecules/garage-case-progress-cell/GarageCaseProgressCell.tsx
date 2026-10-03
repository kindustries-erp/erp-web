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

  const barColor = isAllPaid
    ? "bg-emerald-500 dark:bg-emerald-400"
    : isUnpaid
      ? "bg-transparent"
      : type === "receivable"
        ? "bg-emerald-600 dark:bg-emerald-500"
        : "bg-slate-600 dark:bg-slate-400";

  return (
    <Tooltip content={tooltipText}>
      <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
        <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
          <span className="font-semibold text-foreground font-mono">
            {money(total)}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              barColor,
            )}
            style={{ width: `${rate}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
}
