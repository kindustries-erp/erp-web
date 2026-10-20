import React from "react";
import { formatNumber } from "../../../../GarageCasePreview.helper";

export interface ProfitSummaryRowProps {
  label: React.ReactNode;
  value: string | number;
  subValue?: React.ReactNode;
  variant?:
    | "default"
    | "subtotal"
    | "highlight"
    | "danger"
    | "success"
    | "muted";
  isIndented?: boolean;
  className?: string;
}

export function ProfitSummaryRow({
  label,
  value,
  subValue,
  variant = "default",
  isIndented = false,
  className = "",
}: ProfitSummaryRowProps) {
  const formattedVal =
    typeof value === "number" ? `${formatNumber(value)} ₫` : value;

  const getVariantStyles = () => {
    switch (variant) {
      case "subtotal":
        return "font-semibold text-slate-900 dark:text-slate-100 bg-slate-100/70 dark:bg-slate-800/60 px-2 py-1 rounded mt-1";
      case "highlight":
        return "font-bold text-slate-900 dark:text-slate-50 text-[13px]";
      case "danger":
        return "text-rose-600 dark:text-rose-400 font-medium";
      case "success":
        return "text-emerald-600 dark:text-emerald-400 font-bold";
      case "muted":
        return "text-slate-500 dark:text-slate-400 text-xs";
      default:
        return "text-slate-700 dark:text-slate-300";
    }
  };

  return (
    <div
      className={`flex items-center justify-between py-0.5 text-xs transition-colors ${
        isIndented ? "pl-3 text-[11px] text-slate-500 dark:text-slate-400" : ""
      } ${getVariantStyles()} ${className}`}
    >
      <div className="flex items-center gap-1.5 truncate pr-2">
        <span>{label}</span>
        {subValue && (
          <span className="text-[10px] text-slate-400 truncate">
            {subValue}
          </span>
        )}
      </div>
      <span className="tabular-nums font-mono whitespace-nowrap shrink-0">
        {formattedVal}
      </span>
    </div>
  );
}
