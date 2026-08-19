import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerModal, DrawerSection } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { FilterButton } from "@/shared/components/FilterPanel";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  Landmark,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  erpInvoicesCoreApi,
  type SmartNetOffSuggestionItem,
} from "../api/erpInvoicesCoreApi";
import { garageApi } from "@/modules/garage/api/garageApi";
import { SmartSuggestionCard } from "./SmartSuggestionCard";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import toast from "react-hot-toast";

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

export interface NetoffTargetContext {
  label?: string;
  code?: string;
  totalAmount?: number;
  remainingAmount: number;
  remainingLabel?: string;
}

export interface VoucherNetoffSelectionModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;

  // Target Document Context (generic)
  target?: NetoffTargetContext;

  // Invoice-specific context (backward compatibility)
  invoice?: any;
  targetRemainingAmount?: number;

  // Garage-specific context (backward compatibility)
  caseId?: string;
  caseCode?: string;
  defaultType?: "RECEIPT" | "PAYMENT";
  suggestedAmount?: number;
  remainingReceivable?: number;
  remainingPayable?: number;
  editingItem?: SettlementSubmissionItem | null;

  // Mode: "standard" (default for Invoices) | "tabs" (for Garage Case with manual entry tab)
  mode?: "standard" | "tabs";

  existingVoucherIds?: string[];
  excludeTxnIds?: string[];

  // Callbacks
  onSelect?: (
    selectedVouchers: {
      id: string;
      amount: number;
      maxAmount?: number;
      txn?: any;
    }[],
  ) => void;
  onSubmitItems?: (items: SettlementSubmissionItem[]) => Promise<void> | void;
  onSubmitManual?: (item: SettlementSubmissionItem) => Promise<void> | void;
}

function readVietnameseCurrency(num: number): string {
  if (!num || num <= 0 || isNaN(num)) return "";
  const digits = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];

  function readThreeDigits(n: number, isHighest: boolean): string {
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    const ten = Math.floor(remainder / 10);
    const one = remainder % 10;
    let res = "";

    if (hundred > 0 || !isHighest) {
      res += digits[hundred] + " trăm ";
    }

    if (ten > 1) {
      res += digits[ten] + " mươi ";
      if (one === 1) res += "mốt ";
      else if (one === 5) res += "lăm ";
      else if (one > 0) res += digits[one] + " ";
    } else if (ten === 1) {
      res += "mười ";
      if (one === 5) res += "lăm ";
      else if (one > 0) res += digits[one] + " ";
    } else if (ten === 0 && one > 0) {
      if (hundred > 0 || !isHighest) res += "lẻ ";
      res += digits[one] + " ";
    }

    return res.trim();
  }

  const s = Math.floor(num).toString();
  const groups: number[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    groups.push(parseInt(s.substring(Math.max(0, i - 3), i), 10));
  }

  let result = "";
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g > 0) {
      const isHighest = i === groups.length - 1;
      const groupText = readThreeDigits(g, isHighest);
      result += groupText + " " + units[i] + " ";
    }
  }

  result = result.trim() + " đồng";
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function NetOffInput({
  initialValue,
  maxAmount,
  isSelected,
  onChange,
}: {
  initialValue: number | "";
  maxAmount: number;
  isSelected: boolean;
  onChange: (val: number) => void;
}) {
  const [val, setVal] = useState<string | number>(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  const handleBlur = () => {
    let numericVal = Number(val);
    if (isNaN(numericVal) || numericVal < 0) numericVal = 0;
    if (maxAmount > 0 && numericVal > maxAmount) numericVal = maxAmount;
    setVal(numericVal === 0 ? "" : numericVal);
    onChange(numericVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <input
      className={cn(
        "w-full text-right h-8 border rounded-md px-2 text-xs font-mono font-medium focus:outline-none transition-colors",
        isSelected
          ? "border-primary bg-primary/5 text-slate-900 font-semibold focus:ring-1 focus:ring-primary dark:text-white"
          : "border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary text-slate-600 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300",
      )}
      type="number"
      placeholder={maxAmount > 0 ? money(maxAmount) : "0"}
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}

export function VoucherNetoffSelectionModal({
  open,
  onClose,
  title,
  target,
  invoice,
  targetRemainingAmount,
  caseId,
  caseCode,
  defaultType = "RECEIPT",
  suggestedAmount = 0,
  remainingReceivable,
  remainingPayable,
  editingItem = null,
  mode = "standard",
  existingVoucherIds = [],
  excludeTxnIds = [],
  onSelect,
  onSubmitItems,
  onSubmitManual,
}: VoucherNetoffSelectionModalProps) {
  const { t } = useTranslation(["erpInvoices", "garage", "common"]);

  // Detect mode: if mode is "tabs" or caseId is passed
  const isTabsMode = mode === "tabs" || !!caseId || !!caseCode;

  // Active tab: "ON_SYSTEM" vs "OFF_SYSTEM_MANUAL"
  const [activeTab, setActiveTab] = useState<"ON_SYSTEM" | "OFF_SYSTEM_MANUAL">(
    editingItem ? "OFF_SYSTEM_MANUAL" : "ON_SYSTEM",
  );
  const [settlementType, setSettlementType] = useState<"RECEIPT" | "PAYMENT">(
    editingItem?.settlementType || defaultType,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query case financial summary if caseId is present
  const { data: caseFinancialSummary } = useQuery({
    queryKey: ["garage-case-financial-summary-in-modal", caseId],
    queryFn: () =>
      caseId
        ? garageApi.getCaseFinancialSummary(caseId)
        : Promise.resolve(null),
    enabled: open && !!caseId,
  });

  const resolvedReceivableRemaining = useMemo(() => {
    if (
      caseFinancialSummary?.breakdown?.receipts?.remainingReceivable !==
      undefined
    ) {
      return (
        Number(caseFinancialSummary.breakdown.receipts.remainingReceivable) || 0
      );
    }
    if (remainingReceivable !== undefined) return remainingReceivable;
    if (defaultType === "RECEIPT" && suggestedAmount !== undefined)
      return suggestedAmount;
    return 0;
  }, [caseFinancialSummary, remainingReceivable, defaultType, suggestedAmount]);

  const resolvedPayableRemaining = useMemo(() => {
    if (
      caseFinancialSummary?.breakdown?.payments?.remainingPayable !== undefined
    ) {
      return (
        Number(caseFinancialSummary.breakdown.payments.remainingPayable) || 0
      );
    }
    if (remainingPayable !== undefined) return remainingPayable;
    if (defaultType === "PAYMENT" && suggestedAmount !== undefined)
      return suggestedAmount;
    return 0;
  }, [caseFinancialSummary, remainingPayable, defaultType, suggestedAmount]);

  const initialAmount =
    editingItem?.amount ||
    (isTabsMode
      ? (editingItem?.settlementType || defaultType) === "RECEIPT"
        ? resolvedReceivableRemaining
        : resolvedPayableRemaining
      : suggestedAmount || 0);

  // Manual entry fields (Tab 2)
  const [manualAmount, setManualAmount] = useState<number>(initialAmount);
  const [manualDate, setManualDate] = useState<string>(
    editingItem?.transDate || new Date().toISOString().slice(0, 10),
  );
  const [manualCategory, setManualCategory] = useState<string>(
    editingItem?.category ||
      (settlementType === "RECEIPT" ? "TIEN_MAT_NGOAI" : "CHI_PHI_KHAC"),
  );
  const [manualPartner, setManualPartner] = useState<string>(
    editingItem?.partnerName || "",
  );
  const [manualNote, setManualNote] = useState<string>(editingItem?.note || "");

  // State for Table (Tab 1: Sao kê ERP)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    existingVoucherIds || [],
  );
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [maxAmounts, setMaxAmounts] = useState<Record<string, number>>({});
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  // Target context computation
  const resolvedTarget = useMemo(() => {
    if (target) return target;
    if (invoice) {
      const invoiceTotal = Number(invoice.totalAmount) || 0;
      const invoiceAlreadyNetOff = Number(invoice.netOffAmount) || 0;
      const remaining =
        targetRemainingAmount !== undefined
          ? targetRemainingAmount
          : invoiceTotal > 0
            ? Math.max(0, invoiceTotal - invoiceAlreadyNetOff)
            : 0;
      return {
        label: "Hóa đơn",
        code: invoice.invoiceNo || "---",
        totalAmount: invoiceTotal,
        remainingAmount: remaining,
        remainingLabel: "Cần cấn trừ:",
      };
    }
    if (caseCode || caseId || suggestedAmount) {
      const isReceipt = settlementType === "RECEIPT";
      const totalAmt = isReceipt
        ? Number(caseFinancialSummary?.targetRevenue || 0)
        : Number(caseFinancialSummary?.targetCost || 0);
      const remaining = isReceipt
        ? resolvedReceivableRemaining
        : resolvedPayableRemaining;

      return {
        label: "Vụ việc",
        code: caseCode || "---",
        totalAmount: totalAmt > 0 ? totalAmt : undefined,
        remainingAmount: remaining,
        remainingLabel: isReceipt
          ? "Cần thu còn lại:"
          : "Cần chi còn lại (Chi phí vụ việc):",
      };
    }
    return undefined;
  }, [
    target,
    invoice,
    targetRemainingAmount,
    caseCode,
    caseId,
    suggestedAmount,
    settlementType,
    caseFinancialSummary,
    resolvedReceivableRemaining,
    resolvedPayableRemaining,
  ]);

  const targetRemaining = resolvedTarget?.remainingAmount;

  // Handler for switching between Thu Tiền & Chi Tiền
  const handleSwitchSettlementType = (type: "RECEIPT" | "PAYMENT") => {
    setSettlementType(type);
    const newRemaining =
      type === "RECEIPT"
        ? resolvedReceivableRemaining
        : resolvedPayableRemaining;
    setManualAmount(newRemaining);
    if (type === "RECEIPT" && manualCategory === "CHI_PHI_KHAC") {
      setManualCategory("TIEN_MAT_NGOAI");
    } else if (type === "PAYMENT" && manualCategory === "TIEN_MAT_NGOAI") {
      setManualCategory("CHI_PHI_KHAC");
    }
  };

  const totalCurrentNetOff = useMemo(() => {
    return selectedIds.reduce(
      (sum, id) => sum + (Number(netOffAmounts[id]) || 0),
      0,
    );
  }, [selectedIds, netOffAmounts]);

  const isOverRemaining =
    activeTab === "ON_SYSTEM" &&
    targetRemaining !== undefined &&
    targetRemaining > 0 &&
    totalCurrentNetOff > targetRemaining;

  const tableState = useTableColumnState(`voucher-netoff-selection-table`);
  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const invoiceId = invoice?.id;

  // Fetch Smart Suggestions for Single Invoice
  const {
    data: invoiceSuggestionsData,
    isLoading: isLoadingInvoiceSuggestions,
  } = useQuery<Record<string, SmartNetOffSuggestionItem[]>>({
    queryKey: ["smart-net-off-suggestions-single", invoiceId],
    queryFn: () =>
      invoiceId
        ? erpInvoicesCoreApi.getSmartNetOffSuggestions([invoiceId])
        : Promise.resolve({}),
    enabled: open && !!invoiceId,
  });

  // Fetch Smart Suggestions for Garage Case (sensitive to settlementType)
  const { data: caseSuggestionsData, isLoading: isLoadingCaseSuggestions } =
    useQuery<any[]>({
      queryKey: ["garage-case-smart-suggestions", caseId, settlementType],
      queryFn: () =>
        caseId
          ? garageApi.getSmartSettlementSuggestions(caseId, settlementType)
          : Promise.resolve([]),
      enabled: open && !!caseId,
    });

  // Fetch Existing Case Settlements for mini-ledger in Tab 2
  const { data: existingCaseSettlements } = useQuery({
    queryKey: ["case-existing-settlements-in-modal", caseId],
    queryFn: () =>
      caseId ? garageApi.getCaseSettlements(caseId) : Promise.resolve([]),
    enabled: open && !!caseId,
  });

  const suggestions: SmartNetOffSuggestionItem[] = useMemo(() => {
    if (invoiceId && invoiceSuggestionsData) {
      return invoiceSuggestionsData[invoiceId] || [];
    }
    if (caseId && caseSuggestionsData) {
      return caseSuggestionsData || [];
    }
    return [];
  }, [invoiceId, invoiceSuggestionsData, caseId, caseSuggestionsData]);

  const isLoadingSuggestions =
    isLoadingInvoiceSuggestions || isLoadingCaseSuggestions;

  const { data, isLoading } = useQuery({
    queryKey: [
      "bank-transactions-for-netoff",
      page,
      pageSize,
      tableState.sorts,
      tableState.columnFilters,
      tableState.columnSearch,
    ],
    queryFn: () =>
      bankStatementApi.getTransactions({
        page,
        pageSize,
        sortBy,
        sortOrder,
        column_search:
          Object.keys(tableState.columnSearch).length > 0
            ? JSON.stringify(tableState.columnSearch)
            : undefined,
        column_filters:
          Object.keys(tableState.columnFilters).length > 0
            ? JSON.stringify(tableState.columnFilters)
            : undefined,
      }),
    enabled: open && activeTab === "ON_SYSTEM",
  });

  const vouchers = (data?.items || []).filter((v: any) => {
    if (existingVoucherIds.includes(v.id)) return false;
    if (excludeTxnIds.includes(v.id)) return false;
    const credit = parseFloat(v.creditAmount) || 0;
    const debit = parseFloat(v.debitAmount) || 0;
    const amount = credit > 0 ? credit : debit;
    const netOff = parseFloat(v.netOffAmount) || 0;
    const remaining = amount - netOff;
    return remaining > 0;
  });

  useEffect(() => {
    if (open) {
      setSelectedIds(existingVoucherIds || []);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
      if (editingItem) {
        setActiveTab("OFF_SYSTEM_MANUAL");
        setManualAmount(editingItem.amount || 0);
        setManualDate(
          editingItem.transDate || new Date().toISOString().slice(0, 10),
        );
        setManualCategory(editingItem.category || "TIEN_MAT_NGOAI");
        setManualPartner(editingItem.partnerName || "");
        setManualNote(editingItem.note || "");
        setSettlementType(editingItem.settlementType || defaultType);
      } else {
        setActiveTab("ON_SYSTEM");
        setSettlementType(defaultType);
        const rem =
          defaultType === "RECEIPT"
            ? resolvedReceivableRemaining
            : resolvedPayableRemaining;
        if (rem || suggestedAmount) {
          setManualAmount(rem || suggestedAmount);
        }
      }
    }
  }, [
    open,
    editingItem,
    defaultType,
    suggestedAmount,
    resolvedReceivableRemaining,
    resolvedPayableRemaining,
    existingVoucherIds,
  ]);

  const handleSelect = (v: any, checked: boolean) => {
    if (checked) {
      const credit = parseFloat(v.creditAmount) || 0;
      const debit = parseFloat(v.debitAmount) || 0;
      const amount = credit > 0 ? credit : debit;
      const netOff = parseFloat(v.netOffAmount) || 0;
      const remaining = Math.max(0, amount - netOff);

      let autoFill = remaining;
      if (targetRemaining !== undefined && targetRemaining > 0) {
        const currentSum = selectedIds.reduce(
          (sum, id) => sum + (Number(netOffAmounts[id]) || 0),
          0,
        );
        const remainingNeeded = Math.max(0, targetRemaining - currentSum);
        if (remainingNeeded > 0) {
          autoFill = Math.min(remaining, remainingNeeded);
        }
      }

      setSelectedIds((prev) => [...prev, v.id]);
      setNetOffAmounts((prev) => ({
        ...prev,
        [v.id]: autoFill > 0 ? autoFill : remaining,
      }));
      setMaxAmounts((prev) => ({ ...prev, [v.id]: remaining }));
      setSelectedTxns((prev) => ({ ...prev, [v.id]: v }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== v.id));
      setNetOffAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      setMaxAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      setSelectedTxns((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
    }
  };

  const isAllSelected =
    vouchers.length > 0 &&
    vouchers.every((v: any) => selectedIds.includes(v.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newIds: string[] = [];
      const newAmounts: Record<string, number> = { ...netOffAmounts };
      const newMaxAmounts: Record<string, number> = { ...maxAmounts };
      const newTxns: Record<string, any> = { ...selectedTxns };

      let currentSum = 0;
      vouchers.forEach((v: any) => {
        const credit = parseFloat(v.creditAmount) || 0;
        const debit = parseFloat(v.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(v.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        let autoFill = remaining;
        if (targetRemaining !== undefined && targetRemaining > 0) {
          const needed = Math.max(0, targetRemaining - currentSum);
          autoFill = Math.min(remaining, needed);
        }

        newIds.push(v.id);
        newAmounts[v.id] = autoFill > 0 ? autoFill : remaining;
        newMaxAmounts[v.id] = remaining;
        newTxns[v.id] = v;
        currentSum += newAmounts[v.id];
      });

      setSelectedIds(newIds);
      setNetOffAmounts(newAmounts);
      setMaxAmounts(newMaxAmounts);
      setSelectedTxns(newTxns);
    } else {
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
    }
  };

  const handleAmountChange = (v: any, val: number) => {
    const credit = parseFloat(v.creditAmount) || 0;
    const debit = parseFloat(v.debitAmount) || 0;
    const amount = credit > 0 ? credit : debit;
    const netOff = parseFloat(v.netOffAmount) || 0;
    const remaining = Math.max(0, amount - netOff);
    const safeVal = Math.min(val, remaining);

    if (safeVal > 0) {
      setSelectedIds((prev) => (prev.includes(v.id) ? prev : [...prev, v.id]));
      setNetOffAmounts((prev) => ({ ...prev, [v.id]: safeVal }));
      setMaxAmounts((prev) => ({ ...prev, [v.id]: remaining }));
      setSelectedTxns((prev) => ({ ...prev, [v.id]: v }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== v.id));
      setNetOffAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      setMaxAmounts((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
      setSelectedTxns((prev) => {
        const next = { ...prev };
        delete next[v.id];
        return next;
      });
    }
  };

  const handleQuickAcceptSuggestion = (s: any) => {
    const txn = s.txn;
    const credit = Number(txn.creditAmount) || 0;
    const debit = Number(txn.debitAmount) || 0;
    const amount = credit > 0 ? credit : debit;
    const remaining = Number(txn.remainingAmount) || amount;

    let autoFill = remaining;
    if (targetRemaining !== undefined && targetRemaining > 0) {
      const currentSum = selectedIds
        .filter((id) => id !== txn.id)
        .reduce((sum, id) => sum + (Number(netOffAmounts[id]) || 0), 0);
      const remainingNeeded = Math.max(0, targetRemaining - currentSum);
      if (remainingNeeded > 0) {
        autoFill = Math.min(remaining, remainingNeeded);
      }
    }

    setSelectedIds((prev) =>
      prev.includes(txn.id) ? prev : [...prev, txn.id],
    );
    setNetOffAmounts((prev) => ({
      ...prev,
      [txn.id]: autoFill > 0 ? autoFill : remaining,
    }));
    setMaxAmounts((prev) => ({ ...prev, [txn.id]: remaining }));
    setSelectedTxns((prev) => ({ ...prev, [txn.id]: txn }));
    toast.success(
      `Đã nhận gợi ý: ${money(autoFill > 0 ? autoFill : remaining)}`,
    );
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      if (activeTab === "ON_SYSTEM") {
        if (isOverRemaining) {
          toast.error(
            `Tổng tiền cấn trừ (${money(totalCurrentNetOff)}) vượt quá số tiền cần thanh toán (${money(targetRemaining!)}).`,
          );
          return;
        }

        if (selectedIds.length === 0) {
          toast.error(
            t("selectAtLeastOne", "Vui lòng chọn ít nhất một giao dịch"),
          );
          return;
        }

        const selectedVouchersList = selectedIds.map((id) => ({
          id,
          amount: netOffAmounts[id] || 0,
          maxAmount: maxAmounts[id],
          txn: selectedTxns[id],
        }));

        if (onSubmitItems) {
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
          await onSubmitItems(items);
        }

        if (onSelect) {
          onSelect(selectedVouchersList);
        }

        onClose();
      } else {
        // Tab 2: OFF_SYSTEM_MANUAL
        if (!manualAmount || manualAmount <= 0) {
          toast.error(t("validAmount", "Vui lòng nhập số tiền hợp lệ (> 0)"));
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

        if (onSubmitItems) {
          await onSubmitItems([manualItem]);
        }
        if (onSubmitManual) {
          await onSubmitManual(manualItem);
        }

        toast.success(
          t("manualSuccess", "Đã ghi nhận dòng tiền ngoài sổ sách thành công!"),
        );
        onClose();
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Lỗi lưu giao dịch",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchColumnOptions = async ({
    columnKey,
    search,
    pageParam,
    filtersStr,
  }: {
    columnKey: string;
    search: string;
    pageParam: number;
    filtersStr?: string;
  }) => {
    return bankStatementApi.getColumnOptions(
      columnKey,
      search,
      pageParam,
      20,
      filtersStr,
    );
  };

  const getSortState = (columnKey: string) => {
    const current = tableState.sorts[0];
    if (!current) return "none";
    if (current === columnKey) return "asc";
    if (current === `-${columnKey}`) return "desc";
    return "none";
  };

  const handleSortChange = (
    columnKey: string,
    state: "asc" | "desc" | "none",
  ) => {
    tableState.setSort(columnKey, state);
  };

  const handleSearchChange = (columnKey: string, value: string) => {
    tableState.setColumnSearch(columnKey, value);
    setPage(1);
  };

  const handleFilterChange = (columnKey: string, values: string[]) => {
    tableState.setColumnFilter(columnKey, values);
    setPage(1);
  };

  const renderHeaderFilter = (key: string, label: string) => {
    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={getSortState(key)}
        onSortChange={(state) => handleSortChange(key, state)}
        searchValue={tableState.columnSearch[key] || ""}
        onSearchChange={(val) => handleSearchChange(key, val)}
        selectedFilters={tableState.columnFilters[key] || []}
        onFilterChange={(vals) => handleFilterChange(key, vals)}
        columnKey={key}
        allFilters={tableState.columnFilters}
        fetchOptions={fetchColumnOptions}
        queryKeyPrefix={`voucher-netoff-selection-column-options`}
      />
    );
  };

  // Standardized Columns (aligned with BankStatementPage)
  const columns: any[] = [
    {
      key: "selection",
      header: (
        <div
          className="flex items-center justify-center p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(c: any) => handleSelectAll(!!c)}
          />
        </div>
      ),
      size: 45,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(c: any) => handleSelect(row, !!c)}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "account",
      header: renderHeaderFilter("account", t("account", "Ngân hàng / Sổ quỹ")),
      size: 130,
      cell: (row: any) => {
        return (
          <div className="flex flex-col text-xs">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.bankName || "---"
                : row.cashBook?.name || "Sổ quỹ tiền mặt"}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {row.sourceType === "BANK"
                ? row.bankAccount?.accountNumber || t("bank", "Ngân hàng")
                : t("cash", "Tiền mặt")}
            </span>
          </div>
        );
      },
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: renderHeaderFilter("transDate", t("date", "Ngày GD")),
      cell: (row: any) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {formatGMT7(row.transDate, "date")}
        </span>
      ),
      size: 105,
      sortable: false,
    },
    {
      key: "referenceNumber",
      header: renderHeaderFilter(
        "referenceNumber",
        t("referenceNumber", "Số tham chiếu / Bút toán"),
      ),
      size: 140,
      cell: (row: any) => {
        if (!row.referenceNumber) return "—";
        return (
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline truncate cursor-pointer text-left max-w-full font-mono"
            onClick={(e) => {
              e.stopPropagation();
              setDetailTxnId(row.id);
            }}
            title={row.referenceNumber}
          >
            {row.referenceNumber}
          </button>
        );
      },
    },
    {
      key: "correspondentName",
      header: renderHeaderFilter(
        "correspondentName",
        t("correspondentName", "Đối tác / Người nộp"),
      ),
      size: 150,
      cell: (row: any) => (
        <span
          className="text-xs text-slate-700 dark:text-slate-300 truncate block"
          title={row.correspondentName || ""}
        >
          {row.correspondentName || "—"}
        </span>
      ),
    },
    {
      key: "description",
      dataIndex: "description",
      header: renderHeaderFilter(
        "description",
        t("description", "Nội dung diễn giải"),
      ),
      size: 240,
      cell: (row: any) => (
        <div
          className="whitespace-pre-wrap line-clamp-2 text-xs text-slate-600 dark:text-slate-300"
          title={row.description || ""}
        >
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "thu",
      header: renderHeaderFilter("thu", t("thu", "Thu")),
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-emerald-600 font-medium">
              +{money(credit)}
            </span>
          );
        return null;
      },
      className: "text-right",
      size: 120,
      minSize: 120,
      sortable: false,
    },
    {
      key: "chi",
      header: renderHeaderFilter("chi", t("chi", "Chi")),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-[#ea580c] font-medium">{money(debit)}</span>
          );
        return null;
      },
      className: "text-right",
      size: 120,
      minSize: 120,
      sortable: false,
    },
    {
      key: "netOffAmount",
      header: renderHeaderFilter(
        "netOffAmount",
        t("netOffAmountLabel", "Đã cấn trừ"),
      ),
      className: "text-right",
      headerClassName: "text-center",
      size: 120,
      minSize: 120,
      cell: (row: any) => {
        const netOff = parseFloat(row.netOffAmount) || 0;
        if (netOff === 0) return "--";
        return (
          <span className="text-blue-600 font-medium">{money(netOff)}</span>
        );
      },
    },
    {
      key: "remainingAmount",
      header: renderHeaderFilter(
        "remainingAmount",
        t("remainingAmountLabel", "Còn lại"),
      ),
      className: "text-right font-semibold",
      headerClassName: "text-center",
      size: 120,
      minSize: 120,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = amount - netOff;
        if (remaining === 0)
          return <span className="text-emerald-600 font-medium">0</span>;
        return (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {money(remaining)}
          </span>
        );
      },
    },
    {
      key: "currentNetOff",
      header: renderHeaderFilter(
        "currentNetOff",
        t("netOffAmount", "Cấn trừ đợt này"),
      ),
      className: "text-right",
      headerClassName: "text-center",
      size: 150,
      minSize: 150,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        return (
          <div className="p-0.5" onClick={(e) => e.stopPropagation()}>
            <NetOffInput
              initialValue={
                netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : ""
              }
              maxAmount={remaining}
              isSelected={isSelected}
              onChange={(val: number) => handleAmountChange(row, val)}
            />
          </div>
        );
      },
    },
  ];

  const summaryRow = useMemo(() => {
    if (!vouchers || vouchers.length === 0) return undefined;

    const totalDebit = vouchers.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.debitAmount) || 0),
      0,
    );
    const totalCredit = vouchers.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.creditAmount) || 0),
      0,
    );

    const totalAlreadyNetOff = vouchers.reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.netOffAmount) || 0),
      0,
    );
    const totalRemaining = vouchers.reduce(
      (acc: number, curr: any) =>
        acc +
        (Math.max(
          parseFloat(curr.creditAmount) || 0,
          parseFloat(curr.debitAmount) || 0,
        ) -
          (parseFloat(curr.netOffAmount) || 0)),
      0,
    );

    return {
      transDate: null,
      account: "",
      referenceNumber: "",
      correspondentName: "",
      description: "",
      thu:
        totalCredit > 0 ? (
          <span className="text-emerald-600 font-medium">
            +{money(totalCredit)}
          </span>
        ) : (
          money(0)
        ),
      chi:
        totalDebit > 0 ? (
          <span className="text-[#ea580c] font-medium">
            {money(totalDebit)}
          </span>
        ) : (
          money(0)
        ),
      netOffAmount:
        totalAlreadyNetOff === 0 ? (
          "--"
        ) : (
          <span className="text-blue-600 font-medium">
            {money(totalAlreadyNetOff)}
          </span>
        ),
      remainingAmount:
        totalRemaining === 0 ? (
          <span className="text-emerald-600 font-medium">0</span>
        ) : (
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            {money(totalRemaining)}
          </span>
        ),
      currentNetOff:
        totalCurrentNetOff === 0 ? (
          "--"
        ) : (
          <span
            className={cn(
              "font-bold",
              isOverRemaining
                ? "text-rose-600 font-extrabold"
                : "text-orange-600",
            )}
          >
            {money(totalCurrentNetOff)}
          </span>
        ),
    };
  }, [vouchers, totalCurrentNetOff, isOverRemaining]);

  const computedTitle =
    title ||
    (caseCode
      ? t("cases.settlementDrawer.title", {
          code: caseCode,
          defaultValue: `Ghi nhận & Cấn trừ Dòng tiền: ${caseCode}`,
        })
      : t("selectVoucherToNetoff", "Chọn phiếu thu/chi để cấn trừ"));

  // Realtime calculations for Tab 2
  const currentRemaining =
    targetRemaining !== undefined ? targetRemaining : suggestedAmount || 0;
  const amountEntered = Number(manualAmount) || 0;
  const remainingAfter = Math.max(0, currentRemaining - amountEntered);
  const percentCompleted =
    currentRemaining > 0
      ? Math.min(100, Math.round((amountEntered / currentRemaining) * 100))
      : 100;

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        title={computedTitle}
        panelClassName="w-full max-w-[96vw] xl:max-w-[1440px] 2xl:max-w-[1550px]"
        bodyClassName="h-full flex flex-col p-3.5 overflow-hidden min-h-0"
        actions={[
          {
            label: t("common:cancel", "Hủy"),
            variant: "outline",
            onClick: onClose,
            disabled: isSubmitting,
          },
          {
            label: isSubmitting
              ? t("common:saving", "Đang lưu...")
              : activeTab === "ON_SYSTEM"
                ? selectedIds.length > 0
                  ? settlementType === "RECEIPT"
                    ? t(
                        "confirmReceiptWithCount",
                        `Xác nhận thu cấn trừ (${selectedIds.length})`,
                      )
                    : t(
                        "confirmPaymentWithCount",
                        `Xác nhận chi cấn trừ (${selectedIds.length})`,
                      )
                  : t("confirm", "Xác nhận cấn trừ")
                : settlementType === "RECEIPT"
                  ? t("confirmManualReceipt", "Xác nhận ghi nhận thu ngoài")
                  : t("confirmManualPayment", "Xác nhận ghi nhận chi ngoài"),
            primary: true,
            disabled:
              isSubmitting ||
              (activeTab === "ON_SYSTEM" &&
                (selectedIds.length === 0 || isOverRemaining)) ||
              (activeTab === "OFF_SYSTEM_MANUAL" &&
                (!manualAmount || manualAmount <= 0)),
            onClick: handleSubmit,
          },
        ]}
      >
        <div className="flex flex-col h-full min-h-0 flex-1 gap-2.5">
          {/* Target Document Info Badge */}
          {resolvedTarget && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 font-medium">
                  {resolvedTarget.label || "Chứng từ"}:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {resolvedTarget.code || "---"}
                </span>
                {resolvedTarget.totalAmount !== undefined && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">
                      |
                    </span>
                    <span className="text-slate-500 font-medium">
                      {settlementType === "RECEIPT"
                        ? "Doanh thu:"
                        : "Tổng chi phí:"}
                    </span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {money(resolvedTarget.totalAmount)}
                    </span>
                  </>
                )}
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 font-medium">
                  {resolvedTarget.remainingLabel || "Cần thanh toán:"}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    settlementType === "RECEIPT"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-amber-600 dark:text-amber-400",
                  )}
                >
                  {money(resolvedTarget.remainingAmount)}
                </span>
              </div>

              {activeTab === "ON_SYSTEM" ? (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Đã chọn cấn trừ:
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold text-sm",
                      isOverRemaining
                        ? "text-rose-600 dark:text-rose-400 animate-pulse"
                        : "text-primary",
                    )}
                  >
                    {money(totalCurrentNetOff)}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Ghi nhận ngoài:
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold text-sm",
                      settlementType === "RECEIPT"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400",
                    )}
                  >
                    {money(amountEntered)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Validation Warning Alert */}
          {isOverRemaining && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in shrink-0">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Cảnh báo:</strong> Tổng tiền cấn trừ (
                {money(totalCurrentNetOff)}) đang vượt quá số tiền cần thanh
                toán ({money(targetRemaining!)}). Vui lòng điều chỉnh lại số
                tiền trước khi xác nhận.
              </span>
            </div>
          )}

          {/* Flagship Animated Pill Tabs (Image 1 Style) */}
          {isTabsMode && (
            <Tabs
              value={activeTab}
              onValueChange={(val) =>
                setActiveTab(val as "ON_SYSTEM" | "OFF_SYSTEM_MANUAL")
              }
              className="w-full shrink-0"
            >
              <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5 gap-3">
                <TabsList className="h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 shadow-[0_1px_2px_rgba(15,23,42,.03),0_6px_18px_-14px_rgba(15,23,42,.08)] p-1 gap-2 border border-slate-200/60 dark:border-slate-700/60">
                  <TabsTrigger
                    value="ON_SYSTEM"
                    className={cn(
                      "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out cursor-pointer",
                      "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400 dark:hover:text-slate-200",
                      "data-[state=active]:text-slate-900 data-[state=active]:font-semibold dark:data-[state=active]:text-white whitespace-nowrap",
                    )}
                  >
                    <Landmark
                      className={cn(
                        "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                        "w-0 h-0 opacity-0 mr-0",
                        "group-data-[state=active]:w-4 group-data-[state=active]:h-4 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
                      )}
                    />
                    <span className="text-xs tracking-tight">
                      {t("erpTab", "1. Cấn trừ Sao kê / Sổ quỹ ERP")}
                    </span>
                  </TabsTrigger>

                  <TabsTrigger
                    value="OFF_SYSTEM_MANUAL"
                    className={cn(
                      "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-[color,background-color,box-shadow,transform] duration-150 ease-out cursor-pointer",
                      "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400 dark:hover:text-slate-200",
                      "data-[state=active]:text-slate-900 data-[state=active]:font-semibold dark:data-[state=active]:text-white whitespace-nowrap",
                    )}
                  >
                    <DollarSign
                      className={cn(
                        "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                        "w-0 h-0 opacity-0 mr-0",
                        "group-data-[state=active]:w-4 group-data-[state=active]:h-4 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-2",
                      )}
                    />
                    <span className="text-xs tracking-tight">
                      {t("manualTab", "2. Ghi nhận Dòng tiền Ngoài sổ sách")}
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Receipt vs Payment Toggle - Active for BOTH Tabs */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchSettlementType("RECEIPT")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs",
                      settlementType === "RECEIPT"
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/20 shadow-sm ring-2 ring-emerald-500/30"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
                    )}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    {t("typeReceipt", "Ghi nhận Thu tiền")}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchSettlementType("PAYMENT")}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs",
                      settlementType === "PAYMENT"
                        ? "bg-amber-600 border-amber-600 text-white shadow-amber-500/20 shadow-sm ring-2 ring-amber-500/30"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
                    )}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    {t("typePayment", "Ghi nhận Chi tiền")}
                  </button>
                </div>
              </div>
            </Tabs>
          )}

          {/* TAB 1: ON_SYSTEM (Sao kê ERP) */}
          {activeTab === "ON_SYSTEM" ? (
            <div className="flex-1 flex flex-col min-h-0 gap-2.5">
              {/* Smart Suggestions Section */}
              {(invoice?.id || caseId) && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                        {settlementType === "RECEIPT"
                          ? "Gợi ý Đối soát Thu tiền (Tiền vào)"
                          : "Gợi ý Đối soát Chi tiền (Chi phí vụ việc)"}
                      </h4>
                    </div>
                    {isLoadingSuggestions && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang tìm kiếm...
                      </span>
                    )}
                  </div>

                  {suggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {suggestions.map((s: any) => {
                        const isAlreadySelected = selectedIds.includes(
                          s.txn.id,
                        );
                        return (
                          <SmartSuggestionCard
                            key={s.txn.id}
                            txn={s.txn}
                            amount={
                              s.txn.debitAmount > 0
                                ? s.txn.debitAmount
                                : s.txn.creditAmount
                            }
                            isSuggestion={!isAlreadySelected}
                            badgeType={s.score?.badge || "exact"}
                            matchedKeywords={s.matchedKeywords || []}
                            onAccept={() => handleQuickAcceptSuggestion(s)}
                            onViewDetail={(id) => setDetailTxnId(id)}
                          />
                        );
                      })}
                    </div>
                  ) : !isLoadingSuggestions ? (
                    <div className="text-[11px] text-slate-500 italic">
                      Chưa tìm thấy giao dịch khớp chính xác với chứng từ này.
                      Bạn có thể tìm kiếm thủ công trong danh sách bên dưới.
                    </div>
                  ) : null}
                </div>
              )}

              {/* Main Content: DrawerSection containing StandardTable */}
              <DrawerSection
                title={
                  <div className="flex items-center gap-2 flex-wrap">
                    <span>
                      {t("vouchersList", "Danh sách giao dịch sao kê & sổ quỹ")}
                    </span>
                    {data?.total !== undefined && (
                      <span className="text-xs font-normal text-muted-foreground lowercase">
                        ({data.total} {t("records", "giao dịch")})
                      </span>
                    )}
                    {selectedIds.length > 0 && (
                      <span className="text-xs font-semibold text-primary">
                        ({selectedIds.length} {t("selected", "đã chọn")})
                      </span>
                    )}
                  </div>
                }
                titleExtra={
                  <div className="flex items-center gap-2">
                    {/* Split Payment Helper Button: If remaining needed > current netoff */}
                    {isTabsMode &&
                      targetRemaining !== undefined &&
                      targetRemaining > totalCurrentNetOff && (
                        <button
                          type="button"
                          onClick={() => {
                            const remainingNeeded = Math.max(
                              0,
                              targetRemaining - totalCurrentNetOff,
                            );
                            setManualAmount(remainingNeeded);
                            setActiveTab("OFF_SYSTEM_MANUAL");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 transition-colors dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300 cursor-pointer"
                          title="Ghi nhận số tiền còn thiếu ngoài sổ sách"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                          <span>
                            Ghi nhận phần thiếu (
                            {money(targetRemaining - totalCurrentNetOff)}) ngoài
                            sổ ➔
                          </span>
                        </button>
                      )}

                    {tableState.activeFilterCount > 0 && (
                      <FilterButton
                        activeCount={tableState.activeFilterCount}
                        onClick={() => {}}
                        onClear={() => {
                          tableState.resetFilters();
                          setPage(1);
                        }}
                      />
                    )}
                  </div>
                }
                className="flex-1 flex flex-col min-h-0 mb-0 p-3 [&>div:last-child]:flex-1 [&>div:last-child]:flex [&>div:last-child]:flex-col [&>div:last-child]:min-h-0"
                bodyClassName="flex-1 flex flex-col min-h-0 p-0"
              >
                <div className="flex-1 min-h-0 flex flex-col">
                  <StandardTable
                    tableId="voucher-netoff-selection-table"
                    items={vouchers}
                    columns={columns}
                    getRowKey={(row: any) => row.id}
                    variant="spreadsheet"
                    enableColumnResizing={true}
                    loading={isLoading}
                    page={page}
                    pageSize={pageSize}
                    total={data?.total || 0}
                    totalPages={data?.totalPages || 0}
                    onPage={setPage}
                    onPageSize={setPageSize}
                    summaryRow={summaryRow}
                    minWidth={1440}
                    containerClassName="flex-1 min-h-0"
                  />
                </div>
              </DrawerSection>
            </div>
          ) : (
            /* TAB 2: OFF_SYSTEM_MANUAL (Bố cục 2 cột chuyên nghiệp) */
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-y-auto pr-1">
              {/* CỘT TRÁI: Nhập liệu & Thiết lập dòng tiền (7 cols = ~58%) */}
              <div className="lg:col-span-7 space-y-3.5 flex flex-col">
                {/* Nút Chọn Số Tiền Nhanh */}
                {currentRemaining > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>
                        {settlementType === "RECEIPT"
                          ? "Gợi ý số tiền thu nhanh"
                          : "Gợi ý số tiền chi nhanh"}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManualAmount(currentRemaining)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-800 dark:text-slate-200 hover:text-primary transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                      >
                        <span>
                          {settlementType === "RECEIPT"
                            ? "Toàn bộ thu còn lại:"
                            : "Toàn bộ chi còn lại:"}
                        </span>
                        <span
                          className={cn(
                            "font-mono font-bold",
                            settlementType === "RECEIPT"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400",
                          )}
                        >
                          {money(currentRemaining)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setManualAmount(Math.round(currentRemaining * 0.5))
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
                      >
                        50% ({money(Math.round(currentRemaining * 0.5))})
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setManualAmount(Math.round(currentRemaining * 0.3))
                        }
                        className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
                      >
                        30% ({money(Math.round(currentRemaining * 0.3))})
                      </button>
                    </div>
                  </div>
                )}

                {/* Thẻ Chọn Kênh Tiền Ngoài (Visual Radio Cards) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phương thức Dòng tiền Ngoài sổ sách *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div
                      onClick={() => setManualCategory("TIEN_MAT_NGOAI")}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                        manualCategory === "TIEN_MAT_NGOAI"
                          ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">💵</span>
                        {manualCategory === "TIEN_MAT_NGOAI" && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Tiền mặt tại Quầy
                        </div>
                        <div className="text-[10px] text-slate-500 leading-snug">
                          {settlementType === "RECEIPT"
                            ? "Thu tiền mặt khi giao nhận xe"
                            : "Chi tiền mặt tại quầy/xưởng"}
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setManualCategory("CHUYEN_KHOAN_CA_NHAN")}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                        manualCategory === "CHUYEN_KHOAN_CA_NHAN"
                          ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">📱</span>
                        {manualCategory === "CHUYEN_KHOAN_CA_NHAN" && (
                          <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          CK Tài khoản Cá nhân
                        </div>
                        <div className="text-[10px] text-slate-500 leading-snug">
                          QR / STK cá nhân không qua cty
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setManualCategory("CHI_PHI_KHAC")}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                        manualCategory === "CHI_PHI_KHAC"
                          ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">🏷️</span>
                        {manualCategory === "CHI_PHI_KHAC" && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Cấn trừ / Khác
                        </div>
                        <div className="text-[10px] text-slate-500 leading-snug">
                          Bù trừ công nợ hoặc chi phí phát sinh
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Fields Card */}
                <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3.5 shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>
                          {settlementType === "RECEIPT"
                            ? "Số tiền thu (VNĐ) *"
                            : "Số tiền chi (VNĐ) *"}
                        </span>
                        {manualAmount > 0 && (
                          <span
                            className={cn(
                              "text-[10px] font-mono font-bold",
                              settlementType === "RECEIPT"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-amber-600 dark:text-amber-400",
                            )}
                          >
                            {money(manualAmount)}
                          </span>
                        )}
                      </label>
                      <Input
                        type="number"
                        min={0}
                        value={manualAmount || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setManualAmount(Number(e.target.value))
                        }
                        placeholder="Nhập số tiền..."
                        className="h-10 text-sm font-bold font-mono text-slate-900 dark:text-white"
                      />
                      {manualAmount > 0 && (
                        <p className="text-[11px] text-slate-500 italic font-medium leading-tight pt-0.5">
                          Bằng chữ:{" "}
                          <span className="text-slate-700 dark:text-slate-300">
                            {readVietnameseCurrency(manualAmount)}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Ngày giao dịch *
                      </label>
                      <Input
                        type="date"
                        value={manualDate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setManualDate(e.target.value)
                        }
                        className="h-10 text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {settlementType === "RECEIPT"
                        ? "Đối tác / Người nộp tiền"
                        : "Đối tác / Người nhận tiền"}
                    </label>
                    <Input
                      value={manualPartner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setManualPartner(e.target.value)
                      }
                      placeholder={
                        settlementType === "RECEIPT"
                          ? "Tên khách hàng hoặc người nộp..."
                          : "Tên nhà cung cấp, thợ, người nhận..."
                      }
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Ghi chú & Diễn giải giao dịch
                    </label>
                    <Textarea
                      rows={2}
                      value={manualNote}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setManualNote(e.target.value)
                      }
                      placeholder={
                        settlementType === "RECEIPT"
                          ? "Lý do thu tiền, nội dung chứng từ..."
                          : "Nội dung chi phí, tiền phụ tùng, công thợ..."
                      }
                      className="text-xs resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* CỘT PHẢI: Trung tâm Đối soát & Mô phỏng dòng tiền (5 cols = ~42%) */}
              <div className="lg:col-span-5 space-y-3.5 flex flex-col">
                {/* Thẻ Mô Phỏng Dòng Tiền Realtime */}
                <div className="p-4 rounded-xl border border-indigo-200/70 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50/60 via-slate-50/50 to-blue-50/40 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-blue-950/30 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>
                        {settlementType === "RECEIPT"
                          ? "Mô phỏng Thu tiền Vụ việc"
                          : "Mô phỏng Chi phí Vụ việc"}
                      </span>
                    </h4>
                    {percentCompleted === 100 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                        Đủ 100%
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>
                        {settlementType === "RECEIPT"
                          ? "Tổng cần thu còn lại:"
                          : "Tổng chi phí cần chi còn lại:"}
                      </span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        {money(currentRemaining)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                      <span>
                        {settlementType === "RECEIPT"
                          ? "Số tiền thu đợt này:"
                          : "Số tiền chi đợt này:"}
                      </span>
                      <span
                        className={cn(
                          "font-mono font-bold",
                          settlementType === "RECEIPT"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      >
                        +{money(amountEntered)}
                      </span>
                    </div>
                    <div className="h-px bg-slate-200/80 dark:bg-slate-700 my-1" />
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-800 dark:text-slate-200">
                        Còn lại sau khi ghi nhận:
                      </span>
                      <span
                        className={cn(
                          "font-mono text-sm",
                          remainingAfter === 0
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {money(remainingAfter)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                      <span>
                        {settlementType === "RECEIPT"
                          ? "Tiến độ thu tiền"
                          : "Tiến độ thanh toán chi phí"}
                      </span>
                      <span className="font-mono font-bold">
                        {percentCompleted}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300 rounded-full",
                          percentCompleted >= 100
                            ? "bg-emerald-500"
                            : settlementType === "RECEIPT"
                              ? "bg-indigo-500"
                              : "bg-amber-500",
                        )}
                        style={{
                          width: `${Math.min(100, percentCompleted)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bảng Mini Lịch Sử Dòng Tiền Đã Ghi Nhận */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex-1 flex flex-col min-h-0 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-slate-500" />
                      <span>Dòng tiền đã ghi nhận trước đó</span>
                    </h4>
                    {existingCaseSettlements &&
                      existingCaseSettlements.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-500">
                          {existingCaseSettlements.length} khoản
                        </span>
                      )}
                  </div>

                  {existingCaseSettlements &&
                  existingCaseSettlements.length > 0 ? (
                    <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] pr-1">
                      {existingCaseSettlements.map((item: any, idx: number) => (
                        <div
                          key={item.id || idx}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-xs flex items-center justify-between"
                        >
                          <div className="flex flex-col min-w-0 pr-2">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {item.sourceChannel === "ON_SYSTEM"
                                ? item.bankName || "Sao kê ERP"
                                : item.category === "TIEN_MAT_NGOAI"
                                  ? "Tiền mặt ngoài"
                                  : item.category === "CHUYEN_KHOAN_CA_NHAN"
                                    ? "CK cá nhân"
                                    : "Cấn trừ khác"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatGMT7(
                                item.transDate || item.createdAt,
                                "date",
                              )}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "font-mono font-bold shrink-0",
                              item.settlementType === "RECEIPT"
                                ? "text-emerald-600"
                                : "text-amber-600",
                            )}
                          >
                            {item.settlementType === "RECEIPT" ? "+" : "-"}
                            {money(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 space-y-2">
                      <p className="text-[11px] leading-relaxed">
                        Chưa có dòng tiền nào được ghi nhận cho vụ việc này.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("ON_SYSTEM")}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        <Landmark className="w-3 h-3" />
                        <span>
                          Khách đã chuyển khoản STK công ty? Chọn Tab 1
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </DrawerModal>

      <BankTransactionDetailDrawer
        transactionId={detailTxnId!}
        isOpen={!!detailTxnId}
        onClose={() => setDetailTxnId(null)}
      />
    </>
  );
}
