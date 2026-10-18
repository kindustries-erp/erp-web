import React from "react";
import { Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { QuoteProfitSummaryData } from "../../../../GarageCasePreview.type";
import { ProfitGroupCard, ProfitSummaryRow } from "../atoms";

export interface QuoteDirectCostSectionProps {
  profitSummary: QuoteProfitSummaryData;
  className?: string;
}

export function QuoteDirectCostSection({
  profitSummary,
  className = "",
}: QuoteDirectCostSectionProps) {
  const { t } = useTranslation(["garage", "common"]);
  const partsInside = Number(profitSummary.partsCostInside || 0);
  const partsOutside = Number(profitSummary.partsCostOutside || 0);
  const outsourceCost = Number(profitSummary.outsourceLaborCost || 0);
  const totalDirectCost = partsInside + partsOutside + outsourceCost;

  return (
    <ProfitGroupCard
      icon={<Wrench className="w-3.5 h-3.5 text-slate-600" />}
      title={t(
        "cases.quotePreview.groupDirectCost",
        "4. Giá vốn & Gia công ngoài",
      )}
      className={className}
    >
      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.partCostInside",
          "Giá vốn phụ tùng trong phiếu",
        )}
        value={partsInside}
      />

      {partsOutside > 0 && (
        <ProfitSummaryRow
          label={t(
            "cases.quotePreview.partCostOutside",
            "Giá vốn phụ tùng mua ngoài",
          )}
          value={partsOutside}
        />
      )}

      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.subcontractOutsource",
          "Gia công ngoài (GCN)",
        )}
        value={outsourceCost}
      />

      <ProfitSummaryRow
        label={t(
          "cases.quotePreview.totalDirectCost",
          "Tổng chi phí giá vốn & gia công",
        )}
        value={totalDirectCost}
        variant="subtotal"
      />
    </ProfitGroupCard>
  );
}
