import React from "react";
import type {
  QuoteLineItem,
  QuoteProfitSummaryData,
} from "../GarageCasePreview.type";
import { QuoteDocumentHeader } from "./document/QuoteDocumentHeader";
import { QuoteDocumentInfoGrid } from "./document/QuoteDocumentInfoGrid";
import { QuoteDocumentTables } from "./document/QuoteDocumentTables";
import { QuoteDocumentSummary } from "./document/QuoteDocumentSummary";
import { QuoteDocumentSignatures } from "./document/QuoteDocumentSignatures";

export interface QuotePreviewDocumentProps {
  caseData: any;
  rawData: any;
  dateStr: string;
  parts: QuoteLineItem[];
  services: QuoteLineItem[];
  partsTotalAmount: number;
  partsTotalCost: number;
  servicesTotalAmount: number;
  profitSummary: QuoteProfitSummaryData;
}

export function QuotePreviewDocument({
  caseData,
  rawData,
  dateStr,
  parts,
  services,
  partsTotalAmount,
  partsTotalCost,
  servicesTotalAmount,
  profitSummary,
}: QuotePreviewDocumentProps) {
  const caseCode = caseData?.soChungTu || rawData?.SoPhieu;

  return (
    <div className="w-full text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm relative overflow-hidden rounded-xl">
        <QuoteDocumentHeader caseCode={caseCode} dateStr={dateStr} />
        <QuoteDocumentInfoGrid rawData={rawData} caseData={caseData} />
        <QuoteDocumentTables
          parts={parts}
          services={services}
          partsTotalAmount={partsTotalAmount}
          partsTotalCost={partsTotalCost}
          servicesTotalAmount={servicesTotalAmount}
          costBreakdown={profitSummary.costBreakdown}
          totalCost={profitSummary.totalCost}
          grossProfit={profitSummary.grossProfit}
          grossMargin={profitSummary.profitMargin}
        />
        <QuoteDocumentSummary
          rawData={rawData}
          caseData={caseData}
          profitSummary={profitSummary}
        />
        <QuoteDocumentSignatures />
      </div>
    </div>
  );
}
