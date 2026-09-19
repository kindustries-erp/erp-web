import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { garageApi } from "@/modules/garage/api/garageApi";
import type {
  GarageCaseReconciliationDrawerProps,
  ReconciliationTabKey,
  SettlementSubmissionItem,
  PdfPreviewState,
  FinancialsDomainDirection,
} from "./types";

export function useGarageCaseReconciliationLogic({
  open,
  onClose,
  caseId,
  caseCode,
  caseData,
  initialTab = "invoices_out",
  defaultType = "RECEIPT",
  suggestedAmount = 0,
  remainingReceivable = 0,
  remainingPayable = 0,
  editingItem = null,
  editMode = false,
  onSuccess,
  activeLinkedInvoices,
  activeSettlements,
  activeSummary,
  onSubmitSettlements,
  onRemoveSettlement,
  onSubmitInvoices,
  onRemoveInvoice,
}: GarageCaseReconciliationDrawerProps & { editMode?: boolean }) {
  void caseCode;
  void suggestedAmount;
  void editingItem;
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);
  const queryClient = useQueryClient();

  // ─── Query Case Financial Summary & Details ──────────────────────────────
  const { data: queriedCaseSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", caseId],
    queryFn: () =>
      caseId
        ? garageApi.getCaseFinancialSummary(caseId)
        : Promise.resolve(null),
    enabled: open && !!caseId && !activeSummary,
  });

  const caseSummary = activeSummary || queriedCaseSummary;

  // Compute VAT eligibility for invoice tabs
  const hasVat = useMemo(() => {
    if (!caseData && !caseSummary) return true; // Default fallback if no data yet
    const rawData = caseData?.rawData;
    const vatKh = Number(rawData?.TienThueKH ?? caseData?.tienThueKh ?? 0);
    const vatRaw = Number(
      rawData?.TienThue ??
        caseData?.tienThue ??
        caseData?.vatAmount ??
        caseSummary?.vatAmount ??
        0,
    );
    const vatRate = Number(
      rawData?.PhanTramThue ?? caseData?.phanTramThue ?? 0,
    );
    const daTaoHd = Boolean(
      rawData?.DaTaoHoaDonThue ?? caseData?.daTaoHoaDonThue ?? false,
    );

    return vatKh > 0 || vatRaw > 0 || vatRate > 0 || daTaoHd;
  }, [caseData, caseSummary]);

  // Active Tab & View Preset State
  const resolvedInitialTab = useMemo(() => {
    if (!hasVat) return "manual_cashflow";
    return initialTab;
  }, [hasVat, initialTab]);

  const [activeTab, setActiveTab] =
    useState<ReconciliationTabKey>(resolvedInitialTab);
  const [viewPreset, setViewPreset] = useState<
    "all" | "suggestions" | "selected" | "linked"
  >("all");

  useEffect(() => {
    if (open) {
      setActiveTab(resolvedInitialTab);
      setViewPreset("all");
    }
  }, [open, resolvedInitialTab]);

  useEffect(() => {
    if (
      !hasVat &&
      (activeTab === "invoices_out" || activeTab === "invoices_in")
    ) {
      setActiveTab("manual_cashflow");
    }
  }, [hasVat, activeTab]);

  useEffect(() => {
    setViewPreset("all");
  }, [activeTab, caseId]);

  const targetRevenue = Number(
    caseSummary?.targetRevenue ?? caseSummary?.targetReceivable ?? 0,
  );
  const targetCost = Number(
    caseSummary?.targetCost ?? caseSummary?.targetPayable ?? 0,
  );

  const effectiveReceivable =
    caseSummary?.breakdown?.receipts?.remainingReceivable ??
    remainingReceivable ??
    Math.max(0, targetRevenue);
  const effectivePayable =
    caseSummary?.breakdown?.payments?.remainingPayable ??
    remainingPayable ??
    Math.max(0, targetCost);

  const totalCollected = Number(
    caseSummary?.breakdown?.receipts?.totalCollected ??
      Math.max(0, targetRevenue - effectiveReceivable),
  );
  const totalPaid = Number(
    caseSummary?.breakdown?.payments?.totalPaid ??
      Math.max(0, targetCost - effectivePayable),
  );

  // ─── Query Currently Linked Invoices ──────────────────────────────────────
  const { data: queriedLinkedInvoices = [] } = useQuery({
    queryKey: ["garage-case-linked-invoices-for-drawer", caseId],
    queryFn: () =>
      caseId ? garageApi.getCaseLinkedInvoices(caseId) : Promise.resolve([]),
    enabled: open && !!caseId && !activeLinkedInvoices,
  });

  const linkedInvoices = activeLinkedInvoices || queriedLinkedInvoices;

  const initialLinkedOutCount = useMemo(
    () =>
      (linkedInvoices || []).filter((l: any) => (l.linkType || "OUT") === "OUT")
        .length,
    [linkedInvoices],
  );

  const initialLinkedInCount = useMemo(
    () =>
      (linkedInvoices || []).filter((l: any) => (l.linkType || "OUT") === "IN")
        .length,
    [linkedInvoices],
  );

  // ─── Domain Direction & Settlement Type (REVENUE vs COST) ────────────────
  const [domainDirection, setDomainDirection] =
    useState<FinancialsDomainDirection>(
      defaultType === "PAYMENT" || initialTab === "invoices_in"
        ? "COST"
        : "REVENUE",
    );

  const [settlementType, setSettlementType] = useState<"RECEIPT" | "PAYMENT">(
    defaultType || (domainDirection === "COST" ? "PAYMENT" : "RECEIPT"),
  );

  const handleSetDomainDirection = useCallback(
    (domain: FinancialsDomainDirection) => {
      setDomainDirection(domain);
      if (domain === "REVENUE") {
        setSettlementType("RECEIPT");
        if (hasVat && activeTab === "invoices_in") {
          setActiveTab("invoices_out");
        }
      } else {
        setSettlementType("PAYMENT");
        if (hasVat && activeTab === "invoices_out") {
          setActiveTab("invoices_in");
        }
      }
      setViewPreset("all");
    },
    [activeTab, hasVat],
  );

  const handleSetSettlementType = useCallback(
    (type: "RECEIPT" | "PAYMENT") => {
      setSettlementType(type);
      if (type === "RECEIPT") {
        setDomainDirection("REVENUE");
        if (hasVat && activeTab === "invoices_in") {
          setActiveTab("invoices_out");
        }
      } else {
        setDomainDirection("COST");
        if (hasVat && activeTab === "invoices_out") {
          setActiveTab("invoices_in");
        }
      }
      setViewPreset("all");
    },
    [activeTab, hasVat],
  );

  // Auto switch settlementType & domain when activeTab changes
  useEffect(() => {
    if (activeTab === "invoices_out") {
      setSettlementType("RECEIPT");
      setDomainDirection("REVENUE");
    } else if (activeTab === "invoices_in") {
      setSettlementType("PAYMENT");
      setDomainDirection("COST");
    }
  }, [activeTab]);

  // ─── Bank & Cash Table Selection & NetOff Amounts State ──────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  // Manual Cashflow State
  const [manualAmount, setManualAmount] = useState<number | string>("");
  const [manualCategory, setManualCategory] =
    useState<string>("TIEN_MAT_NGOAI");
  const [manualDate, setManualDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [manualPartner, setManualPartner] = useState<string>("");
  const [manualNote, setManualNote] = useState<string>("");

  // Bank & Cash Statements Pagination & Filter State
  const bankTableState = useTableColumnState(
    "garage-case-bank-reconciliation-table",
  );
  const [bankPage, setBankPage] = useState<number>(1);
  const [bankPageSize, setBankPageSize] = useState<number>(50);
  const [bankDateFrom, setBankDateFrom] = useState<string>("");
  const [bankDateTo, setBankDateTo] = useState<string>("");

  // Invoices Selection State
  const [selectedInvoicesMap, setSelectedInvoicesMap] = useState<
    Record<string, ErpInvoice>
  >({});
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [invoiceNote, setInvoiceNote] = useState<string>("");
  const [invoicePage, setInvoicePage] = useState<number>(1);
  const [invoicePageSize, setInvoicePageSize] = useState<number>(50);
  const [invoiceDateFrom, setInvoiceDateFrom] = useState<string>("");
  const [invoiceDateTo, setInvoiceDateTo] = useState<string>("");
  const [previewPdf, setPreviewPdf] = useState<PdfPreviewState | null>(null);
  const invoiceTableState = useTableColumnState(
    "garage-invoice-selection-table",
  );

  const currentRemaining =
    settlementType === "RECEIPT" ? effectiveReceivable : effectivePayable;

  // ─── REAL-TIME LIVE PREVIEW CALCULATIONS ────────────────────────────────
  const currentSelectedBankTotal = useMemo(() => {
    return selectedIds.reduce((sum, id) => {
      return sum + (Number(netOffAmounts[id]) || 0);
    }, 0);
  }, [selectedIds, netOffAmounts]);

  const currentManualAmount = useMemo(() => {
    return Number(manualAmount) || 0;
  }, [manualAmount]);

  const activeTabSettlementTotal = useMemo(() => {
    if (activeTab === "bank_statement" || activeTab === "cash_book") {
      return currentSelectedBankTotal;
    }
    if (activeTab === "manual_cashflow") return currentManualAmount;
    return 0;
  }, [activeTab, currentSelectedBankTotal, currentManualAmount]);

  const currentTargetAmount = useMemo(() => {
    return settlementType === "RECEIPT"
      ? caseSummary?.targetReceivable || 0
      : caseSummary?.targetPayable || 0;
  }, [settlementType, caseSummary]);

  const baseRemaining = useMemo(() => {
    return settlementType === "RECEIPT"
      ? effectiveReceivable
      : effectivePayable;
  }, [settlementType, effectiveReceivable, effectivePayable]);

  const projectedRemaining = useMemo(() => {
    return baseRemaining - activeTabSettlementTotal;
  }, [baseRemaining, activeTabSettlementTotal]);

  const domainTargetAmount = useMemo(() => {
    return domainDirection === "REVENUE" ? targetRevenue : targetCost;
  }, [domainDirection, targetRevenue, targetCost]);

  const domainSettledAmount = useMemo(() => {
    return domainDirection === "REVENUE" ? totalCollected : totalPaid;
  }, [domainDirection, totalCollected, totalPaid]);

  const remainingDebt = useMemo(() => {
    return domainDirection === "REVENUE"
      ? effectiveReceivable
      : effectivePayable;
  }, [domainDirection, effectiveReceivable, effectivePayable]);

  const remainingAfterNetOff = useMemo(() => {
    const netOff =
      activeTab === "invoices_out" || activeTab === "invoices_in"
        ? 0
        : activeTabSettlementTotal;
    return Math.max(0, remainingDebt - netOff);
  }, [remainingDebt, activeTab, activeTabSettlementTotal]);

  const paymentPercent = useMemo(() => {
    if (domainTargetAmount <= 0) return domainSettledAmount > 0 ? 100 : 0;
    return Math.min(
      100,
      Math.round((domainSettledAmount / domainTargetAmount) * 100),
    );
  }, [domainTargetAmount, domainSettledAmount]);

  const isPaidFull = useMemo(() => {
    return (
      remainingDebt <= 0 ||
      (domainTargetAmount > 0 && domainSettledAmount >= domainTargetAmount)
    );
  }, [remainingDebt, domainTargetAmount, domainSettledAmount]);

  const handleUnselectAll = useCallback(() => {
    setSelectedIds([]);
    setSelectedTxns({});
    setNetOffAmounts({});
    setMaxAmounts({});
    setSelectedInvoicesMap({});
    setManualAmount("");
  }, []);

  const bankSortBy =
    bankTableState.sorts.length > 0
      ? bankTableState.sorts[0]?.replace("-", "")
      : undefined;
  const bankSortOrder =
    bankTableState.sorts.length > 0
      ? bankTableState.sorts[0]?.startsWith("-")
        ? "DESC"
        : "ASC"
      : undefined;

  const bankSourceType = useMemo(() => {
    if (activeTab === "cash_book") return "CASH";
    if (activeTab === "bank_statement") return "BANK";
    return undefined;
  }, [activeTab]);

  const { data: bankData, isLoading: isLoadingBank } = useQuery({
    queryKey: [
      "bank-statements-for-netoff",
      bankPage,
      bankPageSize,
      settlementType,
      bankSourceType,
      bankDateFrom,
      bankDateTo,
      bankTableState.columnFilters,
      bankTableState.columnSearch,
      bankTableState.sorts,
    ],
    queryFn: () => {
      const typeFilter = settlementType === "RECEIPT" ? "CREDIT" : "DEBIT";
      const combinedFilters: Record<string, string[]> = {
        ...bankTableState.columnFilters,
        type: [typeFilter],
      };
      if (bankDateFrom || bankDateTo) {
        combinedFilters["transDate"] = [`${bankDateFrom}..${bankDateTo}`];
      }

      return bankStatementApi.getTransactions({
        page: bankPage,
        pageSize: bankPageSize,
        sourceType: bankSourceType,
        column_filters: JSON.stringify(combinedFilters),
        column_search:
          Object.keys(bankTableState.columnSearch).length > 0
            ? JSON.stringify(bankTableState.columnSearch)
            : undefined,
        sortBy: bankSortBy,
        sortOrder: bankSortOrder,
      });
    },
    enabled:
      open &&
      (activeTab === "bank_statement" ||
        activeTab === "cash_book" ||
        activeTab === "manual_cashflow"),
  });

  const rawBankVouchers = bankData?.items || [];

  const selectedBankItems = useMemo(() => {
    return selectedIds
      .map(
        (id) =>
          selectedTxns[id] || rawBankVouchers.find((v: any) => v.id === id),
      )
      .filter(Boolean);
  }, [selectedIds, selectedTxns, rawBankVouchers]);

  // Query Smart Bank Suggestions
  const { data: allBankSuggestions = [], isLoading: isLoadingBankSuggestions } =
    useQuery({
      queryKey: [
        "garage-case-smart-settlement-suggestions",
        caseId,
        settlementType,
      ],
      queryFn: () =>
        caseId
          ? garageApi.getSmartSettlementSuggestions(caseId, settlementType)
          : Promise.resolve([]),
      enabled:
        open &&
        !!caseId &&
        (activeTab === "bank_statement" || activeTab === "cash_book"),
    });

  const bankSuggestions = useMemo(() => {
    if (activeTab === "cash_book") {
      return (allBankSuggestions || []).filter((sug: any) => {
        const txn = sug.bankTransaction || sug.transaction || sug;
        return (
          txn.sourceType === "CASH" ||
          txn.sourceType === "CASH_BOOK" ||
          !!txn.cashBookId ||
          !!txn.cashBook
        );
      });
    }
    return (allBankSuggestions || []).filter((sug: any) => {
      const txn = sug.bankTransaction || sug.transaction || sug;
      return (
        txn.sourceType !== "CASH" &&
        txn.sourceType !== "CASH_BOOK" &&
        !txn.cashBookId
      );
    });
  }, [allBankSuggestions, activeTab]);

  // ─── TAB 3 & 4: INVOICES SELECTION STATE ──────────────────────────────────
  const invoiceDirection: "IN" | "OUT" =
    activeTab === "invoices_in" ? "IN" : "OUT";

  // Query Smart Invoice Suggestions
  const {
    data: invoiceSuggestions = [],
    isLoading: isLoadingInvoiceSuggestions,
  } = useQuery({
    queryKey: [
      "garage-case-smart-invoice-suggestions",
      caseId,
      invoiceDirection,
    ],
    queryFn: () =>
      caseId
        ? garageApi.getSmartInvoiceSuggestions(caseId, invoiceDirection)
        : Promise.resolve([]),
    enabled:
      open &&
      !!caseId &&
      (activeTab === "invoices_out" || activeTab === "invoices_in"),
  });

  const initialLinkedInvoicesForType = useMemo(() => {
    return (linkedInvoices || []).filter(
      (l: any) => (l.linkType || "OUT") === invoiceDirection,
    );
  }, [linkedInvoices, invoiceDirection]);

  const initialLinkedIdSet = useMemo(() => {
    return new Set(
      initialLinkedInvoicesForType.map((l: any) => l.invoiceId).filter(Boolean),
    );
  }, [initialLinkedInvoicesForType]);

  // Reset all temporary selections when editMode turns false
  useEffect(() => {
    if (!editMode) {
      setSelectedIds([]);
      setSelectedTxns({});
      setNetOffAmounts({});
      setMaxAmounts({});
      setInvoiceNote("");
      setManualAmount("");
    }
  }, [editMode]);

  // Pre-populate selected invoices on direction change or when editMode turns false
  useEffect(() => {
    if (open && (activeTab === "invoices_out" || activeTab === "invoices_in")) {
      const map: Record<string, ErpInvoice> = {};
      initialLinkedInvoicesForType.forEach((item: any) => {
        const invId = item.invoiceId || item.id;
        if (invId) {
          map[invId] = {
            id: invId,
            invoiceNo: item.invoiceNo || item.invoice?.invoiceNo,
            sellerName: item.sellerName || item.invoice?.sellerName,
            buyerName: item.buyerName || item.invoice?.buyerName,
            totalAmount: item.totalAmount || item.invoice?.totalAmount,
            preVatAmount: item.preVatAmount || item.invoice?.preVatAmount,
            vatAmount: item.vatAmount || item.invoice?.vatAmount,
            description: item.description || item.invoice?.description,
            direction: item.direction || item.linkType,
            licensePlate: item.licensePlate,
            settlementOrder: item.settlementOrder,
            serialNo: item.serialNo,
            invoiceDate: item.invoiceDate || item.invoice?.invoiceDate,
          } as ErpInvoice;
        }
      });
      setSelectedInvoicesMap(map);
      setViewInvoiceId(null);
      setInvoiceNote("");
    }
  }, [
    open,
    invoiceDirection,
    initialLinkedInvoicesForType,
    activeTab,
    editMode,
  ]);

  const selectedInvoicesList = useMemo(
    () => Object.values(selectedInvoicesMap),
    [selectedInvoicesMap],
  );
  const selectedInvoicesCount = selectedInvoicesList.length;
  const selectedInvoicesTotal = useMemo(
    () =>
      selectedInvoicesList.reduce(
        (sum, inv) => sum + Number(inv.totalAmount || 0),
        0,
      ),
    [selectedInvoicesList],
  );

  const currentSelectedInvoiceIds = useMemo(
    () => new Set(Object.keys(selectedInvoicesMap)),
    [selectedInvoicesMap],
  );

  const hasInvoiceChanges = useMemo(() => {
    if (initialLinkedIdSet.size !== currentSelectedInvoiceIds.size) return true;
    for (const id of currentSelectedInvoiceIds) {
      if (!initialLinkedIdSet.has(id)) return true;
    }
    return false;
  }, [initialLinkedIdSet, currentSelectedInvoiceIds]);

  // Query Invoices list
  const invoiceSortBy =
    invoiceTableState.sorts.length > 0
      ? invoiceTableState.sorts[0]?.replace("-", "")
      : undefined;
  const invoiceSortOrder =
    invoiceTableState.sorts.length > 0
      ? invoiceTableState.sorts[0]?.startsWith("-")
        ? "desc"
        : "asc"
      : undefined;

  const { data: invoiceData, isLoading: isLoadingInvoices } = useQuery({
    queryKey: [
      "erp-invoices-for-linking",
      invoiceDirection,
      invoicePage,
      invoicePageSize,
      invoiceSortBy,
      invoiceSortOrder,
      invoiceDateFrom,
      invoiceDateTo,
      invoiceTableState.columnFilters,
      invoiceTableState.columnSearch,
    ],
    queryFn: () =>
      erpInvoicesCoreApi.list({
        page: invoicePage,
        pageSize: invoicePageSize,
        direction: invoiceDirection,
        sort_by: invoiceSortBy,
        sort_order: invoiceSortOrder,
        date_from: invoiceDateFrom || undefined,
        date_to: invoiceDateTo || undefined,
        column_search:
          Object.keys(invoiceTableState.columnSearch).length > 0
            ? JSON.stringify(invoiceTableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(invoiceTableState.columnFilters).length > 0
            ? JSON.stringify(invoiceTableState.columnFilters)
            : undefined,
      }),
  });

  const rawInvoiceItems = invoiceData?.items || [];

  const vouchers = useMemo(() => {
    if (viewPreset === "suggestions") {
      return bankSuggestions.map(
        (sug: any) => sug.bankTransaction || sug.transaction || sug,
      );
    }
    if (viewPreset === "selected") {
      return selectedBankItems;
    }
    if (viewPreset === "linked") {
      const recSettlements =
        caseSummary?.breakdown?.receipts?.settlements || [];
      const paySettlements =
        caseSummary?.breakdown?.payments?.settlements || [];
      return recSettlements
        .concat(paySettlements)
        .filter((s: any) => s.sourceChannel === "ON_SYSTEM")
        .map((s: any) => ({
          id: s.bankTransactionId || s.id,
          bankTransactionId: s.bankTransactionId,
          bookingDate: s.transDate,
          transactionDate: s.transDate,
          referenceNumber: s.referenceNumber,
          partnerName: s.partnerName,
          description: s.note,
          bankName: s.bankName,
          accountNumber: s.accountNumber,
          creditAmount: s.settlementType === "RECEIPT" ? s.amount : 0,
          debitAmount: s.settlementType === "PAYMENT" ? s.amount : 0,
          netOffAmount: s.amount,
          isLinked: true,
        }));
    }
    return rawBankVouchers;
  }, [
    viewPreset,
    bankSuggestions,
    selectedBankItems,
    caseSummary,
    rawBankVouchers,
  ]);

  const invoiceItems = useMemo(() => {
    if (viewPreset === "suggestions") {
      return invoiceSuggestions.map((sug: any) => sug.invoice || sug);
    }
    if (viewPreset === "selected") {
      return selectedInvoicesList;
    }
    if (viewPreset === "linked") {
      return initialLinkedInvoicesForType.map((item: any) => ({
        id: item.invoiceId || item.id,
        invoiceNo: item.invoiceNo || item.invoiceNumber,
        invoiceNumber: item.invoiceNumber || item.invoiceNo,
        invoiceDate: item.invoiceDate,
        buyerName: item.buyerName,
        sellerName: item.sellerName,
        partnerName: item.partnerName || item.buyerName || item.sellerName,
        taxCode: item.taxCode || item.buyerTaxCode || item.sellerTaxCode,
        totalAmount: item.totalAmount,
        vatAmount: item.vatAmount,
        preVatAmount: item.preVatAmount,
        isLinked: true,
      }));
    }
    return rawInvoiceItems;
  }, [
    viewPreset,
    invoiceSuggestions,
    selectedInvoicesList,
    initialLinkedInvoicesForType,
    rawInvoiceItems,
  ]);

  const displayBankTotal = useMemo(() => {
    if (viewPreset === "suggestions") return bankSuggestions.length;
    if (viewPreset === "selected") return selectedBankItems.length;
    if (viewPreset === "linked") {
      const recSettlements =
        caseSummary?.breakdown?.receipts?.settlements || [];
      const paySettlements =
        caseSummary?.breakdown?.payments?.settlements || [];
      return recSettlements
        .concat(paySettlements)
        .filter((s: any) => s.sourceChannel === "ON_SYSTEM").length;
    }
    return bankData?.total || 0;
  }, [
    viewPreset,
    bankSuggestions.length,
    selectedBankItems.length,
    caseSummary,
    bankData?.total,
  ]);

  const displayBankTotalPages = useMemo(() => {
    if (viewPreset !== "all") return 1;
    return bankData?.totalPages || 0;
  }, [viewPreset, bankData?.totalPages]);

  const displayInvoiceTotal = useMemo(() => {
    if (viewPreset === "suggestions") return invoiceSuggestions.length;
    if (viewPreset === "selected") return selectedInvoicesList.length;
    if (viewPreset === "linked") return initialLinkedInvoicesForType.length;
    return invoiceData?.total || 0;
  }, [
    viewPreset,
    invoiceSuggestions.length,
    selectedInvoicesList.length,
    initialLinkedInvoicesForType.length,
    invoiceData?.total,
  ]);

  const displayInvoiceTotalPages = useMemo(() => {
    if (viewPreset !== "all") return 1;
    return invoiceData?.totalPages || 0;
  }, [viewPreset, invoiceData?.totalPages]);

  // ─── SMART INVOICE CROSS-NAVIGATION HANDLER ──────────────────────────────
  const handleNavigateToInvoiceTab = useCallback(
    (targetDirection: "IN" | "OUT", invoiceSearchTerm?: string) => {
      setActiveTab(targetDirection === "OUT" ? "invoices_out" : "invoices_in");
      if (invoiceSearchTerm) {
        invoiceTableState.setColumnSearch("invoiceNo", invoiceSearchTerm);
      }
      toast.success(
        t(
          "cases.reconciliation.navigatedToInvoice",
          "Đã chuyển sang Tab Hóa đơn đối soát: {{type}}",
          {
            type:
              targetDirection === "OUT" ? "Hóa đơn Bán ra" : "Hóa đơn Mua vào",
          },
        ),
      );
    },
    [invoiceTableState, t],
  );

  // ─── SUBMISSION & SELECTION HANDLERS ──────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Tab 1 & 2: Bank Selection Handlers
  const handleSelectBankTxn = useCallback(
    (row: any, checked: boolean) => {
      const id = row.id;
      if (checked) {
        setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setSelectedTxns((prev) => ({ ...prev, [id]: row }));

        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        setMaxAmounts((prev) => ({ ...prev, [id]: remaining }));

        const allocated =
          currentRemaining > 0
            ? Math.min(remaining, currentRemaining)
            : remaining;
        setNetOffAmounts((prev) => ({ ...prev, [id]: allocated }));

        if (editMode && onSubmitSettlements) {
          const isCredit = Number(row.creditAmount || 0) > 0;
          onSubmitSettlements([
            {
              bankTransactionId: id,
              settlementType: isCredit ? "RECEIPT" : "PAYMENT",
              sourceChannel: "ON_SYSTEM",
              amount: allocated,
              transDate:
                row.bookingDate ||
                row.transactionDate ||
                (row.transDate
                  ? new Date(row.transDate).toISOString().slice(0, 10)
                  : undefined),
              partnerName: row.partnerName || row.correspondentName,
              note: row.description || row.note,
              referenceNumber: row.referenceNumber,
              bankName:
                row.bankName || row.bankAccount?.bankName || row.cashBook?.name,
              correspondentName: row.correspondentName || row.partnerName,
              sourceType: row.sourceType,
              accountNumber:
                row.accountNumber || row.bankAccount?.accountNumber,
              cashBookName: row.cashBookName || row.cashBook?.name,
            },
          ]);
        }
      } else {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setSelectedTxns((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setNetOffAmounts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        setMaxAmounts((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });

        if (editMode && onRemoveSettlement) {
          onRemoveSettlement(id);
        }
      }
    },
    [currentRemaining, editMode, onSubmitSettlements, onRemoveSettlement],
  );

  const handleSelectAllBankTxns = useCallback(
    (checked: boolean) => {
      if (!checked) {
        if (editMode && onRemoveSettlement) {
          selectedIds.forEach((id) => onRemoveSettlement(id));
        }
        setSelectedIds([]);
        setSelectedTxns({});
        setNetOffAmounts({});
        setMaxAmounts({});
        return;
      }

      const newSelectedIds: string[] = [];
      const newSelectedTxns: Record<string, any> = {};
      const newNetOffAmounts: Record<string, number> = {};
      const newMaxAmounts: Record<string, number> = {};
      const newItemsToSubmit: SettlementSubmissionItem[] = [];

      vouchers.forEach((row: any) => {
        const id = row.id;
        newSelectedIds.push(id);
        newSelectedTxns[id] = row;

        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        newMaxAmounts[id] = remaining;
        newNetOffAmounts[id] = remaining;

        const isCredit = Number(row.creditAmount || 0) > 0;
        newItemsToSubmit.push({
          bankTransactionId: id,
          settlementType: isCredit ? "RECEIPT" : "PAYMENT",
          sourceChannel: "ON_SYSTEM",
          amount: remaining,
          transDate: row.bookingDate || row.transactionDate,
          partnerName: row.partnerName || row.correspondentName,
          note: row.description || row.note,
          referenceNumber: row.referenceNumber,
          bankName: row.bankName,
          sourceType: row.sourceType,
        });
      });

      setSelectedIds(newSelectedIds);
      setSelectedTxns(newSelectedTxns);
      setNetOffAmounts(newNetOffAmounts);
      setMaxAmounts(newMaxAmounts);

      if (editMode && onSubmitSettlements && newItemsToSubmit.length > 0) {
        onSubmitSettlements(newItemsToSubmit);
      }
    },
    [editMode, onRemoveSettlement, onSubmitSettlements, selectedIds, vouchers],
  );

  const handleBankAmountChange = useCallback(
    (row: any, val: number) => {
      setNetOffAmounts((prev) => ({ ...prev, [row.id]: val }));
      if (!selectedIds.includes(row.id) && val > 0) {
        handleSelectBankTxn(row, true);
      }
    },
    [handleSelectBankTxn, selectedIds],
  );

  const handleToggleInvoice = useCallback(
    (inv: ErpInvoice) => {
      const isCurrentlySelected = !!selectedInvoicesMap[inv.id];
      if (isCurrentlySelected) {
        setSelectedInvoicesMap((prev) => {
          const next = { ...prev };
          delete next[inv.id];
          return next;
        });
        if (editMode && onRemoveInvoice) {
          const found = (linkedInvoices || []).find(
            (l: any) =>
              l.invoiceId === inv.id || l.id === inv.id || l.tempId === inv.id,
          );
          onRemoveInvoice(found?.id || found?.tempId || inv.id);
        }
      } else {
        setSelectedInvoicesMap((prev) => ({
          ...prev,
          [inv.id]: inv,
        }));
        if (editMode && onSubmitInvoices) {
          onSubmitInvoices({
            invoiceId: inv.id,
            linkType: invoiceDirection,
            note: invoiceNote,
            invoice: inv,
          });
        }
      }
    },
    [
      selectedInvoicesMap,
      setSelectedInvoicesMap,
      editMode,
      onRemoveInvoice,
      onSubmitInvoices,
      linkedInvoices,
      invoiceDirection,
      invoiceNote,
    ],
  );

  const handleSelectAllInvoices = useCallback(
    (checked: boolean) => {
      if (!checked) {
        if (editMode && onRemoveInvoice) {
          Object.keys(selectedInvoicesMap).forEach((id) => {
            const found = (linkedInvoices || []).find(
              (l: any) => l.invoiceId === id || l.id === id || l.tempId === id,
            );
            onRemoveInvoice(found?.id || found?.tempId || id);
          });
        }
        setSelectedInvoicesMap({});
        return;
      }
      const map: Record<string, ErpInvoice> = {};
      const itemsToAdd: any[] = [];
      (invoiceData?.items || []).forEach((inv: ErpInvoice) => {
        map[inv.id] = inv;
        if (!selectedInvoicesMap[inv.id]) {
          itemsToAdd.push({
            invoiceId: inv.id,
            linkType: invoiceDirection,
            note: invoiceNote,
            invoice: inv,
          });
        }
      });
      setSelectedInvoicesMap(map);
      if (editMode && onSubmitInvoices && itemsToAdd.length > 0) {
        onSubmitInvoices(itemsToAdd);
      }
    },
    [
      editMode,
      onRemoveInvoice,
      onSubmitInvoices,
      selectedInvoicesMap,
      setSelectedInvoicesMap,
      linkedInvoices,
      invoiceData?.items,
      invoiceDirection,
      invoiceNote,
    ],
  );

  // Select All Filtered Suggestions Handler (1-Click)
  const handleSelectAllSuggestions = useCallback(() => {
    if (activeTab === "bank_statement" || activeTab === "cash_book") {
      bankSuggestions.forEach((sug: any) => {
        const txn = sug.bankTransaction || sug.transaction || sug;
        if (txn && !selectedIds.includes(txn.id)) {
          handleSelectBankTxn(txn, true);
        }
      });
      toast.success(
        t(
          "cases.financials.selectedAllSuggestions",
          "Đã chọn tất cả gợi ý khớp",
        ),
      );
    } else if (activeTab === "invoices_out" || activeTab === "invoices_in") {
      invoiceSuggestions.forEach((sug: any) => {
        const inv = sug.invoice || sug;
        if (inv && !selectedInvoicesMap[inv.id]) {
          handleToggleInvoice(inv);
        }
      });
      toast.success(
        t(
          "cases.financials.selectedAllSuggestions",
          "Đã chọn tất cả gợi ý khớp",
        ),
      );
    }
  }, [
    activeTab,
    bankSuggestions,
    invoiceSuggestions,
    selectedIds,
    selectedInvoicesMap,
    handleSelectBankTxn,
    handleToggleInvoice,
    t,
  ]);

  // Submit Bank & Cash Settlements (Tab 1 & 2)
  const handleSubmitBankAndCash = async () => {
    try {
      setIsSubmitting(true);

      if (activeTab === "bank_statement" || activeTab === "cash_book") {
        if (selectedIds.length === 0) {
          toast.error(
            t(
              "cases.reconciliation.noTxnSelected",
              "Vui lòng chọn ít nhất 1 giao dịch sao kê",
            ),
          );
          return;
        }

        const items: SettlementSubmissionItem[] = [];
        for (const id of selectedIds) {
          const amt = netOffAmounts[id] || 0;
          if (amt <= 0) continue;
          const txn = selectedTxns[id];
          const isCredit = Number(txn?.creditAmount || 0) > 0;

          items.push({
            bankTransactionId: id,
            settlementType: isCredit ? "RECEIPT" : "PAYMENT",
            sourceChannel: "ON_SYSTEM",
            amount: amt,
            transDate: txn?.transDate
              ? new Date(txn.transDate).toISOString().slice(0, 10)
              : undefined,
            partnerName: txn?.correspondentName || undefined,
            note: txn?.description || undefined,
            referenceNumber: txn?.referenceNumber || undefined,
            bankName:
              txn?.bankAccount?.bankName || txn?.cashBook?.name || undefined,
            correspondentName: txn?.correspondentName || undefined,
            sourceType: txn?.sourceType,
            accountNumber: txn?.bankAccount?.accountNumber,
            cashBookName: txn?.cashBook?.name,
          });
        }

        if (onSubmitSettlements) {
          await onSubmitSettlements(items);
        } else if (caseId) {
          for (const item of items) {
            await garageApi.addCaseSettlement(caseId, item);
          }
        }

        toast.success(
          t(
            "cases.reconciliation.settlementSuccess",
            "Đã ghi nhận cấn trừ sao kê thành công",
          ),
        );
      } else if (activeTab === "manual_cashflow") {
        if (!manualAmount || Number(manualAmount) <= 0) {
          toast.error(
            t(
              "cases.reconciliation.validAmount",
              "Vui lòng nhập số tiền hợp lệ (> 0)",
            ),
          );
          return;
        }

        const manualItem: SettlementSubmissionItem = {
          settlementType,
          sourceChannel: "OFF_SYSTEM_MANUAL",
          category: manualCategory,
          amount: Number(manualAmount),
          transDate: manualDate,
          partnerName: manualPartner || undefined,
          note: manualNote || undefined,
        };

        if (onSubmitSettlements) {
          await onSubmitSettlements([manualItem]);
        } else if (caseId) {
          await garageApi.addCaseSettlement(caseId, manualItem);
        }

        toast.success(
          t(
            "cases.reconciliation.manualSuccess",
            "Đã ghi nhận dòng tiền ngoài sổ sách thành công",
          ),
        );
      }

      // Invalidate queries
      if (caseId) {
        queryClient.invalidateQueries({
          queryKey: ["garage-case-financial-summary", caseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-case-settlements", caseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-case-traceability-graph", caseId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["garage", "grossProfitReport"],
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t("cases.reconciliation.saveError", "Lỗi lưu giao dịch"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Linked Invoices (Tab 3 & 4)
  const handleSubmitInvoices = async () => {
    if (!hasInvoiceChanges) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);

      if (caseId && !caseId.startsWith("tmp-")) {
        // 1. Remove unselected invoices
        const removedLinks = (linkedInvoices || []).filter(
          (l: any) =>
            (l.linkType || "OUT") === invoiceDirection &&
            !selectedInvoicesMap[l.invoiceId],
        );
        for (const r of removedLinks) {
          if (r.id) {
            await garageApi.removeCaseLinkedInvoice(caseId, r.id);
          }
        }

        // 2. Add newly selected invoices
        const newlyAddedInvoices = selectedInvoicesList.filter(
          (inv) => !initialLinkedIdSet.has(inv.id),
        );

        if (newlyAddedInvoices.length > 0) {
          if (newlyAddedInvoices.length === 1) {
            await garageApi.addCaseLinkedInvoice(
              caseId,
              newlyAddedInvoices[0].id,
              invoiceDirection,
              invoiceNote || undefined,
            );
          } else {
            await garageApi.addCaseLinkedInvoices(
              caseId,
              newlyAddedInvoices.map((inv) => ({
                invoiceId: inv.id,
                linkType: invoiceDirection,
                note: invoiceNote || undefined,
              })),
            );
          }
        }
      }

      if (onSubmitInvoices) {
        await onSubmitInvoices(
          selectedInvoicesList.map((inv) => ({
            invoiceId: inv.id,
            linkType: invoiceDirection,
            note: invoiceNote,
            invoice: inv,
          })),
        );
      }

      toast.success(
        t(
          "cases.reconciliation.invoiceLinkSuccess",
          "Đã cập nhật liên kết hóa đơn thành công",
        ),
      );

      if (caseId) {
        queryClient.invalidateQueries({
          queryKey: ["garage-case-linked-invoices-for-drawer", caseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-case-financial-summary", caseId],
        });
        queryClient.invalidateQueries({
          queryKey: ["garage-case-traceability-graph", caseId],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["garage", "grossProfitReport"],
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          t(
            "cases.reconciliation.saveInvoiceError",
            "Lỗi lưu liên kết hóa đơn",
          ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    t,
    activeTab,
    setActiveTab,
    caseSummary,
    targetRevenue,
    targetCost,
    totalCollected,
    totalPaid,
    effectiveReceivable,
    effectivePayable,
    initialLinkedOutCount,
    initialLinkedInCount,
    settlementType,
    setSettlementType: handleSetSettlementType,
    selectedIds,
    selectedBankItems,
    netOffAmounts,
    maxAmounts,
    detailTxnId,
    setDetailTxnId,
    manualAmount,
    setManualAmount,
    manualCategory,
    setManualCategory,
    manualDate,
    setManualDate,
    manualPartner,
    setManualPartner,
    manualNote,
    setManualNote,
    bankTableState,
    bankPage,
    setBankPage,
    bankPageSize,
    setBankPageSize,
    bankDateFrom,
    setBankDateFrom,
    bankDateTo,
    setBankDateTo,
    bankData,
    isLoadingBank,
    vouchers,
    bankSuggestions,
    isLoadingBankSuggestions,
    currentSelectedBankTotal,
    currentManualAmount,
    activeTabSettlementTotal,
    currentTargetAmount,
    baseRemaining,
    projectedRemaining,
    invoiceDirection,
    selectedInvoicesMap,
    selectedInvoicesList,
    selectedInvoicesCount,
    selectedInvoicesTotal,
    viewInvoiceId,
    setViewInvoiceId,
    invoiceNote,
    setInvoiceNote,
    invoicePage,
    setInvoicePage,
    invoicePageSize,
    setInvoicePageSize,
    invoiceDateFrom,
    setInvoiceDateFrom,
    invoiceDateTo,
    setInvoiceDateTo,
    previewPdf,
    setPreviewPdf,
    invoiceTableState,
    invoiceData,
    isLoadingInvoices,
    invoiceSuggestions,
    isLoadingInvoiceSuggestions,
    viewPreset,
    setViewPreset,
    displayBankTotal,
    displayBankTotalPages,
    displayInvoiceTotal,
    displayInvoiceTotalPages,
    invoiceItems,
    editMode,
    isSubmitting,
    hasInvoiceChanges,
    domainDirection,
    setDomainDirection: handleSetDomainDirection,
    isPaidFull,
    paymentPercent,
    remainingDebt,
    remainingAfterNetOff,
    handleUnselectAll,
    handleSelectBankTxn,
    handleSelectAllBankTxns,
    handleBankAmountChange,
    handleToggleInvoice,
    handleSelectAllInvoices,
    handleSelectAllSuggestions,
    handleNavigateToInvoiceTab,
    handleSubmitBankAndCash,
    handleSubmitInvoices,
    activeSettlements: activeSettlements || [],
    onRemoveSettlement,
    onSubmitSettlements,
    hasVat,
    caseData,
  };
}
