import React from "react";
import { cn } from "@/shared/utils";
import type { CashflowKpiBadgeProps } from "./CashflowKpiBadge.type";

const variantStyles: Record<string, string> = {
  emerald:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/80",
  orange:
    "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300 border-orange-200/80",
  amber:
    "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/80",
  rose: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/80",
  slate:
    "bg-slate-100 text-foreground dark:bg-slate-800 dark:text-slate-300 border-slate-200/80 dark:border-slate-700",
};

export const CashflowKpiBadge: React.FC<CashflowKpiBadgeProps> = ({
  variant = "slate",
  label,
  icon,
  className,
}) => {
  return (
    <span
      className={cn(
        "text-[10px] font-medium px-1.5 py-0.5 rounded border inline-flex items-center gap-1 leading-none",
        variantStyles[variant] || variantStyles.slate,
        className,
      )}
    >
      {icon}
      {label}
    </span>
  );
};
