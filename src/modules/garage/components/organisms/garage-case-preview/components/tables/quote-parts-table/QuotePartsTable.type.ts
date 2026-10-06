import type { QuoteLineItem } from "../../../GarageCasePreview.type";

export interface QuotePartsTableProps {
  lines: QuoteLineItem[];
  loading?: boolean;
  className?: string;
  canEditFinancial?: boolean;
  onPaymentClick?: (line: QuoteLineItem) => void;
}
