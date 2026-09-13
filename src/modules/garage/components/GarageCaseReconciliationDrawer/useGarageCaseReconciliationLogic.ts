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
} from "./types";

export function useGarageCaseReconciliationLogic({
  open,
  onClose,
  caseId,
  initialTab = "bank_cash",
  defaultType = "RECEIPT",
  suggestedAmount = 0,
  remainingReceivable = 0,
  remainingPayable = 0,
  editingItem = null,
  onSuccess,
  onSubmitSettlements,
  onSubmitInvoices,
}: GarageCaseReconciliationDrawerProps) {
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);
  const queryClient = useQueryClient();

  // Active Tab State
  const [activeTab, setActiveTab] = useState<ReconciliationTabKey>(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  // ─── Query Case Financial Summary & Details ──────────────────────────────
  const { data: caseSummary } = useQuery({
    queryKey: ["garage-case-financial-summary", caseId],
    queryFn: () =>
      caseId
        ? garageApi.getCaseFinancialSummary(caseId)
        : Promise.resolve(null),
    enabled: open && !!caseId,
  });

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
  const { data: linkedInvoices = [] } = useQuery({
    queryKey: ["garage-case-linked-invoices-for-drawer", caseId],
    queryFn: () =>
      caseId ? garageApi.getCaseLinkedInvoices(caseId) : Promise.resolve([]),
    enabled: open && !!caseId,
  });

  const initialLinkedOutCount = useMemo(
    () =>
      (linkedInvoices || []).filter((l: any) => (l.linkType || "OUT") === "OUT")
        .length,
    [linkedInvoices],
  );

  const initialLinkedInCount = useMemo(
    () => (linkedInvoices || []).filter((l: any) => l.linkType === "IN").length,
    [linkedInvoices],
  );

  // ─── TAB 1 & 2: BANK & CASH SETTLEMENTS STATE ─────────────────────────────
  const [settlementType, setSettlementType] = useState<"RECEIPT" | "PAYMENT">(
    defaultType,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  // Manual Form States (Tab 2)
  const [manualAmount, setManualAmount] = useState<number | string>(
    suggestedAmount || 0,
  );
  const [manualCategory, setManualCategory] = useState<string>(
    editingItem?.category || "TIEN_MAT_NGOAI",
  );
  const [manualDate, setManualDate] = useState<string>(
    editingItem?.transDate || new Date().toISOString().slice(0, 10),
  );
  const [manualPartner, setManualPartner] = useState<string>(
    editingItem?.partnerName || caseSummary?.customerName || "",
  );
  const [manualNote, setManualNote] = useState<string>(editingItem?.note || "");

  // Table State for Bank Transactions
  const bankTableState = useTableColumnState(
    "garage-bank-netoff-selection-table",
  );
  const [bankPage, setBankPage] = useState<number>(1);
  const [bankPageSize, setBankPageSize] = useState<number>(50);
  const [bankDateFrom, setBankDateFrom] = useState<string>("");
  const [bankDateTo, setBankDateTo] = useState<string>("");

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
    if (activeTab === "bank_cash") return currentSelectedBankTotal;
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

  const { data: bankData, isLoading: isLoadingBank } = useQuery({
    queryKey: [
      "bank-statements-for-netoff",
      bankPage,
      bankPageSize,
      settlementType,
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
      open && (activeTab === "bank_cash" || activeTab === "manual_cashflow"),
  });

  const vouchers = bankData?.items || [];

  const selectedBankItems = useMemo(() => {
    return selectedIds
      .map((id) => selectedTxns[id] || vouchers.find((v: any) => v.id === id))
      .filter(Boolean);
  }, [selectedIds, selectedTxns, vouchers]);

  // Query Smart Bank Suggestions
  const { data: bankSuggestions = [], isLoading: isLoadingBankSuggestions } =
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
        (activeTab === "bank_cash" || activeTab === "manual_cashflow"),
    });

  // ─── TAB 3 & 4: INVOICES SELECTION STATE ──────────────────────────────────
  const invoiceDirection: "IN" | "OUT" =
    activeTab === "invoices_in" ? "IN" : "OUT";

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

  // Pre-populate selected invoices on direction change
  useEffect(() => {
    if (open && (activeTab === "invoices_out" || activeTab === "invoices_in")) {
      const map: Record<string, ErpInvoice> = {};
      initialLinkedInvoicesForType.forEach((item: any) => {
        if (item.invoiceId) {
          map[item.invoiceId] = {
            id: item.invoiceId,
            invoiceNo: item.invoiceNo,
            sellerName: item.sellerName,
            buyerName: item.buyerName,
            totalAmount: item.totalAmount,
            preVatAmount: item.preVatAmount,
            vatAmount: item.vatAmount,
            description: item.description,
            direction: item.direction || item.linkType,
            licensePlate: item.licensePlate,
            settlementOrder: item.settlementOrder,
            serialNo: item.serialNo,
            invoiceDate: item.invoiceDate,
          } as ErpInvoice;
        }
      });
      setSelectedInvoicesMap(map);
      setViewInvoiceId(null);
      setInvoiceNote("");
    }
  }, [open, invoiceDirection, initialLinkedInvoicesForType, activeTab]);

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
    enabled:
      open && (activeTab === "invoices_out" || activeTab === "invoices_in"),
  });

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
  const handleSelectBankTxn = (row: any, checked: boolean) => {
    const id = row.id;
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
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
    }
  };

  const handleSelectAllBankTxns = (checked: boolean) => {
    if (!checked) {
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
    });

    setSelectedIds(newSelectedIds);
    setSelectedTxns(newSelectedTxns);
    setNetOffAmounts(newNetOffAmounts);
    setMaxAmounts(newMaxAmounts);
  };

  const handleBankAmountChange = (row: any, val: number) => {
    setNetOffAmounts((prev) => ({ ...prev, [row.id]: val }));
    if (!selectedIds.includes(row.id) && val > 0) {
      setSelectedIds((prev) => [...prev, row.id]);
      setSelectedTxns((prev) => ({ ...prev, [row.id]: row }));
    }
  };

  const handleToggleInvoice = (inv: ErpInvoice) => {
    setSelectedInvoicesMap((prev) => {
      const next = { ...prev };
      if (next[inv.id]) {
        delete next[inv.id];
      } else {
        next[inv.id] = inv;
      }
      return next;
    });
  };

  const handleSelectAllInvoices = (checked: boolean) => {
    if (!checked) {
      setSelectedInvoicesMap({});
      return;
    }
    const map: Record<string, ErpInvoice> = {};
    (invoiceData?.items || []).forEach((inv: ErpInvoice) => {
      map[inv.id] = inv;
    });
    setSelectedInvoicesMap(map);
  };

  // Submit Bank & Cash Settlements (Tab 1 & 2)
  const handleSubmitBankAndCash = async () => {
    try {
      setIsSubmitting(true);

      if (activeTab === "bank_cash") {
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
    setSettlementType,
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
    hasInvoiceChanges,
    isSubmitting,
    handleSelectBankTxn,
    handleSelectAllBankTxns,
    handleBankAmountChange,
    handleToggleInvoice,
    handleSelectAllInvoices,
    handleNavigateToInvoiceTab,
    handleSubmitBankAndCash,
    handleSubmitInvoices,
  };
}
