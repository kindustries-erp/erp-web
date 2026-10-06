import React from "react";
import type {
  CaseCostBreakdown,
  QuoteLineItem,
} from "../../GarageCasePreview.type";
import { QuotePartsDocumentTable } from "./quote-parts-document-table";
import { QuoteServicesDocumentTable } from "./quote-services-document-table";
import { QuoteDocumentCostSummary } from "./quote-document-cost-summary";

export interface QuoteDocumentTablesProps {
  parts: QuoteLineItem[];
  services: QuoteLineItem[];
  partsTotalAmount: number;
  partsTotalCost: number;
  servicesTotalAmount: number;
  costBreakdown?: CaseCostBreakdown;
  totalCost?: number;
  grossProfit?: number;
  grossMargin?: number;
}

export function QuoteDocumentTables({
  parts,
  services,
  partsTotalAmount,
  partsTotalCost,
  servicesTotalAmount,
  costBreakdown,
  totalCost,
  grossProfit,
  grossMargin,
}: QuoteDocumentTablesProps) {
  return (
    <div className="mb-6 space-y-6">
      <QuotePartsDocumentTable
        parts={parts}
        partsTotalAmount={partsTotalAmount}
        partsTotalCost={partsTotalCost}
      />

      <QuoteServicesDocumentTable
        services={services}
        servicesTotalAmount={servicesTotalAmount}
      />

      <QuoteDocumentCostSummary
        costBreakdown={costBreakdown}
        partsTotalCost={partsTotalCost}
        totalCost={totalCost}
        grossProfit={grossProfit}
        grossMargin={grossMargin}
      />
    </div>
  );
}
