import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";

interface CustomerCaseAgingBadgeCellProps {
  balance: number;
  agingDays: number;
}

export const CustomerCaseAgingBadgeCell = React.memo(
  function CustomerCaseAgingBadgeCell({
    balance,
    agingDays,
  }: CustomerCaseAgingBadgeCellProps) {
    if (balance <= 0) {
      return (
        <Badge
          variant="outline"
          className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
        >
          0d
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] font-mono",
          agingDays > 90
            ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
            : agingDays > 30
              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
              : "bg-slate-500/10 text-muted-foreground border-slate-500/20",
        )}
      >
        {agingDays}d
      </Badge>
    );
  },
);
