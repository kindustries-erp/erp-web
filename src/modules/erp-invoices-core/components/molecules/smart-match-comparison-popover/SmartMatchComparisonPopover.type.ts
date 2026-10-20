import React from "react";
import type {
  ErpInvoice,
  SmartNetOffSuggestionItem,
} from "../../../api/erpInvoicesCoreApi";

export interface SmartMatchComparisonPopoverProps {
  invoice: ErpInvoice;
  suggestion: SmartNetOffSuggestionItem;
  invoiceRemaining: number;
  direction?: "IN" | "OUT";
  onApply: () => void;
  onViewTxnDetail?: (txnId: string) => void;
  onManualSelect?: () => void;
  children: React.ReactNode;
}
