import React from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../GarageCasePreview.helper";
import type { QuoteDocumentCostSummaryProps } from "./QuoteDocumentCostSummary.type";

export function QuoteDocumentCostSummary({
  costBreakdown,
  partsTotalCost = 0,
  totalCost = 0,
  grossProfit = 0,
  grossMargin = 0,
}: QuoteDocumentCostSummaryProps) {
  const { t } = useTranslation(["garage", "common"]);

  const partCost = costBreakdown?.inventoryPartCost ?? partsTotalCost;
  const outsourceCost = costBreakdown?.outsourceCost ?? 0;
  const commissionCost = costBreakdown?.commissionCost ?? 0;
  const finalTotalCost = costBreakdown?.totalCost ?? totalCost;

  if (finalTotalCost <= 0 && partCost <= 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {t(
            "cases.quotePreview.costStructureTitle",
            "Cơ cấu chi phí vụ việc (Sổ chi phí)",
          )}
        </span>
        {grossProfit !== 0 && (
          <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            {t("cases.quotePreview.caseProfitBadge", "Lãi gộp:")}{" "}
            {formatNumber(grossProfit)} ({grossMargin.toFixed(1)}%)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="bg-white dark:bg-slate-800/60 p-2 rounded border border-slate-200/60 dark:border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase">
            {t("cases.quotePreview.tk1541", "1. Phụ tùng kho (1541)")}
          </div>
          <div className="font-semibold tabular-nums text-slate-800 dark:text-slate-200 mt-0.5">
            {formatNumber(partCost)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/60 p-2 rounded border border-slate-200/60 dark:border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase">
            {t("cases.quotePreview.tk1542", "2. Mua ngoài/DV (1542)")}
          </div>
          <div className="font-semibold tabular-nums text-slate-800 dark:text-slate-200 mt-0.5">
            {formatNumber(outsourceCost)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/60 p-2 rounded border border-slate-200/60 dark:border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase">
            {t("cases.quotePreview.tk1543", "3. Hoa hồng/Khác (1543)")}
          </div>
          <div className="font-semibold tabular-nums text-slate-800 dark:text-slate-200 mt-0.5">
            {formatNumber(commissionCost)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800/60 p-2 rounded border border-slate-200/60 dark:border-slate-700/50">
          <div className="text-[10px] text-slate-500 uppercase font-medium text-slate-700 dark:text-slate-300">
            {t("cases.quotePreview.totalCostSummary", "Tổng chi phí")}
          </div>
          <div className="font-bold tabular-nums text-slate-900 dark:text-slate-100 mt-0.5">
            {formatNumber(finalTotalCost)}
          </div>
        </div>
      </div>
    </div>
  );
}
