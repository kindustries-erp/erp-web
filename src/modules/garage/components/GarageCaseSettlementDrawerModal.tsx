import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DrawerModal } from "@/shared/components/DrawerModal";
import { useQuery } from "@tanstack/react-query";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { StandardTable } from "@/shared/components/StandardTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "react-hot-toast";
import {
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Landmark,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import {
  garageApi,
  type GarageSmartSettlementSuggestionItem,
} from "../api/garageApi";
import { SmartSuggestionCard } from "@/modules/erp-invoices-core/components/SmartSuggestionCard";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";

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

interface GarageCaseSettlementDrawerModalProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  defaultType?: "RECEIPT" | "PAYMENT";
  suggestedAmount?: number;
  existingTxnIds?: string[];
  editingItem?: SettlementSubmissionItem | null;
  onSubmit: (items: SettlementSubmissionItem[]) => Promise<void> | void;
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

export function GarageCaseSettlementDrawerModal({
  open,
  onClose,
  caseId,
  caseCode,
  defaultType = "RECEIPT",
  suggestedAmount = 0,
  existingTxnIds = [],
  editingItem = null,
  onSubmit,
}: GarageCaseSettlementDrawerModalProps) {
  const { t } = useTranslation(["garage", "common"]);

  // Tab mode: "ON_SYSTEM" (Sao kê/Sổ quỹ) vs "OFF_SYSTEM_MANUAL" (Ngoài sổ sách)
  const [activeTab, setActiveTab] = useState<"ON_SYSTEM" | "OFF_SYSTEM_MANUAL">(
    editingItem ? "OFF_SYSTEM_MANUAL" : "ON_SYSTEM",
  );
  const [settlementType, setSettlementType] = useState<"RECEIPT" | "PAYMENT">(
    editingItem?.settlementType || defaultType,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State cho Mode 1: Sao kê ERP (StandardTable spreadsheet)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [netOffAmounts, setNetOffAmounts] = useState<Record<string, number>>(
    {},
  );
  const [selectedTxns, setSelectedTxns] = useState<Record<string, any>>({});
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  const totalCurrentNetOff = useMemo(() => {
    return selectedIds.reduce(
      (sum, id) => sum + (Number(netOffAmounts[id]) || 0),
      0,
    );
  }, [selectedIds, netOffAmounts]);

  // Validate ONLY applies for ON_SYSTEM (not for OFF_SYSTEM_MANUAL)
  const isOverCaseRemaining =
    activeTab === "ON_SYSTEM" &&
    suggestedAmount > 0 &&
    totalCurrentNetOff > suggestedAmount;

  // Fetch Smart Suggestions for Garage Case
  const { data: smartSuggestions, isLoading: isLoadingSmartSuggestions } =
    useQuery({
      queryKey: [
        "garage-case-smart-settlement-suggestions",
        caseId,
        settlementType,
      ],
      queryFn: () =>
        garageApi.getSmartSettlementSuggestions(caseId!, settlementType),
      enabled: open && activeTab === "ON_SYSTEM" && !!caseId,
    });

  const handleQuickAcceptSmartSuggestion = (
    s: GarageSmartSettlementSuggestionItem,
  ) => {
    const txn = s.txn;
    const credit = Number(txn.creditAmount) || 0;
    const debit = Number(txn.debitAmount) || 0;
    const amount = credit > 0 ? credit : debit;
    const remaining = Number(txn.remainingAmount) || amount;

    setSelectedIds((prev) =>
      prev.includes(txn.id) ? prev : [...prev, txn.id],
    );
    setNetOffAmounts((prev) => ({
      ...prev,
      [txn.id]: remaining > 0 ? remaining : 0,
    }));
    setSelectedTxns((prev) => ({ ...prev, [txn.id]: txn }));
    toast.success(`Đã nhận gợi ý: ${money(remaining)}`);
  };

  const tableState = useTableColumnState(
    `garage-settlement-netoff-selection-table`,
  );
  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const { data: txnData, isLoading: isLoadingTxns } = useQuery({
    queryKey: [
      "bank-transactions-for-garage-settlement",
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

  // State cho Mode 2: Ghi nhận Ngoài sổ sách
  const [manualAmount, setManualAmount] = useState<number>(
    editingItem?.amount || suggestedAmount || 0,
  );
  const [manualDate, setManualDate] = useState<string>(
    editingItem?.transDate
      ? String(editingItem.transDate).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
  );
  const [manualCategory, setManualCategory] = useState<string>(
    editingItem?.category || "TIEN_MAT_NGOAI",
  );
  const [manualPartner, setManualPartner] = useState<string>(
    editingItem?.partnerName || "",
  );
  const [manualNote, setManualNote] = useState<string>(editingItem?.note || "");

  // Reset state on open
  useEffect(() => {
    if (open) {
      if (editingItem) {
        setActiveTab("OFF_SYSTEM_MANUAL");
        setSettlementType(editingItem.settlementType || defaultType);
        setManualAmount(editingItem.amount || 0);
        setManualDate(
          editingItem.transDate
            ? String(editingItem.transDate).slice(0, 10)
            : new Date().toISOString().slice(0, 10),
        );
        setManualCategory(editingItem.category || "TIEN_MAT_NGOAI");
        setManualPartner(editingItem.partnerName || "");
        setManualNote(editingItem.note || "");
      } else {
        setActiveTab("ON_SYSTEM");
        setSettlementType(defaultType);
        setSelectedIds([]);
        setNetOffAmounts({});
        setSelectedTxns({});
        setManualAmount(suggestedAmount || 0);
        setManualDate(new Date().toISOString().slice(0, 10));
        setManualCategory("TIEN_MAT_NGOAI");
        setManualPartner("");
        setManualNote("");
      }
      setIsSubmitting(false);
    }
  }, [open, defaultType, suggestedAmount, editingItem]);

  const vouchers = (txnData?.items || []).filter((v: any) => {
    if (existingTxnIds.includes(v.id)) return false;
    const credit = parseFloat(v.creditAmount) || 0;
    const debit = parseFloat(v.debitAmount) || 0;
    const amount = credit > 0 ? credit : debit;
    const netOff = parseFloat(v.netOffAmount) || 0;
    const remaining = amount - netOff;
    return remaining > 0;
  });

  const handleSelectRow = (v: any, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, v.id]);
      const credit = parseFloat(v.creditAmount) || 0;
      const debit = parseFloat(v.debitAmount) || 0;
      const amount = credit > 0 ? credit : debit;
      const netOff = parseFloat(v.netOffAmount) || 0;
      const remaining = amount - netOff;

      setNetOffAmounts((prev) => ({
        ...prev,
        [v.id]: remaining > 0 ? remaining : 0,
      }));
      setSelectedTxns((prev) => ({ ...prev, [v.id]: v }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== v.id));
      setNetOffAmounts((prev) => {
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

  const handleAmountChange = (v: any, val: number) => {
    if (val > 0) {
      setSelectedIds((prev) => (prev.includes(v.id) ? prev : [...prev, v.id]));
      setNetOffAmounts((prev) => ({ ...prev, [v.id]: val }));
      setSelectedTxns((prev) => ({ ...prev, [v.id]: v }));
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== v.id));
      setNetOffAmounts((prev) => {
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newIds: string[] = [];
      const newAmounts: Record<string, number> = {};
      const newTxns: Record<string, any> = {};

      vouchers.forEach((v: any) => {
        newIds.push(v.id);
        const credit = parseFloat(v.creditAmount) || 0;
        const debit = parseFloat(v.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(v.netOffAmount) || 0;
        const remaining = amount - netOff;

        newAmounts[v.id] = remaining > 0 ? remaining : 0;
        newTxns[v.id] = v;
      });

      setSelectedIds(newIds);
      setNetOffAmounts(newAmounts);
      setSelectedTxns(newTxns);
    } else {
      setSelectedIds([]);
      setNetOffAmounts({});
      setSelectedTxns({});
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
        queryKeyPrefix={`garage-settlement-column-options`}
      />
    );
  };

  const isAllSelected =
    vouchers.length > 0 &&
    vouchers.every((v: any) => selectedIds.includes(v.id));

  const columns: any[] = [
    {
      key: "selection",
      header: "",
      size: 50,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <div
            className="flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleSelectRow(row, !!checked)}
            />
          </div>
        );
      },
      headerComponent: (
        <div
          className="flex items-center justify-center p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={(checked) => handleSelectAll(!!checked)}
          />
        </div>
      ),
    },
    {
      key: "transDate",
      header: renderHeaderFilter(
        "transDate",
        t("cases.settlementDrawer.columns.date", "Ngày giao dịch"),
      ),
      size: 105,
      cell: (row: any) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {formatGMT7(row.transDate, "date")}
        </span>
      ),
    },
    {
      key: "referenceNumber",
      header: renderHeaderFilter(
        "referenceNumber",
        t("cases.settlementDrawer.columns.ref", "Số tham chiếu / Bút toán"),
      ),
      size: 140,
      cell: (row: any) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
          {row.referenceNumber || "---"}
        </span>
      ),
    },
    {
      key: "bankAccount",
      header: renderHeaderFilter(
        "bankAccount",
        t("cases.settlementDrawer.columns.account", "Tài khoản / Sổ quỹ"),
      ),
      size: 130,
      cell: (row: any) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {row.bankAccount?.bankName || row.cashBook?.name || "---"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.bankAccount?.accountNumber ||
              (row.sourceType === "BANK"
                ? t("common:bank", "Ngân hàng")
                : t("common:cash", "Tiền mặt"))}
          </span>
        </div>
      ),
    },
    {
      key: "correspondentName",
      header: renderHeaderFilter(
        "correspondentName",
        t("cases.settlementDrawer.columns.partner", "Đối tác / Người nộp"),
      ),
      size: 160,
      cell: (row: any) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
          {row.correspondentName || "---"}
        </span>
      ),
    },
    {
      key: "description",
      header: renderHeaderFilter(
        "description",
        t("cases.settlementDrawer.columns.desc", "Nội dung diễn giải"),
      ),
      size: 240,
      cell: (row: any) => (
        <span
          className="text-xs text-slate-500 truncate"
          title={row.description}
        >
          {row.description || "---"}
        </span>
      ),
    },
    {
      key: "amount",
      header: t("cases.settlementDrawer.columns.amount", "Số tiền GD"),
      align: "right",
      size: 115,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const isCredit = credit > 0;
        const amount = isCredit ? credit : debit;
        return (
          <span
            className={cn(
              "text-xs font-mono font-medium",
              isCredit
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400",
            )}
          >
            {isCredit ? "+" : "-"}
            {money(amount)}
          </span>
        );
      },
    },
    {
      key: "remainingAmount",
      header: t("cases.settlementDrawer.columns.available", "Còn khả dụng"),
      align: "right",
      size: 115,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);
        return (
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold">
            {money(remaining)}
          </span>
        );
      },
    },
    {
      key: "currentNetOff",
      header: t("cases.settlementDrawer.columns.netoff", "Cấn trừ đợt này"),
      align: "right",
      size: 140,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        return (
          <div className="p-1" onClick={(e) => e.stopPropagation()}>
            <NetOffInput
              initialValue={
                netOffAmounts[row.id] ?? (isSelected ? remaining : "")
              }
              maxAmount={remaining}
              isSelected={isSelected}
              onChange={(val) => handleAmountChange(row, val)}
            />
          </div>
        );
      },
    },
  ];

  const summaryRow = useMemo(() => {
    let totalCredit = 0;
    let totalDebit = 0;
    let totalRemaining = 0;
    let totalCurrentNetOff = 0;

    vouchers.forEach((v: any) => {
      const credit = parseFloat(v.creditAmount) || 0;
      const debit = parseFloat(v.debitAmount) || 0;
      const amount = credit > 0 ? credit : debit;
      const netOff = parseFloat(v.netOffAmount) || 0;
      const remaining = Math.max(0, amount - netOff);

      totalCredit += credit;
      totalDebit += debit;
      totalRemaining += remaining;

      if (netOffAmounts[v.id]) {
        totalCurrentNetOff += netOffAmounts[v.id];
      }
    });

    return {
      selection: "",
      transDate: t("cases.settlementDrawer.columns.total", "Tổng cộng"),
      referenceNumber: t("cases.settlementDrawer.columns.txnCount", {
        count: vouchers.length,
        defaultValue: `${vouchers.length} giao dịch`,
      }),
      bankAccount: "",
      correspondentName: "",
      description: "",
      amount: money(totalCredit > 0 ? totalCredit : totalDebit),
      remainingAmount: (
        <span className="text-slate-800 dark:text-slate-200 font-bold">
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
              isOverCaseRemaining
                ? "text-rose-600 font-extrabold"
                : "text-indigo-600 dark:text-indigo-400",
            )}
          >
            {money(totalCurrentNetOff)}
          </span>
        ),
    };
  }, [vouchers, netOffAmounts, isOverCaseRemaining, t]);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      if (activeTab === "ON_SYSTEM") {
        if (selectedIds.length === 0) {
          toast.error(
            t(
              "cases.settlementDrawer.toasts.selectAtLeastOne",
              "Vui lòng chọn ít nhất một giao dịch",
            ),
          );
          return;
        }

        if (isOverCaseRemaining) {
          toast.error(
            `Tổng tiền cấn trừ (${money(totalCurrentNetOff)}) vượt quá số tiền cần thanh toán (${money(suggestedAmount)}).`,
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

        if (items.length === 0) {
          toast.error(
            t(
              "cases.settlementDrawer.toasts.amountGreaterThanZero",
              "Số tiền cấn trừ phải lớn hơn 0",
            ),
          );
          return;
        }

        await onSubmit(items);
        toast.success(
          t("cases.settlementDrawer.toasts.netoffSuccess", {
            count: items.length,
            defaultValue: `Đã cấn trừ thành công ${items.length} giao dịch!`,
          }),
        );
      } else {
        // Ghi nhận Ngoài sổ sách
        if (!manualAmount || manualAmount <= 0) {
          toast.error(
            t(
              "cases.settlementDrawer.toasts.validAmount",
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

        await onSubmit([manualItem]);
        toast.success(
          t(
            "cases.settlementDrawer.toasts.manualSuccess",
            "Đã ghi nhận dòng tiền ngoài sổ sách thành công!",
          ),
        );
      }

      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || err?.message || "Lỗi lưu giao dịch",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        title={t("cases.settlementDrawer.title", {
          code: caseCode || "",
          defaultValue: `Ghi nhận & Cấn trừ Dòng tiền: ${caseCode || ""}`,
        })}
        panelClassName="w-full max-w-[96vw] xl:max-w-[1440px] 2xl:max-w-[1550px]"
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
                ? t("cases.settlementDrawer.confirmNetoff", {
                    count: selectedIds.length,
                    defaultValue: `Xác nhận cấn trừ (${selectedIds.length})`,
                  })
                : t(
                    "cases.settlementDrawer.confirmManual",
                    "Xác nhận ghi nhận ngoài",
                  ),
            primary: true,
            disabled:
              isSubmitting ||
              (activeTab === "ON_SYSTEM" &&
                (selectedIds.length === 0 || isOverCaseRemaining)) ||
              (activeTab === "OFF_SYSTEM_MANUAL" &&
                (!manualAmount || manualAmount <= 0)),
            onClick: handleSave,
          },
        ]}
      >
        <div className="flex flex-col h-full space-y-4">
          {/* Case Amount Summary Badge */}
          {suggestedAmount > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Vụ việc:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {caseCode || "---"}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 font-medium">
                  {settlementType === "RECEIPT"
                    ? "Cần thu còn lại:"
                    : "Cần chi còn lại:"}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {money(suggestedAmount)}
                </span>
              </div>
              {activeTab === "ON_SYSTEM" && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-medium">
                    Đã chọn cấn trừ:
                  </span>
                  <span
                    className={cn(
                      "font-mono font-bold text-sm",
                      isOverCaseRemaining
                        ? "text-rose-600 dark:text-rose-400 animate-pulse"
                        : "text-primary",
                    )}
                  >
                    {money(totalCurrentNetOff)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Validation Warning Alert for ON_SYSTEM */}
          {isOverCaseRemaining && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Cảnh báo:</strong> Tổng tiền cấn trừ (
                {money(totalCurrentNetOff)}) đang vượt quá số tiền cần thanh
                toán của vụ việc ({money(suggestedAmount)}). Vui lòng điều chỉnh
                lại số tiền trước khi xác nhận.
              </span>
            </div>
          )}
          {/* Segmented Animated Pill Tabs (Dashboard style) */}
          <Tabs
            value={activeTab}
            onValueChange={(val) =>
              setActiveTab(val as "ON_SYSTEM" | "OFF_SYSTEM_MANUAL")
            }
            className="w-full"
          >
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
              <TabsList className="h-10 rounded-full bg-slate-100/80 dark:bg-slate-800/80 p-1 gap-1.5 shadow-[0_1px_2px_rgba(15,23,42,.03)]">
                <TabsTrigger
                  value="ON_SYSTEM"
                  className={cn(
                    "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-all duration-150 ease-out cursor-pointer",
                    "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400",
                    "data-[state=active]:text-indigo-700 data-[state=active]:font-semibold dark:data-[state=active]:text-indigo-300",
                  )}
                >
                  <Landmark
                    className={cn(
                      "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                      "w-0 h-0 opacity-0 mr-0",
                      "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-1.5",
                    )}
                  />
                  <span className="text-xs font-semibold tracking-tight">
                    {t(
                      "cases.settlementDrawer.tabs.erp",
                      "1. Cấn trừ Sao kê / Sổ quỹ ERP",
                    )}
                  </span>
                </TabsTrigger>

                <TabsTrigger
                  value="OFF_SYSTEM_MANUAL"
                  className={cn(
                    "group relative shrink-0 rounded-full px-4 h-full gap-0 transition-all duration-150 ease-out cursor-pointer",
                    "data-[state=inactive]:text-slate-500 data-[state=inactive]:font-medium hover:text-slate-700 dark:data-[state=inactive]:text-slate-400",
                    "data-[state=active]:text-emerald-700 data-[state=active]:font-semibold dark:data-[state=active]:text-emerald-300",
                  )}
                >
                  <DollarSign
                    className={cn(
                      "shrink-0 transition-[width,height,opacity,margin] duration-150 ease-out overflow-hidden",
                      "w-0 h-0 opacity-0 mr-0",
                      "group-data-[state=active]:w-3.5 group-data-[state=active]:h-3.5 group-data-[state=active]:opacity-100 group-data-[state=active]:mr-1.5",
                    )}
                  />
                  <span className="text-xs font-semibold tracking-tight">
                    {t(
                      "cases.settlementDrawer.tabs.manual",
                      "2. Ghi nhận Dòng tiền Ngoài sổ sách",
                    )}
                  </span>
                </TabsTrigger>
              </TabsList>

              {activeTab === "OFF_SYSTEM_MANUAL" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSettlementType("RECEIPT")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer",
                      settlementType === "RECEIPT"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold shadow-xs ring-1 ring-emerald-500/20"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400",
                    )}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    {t(
                      "cases.settlementDrawer.typeReceipt",
                      "Ghi nhận Thu tiền",
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettlementType("PAYMENT")}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer",
                      settlementType === "PAYMENT"
                        ? "bg-amber-50 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-semibold shadow-xs ring-1 ring-amber-500/20"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400",
                    )}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
                    {t(
                      "cases.settlementDrawer.typePayment",
                      "Ghi nhận Chi tiền",
                    )}
                  </button>
                </div>
              )}
            </div>
          </Tabs>

          {/* Nội dung Tab 1: StandardTable Spreadsheet */}
          {activeTab === "ON_SYSTEM" ? (
            <div className="flex-1 flex flex-col space-y-3 min-h-[480px]">
              {/* Smart Suggestions Block */}
              {caseId && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                        Gợi ý Đối soát Thông minh
                      </h4>
                    </div>
                    {isLoadingSmartSuggestions && (
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Đang tìm kiếm...
                      </span>
                    )}
                  </div>

                  {smartSuggestions && smartSuggestions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {smartSuggestions.map((s) => {
                        const isAlreadySelected = selectedIds.includes(
                          s.txn.id,
                        );
                        return (
                          <SmartSuggestionCard
                            key={s.txn.id}
                            txn={s.txn}
                            amount={
                              s.txn.creditAmount > 0
                                ? s.txn.creditAmount
                                : s.txn.debitAmount
                            }
                            isSuggestion={!isAlreadySelected}
                            badgeType={s.score.badge}
                            matchedKeywords={s.matchedKeywords}
                            onAccept={() => handleQuickAcceptSmartSuggestion(s)}
                            onViewDetail={(id) => setDetailTxnId(id)}
                          />
                        );
                      })}
                    </div>
                  ) : !isLoadingSmartSuggestions ? (
                    <div className="text-[11px] text-slate-500 italic">
                      Chưa tìm thấy giao dịch khớp chính xác với vụ việc này.
                      Bạn có thể tìm kiếm thủ công trong bảng bên dưới.
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex-1">
                <StandardTable
                  tableId="garage-settlement-netoff-selection-table"
                  items={vouchers}
                  columns={columns}
                  getRowKey={(row: any) => row.id}
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  loading={isLoadingTxns}
                  page={page}
                  pageSize={pageSize}
                  total={txnData?.total || 0}
                  totalPages={txnData?.totalPages || 0}
                  onPage={setPage}
                  onPageSize={setPageSize}
                  summaryRow={summaryRow}
                  minWidth={1050}
                />
              </div>
            </div>
          ) : (
            /* Nội dung Tab 2: Form Ghi nhận ngoài sổ sách chuẩn Enterprise */
            <div className="max-w-2xl mx-auto w-full py-6 space-y-4">
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  {t(
                    "cases.settlementDrawer.manualSectionTitle",
                    "Thông tin Dòng tiền Ngoài Sổ sách ERP",
                  )}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t("cases.settlementDrawer.amount", "Số tiền (VNĐ) *")}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={manualAmount || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setManualAmount(Number(e.target.value))
                      }
                      placeholder={t(
                        "cases.settlementDrawer.amountPlaceholder",
                        "Nhập số tiền...",
                      )}
                      className="h-9 text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t(
                        "cases.settlementDrawer.transDate",
                        "Ngày giao dịch *",
                      )}
                    </label>
                    <Input
                      type="date"
                      value={manualDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setManualDate(e.target.value)
                      }
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t(
                        "cases.settlementDrawer.category",
                        "Phân loại nguồn ngoài",
                      )}
                    </label>
                    <select
                      value={manualCategory}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setManualCategory(e.target.value)
                      }
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm dark:border-slate-800 dark:bg-slate-950"
                    >
                      <option value="TIEN_MAT_NGOAI">
                        {t(
                          "cases.settlementDrawer.catCash",
                          "Tiền mặt ngoài sổ sách",
                        )}
                      </option>
                      <option value="CHUYEN_KHOAN_CA_NHAN">
                        {t(
                          "cases.settlementDrawer.catBank",
                          "Chuyển khoản tài khoản cá nhân",
                        )}
                      </option>
                      <option value="CHI_PHI_KHAC">
                        {t("cases.settlementDrawer.catOther", "Khác")}
                      </option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      {t(
                        "cases.settlementDrawer.partner",
                        "Đối tác / Người nộp / Người nhận",
                      )}
                    </label>
                    <Input
                      value={manualPartner}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setManualPartner(e.target.value)
                      }
                      placeholder={t(
                        "cases.settlementDrawer.partnerPlaceholder",
                        "Tên người giao dịch...",
                      )}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {t("cases.settlementDrawer.note", "Ghi chú diễn giải")}
                  </label>
                  <Textarea
                    rows={3}
                    value={manualNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setManualNote(e.target.value)
                    }
                    placeholder={t(
                      "cases.settlementDrawer.notePlaceholder",
                      "Lý do thu / chi, nội dung chứng từ...",
                    )}
                    className="text-xs resize-none"
                  />
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
