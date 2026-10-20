import React from "react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { formatNumber } from "../../../../GarageCasePreview.helper";

export interface QuoteBillingBlockProps {
  rawData: any;
  profitSummary: QuoteProfitSummaryData;
  totalPayable: number;
}

export function QuoteBillingBlock({
  rawData,
  profitSummary,
  totalPayable,
}: QuoteBillingBlockProps) {
  const { t } = useTranslation(["garage", "common"]);
  const discountAmount = Number(rawData?.TienChietKhau || 0);
  const totalDeductible =
    Number(profitSummary.deductibleAmount || 0) +
    Number(profitSummary.sanctionAmount || 0);

  return (
    <div className="space-y-1.5 pb-2">
      <div className="flex justify-between py-0.5">
        <span className="text-slate-600 dark:text-slate-400">
          {t("cases.quotePreview.totalPreVat", "Tổng thành tiền")}
        </span>
        <span className="font-semibold tabular-nums">
          {formatNumber(rawData?.TongTienHang || 0)} ₫
        </span>
      </div>

      {discountAmount > 0 && (
        <div className="flex justify-between py-0.5 text-rose-600 dark:text-rose-400">
          <span>{t("cases.quotePreview.discountSummary", "Chiết khấu")}</span>
          <span className="font-medium tabular-nums font-mono">
            -{formatNumber(discountAmount)} ₫
          </span>
        </div>
      )}

      {profitSummary.subtotalAfterDiscount != null && (
        <div className="flex justify-between py-0.5 text-slate-700 dark:text-slate-300">
          <span>
            {t(
              "cases.quotePreview.subtotalAfterDiscount",
              "Tổng tiền sau Chiết Khấu",
            )}
          </span>
          <span className="font-medium tabular-nums font-mono">
            {formatNumber(profitSummary.subtotalAfterDiscount)} ₫
          </span>
        </div>
      )}

      {profitSummary.isInsurance && (
        <>
          <div className="flex justify-between py-0.5 text-slate-600 dark:text-slate-400">
            <span>
              {t(
                "cases.quotePreview.deductibleTitle",
                "Chi phí khấu trừ + chế tài",
              )}
            </span>
            <span className="font-medium tabular-nums font-mono">
              {formatNumber(totalDeductible)} ₫
            </span>
          </div>

          <div className="flex justify-between py-0.5 text-slate-600 dark:text-slate-400">
            <span>
              {t(
                "cases.quotePreview.afterSanctionTitle",
                "Chi phí sau chế tài",
              )}
            </span>
            <span className="font-medium tabular-nums font-mono">
              {formatNumber(profitSummary.afterSanctionAmount || 0)} ₫
            </span>
          </div>
        </>
      )}

      <div className="flex justify-between py-0.5">
        <span className="text-slate-600 dark:text-slate-400">
          {t("cases.quotePreview.vatSummary", "Thuế VAT")}
        </span>
        <span className="font-medium tabular-nums font-mono">
          {formatNumber(rawData?.TienThue || 0)} ₫
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px]">
        <div>
          <span className="text-slate-500">
            {t("cases.quotePreview.customerPay", "Khách hàng TT:")}
          </span>{" "}
          <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
            {formatNumber(rawData?.TienThanhToanKH || 0)} ₫
          </span>
        </div>
        <div className="text-right">
          <span className="text-slate-500">
            {t("cases.quotePreview.insurancePay", "Bảo hiểm TT:")}
          </span>{" "}
          <span className="font-semibold font-mono text-slate-800 dark:text-slate-200">
            {formatNumber(rawData?.TienThanhToanBH || 0)} ₫
          </span>
        </div>
      </div>

      <div className="flex justify-between py-1 border-t border-slate-200 dark:border-slate-700 font-bold">
        <span className="text-slate-900 dark:text-slate-100">
          {t("cases.quotePreview.totalPostVat", "Tổng tiền sau VAT")}
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
          {formatNumber(totalPayable)} ₫
        </span>
      </div>
    </div>
  );
}
