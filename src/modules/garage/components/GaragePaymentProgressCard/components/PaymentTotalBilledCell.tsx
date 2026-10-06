import React from "react";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";

interface PaymentTotalBilledCellProps {
  item: GarageTrendItem;
}

export const PaymentTotalBilledCell: React.FC<PaymentTotalBilledCellProps> = ({
  item,
}) => {
  const total = item.tienCoThue || item.totalBilled || 0;
  const paid = item.paid || 0;
  const bal = item.receivable || 0;
  if (total <= 0) {
    return (
      <span className="text-muted-foreground/40 font-normal select-none">
        —
      </span>
    );
  }
  const isAllPaid = bal <= 0 && paid > 0;
  const isUnpaid = paid <= 0 && total > 0;
  const rate = item.collectionRate ?? (total > 0 ? (paid / total) * 100 : 0);

  const tooltipText = isAllPaid
    ? `Đã thu đủ 100%: ${money(paid)}`
    : isUnpaid
      ? `Chưa thu (0%): Còn phải thu ${money(bal)} / Tổng ${money(total)}`
      : `Đã thu: ${money(paid)} / ${money(total)} (${rate.toFixed(1)}%) • Còn phải thu: ${money(bal)}`;

  return (
    <Tooltip content={tooltipText} side="top">
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
              isAllPaid
                ? "bg-emerald-500 dark:bg-emerald-400"
                : isUnpaid
                  ? "bg-transparent"
                  : "bg-emerald-600 dark:bg-emerald-500",
            )}
            style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
};
