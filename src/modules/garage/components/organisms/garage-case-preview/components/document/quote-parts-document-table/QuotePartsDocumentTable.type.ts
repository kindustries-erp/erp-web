import type { QuoteLineItem } from "../../../GarageCasePreview.type";

export interface QuotePartsDocumentTableProps {
  parts: QuoteLineItem[];
  partsTotalAmount: number;
  partsTotalCost: number;
}
