import {
  type ErpInvoice,
  type CreateErpInvoicePayload,
} from "../../api/erpInvoicesCoreApi";
import {
  type SettlementType,
  type SelectedVoucherItem,
} from "../VoucherNetoffSelectionModal/types";

export type SettlementSubTabKey = "bank_statement" | "cash_book";
export type SettlementTableViewPreset =
  | "all"
  | "suggestions"
  | "selected"
  | "linked";

export interface ErpInvoiceSettlementTabProps {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  onRefresh?: () => void;
  onStartEdit?: () => void;
}

export interface ActiveVoucherItem {
  id: string;
  bankTransactionId: string;
  refNo: string;
  description: string;
  transDate: string | null;
  amount: number;
  bankName: string;
  partnerName: string;
  sourceType?: "BANK" | "CASH";
  bankAccount?: { bankName?: string; accountNumber?: string } | any;
  accountNumber?: string;
  cashBook?: { name?: string } | any;
  isPending: boolean;
}

export interface ErpInvoiceSettlementContextValue {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction: "IN" | "OUT";
  onRefresh?: () => void;
  onStartEdit?: () => void;
  activeSubTab: SettlementSubTabKey;
  setActiveSubTab: (tab: SettlementSubTabKey) => void;
  viewPreset: SettlementTableViewPreset;
  setViewPreset: (preset: SettlementTableViewPreset) => void;
  // Debt & Progress
  totalInvoiceAmount: number;
  totalNetOff: number;
  remainingDebt: number;
  paymentPercent: number;
  isPaidFull: boolean;
  activeVouchers: ActiveVoucherItem[];
  // NetOff Workspace
  settlementType: SettlementType;
  selectedIds: string[];
  netOffAmounts: Record<string, number>;
  maxAmounts: Record<string, number>;
  selectedTxns: Record<string, any>;
  selectedVouchersList: SelectedVoucherItem[];
  totalCurrentNetOff: number;
  remainingAfterNetOff: number;
  isOverRemaining: boolean;
  suggestedDebtDiff: number;
  // Transactions Table & Filters
  page: number;
  pageSize: number;
  setPage: (p: number) => void;
  setPageSize: (ps: number) => void;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (d: string) => void;
  setDateTo: (d: string) => void;
  tableState: any;
  vouchers: any[];
  isLoadingVouchers: boolean;
  totalVouchers: number;
  totalPages: number;
  // Smart Suggestions
  filteredSuggestions: any[];
  isLoadingSuggestions: boolean;
  // Handlers
  handleAmountChange: (txn: any, val: number) => void;
  handleToggleRow: (row: any) => void;
  handleToggleSuggestion: (txn: any) => void;
  handleUnselectItem: (id: string) => void;
  handleUnselectAll: () => void;
  handleSelectAllFilteredSuggestions: () => void;
  handleConfirmNetOff: () => Promise<void>;
  handleUnlinkVoucher: (item: ActiveVoucherItem) => Promise<void>;
  openBankVoucher: (id: string) => void;
  detailTxnId: string | null;
  setDetailTxnId: (id: string | null) => void;
  isSubmitting: boolean;
}
