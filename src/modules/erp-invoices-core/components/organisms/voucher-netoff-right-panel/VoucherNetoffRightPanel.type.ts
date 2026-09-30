export type SettlementType = "RECEIPT" | "PAYMENT";

export interface VoucherNetoffRightPanelProps {
  isInvoiceContext: boolean;
  invoiceDirection?: "IN" | "OUT";
  settlementType: SettlementType;
  handleSwitchSettlementType: (type: SettlementType) => void;
  resolvedTarget?: { code?: string; type?: string; totalAmount?: number };
  invoice?: any;
  caseCode?: string;
  currentRemaining: number;
  totalCurrentNetOff: number;
  remainingAfterNetOff: number;
  isOverRemaining: boolean;
  suggestedDebtDiff: number;
  filteredSuggestions: any[];
  isLoadingSuggestions: boolean;
  handleSelectAllFilteredSuggestions: () => void;
  selectedIds: string[];
  netOffAmounts: Record<string, number>;
  handleAmountChange: (txn: any, val: number) => void;
  handleToggleSuggestion: (txn: any) => void;
  setDetailTxnId: (id: string | null) => void;
  existingCaseSettlements?: any[];
  existingInvoiceNetOffs?: any[];
}
