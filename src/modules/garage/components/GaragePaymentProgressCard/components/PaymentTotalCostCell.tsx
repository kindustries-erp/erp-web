import React from "react";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";

interface PaymentTotalCostCellProps {
  item: GarageTrendItem;
}

export const PaymentTotalCostCell: React.FC<PaymentTotalCostCellProps> = ({
  item,
}) => {
  const total = item.cost || 0;
  const paid = item.paidCost || 0;
  const bal = item.payableCost || 0;
  if (total <= 0) {
    return (
      <span className="text-muted-foreground/40 font-normal select-none">
        —
      </span>
    );
  }
  const isAllPaid = bal <= 0 && paid > 0;
  const isUnpaid = paid <= 0 && total > 0;
  const rate = item.costPaymentRate ?? (total > 0 ? (paid / total) * 100 : 0);

  const tooltipText = isAllPaid
    ? `Đã trả đủ 100%: ${money(paid)}`
    : isUnpaid
      ? `Chưa trả (0%): Còn phải trả ${money(bal)} / Tổng ${money(total)}`
      : `Đã trả: ${money(paid)} / ${money(total)} (${rate.toFixed(1)}%) • Còn phải trả: ${money(bal)}`;

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
                  : "bg-slate-600 dark:bg-slate-400",
            )}
            style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
          />
        </div>
      </div>
    </Tooltip>
  );
};
