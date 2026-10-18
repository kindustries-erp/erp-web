import React from "react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { formatNumber } from "../../../../GarageCasePreview.helper";

export interface QuoteCommissionBlockProps {
  profitSummary: QuoteProfitSummaryData;
}

export function QuoteCommissionBlock({
  profitSummary,
}: QuoteCommissionBlockProps) {
  const { t } = useTranslation(["garage", "common"]);

  const commissionGeneral = profitSummary.commissionGeneral || 0;
  const commissionGdv = profitSummary.commissionGdv || 0;
  const commissionMg = profitSummary.commissionMg || 0;

  return (
    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1 text-[11px]">
      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>
          {t("cases.quotePreview.commissionGeneral", "Chi phí hoa hồng:")}
        </span>
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
          {formatNumber(commissionGeneral)} ₫
        </span>
      </div>

      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>
          {t("cases.quotePreview.commissionGdv", "Chi phí hoa hồng GĐV:")}
          {profitSummary.gdvName ? ` (${profitSummary.gdvName})` : ""}
        </span>
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
          {formatNumber(commissionGdv)} ₫
        </span>
      </div>

      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>
          {t("cases.quotePreview.commissionMg", "Chi phí hoa hồng MG:")}
          {profitSummary.brokerName ? ` (${profitSummary.brokerName})` : ""}
        </span>
        <span className="font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
          {formatNumber(commissionMg)} ₫
        </span>
      </div>
    </div>
  );
}
