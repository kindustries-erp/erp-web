import type { CaseCostBreakdown } from "../../../GarageCasePreview.type";

export interface QuoteDocumentCostSummaryProps {
  costBreakdown?: CaseCostBreakdown;
  partsTotalCost?: number;
  totalRevenue?: number;
  totalCost?: number;
  grossProfit?: number;
  grossMargin?: number;
}
