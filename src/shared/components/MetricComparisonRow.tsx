import React from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export interface MetricComparisonRowProps {
  receivableLabel?: string;
  payableLabel?: string;
  netLabel?: string;
  receivable: number;
  payable: number;
  net?: number;
  showNet?: boolean;
  className?: string;
}

export function MetricComparisonRow({
  receivableLabel = "Phải thu (KH)",
  payableLabel = "Phải trả (NCC)",
  netLabel = "Vị thế ròng",
  receivable,
  payable,
  net,
  showNet = true,
  className,
}: MetricComparisonRowProps) {
  const calculatedNet = net !== undefined ? net : receivable - payable;
  const isNetPositive = calculatedNet >= 0;

  return (
    <div className={cn("space-y-1 my-1", className)}>
      <div className="flex justify-between text-xs tabular-nums">
        <span className="text-muted-foreground">{receivableLabel}:</span>
        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
          +{money(receivable)}
        </span>
      </div>

      <div className="flex justify-between text-xs tabular-nums">
        <span className="text-muted-foreground">{payableLabel}:</span>
        <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
          -{money(payable)}
        </span>
      </div>

      {showNet && (
        <div className="flex justify-between text-xs pt-1 border-t border-border/50 font-medium tabular-nums">
          <span className="text-muted-foreground">{netLabel}:</span>
          <span
            className={cn(
              "font-mono font-bold",
              isNetPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-700 dark:text-amber-400",
            )}
          >
            {isNetPositive ? "+" : ""}
            {money(calculatedNet)}
          </span>
        </div>
      )}
    </div>
  );
}
