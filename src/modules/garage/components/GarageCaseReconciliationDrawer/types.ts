import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";

export type ReconciliationTabKey =
  | "bank_cash"
  | "manual_cashflow"
  | "invoices_out"
  | "invoices_in";

export interface SettlementSubmissionItem {
  id?: string;
  bankTransactionId?: string;
  settlementType: "RECEIPT" | "PAYMENT";
  sourceChannel: "ON_SYSTEM" | "OFF_SYSTEM_MANUAL";
  category?: string;
  amount: number;
  transDate?: string;
  partnerName?: string;
  note?: string;
  referenceNumber?: string;
  bankName?: string;
  correspondentName?: string;
  sourceType?: "BANK" | "CASH_BOOK";
  accountNumber?: string;
  cashBookName?: string;
}

export interface InvoiceLinkPayloadItem {
  invoiceId: string;
  linkType: "IN" | "OUT";
  note?: string;
  invoice?: ErpInvoice;
}

export interface GarageCaseReconciliationDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  initialTab?: ReconciliationTabKey;
  defaultType?: "RECEIPT" | "PAYMENT";
  suggestedAmount?: number;
  remainingReceivable?: number;
  remainingPayable?: number;
  existingTxnIds?: string[];
  editingItem?: SettlementSubmissionItem | null;
  onSuccess?: () => void;
  onSubmitSettlements?: (
    items: SettlementSubmissionItem[],
  ) => Promise<void> | void;
  onSubmitInvoices?: (
    payloads: InvoiceLinkPayloadItem[] | InvoiceLinkPayloadItem,
  ) => Promise<void> | void;
}

export interface PdfPreviewState {
  url: string;
  filename: string;
  fileKey: string;
  invoiceId: string;
  isAttachment?: boolean;
}

export interface NetOffInputProps {
  initialValue: number | string;
  maxAmount?: number;
  onChange: (val: number) => void;
}

export interface SelectedBankTransactionsTableProps {
  items: any[];
  netOffAmounts: Record<string, number>;
  maxAmounts: Record<string, number>;
  onAmountChange: (txn: any, val: number) => void;
  onRemove: (txn: any) => void;
  onViewDetail: (id: string) => void;
}

export interface SelectedInvoicesTableProps {
  invoices: ErpInvoice[];
  onRemove: (inv: ErpInvoice) => void;
  onViewDetail: (id: string) => void;
}

export interface BankCashTabContentProps {
  vouchers: any[];
  selectedBankItems: any[];
  selectedIds: string[];
  netOffAmounts: Record<string, number>;
  maxAmounts: Record<string, number>;
  currentSelectedBankTotal: number;
  bankDataTotal?: number;
  bankDataTotalPages?: number;
  bankPage: number;
  bankPageSize: number;
  isLoadingBank: boolean;
  bankDateFrom: string;
  bankDateTo: string;
  bankTableState: ReturnType<typeof useTableColumnState>;
  onSelectBankTxn: (row: any, checked: boolean) => void;
  onSelectAllBankTxns: (checked: boolean) => void;
  onBankAmountChange: (row: any, val: number) => void;
  onViewBankDetail: (id: string) => void;
  onSetBankPage: (page: number) => void;
  onSetBankPageSize: (size: number) => void;
  onSetBankDateFrom: (val: string) => void;
  onSetBankDateTo: (val: string) => void;
  onNavigateToInvoiceTab: (
    targetDirection: "IN" | "OUT",
    invoiceSearchTerm?: string,
  ) => void;
  settlementType: "RECEIPT" | "PAYMENT";
}

export interface ManualCashflowTabContentProps {
  settlementType: "RECEIPT" | "PAYMENT";
  baseRemaining: number;
  manualAmount: number | string;
  manualCategory: string;
  manualDate: string;
  manualPartner: string;
  manualNote: string;
  onSetManualAmount: (val: number | string) => void;
  onSetManualCategory: (val: string) => void;
  onSetManualDate: (val: string) => void;
  onSetManualPartner: (val: string) => void;
  onSetManualNote: (val: string) => void;
}

export interface InvoiceTabContentProps {
  invoiceDirection: "IN" | "OUT";
  invoiceItems: ErpInvoice[];
  selectedInvoicesList: ErpInvoice[];
  selectedInvoicesCount: number;
  selectedInvoicesTotal: number;
  selectedInvoicesMap: Record<string, ErpInvoice>;
  invoiceDataTotal?: number;
  invoiceDataTotalPages?: number;
  invoicePage: number;
  invoicePageSize: number;
  isLoadingInvoices: boolean;
  invoiceDateFrom: string;
  invoiceDateTo: string;
  invoiceTableState: ReturnType<typeof useTableColumnState>;
  onToggleInvoice: (inv: ErpInvoice) => void;
  onSelectAllInvoices: (checked: boolean) => void;
  onViewInvoiceDetail: (id: string) => void;
  onPreviewInvoicePdf: (pdf: PdfPreviewState) => void;
  onSetInvoicePage: (page: number) => void;
  onSetInvoicePageSize: (size: number) => void;
  onSetInvoiceDateFrom: (val: string) => void;
  onSetInvoiceDateTo: (val: string) => void;
}

export interface ReconciliationRightPanelProps {
  caseId?: string;
  caseCode?: string;
  caseSummary: any;
  settlementType: "RECEIPT" | "PAYMENT";
  activeTab: ReconciliationTabKey;
  targetRevenue: number;
  targetCost: number;
  totalCollected: number;
  totalPaid: number;
  activeTabSettlementTotal: number;
  bankSuggestions: any[];
  isLoadingBankSuggestions: boolean;
  selectedIds: string[];
  invoiceSuggestions: any[];
  isLoadingInvoiceSuggestions: boolean;
  selectedInvoicesMap: Record<string, ErpInvoice>;
  invoiceNote: string;
  onSetSettlementType: (type: "RECEIPT" | "PAYMENT") => void;
  onSelectBankTxn: (row: any, checked: boolean) => void;
  onViewBankDetail: (id: string) => void;
  onNavigateToInvoiceTab: (
    targetDirection: "IN" | "OUT",
    invoiceSearchTerm?: string,
  ) => void;
  onToggleInvoice: (inv: ErpInvoice) => void;
  onViewInvoiceDetail: (id: string) => void;
  onSetInvoiceNote: (note: string) => void;
}
