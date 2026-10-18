import type { QuoteLineItem } from "../../../GarageCasePreview.type";

export interface QuoteServicesTableProps {
  lines: QuoteLineItem[];
  loading?: boolean;
  className?: string;
  canEditFinancial?: boolean;
  onPaymentClick?: (line: QuoteLineItem) => void;
}
