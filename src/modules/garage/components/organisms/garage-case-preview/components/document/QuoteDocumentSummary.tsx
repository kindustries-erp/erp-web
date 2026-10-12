import React from "react";
import type { QuoteProfitSummaryData } from "../../GarageCasePreview.type";
import {
  QuoteRevenueSection,
  QuoteSettlementSection,
  QuoteCommissionSection,
  QuoteDirectCostSection,
  QuoteProfitHighlightSection,
} from "./quote-document-summary";

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
  const totalPayable =
    profitSummary.totalPayable ||
    rawData?.TongTienThanhToan ||
    caseData?.tienCoThue ||
    0;

  return (
    <div className="w-full mb-8 pt-3 border-t border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
        {/* Cột 1: Dòng tiền bán hàng & Phân bổ thanh toán */}
        <div className="space-y-3">
          <QuoteRevenueSection profitSummary={profitSummary} />
          <QuoteSettlementSection
            profitSummary={profitSummary}
            totalPayable={totalPayable}
          />
        </div>

        {/* Cột 2: Chi phí & Lợi nhuận dự kiến */}
        <div className="space-y-3">
          <QuoteCommissionSection profitSummary={profitSummary} />
          <QuoteDirectCostSection profitSummary={profitSummary} />
          <QuoteProfitHighlightSection profitSummary={profitSummary} />
        </div>
      </div>
    </div>
  );
}
