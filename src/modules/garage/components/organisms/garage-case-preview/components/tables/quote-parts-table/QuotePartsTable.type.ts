import type { QuoteLineItem } from "../../../GarageCasePreview.type";

export interface QuotePartsTableProps {
  lines: QuoteLineItem[];
  loading?: boolean;
  className?: string;
  onPaymentClick?: (line: QuoteLineItem) => void;
}
