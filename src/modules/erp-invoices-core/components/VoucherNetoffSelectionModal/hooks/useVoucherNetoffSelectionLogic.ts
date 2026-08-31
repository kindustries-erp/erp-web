import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { erpInvoicesCoreApi } from "../../../api/erpInvoicesCoreApi";
import {
  type SettlementType,
  type ManualSettlementCategory,
  type InvoiceNetOffTabKey,
  type GarageNetOffTabKey,
  type VoucherNetoffSelectionModalProps,
  type SelectedVoucherItem,
} from "../types";
import {
  calculateTotalNetOff,
  calculateRemainingAfterNetOff,
  checkIsOverRemaining,
} from "../utils";

export function useVoucherNetoffSelectionLogic({
  open,
  onClose,
  onSelect,
  onSubmitItems,
  onSubmitManual,
  invoiceId,
  invoice,
  invoiceDirection,
  caseRemainingDebt = 0,
  caseCode,
  initialType,
  title,
}: VoucherNetoffSelectionModalProps) {
  const { t } = useTranslation(["erpInvoices", "common"]);

  // Multi-tab mode detection
  const isInvoiceContext = !!(invoiceId || invoice?.id || invoiceDirection);

  // Tab State
  const [activeInvoiceTab, setActiveInvoiceTab] =
    useState<InvoiceNetOffTabKey>("bank_statement");
  const [activeGarageTab, setActiveGarageTab] =
    useState<GarageNetOffTabKey>("ON_SYSTEM");

  // Popup xem chi tiết sao kê
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  // Settlement Type (RECEIPT vs PAYMENT)
  const defaultType: SettlementType = useMemo(() => {
    if (invoiceDirection === "IN") return "PAYMENT";
    if (invoiceDirection === "OUT") return "RECEIPT";
    return initialType || "RECEIPT";
  }, [invoiceDirection, initialType]);

  const [settlementType, setSettlementType] =
    useState<SettlementType>(defaultType);

  useEffect(() => {
    setSettlementType(defaultType);
  }, [defaultType]);

  // Selections State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});

  // Reset selections when drawer opens
  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
      setActiveInvoiceTab("bank_statement");
      setActiveGarageTab("ON_SYSTEM");
    }
  }, [open]);

  // Form State cho Ghi nhận Ngoài sổ sách
  const [manualAmount, setManualAmount] = useState<number>(0);
  const [manualDate, setManualDate] = useState<string>(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
  const [manualCategory, setManualCategory] =
    useState<ManualSettlementCategory>("TIEN_MAT_NGOAI");
  const [manualPartner, setManualPartner] = useState<string>("");
  const [manualNote, setManualNote] = useState<string>("");

  // Table & Filter State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const tableState = useTableColumnState("voucher-netoff-selection-table");

  // Query Danh sách Giao dịch Sao kê Ngân hàng
  const { data, isLoading } = useQuery({
    queryKey: [
      "bank-statement-transactions-for-netoff",
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
      const sortField = tableState.sorts[0]?.replace("-", "") || "transDate";
      const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

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
    enabled: open,
  });

  const vouchers = data?.data || [];

  // Target Invoice & Debt Calculations
  const resolvedTarget = useMemo(() => {
    if (invoiceId || invoice?.id) {
      const netOffVal = (invoice?.voucherNetOffs || []).reduce(
        (sum: number, v: any) => sum + Number(v.netOffAmount || 0),
        0,
      );
      return {
        code: invoice?.invoiceNo ? `#${invoice.invoiceNo}` : `HĐ`,
        totalAmount: Number(invoice?.totalAmount || 0),
        netOffAmount: netOffVal,
      };
    }
    return undefined;
  }, [invoiceId, invoice]);

  const currentRemaining = useMemo(() => {
    if (caseRemainingDebt > 0) return caseRemainingDebt;
    if (resolvedTarget) {
      return Math.max(
        0,
        resolvedTarget.totalAmount - (resolvedTarget.netOffAmount || 0),
      );
    }
    return 0;
  }, [caseRemainingDebt, resolvedTarget]);

  // Query Smart Suggestions
  const targetInvoiceId = invoiceId || invoice?.id;
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: [
      "smart-net-off-suggestions",
      targetInvoiceId,
      settlementType,
      open,
    ],
    queryFn: () => {
      if (targetInvoiceId) {
        return erpInvoicesCoreApi.getSmartNetOffSuggestions([targetInvoiceId]);
      }
      return Promise.resolve({ suggestions: [] });
    },
    enabled: open && !!targetInvoiceId,
  });

  const suggestions = suggestionsData?.suggestions || [];

  // Lọc suggestions theo chiều đối soát
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s: any) => {
      const isDebit = (s.txn.debitAmount || 0) > 0;
      return settlementType === "PAYMENT" ? isDebit : !isDebit;
    });
  }, [suggestions, settlementType]);

  // Toggle & Update Amount Handlers
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

  const handleSwitchSettlementType = useCallback((type: SettlementType) => {
    setSettlementType(type);
    setSelectedIds([]);
    setNetOffAmounts({});
    setMaxAmounts({});
    setSelectedTxns({});
    setPage(1);
  }, []);

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
    return calculateRemainingAfterNetOff(currentRemaining, totalCurrentNetOff);
  }, [currentRemaining, totalCurrentNetOff]);

  const isOverRemaining = useMemo(() => {
    return checkIsOverRemaining(currentRemaining, totalCurrentNetOff);
  }, [currentRemaining, totalCurrentNetOff]);

  const suggestedDebtDiff = useMemo(() => {
    return Math.max(0, totalCurrentNetOff - currentRemaining);
  }, [totalCurrentNetOff, currentRemaining]);

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

  // Submit Handler
  const handleSubmit = useCallback(async () => {
    const isOffSystem = activeGarageTab === "OFF_SYSTEM_MANUAL";

    if (isOffSystem) {
      if (!manualAmount || manualAmount <= 0) {
        toast.error(t("errorInvalidAmount", "Vui lòng nhập số tiền hợp lệ"));
        return;
      }
      if (onSubmitManual) {
        await onSubmitManual({
          amount: manualAmount,
          transDate: manualDate,
          category: manualCategory,
          partner: manualPartner,
          note: manualNote,
          sourceChannel: "OFF_SYSTEM_MANUAL",
          settlementType,
        });
      }
      onClose();
      return;
    }

    // ON_SYSTEM (Sao kê ERP)
    if (selectedIds.length === 0) {
      toast.error(
        t("errorNoTransactionSelected", "Vui lòng chọn ít nhất 1 giao dịch"),
      );
      return;
    }

    const items = selectedIds
      .map((id) => ({
        id,
        bankTransactionId: id,
        amount: netOffAmounts[id] || 0,
        maxAmount: maxAmounts[id] || 0,
        txn: selectedTxns[id],
        sourceChannel: "ON_SYSTEM" as const,
        settlementType,
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

    if (onSubmitItems) {
      await onSubmitItems(items);
    } else if (onSelect) {
      onSelect(items);
    }

    onClose();
  }, [
    activeGarageTab,
    manualAmount,
    manualDate,
    manualCategory,
    manualPartner,
    manualNote,
    settlementType,
    selectedIds,
    netOffAmounts,
    maxAmounts,
    selectedTxns,
    onSubmitManual,
    onSubmitItems,
    onSelect,
    onClose,
    t,
  ]);

  // Computed Title
  const computedTitle = useMemo(() => {
    if (title) return title;
    if (caseCode) {
      return t(
        "cases.settlementDrawer.title",
        "Đối soát Dòng tiền & Sổ quỹ: {{code}}",
        { code: caseCode },
      );
    }
    if (isInvoiceContext) {
      const code =
        resolvedTarget?.code ||
        (invoice?.invoiceNo ? `HĐ #${invoice.invoiceNo}` : "Hóa đơn");
      return t("drawerTitleInvoice", "Đối soát Dòng tiền: {{code}}", {
        code,
      });
    }
    return t("drawerTitleDefault", "Đối soát Dòng tiền & Sao kê Ngân hàng");
  }, [title, caseCode, isInvoiceContext, resolvedTarget, invoice, t]);

  const computedSubtitle = useMemo(() => {
    if (caseCode) {
      return t(
        "cases.settlementDrawer.subtitle",
        "Đối soát & cấn trừ dòng tiền cho {{code}}",
        { code: caseCode },
      );
    }
    if (isInvoiceContext) {
      const code =
        resolvedTarget?.code ||
        (invoice?.invoiceNo ? `HĐ #${invoice.invoiceNo}` : "Hóa đơn");
      return t(
        "drawerSubtitleInvoice",
        "Đối soát cấn trừ sao kê ngân hàng & sổ quỹ tiền mặt cho {{code}}",
        { code },
      );
    }
    return undefined;
  }, [caseCode, isInvoiceContext, resolvedTarget, invoice, t]);

  return {
    isInvoiceContext,
    activeInvoiceTab,
    setActiveInvoiceTab,
    activeGarageTab,
    setActiveGarageTab,
    detailTxnId,
    setDetailTxnId,
    settlementType,
    selectedIds,
    netOffAmounts,
    maxAmounts,
    selectedTxns,
    manualAmount,
    setManualAmount,
    manualDate,
    setManualDate,
    manualCategory,
    setManualCategory,
    manualPartner,
    setManualPartner,
    manualNote,
    setManualNote,
    page,
    setPage,
    pageSize,
    setPageSize,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    tableState,
    vouchers,
    data,
    isLoading,
    resolvedTarget,
    currentRemaining,
    filteredSuggestions,
    isLoadingSuggestions,
    handleAmountChange,
    handleToggleRow,
    handleToggleSuggestion,
    handleUnselectItem,
    handleUnselectAll,
    handleSelectAllFilteredSuggestions,
    handleSwitchSettlementType,
    totalCurrentNetOff,
    remainingAfterNetOff,
    isOverRemaining,
    suggestedDebtDiff,
    selectedVouchersList,
    handleSubmit,
    computedTitle,
    computedSubtitle,
  };
}
