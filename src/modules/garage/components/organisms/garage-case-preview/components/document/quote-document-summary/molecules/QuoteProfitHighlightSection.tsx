import React from "react";
import { TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { ProfitSummaryRow } from "../atoms";
import { formatNumber } from "../../../../GarageCasePreview.helper";

export interface QuoteProfitHighlightSectionProps {
  profitSummary: QuoteProfitSummaryData;
  className?: string;
}

export function QuoteProfitHighlightSection({
  profitSummary,
  className = "",
}: QuoteProfitHighlightSectionProps) {
  const { t } = useTranslation(["garage", "common"]);
  const preTaxProfit = Number(profitSummary.estimatedProfitPreTax || 0);
  const afterTaxProfit = Number(profitSummary.estimatedProfitAfterTax || 0);
  const subtotalRev = Number(profitSummary.subtotalAfterDiscount || 0);
  const margin = Number(profitSummary.profitMargin || 0);

  const commCost =
    Number(profitSummary.commissionGeneral || 0) +
    Number(profitSummary.commissionGdv || 0) +
    Number(profitSummary.commissionMg || 0);
  const directCost =
    Number(profitSummary.partsCostInside || 0) +
    Number(profitSummary.partsCostOutside || 0) +
    Number(profitSummary.outsourceLaborCost || 0);
  const totalCostDeducted = commCost + directCost;

  return (
    <div
      className={`rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20 p-3 shadow-xs space-y-2 ${className}`}
    >
      <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60 dark:border-emerald-800/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            {t(
              "cases.quotePreview.groupProfit",
              "5. Tổng kết lợi nhuận dự kiến",
            )}
          </span>
        </div>
        <span className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
          +{margin.toFixed(1)}%
        </span>
      </div>

      <div className="space-y-1 text-xs">
        <ProfitSummaryRow
          label={t(
            "cases.quotePreview.netRevenueBase",
            "Doanh thu sau chiết khấu",
          )}
          value={subtotalRev}
          variant="muted"
        />

        {totalCostDeducted > 0 && (
          <ProfitSummaryRow
            label={t(
              "cases.quotePreview.totalDeductedCost",
              "Trừ tổng chi phí (HH + GCN + PT)",
            )}
            value={`-${formatNumber(totalCostDeducted)} ₫`}
            variant="danger"
          />
        )}

        <div className="pt-1.5 mt-1 border-t border-emerald-200/60 dark:border-emerald-800/50 space-y-1">
          <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400 text-sm">
            <span>
              {t(
                "cases.quotePreview.estimatedProfitPreTax",
                "LÃI TẠM TÍNH (Trước thuế):",
              )}
            </span>
            <span className="font-mono tabular-nums text-base">
              {formatNumber(preTaxProfit)} ₫
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold pt-0.5">
            <span>
              {t(
                "cases.quotePreview.estimatedProfitAfterTax",
                "Lãi tạm tính có thuế:",
              )}
            </span>
            <span className="font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatNumber(afterTaxProfit)} ₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
