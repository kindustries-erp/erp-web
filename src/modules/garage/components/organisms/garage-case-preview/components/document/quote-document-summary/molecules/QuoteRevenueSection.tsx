import React from "react";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { ProfitGroupCard, ProfitSummaryRow } from "../atoms";

export interface QuoteRevenueSectionProps {
  profitSummary: QuoteProfitSummaryData;
  className?: string;
}

export function QuoteRevenueSection({
  profitSummary,
  className = "",
}: QuoteRevenueSectionProps) {
  const { t } = useTranslation(["garage", "common"]);
  const totalAmount = Number(profitSummary.totalAmount || 0);
  const discountAmount = Number(profitSummary.discountAmount || 0);
  const discountRate = Number(profitSummary.discountRate || 0);
  const subtotalAfterDiscount = Number(
    profitSummary.subtotalAfterDiscount ??
      Math.max(0, totalAmount - discountAmount),
  );

  return (
    <ProfitGroupCard
      icon={<Tag className="w-3.5 h-3.5 text-emerald-600" />}
      title={t("cases.quotePreview.groupRevenue", "1. Doanh thu & Chiết khấu")}
      className={className}
    >
      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.totalPreVat",
          "Tổng thành tiền (chưa thuế)",
        )}
        value={totalAmount}
      />

      {discountAmount > 0 && (
        <ProfitSummaryRow
          label={
            discountRate > 0
              ? `${t("cases.quotePreview.discountSummary", "Chiết khấu")} (${discountRate}%)`
              : t("cases.quotePreview.discountSummary", "Chiết khấu")
          }
          value={`-${discountAmount > 0 ? discountAmount.toLocaleString("vi-VN") : "0"} ₫`}
          variant="danger"
        />
      )}

      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.subtotalAfterDiscount",
          "Tổng doanh thu sau Chiết Khấu",
        )}
        value={subtotalAfterDiscount}
        variant="subtotal"
      />
    </ProfitGroupCard>
  );
}
