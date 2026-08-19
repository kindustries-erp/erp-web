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
import { cn } from "@/shared/utils";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import {
  erpInvoicesCoreApi,
  type SmartNetOffSuggestionItem,
} from "../api/erpInvoicesCoreApi";
import { SmartSuggestionCard } from "./SmartSuggestionCard";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (
    selectedVouchers: {
      id: string;
      amount: number;
      maxAmount?: number;
      txn?: any;
    }[],
  ) => void;
  invoice?: any;
  targetRemainingAmount?: number;
  existingVoucherIds?: string[];
  excludeTxnIds?: string[];
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
  onSelect,
  invoice,
  targetRemainingAmount,
  existingVoucherIds = [],
  excludeTxnIds = [],
}: Props) {
  const { t } = useTranslation("erpInvoices");

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

  // Compute Target Remaining Amount for Invoice (Limit Guard)
  const invoiceTotal = Number(invoice?.totalAmount) || 0;
  const invoiceAlreadyNetOff = Number(invoice?.netOffAmount) || 0;
  const targetRemaining =
    targetRemainingAmount !== undefined
      ? targetRemainingAmount
      : invoiceTotal > 0
        ? Math.max(0, invoiceTotal - invoiceAlreadyNetOff)
        : undefined;

  const totalCurrentNetOff = useMemo(() => {
    return selectedIds.reduce(
      (sum, id) => sum + (Number(netOffAmounts[id]) || 0),
      0,
    );
  }, [selectedIds, netOffAmounts]);

  const isOverInvoiceRemaining =
    targetRemaining !== undefined &&
    targetRemaining > 0 &&
    totalCurrentNetOff > targetRemaining;

  const tableState = useTableColumnState(`voucher-netoff-selection-table`);
  const sortBy = tableState.sorts[0]?.replace("-", "") || "transDate";
  const sortOrder = tableState.sorts[0]?.startsWith("-") ? "DESC" : "ASC";

  const invoiceId = invoice?.id;

  // Fetch Smart Suggestions if invoice context is passed
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery<
    Record<string, SmartNetOffSuggestionItem[]>
  >({
    queryKey: ["smart-net-off-suggestions-single", invoiceId],
    queryFn: () =>
      invoiceId
        ? erpInvoicesCoreApi.getSmartNetOffSuggestions([invoiceId])
        : Promise.resolve({}),
    enabled: open && !!invoiceId,
  });

  const suggestions: SmartNetOffSuggestionItem[] = useMemo(() => {
    if (!invoiceId || !suggestionsData) return [];
    return suggestionsData[invoiceId] || [];
  }, [suggestionsData, invoiceId]);

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
    enabled: open,
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
      setSelectedIds([]);
      setNetOffAmounts({});
      setMaxAmounts({});
      setSelectedTxns({});
    }
  }, [open]);

  const handleSelect = (v: any, checked: boolean) => {
    if (checked) {
      const credit = parseFloat(v.creditAmount) || 0;
      const debit = parseFloat(v.debitAmount) || 0;
      const amount = credit > 0 ? credit : debit;
      const netOff = parseFloat(v.netOffAmount) || 0;
      const remaining = Math.max(0, amount - netOff);

      // Smart auto-fill: min(remaining, targetRemaining - currentSelectedSum)
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

  const handleQuickAcceptSuggestion = (s: SmartNetOffSuggestionItem) => {
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

  const handleSubmit = () => {
    if (isOverInvoiceRemaining) {
      toast.error(
        `Tổng tiền cấn trừ (${money(totalCurrentNetOff)}) vượt quá giá trị còn lại của hóa đơn (${money(targetRemaining!)}).`,
      );
      return;
    }

    onSelect(
      selectedIds.map((id) => ({
        id,
        amount: netOffAmounts[id] || 0,
        maxAmount: maxAmounts[id],
        txn: selectedTxns[id],
      })),
    );
    onClose();
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

  const columns: any[] = [
    {
      key: "selection",
      header: "",
      size: 45,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <div className="flex justify-center">
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
      key: "transDate",
      dataIndex: "transDate",
      header: renderHeaderFilter("transDate", t("date", "Ngày")),
      cell: (row: any) => formatGMT7(row.transDate, "date"),
      size: 105,
      sortable: false,
    },
    {
      key: "description",
      dataIndex: "description",
      header: renderHeaderFilter("description", t("description", "Diễn giải")),
      size: 260,
      cell: (row: any) => (
        <div className="whitespace-pre-wrap line-clamp-2">
          {row.description || "—"}
        </div>
      ),
    },
    {
      key: "source",
      header: renderHeaderFilter("source", t("source", "Nguồn")),
      size: 130,
      cell: (row: any) => {
        return row.sourceType === "BANK"
          ? row.bankAccount?.bankName
            ? `${row.bankAccount.bankName} - ${row.bankAccount.accountNumber}`
            : ""
          : row.cashBook?.name || "";
      },
    },
    {
      key: "thu",
      header: renderHeaderFilter("thu", "Thu"),
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
      size: 115,
      sortable: false,
    },
    {
      key: "chi",
      header: renderHeaderFilter("chi", "Chi"),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-[#ea580c] font-medium">{money(debit)}</span>
          );
        return null;
      },
      className: "text-right",
      size: 115,
      sortable: false,
    },
    {
      key: "netOffAmount",
      header: renderHeaderFilter("netOffAmount", "Đã cấn trừ"),
      className: "text-right",
      headerClassName: "text-center",
      size: 110,
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
      header: renderHeaderFilter("remainingAmount", "Còn lại"),
      className: "text-right font-semibold",
      headerClassName: "text-center",
      size: 115,
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
      header: renderHeaderFilter("currentNetOff", t("netOffAmount", "Cấn trừ")),
      className: "text-right",
      headerClassName: "text-center",
      size: 145,
      cell: (row: any) => {
        const isSelected = selectedIds.includes(row.id);
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = Math.max(0, amount - netOff);

        return (
          <NetOffInput
            initialValue={
              netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : ""
            }
            maxAmount={remaining}
            isSelected={isSelected}
            onChange={(val: number) => handleAmountChange(row, val)}
          />
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
              isOverInvoiceRemaining
                ? "text-rose-600 font-extrabold"
                : "text-orange-600",
            )}
          >
            {money(totalCurrentNetOff)}
          </span>
        ),
    };
  }, [vouchers, totalCurrentNetOff, isOverInvoiceRemaining]);

  return (
    <>
      <DrawerModal
        open={open}
        onClose={onClose}
        title={t("selectVoucherToNetoff", "Chọn phiếu thu/chi để cấn trừ")}
        panelClassName="w-full max-w-[96vw] xl:max-w-[1440px] 2xl:max-w-[1550px]"
        actions={[
          {
            label: t("cancel", "Hủy"),
            variant: "outline",
            onClick: onClose,
          },
          {
            label: t("confirm", "Xác nhận"),
            primary: true,
            disabled: selectedIds.length === 0 || isOverInvoiceRemaining,
            onClick: handleSubmit,
          },
        ]}
      >
        <div className="flex flex-col h-full min-h-[500px] space-y-3">
          {/* Target Invoice / Case info badge if available */}
          {targetRemaining !== undefined && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Hóa đơn:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {invoice?.invoiceNo || "---"}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 font-medium">Giá trị HĐ:</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                  {money(invoiceTotal)}
                </span>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-500 font-medium">Cần cấn trừ:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {money(targetRemaining)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">
                  Đã chọn cấn trừ:
                </span>
                <span
                  className={cn(
                    "font-mono font-bold text-sm",
                    isOverInvoiceRemaining
                      ? "text-rose-600 dark:text-rose-400 animate-pulse"
                      : "text-primary",
                  )}
                >
                  {money(totalCurrentNetOff)}
                </span>
              </div>
            </div>
          )}

          {/* Validation Warning Alert */}
          {isOverInvoiceRemaining && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>
                <strong>Cảnh báo:</strong> Tổng tiền cấn trừ (
                {money(totalCurrentNetOff)}) đang vượt quá số tiền cần thanh
                toán của hóa đơn ({money(targetRemaining!)}). Vui lòng điều
                chỉnh lại số tiền trước khi xác nhận.
              </span>
            </div>
          )}

          {/* Smart Suggestions Section if available */}
          {invoice?.id && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    Gợi ý Đối soát Thông minh
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
                  {suggestions.map((s) => {
                    const isAlreadySelected = selectedIds.includes(s.txn.id);
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
                        badgeType={s.score.badge}
                        matchedKeywords={s.matchedKeywords}
                        onAccept={() => handleQuickAcceptSuggestion(s)}
                        onViewDetail={(id) => setDetailTxnId(id)}
                      />
                    );
                  })}
                </div>
              ) : !isLoadingSuggestions ? (
                <div className="text-[11px] text-slate-500 italic">
                  Chưa tìm thấy giao dịch khớp chính xác với hóa đơn này. Bạn có
                  thể tìm kiếm thủ công trong danh sách bên dưới.
                </div>
              ) : null}
            </div>
          )}

          <div className="flex-1 min-h-[380px]">
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
              minWidth={1100}
            />
          </div>
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
