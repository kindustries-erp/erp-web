import React from "react";
import { Truck } from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import type { GarageTrendItem } from "../../../../api/garageDashboardApi";

interface MonthCostPayableKpiCardProps {
  item: GarageTrendItem;
}

export const MonthCostPayableKpiCard: React.FC<
  MonthCostPayableKpiCardProps
> = ({ item }) => {
  const totalCost = item.cost ?? 0;
  const totalPaid = item.paidCost ?? 0;
  const totalPayable = item.payableCost ?? Math.max(0, totalCost - totalPaid);
  const paymentRate =
    item.costPaymentRate ?? (totalCost > 0 ? (totalPaid / totalCost) * 100 : 0);

  const costWithInv = item.costWithInvoice ?? 0;
  const payableWithInv = item.payableCostWithInvoice ?? 0;
  const costNoInv = item.costNoInvoice ?? 0;
  const payableNoInv = item.payableCostNoInvoice ?? 0;

  return (
    <div className="flex flex-col rounded-xl border border-border/70 bg-gradient-to-br from-amber-500/[0.04] to-transparent p-3.5 gap-2.5 relative overflow-hidden w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Chi phí Dịch vụ & Phụ tùng
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Phải trả nhà cung cấp, phụ tùng và đối tác gia công
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="font-bold text-xs tabular-nums px-2 py-0.5 bg-background border-border"
        >
          {paymentRate.toFixed(1)}% Đã trả
        </Badge>
      </div>

      {/* 3-Column Metrics: Phát sinh | Đã trả | Còn nợ */}
      <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50 bg-background/50 rounded-lg px-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Phát sinh
          </span>
          <span className="text-xs font-bold font-mono text-foreground tabular-nums">
            {money(totalCost)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Đã trả
          </span>
          <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
            {money(totalPaid)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase">
            Còn nợ
          </span>
          <span
            className={cn(
              "text-xs font-bold font-mono tabular-nums",
              totalPayable > 0
                ? "text-amber-600 dark:text-amber-400 font-bold"
                : "text-muted-foreground/60",
            )}
          >
            {totalPayable > 0 ? money(totalPayable) : "0 đ"}
          </span>
        </div>
      </div>

      {/* Invoice Breakdown Details (nếu có dữ liệu phát sinh có/không HĐ) */}
      {(costWithInv > 0 ||
        costNoInv > 0 ||
        payableWithInv > 0 ||
        payableNoInv > 0) && (
        <div className="flex flex-col gap-1 text-[11px] text-muted-foreground pt-0.5">
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
