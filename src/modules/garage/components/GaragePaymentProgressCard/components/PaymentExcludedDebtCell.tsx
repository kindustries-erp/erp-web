import React from "react";
import { money } from "@/shared/utils/format";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { cn } from "@/shared/utils";

interface PaymentExcludedDebtCellProps {
  amount?: number;
  caseCount?: number;
  labelTooltipPrefix?: string;
}

export const PaymentExcludedDebtCell: React.FC<
  PaymentExcludedDebtCellProps
> = ({
  amount = 0,
  caseCount = 0,
  labelTooltipPrefix = "Không theo dõi công nợ",
}) => {
  if (!amount || amount <= 0) {
    return (
      <span className="font-mono text-muted-foreground/50 text-[11px] select-none block text-right">
        —
      </span>
    );
  }

  const tooltipText = `${labelTooltipPrefix}: ${money(amount)}${caseCount > 0 ? ` (${caseCount} phiếu)` : ""}`;

  return (
    <Tooltip content={tooltipText} side="top">
      <div className="flex flex-col items-end gap-0.5 justify-center cursor-default">
        <span
          className={cn(
            "font-mono font-medium text-[12px] tabular-nums text-slate-700 dark:text-slate-300",
          )}
        >
          {money(amount)}
        </span>
        {caseCount > 0 && (
          <span className="text-[10px] text-muted-foreground/80 font-sans leading-none">
            {caseCount} phiếu
          </span>
        )}
      </div>
    </Tooltip>
  );
};
