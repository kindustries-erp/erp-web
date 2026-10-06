import React from "react";
import type { TFunction } from "i18next";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteFinancialItem } from "../../../GarageCasePreview.type";

export function renderFinancialGroupBadge(t: TFunction, group: string) {
  const groupLabels: Record<string, { label: string; cls: string }> = {
    REVENUE: {
      label: t("cases.quotePreview.fin.grpRevenue", "Doanh thu"),
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
    },
    DEDUCTION: {
      label: t("cases.quotePreview.fin.grpDeduction", "Giảm trừ"),
      cls: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
    },
    PAYMENT: {
      label: t("cases.quotePreview.fin.grpPayment", "Thanh toán"),
      cls: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300",
    },
    COMMISSION: {
      label: t("cases.quotePreview.fin.grpCommission", "Hoa hồng"),
      cls: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
    },
    PROFIT: {
      label: t("cases.quotePreview.fin.grpProfit", "Lợi nhuận"),
      cls: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
    },
  };

  const g = groupLabels[group] || {
    label: group,
    cls: "bg-slate-50 text-slate-700 border-slate-200",
  };

  return (
    <div className="w-full flex justify-center">
      <span
        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border ${g.cls}`}
      >
        {g.label}
      </span>
    </div>
  );
}

export function renderFinancialAmount(row: QuoteFinancialItem) {
  const toneCls =
    row.tone === "primary"
      ? "font-bold text-primary text-sm"
      : row.tone === "success"
        ? "font-bold text-emerald-600 dark:text-emerald-400"
        : row.tone === "danger"
          ? "font-semibold text-rose-600 dark:text-rose-400"
          : row.tone === "warning"
            ? "font-semibold text-amber-600 dark:text-amber-400"
            : row.tone === "muted"
              ? "text-slate-500 font-normal"
              : "font-semibold text-slate-900 dark:text-slate-100";

  return (
    <div
      className={`w-full text-right font-mono tabular-nums text-xs ${toneCls}`}
    >
      {formatNumber(row.amount)} ₫
    </div>
  );
}
