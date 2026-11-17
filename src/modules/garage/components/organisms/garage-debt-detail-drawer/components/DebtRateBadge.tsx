import React from "react";
import { Badge } from "@/v2/shared/ui/badge";
import { cn } from "@/shared/utils";
import { Wallet, Truck } from "lucide-react";

export interface DebtRateBadgeProps {
  rate: number;
  isReceipt: boolean;
}

/** Badge "xx% Hoàn tất" ở tiêu đề drawer công nợ. */
export const DebtRateBadge: React.FC<DebtRateBadgeProps> = ({
  rate,
  isReceipt,
}) => (
  <Badge
    variant="outline"
    className={cn(
      "text-[11px] font-semibold px-2 py-0.5 border",
      rate >= 100
        ? isReceipt
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
          : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
        : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
    )}
  >
    {isReceipt ? (
      <Wallet className="w-3 h-3 inline mr-1" />
    ) : (
      <Truck className="w-3 h-3 inline mr-1" />
    )}
    {rate.toFixed(1)}% Hoàn tất
  </Badge>
);
