import type { QuoteLineItem } from "../../../GarageCasePreview.type";

export interface QuoteServicesDocumentTableProps {
  services: QuoteLineItem[];
  servicesTotalAmount: number;
}
