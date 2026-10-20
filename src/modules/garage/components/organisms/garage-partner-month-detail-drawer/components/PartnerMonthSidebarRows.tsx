import React from "react";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";

export function RateBar({
  rate,
  isReceipt = true,
}: {
  rate: number;
  isReceipt?: boolean;
}) {
  const color = isReceipt
    ? "bg-emerald-500 dark:bg-emerald-400"
    : "bg-orange-500 dark:bg-orange-400";
  const capped = Math.min(100, Math.max(0, rate));
  const badgeClass =
    rate >= 100
      ? isReceipt
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
        : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80";

  return (
    <div className="flex items-center gap-2.5 w-full">
      <Badge
        variant="outline"
        className={cn(
          "font-bold px-2 py-0.5 text-xs border tabular-nums w-fit shrink-0",
          badgeClass,
        )}
      >
        {rate.toFixed(1)}%
      </Badge>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            color,
          )}
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  );
}

export function MoneyRow({
  label,
  value,
  valueClass,
  secondary,
}: {
  label: string;
  value: number;
  valueClass?: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <span className="text-[12px] text-muted-foreground font-medium shrink-0">
        {label}
      </span>
      <div className="text-right shrink-0">
        <span
          className={cn(
            "text-[12px] font-mono font-semibold tabular-nums whitespace-nowrap",
            valueClass ?? "text-foreground",
          )}
        >
          {money(value)}
        </span>
        {secondary && (
          <span className="block text-[10px] text-muted-foreground/75 font-normal">
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
}
