import type { ErpInvoiceSettlementTabProps } from "../erp-invoice-settlement-tab/types";

export interface ErpInvoiceSettlementRightPanelProps extends Partial<ErpInvoiceSettlementTabProps> {
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  className?: string;
}
