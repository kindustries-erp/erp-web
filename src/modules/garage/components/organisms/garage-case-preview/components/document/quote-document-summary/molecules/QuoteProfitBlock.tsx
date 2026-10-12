import React from "react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { formatNumber } from "../../../../GarageCasePreview.helper";

export interface QuoteProfitBlockProps {
  profitSummary: QuoteProfitSummaryData;
}

export function QuoteProfitBlock({ profitSummary }: QuoteProfitBlockProps) {
  const { t } = useTranslation(["garage", "common"]);

  const partsInside = profitSummary.partsCostInside || 0;
  const partsOutside = profitSummary.partsCostOutside || 0;
  const outsourceLabor = profitSummary.outsourceLaborCost || 0;
  const totalCostEstimate = partsInside + partsOutside + outsourceLabor;

  const preTaxProfit =
    profitSummary.estimatedProfitPreTax != null
      ? profitSummary.estimatedProfitPreTax
      : profitSummary.grossProfit;

  const postTaxProfit =
    profitSummary.estimatedProfitAfterTax != null
      ? profitSummary.estimatedProfitAfterTax
      : preTaxProfit + (profitSummary.vatAmount || 0);

  return (
    <div className="pt-2.5 border-t border-dashed border-emerald-300 dark:border-emerald-700 space-y-1 text-[11px]">
      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>
          {t(
            "cases.quotePreview.partsCostInside",
            "Chi phí phụ tùng trong phiếu:",
          )}
        </span>
        <span className="font-mono tabular-nums">
          {formatNumber(partsInside)} ₫
        </span>
      </div>

      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>
          {t(
            "cases.quotePreview.partsCostOutside",
            "Chi phí phụ tùng ngoài phiếu:",
          )}
        </span>
        <span className="font-mono tabular-nums">
          {formatNumber(partsOutside)} ₫
        </span>
      </div>

      <div className="flex justify-between text-slate-600 dark:text-slate-400">
        <span>
          {t(
            "cases.quotePreview.outsourceLaborCost",
            "Chi phí gia công thuê ngoài:",
          )}
        </span>
        <span className="font-mono tabular-nums">
          {formatNumber(outsourceLabor)} ₫
        </span>
      </div>

      <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
        <span>
          {t(
            "cases.quotePreview.totalEstimatedCost",
            "Tổng Chi Phí giá vốn tạm tính",
          )}
        </span>
        <span className="font-mono tabular-nums">
          {formatNumber(totalCostEstimate)} ₫
        </span>
      </div>

      <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400 pt-0.5 text-xs">
        <span>
          {t("cases.quotePreview.estimatedProfitPreTax", "Lãi tạm tính")}
        </span>
        <span className="font-mono tabular-nums">
          {formatNumber(preTaxProfit)} ₫
        </span>
      </div>

      <div className="flex justify-between font-bold text-emerald-800 dark:text-emerald-300 text-xs">
        <span>
          {t(
            "cases.quotePreview.estimatedProfitAfterTax",
            "Lãi tạm tính có thuế",
          )}
        </span>
        <span className="font-mono tabular-nums">
          {formatNumber(postTaxProfit)} ₫
        </span>
      </div>
    </div>
  );
}
