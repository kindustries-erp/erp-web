import React from "react";
import { cn } from "@/shared/utils";
import type { DebtHorizonBadgeProps } from "./DebtHorizonBadge.type";

const variantStyles: Record<string, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80",
  amber:
    "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80",
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/80",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80",
  slate:
    "bg-slate-100 text-foreground dark:bg-slate-800 dark:text-slate-300 border-slate-200/80 dark:border-slate-700",
  violet:
    "bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 border-violet-200/80",
};

export const DebtHorizonBadge: React.FC<DebtHorizonBadgeProps> = ({
  variant = "slate",
  label,
  className,
}) => {
  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded border inline-flex items-center leading-none",
        variantStyles[variant] || variantStyles.slate,
        className,
      )}
    >
      {label}
    </span>
  );
};
