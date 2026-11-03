import type { SmartNetOffSuggestionItem } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface SuggestionPillStripProps {
  suggestions: SmartNetOffSuggestionItem[];
  selectedIds: string[];
  onToggle: (txn: SmartNetOffSuggestionItem["txn"]) => void;
  onSelectAll: () => void;
  isLoading?: boolean;
  currentRemaining?: number;
  onViewDetail?: (id: string) => void;
}
