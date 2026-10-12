import React from "react";
import { Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { ProfitGroupCard, ProfitSummaryRow } from "../atoms";

export interface QuoteCommissionSectionProps {
  profitSummary: QuoteProfitSummaryData;
  className?: string;
}

export function QuoteCommissionSection({
  profitSummary,
  className = "",
}: QuoteCommissionSectionProps) {
  const { t } = useTranslation(["garage", "common"]);
  const commGdv = Number(profitSummary.commissionGdv || 0);
  const commMg = Number(profitSummary.commissionMg || 0);
  const commGen = Number(profitSummary.commissionGeneral || 0);
  const totalComm = commGdv + commMg + commGen;

  return (
    <ProfitGroupCard
      icon={<Handshake className="w-3.5 h-3.5 text-amber-600" />}
      title={t("cases.quotePreview.groupCommissions", "3. Chi phí hoa hồng")}
      className={className}
    >
      <ProfitSummaryRow
        label={t("cases.quotePreview.commSurveyor", "Hoa hồng Giám định viên")}
        subValue={
          profitSummary.gdvName ? `(${profitSummary.gdvName})` : undefined
        }
        value={commGdv}
      />

      <ProfitSummaryRow
        label={t("cases.quotePreview.commBroker", "Hoa hồng Môi giới")}
        subValue={
          profitSummary.brokerName ? `(${profitSummary.brokerName})` : undefined
        }
        value={commMg}
      />

      {commGen > 0 && (
        <ProfitSummaryRow
          label={t("cases.quotePreview.commGeneral", "Hoa hồng chung")}
          value={commGen}
        />
      )}

      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.totalCommissions",
          "Tổng chi phí hoa hồng",
        )}
        value={totalComm}
        variant="subtotal"
      />
    </ProfitGroupCard>
  );
}
