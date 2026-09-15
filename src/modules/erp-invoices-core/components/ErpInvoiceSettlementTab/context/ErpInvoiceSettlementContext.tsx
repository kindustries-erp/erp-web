import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { erpInvoicesCoreApi } from "../../../api/erpInvoicesCoreApi";
import {
  type SettlementSubTabKey,
  type SettlementTableViewPreset,
  type ActiveVoucherItem,
  type ErpInvoiceSettlementContextValue,
  type ErpInvoiceSettlementTabProps,
} from "../types";
import {
  type SettlementType,
  type SelectedVoucherItem,
} from "../../VoucherNetoffSelectionModal/types";
import {
  calculateTotalNetOff,
  calculateRemainingAfterNetOff,
  checkIsOverRemaining,
} from "../../VoucherNetoffSelectionModal/utils";

const ErpInvoiceSettlementContext =
  createContext<ErpInvoiceSettlementContextValue | null>(null);

export interface ErpInvoiceSettlementProviderProps extends ErpInvoiceSettlementTabProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function ErpInvoiceSettlementProvider({
  children,
  invoice,
  form,
  editMode,
  fieldSet,
  direction = "OUT",
  onRefresh,
  onStartEdit,
  enabled = true,
}: ErpInvoiceSettlementProviderProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  // Sub tab: 1. Sao kê (bank_statement) vs 2. Sổ quỹ (cash_book)
  const [activeSubTab, setActiveSubTab] =
    useState<SettlementSubTabKey>("bank_statement");

  // View Preset: "all" | "suggestions" | "selected" | "linked"
  const [viewPreset, setViewPreset] =
    useState<SettlementTableViewPreset>("all");

  // Popup xem chi tiết sao kê
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Settlement Type (RECEIPT vs PAYMENT)
  const settlementType: SettlementType = useMemo(() => {
    return direction === "IN" ? "PAYMENT" : "RECEIPT";
  }, [direction]);

  // Selections State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});

  // Reset selections when invoice ID changes or drawer opens
  const invoiceId = invoice?.id;
  useEffect(() => {
    setSelectedIds([]);
    setNetOffAmounts({});
    setMaxAmounts({});
    setSelectedTxns({});
    setViewPreset("all");
  }, [invoiceId]);

  // Table & Filter State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const tableState = useTableColumnState("invoice-settlement-bank-table");

  // Query Danh sách Giao dịch Sao kê Ngân hàng
  const { data, isLoading: isLoadingVouchers } = useQuery({
    queryKey: [
      "bank-statement-transactions-for-invoice-settlement",
      page,
      pageSize,
      settlementType,
      dateFrom,
      dateTo,
      tableState.columnFilters,
      tableState.sorts,
      tableState.columnSearch,
    ],
    queryFn: () => {
      const hasSort = tableState.sorts && tableState.sorts.length > 0;
      const sortField = hasSort
        ? tableState.sorts[0].replace("-", "")
        : "transDate";
      const sortOrder = hasSort
        ? tableState.sorts[0].startsWith("-")
          ? "DESC"
          : "ASC"
        : "DESC";

      return bankStatementApi.getTransactions({
        page,
        pageSize,
        sortBy: sortField,
        sortOrder,
        startDate: dateFrom || undefined,
        endDate: dateTo || undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
      });
    },
    enabled: enabled && activeSubTab === "bank_statement",
  });

  const vouchers = data?.items || data?.data || [];
  const totalVouchers = data?.total || 0;
  const totalPages = data?.totalPages || 0;

  // Query Smart Suggestions
  const targetInvoiceId = invoiceId;
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: [
      "smart-net-off-suggestions-settlement-tab",
      targetInvoiceId,
      settlementType,
      enabled,
    ],
    queryFn: () => {
      if (targetInvoiceId) {
        return erpInvoicesCoreApi.getSmartNetOffSuggestions([targetInvoiceId]);
      }
      return Promise.resolve({ suggestions: [] });
    },
    enabled: enabled && !!targetInvoiceId,
  });

  const suggestions = useMemo(() => {
    if (!suggestionsData) return [];
    if (targetInvoiceId && Array.isArray(suggestionsData[targetInvoiceId])) {
      return suggestionsData[targetInvoiceId];
    }
    if (Array.isArray((suggestionsData as any)?.suggestions)) {
      return (suggestionsData as any).suggestions;
    }
    return [];
  }, [suggestionsData, targetInvoiceId]);

  // Lọc suggestions theo chiều đối soát (PAYMENT -> debit > 0, RECEIPT -> credit > 0)
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s: any) => {
      const isDebit = (s.txn.debitAmount || 0) > 0;
      return settlementType === "PAYMENT" ? isDebit : !isDebit;
    });
  }, [suggestions, settlementType]);

  // Active Vouchers (Persisted + Pending)
  const activeVouchers: ActiveVoucherItem[] = useMemo(() => {
    const list: ActiveVoucherItem[] = [];
    const pending = form?.pendingDocumentChanges || [];

    const removedBankIds = pending
      .filter((p) => p.action === "REMOVE" && p.type === "BANK")
      .map((p) => p.refId);

    (invoice?.voucherNetOffs || []).forEach((v) => {
      if (removedBankIds.includes(v.bankTransactionId)) return;
      list.push({
        id: v.id,
        bankTransactionId: v.bankTransactionId,
        refNo:
          v.bankTransaction?.referenceNumber ||
          v.bankTransaction?.description ||
          `GD #${v.bankTransactionId.slice(0, 8)}`,
        description: v.bankTransaction?.description || "—",
        transDate: v.bankTransaction?.transDate || null,
        amount: Number(v.netOffAmount || 0),
        bankName:
          v.bankTransaction?.bankAccount?.bankName ||
          v.bankTransaction?.bankName ||
          v.bankTransaction?.cashBook?.name ||
          "Sao kê ERP",
        partnerName:
          v.bankTransaction?.partnerName ||
          v.bankTransaction?.correspondentName ||
          "",
        isPending: false,
      });
    });

    // Pending added items
    pending
      .filter((p) => p.action === "ADD" && p.type === "BANK")
      .forEach((p) => {
        list.push({
          id: p.refId,
          bankTransactionId: p.refId,
          refNo: `Giao dịch #${p.refId.slice(0, 8)}`,
          description: "Giao dịch đang chờ lưu...",
          transDate: new Date().toISOString(),
          amount: Number(p.amount || 0),
          bankName: "Sao kê ERP",
          partnerName: "",
          isPending: true,
        });
      });

    return list;
  }, [invoice?.voucherNetOffs, form?.pendingDocumentChanges]);

  // Debt & Progress Calculations
  const totalInvoiceAmount = Number(
    invoice?.totalAmount || form?.totalAmount || 0,
  );
  const totalNetOff = activeVouchers.reduce(
    (sum, v) => sum + Number(v.amount || 0),
    0,
  );
  const remainingDebt = Math.max(0, totalInvoiceAmount - totalNetOff);
  const paymentPercent =
    totalInvoiceAmount > 0
      ? Math.min(100, Math.round((totalNetOff / totalInvoiceAmount) * 100))
      : totalNetOff > 0
        ? 100
        : 0;
  const isPaidFull =
    totalNetOff >= totalInvoiceAmount && totalInvoiceAmount > 0;

  // Handlers
  const handleAmountChange = useCallback((txn: any, val: number) => {
    setNetOffAmounts((prev) => ({ ...prev, [txn.id]: val }));
    setSelectedTxns((prev) => ({ ...prev, [txn.id]: txn }));
  }, []);

  const handleToggleRow = useCallback(
    (txn: any) => {
      const id = txn.id;
      const isSelected = selectedIds.includes(id);

      if (isSelected) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
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
        setSelectedTxns((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      } else {
        setSelectedIds((prev) => [...prev, id]);
        const debit = parseFloat(txn.debitAmount) || 0;
        const credit = parseFloat(txn.creditAmount) || 0;
        const amount = debit > 0 ? debit : credit;
        const netOff = parseFloat(txn.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        setNetOffAmounts((prev) => ({ ...prev, [id]: remaining }));
        setMaxAmounts((prev) => ({ ...prev, [id]: remaining }));
        setSelectedTxns((prev) => ({ ...prev, [id]: txn }));
      }
    },
    [selectedIds],
  );

  const handleToggleSuggestion = useCallback(
    (txn: any) => {
      handleToggleRow(txn);
    },
    [handleToggleRow],
  );

  const handleUnselectItem = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
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
    setSelectedTxns((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const handleUnselectAll = useCallback(() => {
    setSelectedIds([]);
    setNetOffAmounts({});
    setMaxAmounts({});
    setSelectedTxns({});
  }, []);

  const handleSelectAllFilteredSuggestions = useCallback(() => {
    if (filteredSuggestions.length === 0) return;
    const newSelectedIds = [...selectedIds];
    const newAmounts = { ...netOffAmounts };
    const newMaxAmounts = { ...maxAmounts };
    const newTxns = { ...selectedTxns };

    filteredSuggestions.forEach((s: any) => {
      const v = s.txn;
      if (!newSelectedIds.includes(v.id)) {
        newSelectedIds.push(v.id);
        const credit = parseFloat(v.creditAmount) || 0;
        const debit = parseFloat(v.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(v.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);
        newAmounts[v.id] = remaining;
        newMaxAmounts[v.id] = remaining;
        newTxns[v.id] = v;
      }
    });

    setSelectedIds(newSelectedIds);
    setNetOffAmounts(newAmounts);
    setMaxAmounts(newMaxAmounts);
    setSelectedTxns(newTxns);
  }, [
    filteredSuggestions,
    selectedIds,
    netOffAmounts,
    maxAmounts,
    selectedTxns,
  ]);

  // Tổng số tiền cấn trừ ròng đợt này
  const totalCurrentNetOff = useMemo(() => {
    return calculateTotalNetOff(
      selectedIds,
      netOffAmounts,
      selectedTxns,
      settlementType,
    );
  }, [selectedIds, netOffAmounts, selectedTxns, settlementType]);

  const remainingAfterNetOff = useMemo(() => {
    return calculateRemainingAfterNetOff(remainingDebt, totalCurrentNetOff);
  }, [remainingDebt, totalCurrentNetOff]);

  const isOverRemaining = useMemo(() => {
    return checkIsOverRemaining(remainingDebt, totalCurrentNetOff);
  }, [remainingDebt, totalCurrentNetOff]);

  const suggestedDebtDiff = useMemo(() => {
    return Math.max(0, totalCurrentNetOff - remainingDebt);
  }, [totalCurrentNetOff, remainingDebt]);

  // Selected Vouchers List for Table
  const selectedVouchersList: SelectedVoucherItem[] = useMemo(() => {
    return selectedIds
      .map((id) => {
        const found =
          selectedTxns[id] ||
          vouchers.find((v: any) => v.id === id) ||
          filteredSuggestions.find((s: any) => s.txn.id === id)?.txn;
        return {
          id,
          txn: found || {},
          amount: netOffAmounts[id] || 0,
        };
      })
      .filter((item) => !!item.txn.id);
  }, [selectedIds, selectedTxns, vouchers, filteredSuggestions, netOffAmounts]);

  // Submit / Confirm NetOff Action
  const handleConfirmNetOff = useCallback(async () => {
    if (selectedIds.length === 0) {
      toast.error(
        t("errorNoTransactionSelected", "Vui lòng chọn ít nhất 1 giao dịch"),
      );
      return;
    }

    const items = selectedIds
      .map((id) => ({
        id,
        amount: netOffAmounts[id] || 0,
      }))
      .filter((i) => i.amount > 0);

    if (items.length === 0) {
      toast.error(
        t(
          "errorNoValidAmount",
          "Vui lòng nhập số tiền cấn trừ > 0 cho các giao dịch đã chọn",
        ),
      );
      return;
    }

    if (editMode) {
      const current = form?.pendingDocumentChanges || [];
      const newChanges = items.map((s) => ({
        action: "ADD" as const,
        type: "BANK" as const,
        refId: s.id,
        amount: s.amount,
      }));
      fieldSet?.("pendingDocumentChanges", [...current, ...newChanges]);
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
      toast.success(
        t(
          "addBankPendingToast",
          "Đã thêm giao dịch ngân hàng vào danh sách cấn trừ (chờ Lưu thay đổi).",
        ),
      );
      return;
    }

    if (!invoice?.id) {
      toast.error(
        t("missingInvoiceId", "Không tìm thấy mã hóa đơn để cấn trừ"),
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await erpInvoicesCoreApi.linkVouchers(
        invoice.id,
        items.map((s) => ({
          bankTransactionId: s.id,
          netOffAmount: s.amount,
        })),
      );
      toast.success(t("linkSuccess", "Đã cấn trừ phiếu thành công"));
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
      onRefresh?.();
    } catch (e: any) {
      toast.error(
        e.response?.data?.message || t("linkError", "Lỗi cấn trừ phiếu"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [
    selectedIds,
    netOffAmounts,
    editMode,
    form,
    fieldSet,
    invoice,
    onRefresh,
    t,
  ]);

  // Unlink / Remove linked voucher
  const handleUnlinkVoucher = useCallback(
    async (item: ActiveVoucherItem) => {
      if (editMode) {
        const current = form?.pendingDocumentChanges || [];
        fieldSet?.("pendingDocumentChanges", [
          ...current,
          {
            action: "REMOVE" as const,
            type: "BANK" as const,
            refId: item.bankTransactionId,
          },
        ]);
        toast.success(
          t(
            "removeBankPendingToast",
            "Đã đánh dấu gỡ cấn trừ giao dịch (chờ Lưu thay đổi).",
          ),
        );
      } else if (invoice?.id) {
        try {
          setIsSubmitting(true);
          await erpInvoicesCoreApi.removeVoucherLink(
            invoice.id,
            item.bankTransactionId,
          );
          toast.success(t("unlinkSuccess", "Đã gỡ cấn trừ thành công"));
          onRefresh?.();
        } catch (e: any) {
          toast.error(
            e.response?.data?.message || t("unlinkError", "Lỗi gỡ cấn trừ"),
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [editMode, form, fieldSet, invoice, onRefresh, t],
  );

  const openBankVoucher = useCallback((id: string) => {
    const event = new CustomEvent("open_erp_document", {
      detail: { type: "bank_transaction", id },
    });
    window.dispatchEvent(event);
  }, []);

  const value: ErpInvoiceSettlementContextValue = useMemo(
    () => ({
      invoice,
      form,
      editMode,
      fieldSet,
      direction,
      onRefresh,
      activeSubTab,
      setActiveSubTab,
      viewPreset,
      setViewPreset,
      totalInvoiceAmount,
      totalNetOff,
      remainingDebt,
      paymentPercent,
      isPaidFull,
      activeVouchers,
      settlementType,
      selectedIds,
      netOffAmounts,
      maxAmounts,
      selectedTxns,
      selectedVouchersList,
      totalCurrentNetOff,
      remainingAfterNetOff,
      isOverRemaining,
      suggestedDebtDiff,
      page,
      pageSize,
      setPage,
      setPageSize,
      dateFrom,
      dateTo,
      setDateFrom,
      setDateTo,
      tableState,
      vouchers,
      isLoadingVouchers,
      totalVouchers,
      totalPages,
      filteredSuggestions,
      isLoadingSuggestions,
      handleAmountChange,
      handleToggleRow,
      handleToggleSuggestion,
      handleUnselectItem,
      handleUnselectAll,
      handleSelectAllFilteredSuggestions,
      handleConfirmNetOff,
      handleUnlinkVoucher,
      openBankVoucher,
      detailTxnId,
      setDetailTxnId,
      isSubmitting,
    }),
    [
      invoice,
      form,
      editMode,
      fieldSet,
      direction,
      onRefresh,
      onStartEdit,
      activeSubTab,
      viewPreset,
      totalInvoiceAmount,
      totalNetOff,
      remainingDebt,
      paymentPercent,
      isPaidFull,
      activeVouchers,
      settlementType,
      selectedIds,
      netOffAmounts,
      maxAmounts,
      selectedTxns,
      selectedVouchersList,
      totalCurrentNetOff,
      remainingAfterNetOff,
      isOverRemaining,
      suggestedDebtDiff,
      page,
      pageSize,
      dateFrom,
      dateTo,
      tableState,
      vouchers,
      isLoadingVouchers,
      totalVouchers,
      totalPages,
      filteredSuggestions,
      isLoadingSuggestions,
      handleAmountChange,
      handleToggleRow,
      handleToggleSuggestion,
      handleUnselectItem,
      handleUnselectAll,
      handleSelectAllFilteredSuggestions,
      handleConfirmNetOff,
      handleUnlinkVoucher,
      openBankVoucher,
      detailTxnId,
      isSubmitting,
    ],
  );

  return (
    <ErpInvoiceSettlementContext.Provider value={value}>
      {children}
    </ErpInvoiceSettlementContext.Provider>
  );
}

export function useErpInvoiceSettlement() {
  const ctx = useContext(ErpInvoiceSettlementContext);
  if (!ctx) {
    throw new Error(
      "useErpInvoiceSettlement must be used within an ErpInvoiceSettlementProvider",
    );
  }
  return ctx;
}
