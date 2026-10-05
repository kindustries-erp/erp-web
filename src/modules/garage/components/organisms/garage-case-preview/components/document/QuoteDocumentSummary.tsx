import React from "react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../GarageCasePreview.type";
import { formatNumber } from "../../GarageCasePreview.helper";

export interface QuoteDocumentSummaryProps {
  rawData: any;
  caseData: any;
  profitSummary: QuoteProfitSummaryData;
}

export function QuoteDocumentSummary({
  rawData,
  caseData,
  profitSummary,
}: QuoteDocumentSummaryProps) {
  const { t } = useTranslation(["garage", "common"]);

  const discountAmount = Number(rawData?.TienChietKhau || 0);
  const totalPayable = rawData?.TongTienThanhToan || caseData?.tienCoThue || 0;

  return (
    <div className="flex justify-end mb-8">
      <div className="w-full md:w-7/12 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
        <div className="flex justify-between py-0.5">
          <span className="text-slate-600 dark:text-slate-400">
            {t("cases.quotePreview.totalPreVat", "Tổng thành tiền (chưa thuế)")}
          </span>
          <span className="font-medium tabular-nums">
            {formatNumber(rawData?.TongTienHang || 0)} ₫
          </span>
        </div>

        {discountAmount > 0 && (
          <div className="flex justify-between py-0.5 text-rose-600">
            <span>{t("cases.quotePreview.discountSummary", "Chiết khấu")}</span>
            <span className="font-medium tabular-nums">
              -{formatNumber(discountAmount)} ₫
            </span>
          </div>
        )}

        <div className="flex justify-between py-0.5">
          <span className="text-slate-600 dark:text-slate-400">
            {t("cases.quotePreview.vatSummary", "Thuế VAT")}
          </span>
          <span className="font-medium tabular-nums">
            {formatNumber(rawData?.TienThue || 0)} ₫
          </span>
        </div>

        <div className="flex justify-between py-1 border-t border-slate-200 dark:border-slate-700 text-sm font-bold">
          <span className="text-slate-900 dark:text-slate-100">
            {t("cases.quotePreview.totalPayable", "Tổng tiền thanh toán")}
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatNumber(totalPayable)} ₫
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700 text-[11px]">
          <div>
            <span className="text-slate-500">
              {t("cases.quotePreview.customerPay", "Khách hàng TT:")}
            </span>{" "}
            <span className="font-medium font-mono">
              {formatNumber(rawData?.TienThanhToanKH || 0)} ₫
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500">
              {t("cases.quotePreview.insurancePay", "Bảo hiểm TT:")}
            </span>{" "}
            <span className="font-medium font-mono">
              {formatNumber(rawData?.TienThanhToanBH || 0)} ₫
            </span>
          </div>
        </div>

        {/* Gross profit data if available */}
        {profitSummary.hasProfitData && (
          <div className="mt-3 pt-2.5 border-t border-dashed border-emerald-300 dark:border-emerald-700 space-y-1">
            <div className="flex justify-between font-semibold text-slate-700 dark:text-slate-300">
              <span>
                {t(
                  "cases.quotePreview.totalCostSummary",
                  "Tổng chi phí vụ việc",
                )}
              </span>
              <span className="tabular-nums font-mono">
                {formatNumber(profitSummary.totalCost)} ₫
              </span>
            </div>

            {profitSummary.partCost > 0 && (
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 pl-2">
                <span>
                  {t(
                    "cases.quotePreview.partCostSummary",
                    "↳ Giá vốn phụ tùng",
                  )}
                </span>
                <span className="tabular-nums font-mono">
                  {formatNumber(profitSummary.partCost)} ₫
                </span>
              </div>
            )}

            <div className="flex justify-between font-bold text-emerald-700 dark:text-emerald-400">
              <span>
                {t(
                  "cases.quotePreview.grossProfitSummary",
                  "Lợi nhuận gộp (tạm tính)",
                )}
              </span>
              <span className="tabular-nums font-mono">
                {formatNumber(profitSummary.grossProfit)} ₫
              </span>
            </div>

            {profitSummary.revenue > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                <span>
                  {t(
                    "cases.quotePreview.profitMarginSummary",
                    "Biên lợi nhuận",
                  )}
                </span>
                <span className="tabular-nums font-mono">
                  {profitSummary.profitMargin >= 0
                    ? `+${profitSummary.profitMargin}`
                    : profitSummary.profitMargin}
                  %
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
