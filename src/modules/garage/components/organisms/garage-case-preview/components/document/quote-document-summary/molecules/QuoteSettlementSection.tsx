import React from "react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { ProfitGroupCard, ProfitSummaryRow } from "../atoms";
import { formatNumber } from "../../../../GarageCasePreview.helper";

export interface QuoteSettlementSectionProps {
  profitSummary: QuoteProfitSummaryData;
  totalPayable: number;
  className?: string;
}

export function QuoteSettlementSection({
  profitSummary,
  totalPayable,
  className = "",
}: QuoteSettlementSectionProps) {
  const { t } = useTranslation(["garage", "common"]);
  const totalDeductible =
    Number(profitSummary.deductibleAmount || 0) +
    Number(profitSummary.sanctionAmount || 0);

  return (
    <ProfitGroupCard
      icon={<ShieldCheck className="w-3.5 h-3.5 text-slate-600" />}
      title={t(
        "cases.quotePreview.groupSettlement",
        "2. Phân bổ thanh toán (Sau thuế)",
      )}
      className={className}
    >
      {profitSummary.isInsurance && (
        <>
          <ProfitSummaryRow
            label={t(
              "cases.quotePreview.deductibleTitle",
              "Chi phí khấu trừ + chế tài",
            )}
            value={totalDeductible}
            variant="muted"
          />

          <ProfitSummaryRow
            label={t(
              "cases.quotePreview.afterSanctionTitle",
              "Chi phí sau chế tài (BH chịu trước VAT)",
            )}
            value={Number(profitSummary.afterSanctionAmount || 0)}
          />
        </>
      )}

      <ProfitSummaryRow
        label={t("cases.quotePreview.vatSummary", "Thuế VAT")}
        value={Number(profitSummary.vatAmount || 0)}
      />

      <div className="grid grid-cols-2 gap-2 my-1.5 p-2 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200/60 dark:border-slate-800 text-xs">
        <div>
          <div className="text-[10px] text-slate-500 uppercase tracking-tight">
            {t("cases.quotePreview.customerPay", "Khách hàng TT")}
          </div>
          <div className="font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
            {formatNumber(profitSummary.customerPay || 0)} ₫
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 uppercase tracking-tight">
            {t("cases.quotePreview.insurancePay", "Bảo hiểm TT")}
          </div>
          <div className="font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
            {formatNumber(profitSummary.insurancePay || 0)} ₫
          </div>
        </div>
      </div>

      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.totalPostVat",
          "Tổng tiền thanh toán sau VAT",
        )}
        value={totalPayable}
        variant="subtotal"
      />
    </ProfitGroupCard>
  );
}
