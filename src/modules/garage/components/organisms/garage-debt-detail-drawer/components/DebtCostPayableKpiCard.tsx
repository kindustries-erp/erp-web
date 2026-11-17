import React from "react";
import { Truck } from "lucide-react";
import { Badge } from "@/v2/shared/ui/badge";
import { V2Text } from "@/v2/shared/components/atoms/v2-text";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { GarageTrendItem } from "@/modules/garage/api/garageDashboardApi";

export interface DebtCostPayableKpiCardProps {
  item: GarageTrendItem;
}

export const DebtCostPayableKpiCard: React.FC<DebtCostPayableKpiCardProps> = ({
  item,
}) => {
  const totalCost = item.cost ?? 0;
  const totalPaid = item.paidCost ?? 0;
  const totalPayable = item.payableCost ?? Math.max(0, totalCost - totalPaid);
  const paymentRate =
    item.costPaymentRate ?? (totalCost > 0 ? (totalPaid / totalCost) * 100 : 0);
  const isHighRate = paymentRate >= 90;

  const costWithInv = item.costWithInvoice ?? 0;
  const payableWithInv = item.payableCostWithInvoice ?? 0;
  const costNoInv = item.costNoInvoice ?? 0;
  const payableNoInv = item.payableCostNoInvoice ?? 0;

  return (
    <div className="flex flex-col rounded-lg border border-border/25 dark:border-white/[0.04] bg-surface/30 dark:bg-white/[0.015] p-2.5 gap-2 w-full">
      {/* Header Compact */}
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 rounded bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <V2Text
            variant="caption"
            className="font-bold uppercase tracking-wider text-foreground truncate"
          >
            Chi phí DV & Phụ tùng
          </V2Text>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "font-bold text-[11px] tabular-nums px-1.5 py-0 shrink-0",
            isHighRate
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
          )}
        >
          {paymentRate.toFixed(1)}% Trả
        </Badge>
      </div>

      {/* 3-Column Metrics: Phát sinh | Đã trả | Còn nợ */}
      <div className="grid grid-cols-3 gap-1.5 py-1.5 px-2 rounded-md bg-muted/20 dark:bg-white/[0.02]">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-fg font-medium uppercase tracking-tight">
            Phát sinh
          </span>
          <span className="text-xs font-semibold font-mono text-foreground tabular-nums">
            {money(totalCost)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-fg font-medium uppercase tracking-tight">
            Đã trả
          </span>
          <span className="text-xs font-semibold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {money(totalPaid)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-fg font-medium uppercase tracking-tight">
            Còn nợ
          </span>
          <span
            className={cn(
              "text-xs font-bold font-mono tabular-nums",
              totalPayable > 0
                ? "text-amber-600 dark:text-amber-400"
                : "text-muted-fg/60",
            )}
          >
            {totalPayable > 0 ? money(totalPayable) : "0 đ"}
          </span>
        </div>
      </div>

      {/* Invoice Breakdown Details */}
      {(costWithInv > 0 ||
        costNoInv > 0 ||
        payableWithInv > 0 ||
        payableNoInv > 0) && (
        <div className="flex flex-col gap-0.5 text-[11px] text-muted-fg pt-0.5">
          <div className="flex items-center justify-between">
            <span>Có HĐ:</span>
            <span className="font-mono text-foreground">
              {money(costWithInv)}{" "}
              {payableWithInv > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  (nợ {money(payableWithInv)})
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Không HĐ:</span>
            <span className="font-mono text-foreground">
              {money(costNoInv)}{" "}
              {payableNoInv > 0 && (
                <span className="text-amber-600 dark:text-amber-400">
                  (nợ {money(payableNoInv)})
                </span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
