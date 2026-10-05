import React from "react";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { DebtHorizonBadge } from "@/shared/components/atoms/debt-horizon-badge";
import type { DebtTimeHorizonCardProps } from "./DebtTimeHorizonCard.type";

export const DebtTimeHorizonCard: React.FC<DebtTimeHorizonCardProps> = ({
  title,
  badge,
  badgeVariant = "slate",
  icon: Icon,
  iconColor = "text-primary",
  hoverBorderColor = "hover:border-primary/50",
  inLabel,
  inAmount,
  outLabel,
  outAmount,
  netLabel,
  netAmount,
  isNetPositiveGood = true,
  onClick,
}) => {
  const isNetPositive = netAmount >= 0;
  const netColorClass = isNetPositiveGood
    ? isNetPositive
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-rose-700 dark:text-rose-400"
    : isNetPositive
      ? "text-rose-700 dark:text-rose-400"
      : "text-emerald-700 dark:text-emerald-400";

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "bg-surface border border-border rounded-xl card-shadow p-3.5 transition-all hover:shadow-md cursor-pointer group active:scale-[0.99] flex flex-col justify-between",
        hoverBorderColor,
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">
          <Icon className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />
          <span className="truncate">{title}</span>
        </span>
        <DebtHorizonBadge variant={badgeVariant} label={badge} />
      </div>

      <div className="space-y-1 my-1">
        <div className="flex justify-between text-xs tabular-nums">
          <span className="text-muted-foreground">{inLabel}:</span>
          <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            +{money(inAmount || 0)}
          </span>
        </div>
        <div className="flex justify-between text-xs tabular-nums">
          <span className="text-muted-foreground">{outLabel}:</span>
          <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
            -{money(outAmount || 0)}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs tabular-nums mt-1">
        <span className="text-muted-foreground font-medium">{netLabel}:</span>
        <span className={cn("font-mono font-bold", netColorClass)}>
          {isNetPositive ? "+" : ""}
          {money(netAmount || 0)}
        </span>
      </div>
    </div>
  );
};
