import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import type {
  SettlementSubmissionItem,
  InvoiceLinkPayloadItem,
  PdfPreviewState,
  FinancialsDomainDirection,
} from "../GarageCaseReconciliationDrawer/types";

export type { FinancialsDomainDirection };

export type FinancialsSubTabKey =
  | "invoices_out"
  | "invoices_in"
  | "manual_cashflow";

export type FinancialsTableViewPreset =
  | "all"
  | "suggestions"
  | "selected"
  | "linked";

export interface GarageCaseFinancialsTabProps {
  caseId: string;
  caseCode?: string;
  caseData?: any;
  editMode?: boolean;
  onStartEdit?: () => void;
  activeSettlements?: any[];
  activeLinkedInvoices?: any[];
  activeSummary?: any;
  onAddSettlement?: (items: SettlementSubmissionItem[]) => void;
  onRemoveSettlement?: (id: string) => void;
  onAddInvoice?: (
    payload: InvoiceLinkPayloadItem | InvoiceLinkPayloadItem[],
  ) => void;
  onRemoveInvoice?: (id: string) => void;
  initialSubTab?: FinancialsSubTabKey;
}

export interface GarageCaseFinancialsContextValue {
  caseId: string;
  caseCode?: string;
  caseData?: any;
  hasVat: boolean;
  editMode: boolean;
  onStartEdit?: () => void;
  domainDirection: FinancialsDomainDirection;
  setDomainDirection: (domain: FinancialsDomainDirection) => void;
  activeSubTab: FinancialsSubTabKey;
  setActiveSubTab: (tab: FinancialsSubTabKey) => void;
  viewPreset: FinancialsTableViewPreset;
  setViewPreset: (preset: FinancialsTableViewPreset) => void;
  settlementType: "RECEIPT" | "PAYMENT";
  setSettlementType: (type: "RECEIPT" | "PAYMENT") => void;

  // Case Summary & KPI
  caseSummary: any;
  targetRevenue: number;
  targetCost: number;
  totalCollected: number;
  totalPaid: number;
  effectiveReceivable: number;
  effectivePayable: number;
  activeTabSettlementTotal: number;

  // Active items (from parent / server)
  activeSettlements: any[];
  activeLinkedInvoices: any[];
  activeSummary: any;

  // Bank & Cash Statements State
  vouchers: any[];
  selectedIds: string[];
  selectedBankItems: any[];
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
  bankSuggestions: any[];
  isLoadingBankSuggestions: boolean;

  // Invoices State
  invoiceData: any;
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
  invoiceSuggestions: any[];
  isLoadingInvoiceSuggestions: boolean;
  invoiceNote: string;
  setInvoiceNote: (val: string) => void;

  // Manual Cashflow State
  manualAmount: number | string;
  manualCategory: string;
  manualDate: string;
  manualPartner: string;
  manualNote: string;
  setManualAmount: (val: number | string) => void;
  setManualCategory: (val: string) => void;
  setManualDate: (val: string) => void;
  setManualPartner: (val: string) => void;
  setManualNote: (val: string) => void;

  // Modals & Detail Drawers
  detailTxnId: string | null;
  setDetailTxnId: (id: string | null) => void;
  viewInvoiceId: string | null;
  setViewInvoiceId: (id: string | null) => void;
  pdfPreview: PdfPreviewState | null;
  setPdfPreview: (preview: PdfPreviewState | null) => void;

  // Actions / Handlers
  handleSelectBankTxn: (row: any, checked: boolean) => void;
  handleSelectAllBankTxns: (checked: boolean) => void;
  handleBankAmountChange: (row: any, val: number) => void;
  handleToggleInvoice: (inv: ErpInvoice) => void;
  handleSelectAllInvoices: (checked: boolean) => void;
  handleSaveCurrentTabChanges: () => Promise<void>;
  handleNavigateToInvoiceTab: (
    targetDirection: "IN" | "OUT",
    invoiceSearchTerm?: string,
  ) => void;

  // Pagination & Filters setters
  setBankPage: (page: number) => void;
  setBankPageSize: (size: number) => void;
  setBankDateFrom: (val: string) => void;
  setBankDateTo: (val: string) => void;
  setInvoicePage: (page: number) => void;
  setInvoicePageSize: (size: number) => void;
  setInvoiceDateFrom: (val: string) => void;
  setInvoiceDateTo: (val: string) => void;
}
