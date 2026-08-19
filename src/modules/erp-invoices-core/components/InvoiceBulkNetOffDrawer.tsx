import React, { useMemo, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { type DrawerAction } from "@/shared/components/DrawerModal";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { Button } from "@/shared/components/ui/Button";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Search,
  Sparkles,
} from "lucide-react";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import toast from "react-hot-toast";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
  type SmartNetOffSuggestionItem,
} from "../api/erpInvoicesCoreApi";
import { money } from "@/shared/utils/format";
import { VoucherNetoffSelectionModal } from "@/modules/erp-invoices-core/components/VoucherNetoffSelectionModal";
import { type ComboboxOption } from "@/shared/components/Combobox";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import {
  SmartSuggestionCard,
  highlightText,
} from "@/modules/erp-invoices-core/components/SmartSuggestionCard";

const SUGGESTION_FILTER_OPTIONS: ComboboxOption[] = [
  { value: "ALL", label: "Tất cả HĐ" },
  { value: "HAS_SUGGESTION", label: "Có gợi ý / Lưu ý" },
  { value: "PERFECT_HIGH", label: "Hoàn hảo / Tốt" },
  { value: "NOTICE", label: "Nhóm Lưu ý" },
  { value: "NO_SUGGESTION", label: "Chưa có gợi ý" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  selectedInvoiceIds: string[];
  invoices: ErpInvoice[];
  direction?: "IN" | "OUT";
  onSuccess: () => void;
}

export function InvoiceBulkNetOffDrawer({
  open,
  onClose,
  selectedInvoiceIds,
  invoices,
  direction = "IN",
  onSuccess,
}: Props) {
  const selectedInvoices = useMemo(
    () => invoices.filter((inv) => selectedInvoiceIds.includes(inv.id)),
    [invoices, selectedInvoiceIds],
  );

  // { invoiceId: { txnId: amount } }
  const [netOffMap, setNetOffMap] = useState<
    Record<
      string,
      Record<string, { amount: number; maxAmount?: number; txn?: any }>
    >
  >({});
  const [isDirty, setIsDirty] = useState(false);
  const [columnSearch, setColumnSearch] = useState<Record<string, string>>({});

  // Existing net-offs map fetched from DB
  const [existingNetOffsMap, setExistingNetOffsMap] = useState<
    Record<string, any[]>
  >({});

  // Deleted existing net-offs in this session (invoiceId -> Set of bankTransactionIds)
  const [deletedNetOffs, setDeletedNetOffs] = useState<
    Record<string, Set<string>>
  >({});

  // Updated existing net-offs in this session (invoiceId -> bankTransactionId -> newAmount)
  const [updatedNetOffs, setUpdatedNetOffs] = useState<
    Record<string, Record<string, number>>
  >({});
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [columnSort, setColumnSort] = useState<{
    key: string;
    direction: "asc" | "desc" | "none";
  }>({ key: "", direction: "none" });

  // State for BankTransactionDetailDrawer
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  // State for VoucherNetoffSelectionModal
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  // Fetch existing net-offs for selected invoices
  useEffect(() => {
    if (!open || !selectedInvoiceIds.length) return;

    let isMounted = true;
    erpInvoicesCoreApi
      .getBulkNetOffs(selectedInvoiceIds)
      .then((netOffs) => {
        if (!isMounted) return;
        const map: Record<string, any[]> = {};
        netOffs.forEach((no) => {
          if (!map[no.invoiceId]) map[no.invoiceId] = [];
          map[no.invoiceId].push(no);
        });
        setExistingNetOffsMap(map);
      })
      .catch((err) => {
        console.error("Failed to fetch bulk net-offs", err);
      });

    return () => {
      isMounted = false;
    };
  }, [open, selectedInvoiceIds]);

  // Fetch Smart Net-Off Suggestions from Backend Targeted Engine
  const { data: suggestionsData, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ["smart-net-off-suggestions", selectedInvoiceIds],
    queryFn: () =>
      erpInvoicesCoreApi.getSmartNetOffSuggestions(selectedInvoiceIds),
    enabled: open && selectedInvoiceIds.length > 0,
  });

  // Reset when drawer opens/closes
  useEffect(() => {
    if (!open) {
      setNetOffMap({});
      setExistingNetOffsMap({});
      setDeletedNetOffs({});
      setUpdatedNetOffs({});
      setActiveInvoiceId(null);
      setIsDirty(false);
      return;
    }
  }, [open]);

  const getAmounts = (inv: ErpInvoice) => {
    const total = Number(inv.totalAmount) || 0;

    const existing = existingNetOffsMap[inv.id];
    let currentNetOff: number;
    if (existing) {
      currentNetOff = existing.reduce((sum, v) => {
        const txnId = v.bankTransactionId;
        if (deletedNetOffs[inv.id]?.has(txnId)) return sum;
        const updatedAmount = updatedNetOffs[inv.id]?.[txnId];
        if (updatedAmount !== undefined) return sum + updatedAmount;
        return sum + (Number(v.netOffAmount || v.net_off_amount) || 0);
      }, 0);
    } else {
      currentNetOff = Number((inv as any).netOffAmount) || 0;
    }

    const pendingNetOff = Object.values(netOffMap[inv.id] || {}).reduce(
      (sum, val) => sum + (val.amount || 0),
      0,
    );
    return {
      total,
      nettedOff: currentNetOff + pendingNetOff,
      remaining: total - currentNetOff - pendingNetOff,
    };
  };

  // Tính tổng pending đã phân bổ cho mỗi txn trong session
  const pendingTxnUsage = useMemo(() => {
    const usage: Record<string, number> = {};
    for (const invSelections of Object.values(netOffMap)) {
      for (const [txnId, data] of Object.entries(invSelections)) {
        usage[txnId] = (usage[txnId] || 0) + (data.amount || 0);
      }
    }
    return usage;
  }, [netOffMap]);

  // Find best valid suggestion for each invoice
  const suggestionsMap = useMemo(() => {
    const map: Record<string, SmartNetOffSuggestionItem> = {};
    if (!suggestionsData) return map;

    for (const inv of selectedInvoices) {
      const amounts = getAmounts(inv);
      if (amounts.remaining <= 0) continue;

      const suggestions = suggestionsData[inv.id] || [];
      const valid = suggestions.find((s) => {
        const remaining =
          s.txn.remainingAmount - (pendingTxnUsage[s.txn.id] || 0);
        return remaining > 0;
      });

      if (valid) {
        map[inv.id] = valid;
      }
    }
    return map;
  }, [
    suggestionsData,
    selectedInvoices,
    pendingTxnUsage,
    netOffMap,
    existingNetOffsMap,
    updatedNetOffs,
    deletedNetOffs,
  ]);

  const displayedInvoices = useMemo(() => {
    let filtered = selectedInvoices;

    // Search
    if (columnSearch.invoiceNo) {
      const q = columnSearch.invoiceNo.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNo?.toLowerCase().includes(q) ||
          inv.serialNo?.toLowerCase().includes(q),
      );
    }
    if (columnSearch.partner) {
      const q = columnSearch.partner.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.sellerName?.toLowerCase().includes(q) ||
          inv.buyerName?.toLowerCase().includes(q) ||
          inv.sellerTaxCode?.toLowerCase().includes(q) ||
          inv.buyerTaxCode?.toLowerCase().includes(q),
      );
    }
    if (columnSearch.amount) {
      const q = columnSearch.amount;
      filtered = filtered.filter((inv) => String(inv.totalAmount).includes(q));
    }

    // Sort
    if (columnSort.key && columnSort.direction !== "none") {
      filtered = [...filtered].sort((a, b) => {
        let valA: any = "";
        let valB: any = "";
        if (columnSort.key === "invoiceNo") {
          valA = a.invoiceNo || "";
          valB = b.invoiceNo || "";
        } else if (columnSort.key === "partner") {
          valA = (direction === "IN" ? a.sellerName : a.buyerName) || "";
          valB = (direction === "IN" ? b.sellerName : b.buyerName) || "";
        } else if (columnSort.key === "amount") {
          valA = Number(a.totalAmount) || 0;
          valB = Number(b.totalAmount) || 0;
        }

        if (valA < valB) return columnSort.direction === "asc" ? -1 : 1;
        if (valA > valB) return columnSort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Filters
    if (columnFilters.invoiceNo?.length > 0) {
      filtered = filtered.filter((inv) =>
        columnFilters.invoiceNo.includes(inv.invoiceNo || ""),
      );
    }
    if (columnFilters.partner?.length > 0) {
      filtered = filtered.filter((inv) => {
        const text = direction === "IN" ? inv.sellerName : inv.buyerName;
        return columnFilters.partner.includes(text || "");
      });
    }
    if (columnFilters.amount?.length > 0) {
      filtered = filtered.filter((inv) => {
        return columnFilters.amount.some((val) => {
          if (val === "NETTED") return getAmounts(inv).remaining <= 0;
          if (val === "UNNETTED") return getAmounts(inv).remaining > 0;
          return String(inv.totalAmount) === val;
        });
      });
    }
    if (columnFilters.action?.length > 0) {
      filtered = filtered.filter((inv) => {
        const badge = suggestionsMap[inv.id]?.score?.badge;
        return columnFilters.action.some((val) => {
          if (val === "HAS_SUGGESTION") return !!badge;
          if (val === "PERFECT_HIGH")
            return (
              badge === "PERFECT" || badge === "HIGH" || badge === "LIKELY"
            );
          if (val === "NOTICE")
            return badge === "NOTICE_STRONG" || badge === "NOTICE";
          if (val === "NO_SUGGESTION") return !badge;
          return false;
        });
      });
    }

    return filtered;
  }, [
    selectedInvoices,
    suggestionsMap,
    columnSearch,
    columnSort,
    columnFilters,
    direction,
  ]);

  const invoiceNoOptions = useMemo(() => {
    const set = new Set<string>();
    selectedInvoices.forEach((inv) => {
      if (inv.invoiceNo) set.add(inv.invoiceNo);
    });
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [selectedInvoices]);

  const partnerOptions = useMemo(() => {
    const set = new Set<string>();
    selectedInvoices.forEach((inv) => {
      const text = direction === "IN" ? inv.sellerName : inv.buyerName;
      if (text) set.add(text);
    });
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [selectedInvoices, direction]);

  const amountOptions = useMemo(() => {
    const set = new Set<string>();
    selectedInvoices.forEach((inv) => {
      if (inv.totalAmount) set.add(String(inv.totalAmount));
    });
    return [
      { label: "Đã cấn đủ", value: "NETTED" },
      { label: "Chưa cấn đủ", value: "UNNETTED" },
      ...Array.from(set).map((v) => ({ label: money(Number(v)), value: v })),
    ];
  }, [selectedInvoices]);

  const handleQuickAccept = (invId: string, txn: any, amt: number) => {
    setIsDirty(true);
    setNetOffMap((prev) => {
      const invMap = { ...(prev[invId] || {}) };
      const credit = parseFloat(txn.creditAmount as any) || 0;
      const debit = parseFloat(txn.debitAmount as any) || 0;
      const baseAmt = credit > 0 ? credit : debit;
      const dbNetOff = parseFloat((txn as any).netOffAmount) || 0;
      const remaining = baseAmt - dbNetOff;
      invMap[txn.id] = { amount: amt, maxAmount: remaining, txn };
      return { ...prev, [invId]: invMap };
    });
  };

  const columns = useMemo<DataTableColumn<ErpInvoice>[]>(
    () => [
      {
        key: "invoiceNo",
        header: (
          <TableColumnHeaderFilter
            title="Thông tin HĐ"
            sortState={
              columnSort.key === "invoiceNo" ? columnSort.direction : "none"
            }
            onSortChange={(dir) =>
              setColumnSort({ key: "invoiceNo", direction: dir })
            }
            searchValue={columnSearch.invoiceNo || ""}
            onSearchChange={(val) =>
              setColumnSearch((prev) => ({ ...prev, invoiceNo: val }))
            }
            filterOptions={invoiceNoOptions}
            selectedFilters={columnFilters.invoiceNo || []}
            onFilterChange={(vals) =>
              setColumnFilters((prev) => ({ ...prev, invoiceNo: vals }))
            }
            hideFilter={false}
            align="center"
          />
        ),
        headerClassName: "text-center",
        size: 150,
        cell: (inv) => {
          const suggestion = suggestionsMap[inv.id];
          const hasMatchedInvoiceNo =
            suggestion && suggestion.score.invoiceNoMatch;
          return (
            <div className={getAmounts(inv).remaining <= 0 ? "opacity-60" : ""}>
              <div className="font-medium text-xs text-slate-800 dark:text-slate-200">
                {hasMatchedInvoiceNo
                  ? highlightText(inv.invoiceNo, inv.invoiceNo)
                  : inv.invoiceNo}
              </div>
              <div className="text-[10px] text-slate-500">
                {inv.serialNo || "---"}
              </div>
              <div className="text-[10px] text-slate-500">
                {inv.invoiceDate?.substring(0, 10)}
              </div>
            </div>
          );
        },
      },
      {
        key: "partner",
        header: (
          <TableColumnHeaderFilter
            title="Đối tác"
            sortState={
              columnSort.key === "partner" ? columnSort.direction : "none"
            }
            onSortChange={(dir) =>
              setColumnSort({ key: "partner", direction: dir })
            }
            searchValue={columnSearch.partner || ""}
            onSearchChange={(val) =>
              setColumnSearch((prev) => ({ ...prev, partner: val }))
            }
            filterOptions={partnerOptions}
            selectedFilters={columnFilters.partner || []}
            onFilterChange={(vals) =>
              setColumnFilters((prev) => ({ ...prev, partner: vals }))
            }
            hideFilter={false}
            align="center"
          />
        ),
        headerClassName: "text-center",
        size: 250,
        cell: (inv) => {
          const text = direction === "IN" ? inv.sellerName : inv.buyerName;
          const taxCode =
            direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;
          const suggestion = suggestionsMap[inv.id];
          const hasMatchedPartner =
            suggestion && suggestion.score.correspondentMatch;
          return (
            <div className={getAmounts(inv).remaining <= 0 ? "opacity-60" : ""}>
              <div
                className="text-xs text-slate-700 dark:text-slate-300 whitespace-normal break-words"
                title={text || ""}
              >
                {hasMatchedPartner && text
                  ? highlightText(text, suggestion?.matchedKeywords)
                  : text || "---"}
              </div>
              {taxCode && (
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  MST: {taxCode}
                </div>
              )}
              {inv.description && (
                <div className="text-[10px] text-slate-400 italic mt-0.5 whitespace-normal break-words">
                  {suggestion && suggestion.matchedKeywords.length > 0
                    ? highlightText(inv.description, suggestion.matchedKeywords)
                    : inv.description}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "amount",
        header: (
          <TableColumnHeaderFilter
            title="Giá trị"
            sortState={
              columnSort.key === "amount" ? columnSort.direction : "none"
            }
            onSortChange={(dir) =>
              setColumnSort({ key: "amount", direction: dir })
            }
            searchValue={columnSearch.amount || ""}
            onSearchChange={(val) =>
              setColumnSearch((prev) => ({ ...prev, amount: val }))
            }
            filterOptions={amountOptions}
            selectedFilters={columnFilters.amount || []}
            onFilterChange={(vals) =>
              setColumnFilters((prev) => ({ ...prev, amount: vals }))
            }
            hideFilter={false}
            align="center"
          />
        ),
        headerClassName: "text-center",
        size: 150,
        cell: (inv) => {
          const { remaining, nettedOff } = getAmounts(inv);
          const suggestion = suggestionsMap[inv.id];
          const hasMatchedAmount = suggestion && suggestion.score.amountMatch;
          return (
            <div className={`text-right ${remaining <= 0 ? "opacity-60" : ""}`}>
              <div className="font-medium text-xs text-slate-800 dark:text-slate-200">
                {hasMatchedAmount ? (
                  <mark className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic dark:bg-amber-900/60 dark:text-amber-200">
                    {money(Number(inv.totalAmount))}
                  </mark>
                ) : (
                  money(Number(inv.totalAmount))
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Đã cấn: {money(nettedOff)}
              </div>
              <div
                className={`text-[10px] mt-0.5 ${remaining < 0 ? "text-rose-600 font-medium" : "text-emerald-600"}`}
              >
                Còn lại: {money(remaining)}
              </div>
            </div>
          );
        },
      },
      {
        key: "action",
        header: (
          <TableColumnHeaderFilter
            title="Cấn trừ / Gợi ý"
            sortState="none"
            onSortChange={() => {}}
            searchValue=""
            onSearchChange={() => {}}
            filterOptions={SUGGESTION_FILTER_OPTIONS.filter(
              (o) => o.value !== "ALL",
            )}
            selectedFilters={columnFilters.action || []}
            onFilterChange={(vals) =>
              setColumnFilters((prev) => ({ ...prev, action: vals }))
            }
            hideFilter={false}
            align="center"
          />
        ),
        headerClassName: "text-center",
        size: 350,
        cell: (inv) => {
          const currentSelections = Object.entries(netOffMap[inv.id] || {});
          const suggestion = suggestionsMap[inv.id];
          const invDone = getAmounts(inv).remaining <= 0;
          const existingNetOffs = existingNetOffsMap[inv.id] || [];

          if (
            invDone &&
            currentSelections.length === 0 &&
            existingNetOffs.length === 0
          ) {
            return (
              <div className="flex items-center justify-center p-2 rounded text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Đã cấn đủ
              </div>
            );
          }

          if (currentSelections.length > 0 || existingNetOffs.length > 0) {
            return (
              <div className="flex flex-col gap-2">
                {existingNetOffs.map((netOff, idx) => {
                  const txnId = netOff.bankTransactionId;
                  if (deletedNetOffs[inv.id]?.has(txnId)) return null;

                  const updatedAmount = updatedNetOffs[inv.id]?.[txnId];
                  const originalAmount =
                    Number(netOff.netOffAmount || netOff.net_off_amount) || 0;
                  const currentAmount =
                    updatedAmount !== undefined
                      ? updatedAmount
                      : originalAmount;

                  const remaining = getAmounts(inv).remaining;
                  const maxAllowed = currentAmount + remaining;

                  return (
                    <SmartSuggestionCard
                      key={`existing-${netOff.id || idx}`}
                      txn={netOff.bankTransaction}
                      amount={currentAmount}
                      isSuggestion={false}
                      netOffProps={{
                        value: currentAmount,
                        maxValue: maxAllowed,
                        onChange: (val) => {
                          setIsDirty(true);
                          setUpdatedNetOffs((prev) => ({
                            ...prev,
                            [inv.id]: {
                              ...(prev[inv.id] || {}),
                              [txnId]: val,
                            },
                          }));
                        },
                        onRemove: () => {
                          setIsDirty(true);
                          setDeletedNetOffs((prev) => {
                            const newSet = new Set(prev[inv.id] || []);
                            newSet.add(txnId);
                            return { ...prev, [inv.id]: newSet };
                          });
                        },
                      }}
                      onViewDetail={(id) => setDetailTxnId(id)}
                    />
                  );
                })}
                {currentSelections.map(([txnId, data]) => (
                  <SmartSuggestionCard
                    key={txnId}
                    txn={data.txn}
                    amount={
                      data.txn
                        ? Number(
                            direction === "IN"
                              ? data.txn.debitAmount
                              : data.txn.creditAmount,
                          ) || 0
                        : data.amount
                    }
                    isSuggestion={false}
                    netOffProps={{
                      value: data.amount,
                      maxValue: data.maxAmount,
                      onChange: (val) => {
                        setNetOffMap((prev) => {
                          const newMap = { ...prev };
                          const invMap = { ...(newMap[inv.id] || {}) };
                          invMap[txnId] = { ...data, amount: val };
                          newMap[inv.id] = invMap;
                          return newMap;
                        });
                      },
                      onRemove: () => {
                        setNetOffMap((prev) => {
                          const newMap = { ...prev };
                          const invMap = { ...newMap[inv.id] };
                          delete invMap[txnId];
                          newMap[inv.id] = invMap;
                          return newMap;
                        });
                      },
                    }}
                    onViewDetail={(id) => setDetailTxnId(id)}
                  />
                ))}
                {!invDone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] w-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    onClick={() => setActiveInvoiceId(inv.id)}
                  >
                    Nhấn để chọn thêm giao dịch...
                  </Button>
                )}
              </div>
            );
          }

          if (suggestion) {
            const { txn, score } = suggestion;
            const txnAmt =
              Number(direction === "IN" ? txn.debitAmount : txn.creditAmount) ||
              0;
            const txnEffectiveRemaining = Math.max(
              0,
              (Number(txn.remainingAmount) || 0) -
                (pendingTxnUsage[txn.id] || 0),
            );
            const remaining = getAmounts(inv).remaining;
            const amtToApply = Math.min(remaining, txnEffectiveRemaining);

            return (
              <div className="flex flex-col gap-2">
                <SmartSuggestionCard
                  txn={txn}
                  amount={txnAmt}
                  isSuggestion={true}
                  badgeType={score.badge}
                  matchedKeywords={suggestion.matchedKeywords}
                  onAccept={() => handleQuickAccept(inv.id, txn, amtToApply)}
                  onViewDetail={(id) => setDetailTxnId(id)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] w-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer"
                  onClick={() => setActiveInvoiceId(inv.id)}
                >
                  <Search className="w-3 h-3 mr-1.5" />
                  Bỏ qua & Chọn thủ công...
                </Button>
              </div>
            );
          }

          return (
            <div
              className="flex items-center justify-center p-2 border border-dashed rounded text-xs text-slate-500 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 transition-colors"
              onClick={() => setActiveInvoiceId(inv.id)}
            >
              <Search className="w-3 h-3 mr-1.5" />
              Nhấn để chọn giao dịch...
            </div>
          );
        },
      },
    ],
    [direction, suggestionsMap, netOffMap, getAmounts, pendingTxnUsage],
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<any>[] = [];

      for (const [invId, txnIds] of Object.entries(deletedNetOffs)) {
        for (const txnId of txnIds) {
          promises.push(erpInvoicesCoreApi.removeVoucherLink(invId, txnId));
        }
      }

      const allUpserts: Record<
        string,
        { bankTransactionId: string; netOffAmount: number }[]
      > = {};

      for (const [invId, txns] of Object.entries(netOffMap)) {
        if (!allUpserts[invId]) allUpserts[invId] = [];
        for (const [txnId, data] of Object.entries(txns)) {
          allUpserts[invId].push({
            bankTransactionId: txnId,
            netOffAmount: data.amount,
          });
        }
      }

      for (const [invId, txns] of Object.entries(updatedNetOffs)) {
        if (!allUpserts[invId]) allUpserts[invId] = [];
        for (const [txnId, amount] of Object.entries(txns)) {
          if (!deletedNetOffs[invId]?.has(txnId)) {
            allUpserts[invId].push({
              bankTransactionId: txnId,
              netOffAmount: amount,
            });
          }
        }
      }

      for (const [invId, payload] of Object.entries(allUpserts)) {
        if (payload.length > 0) {
          promises.push(erpInvoicesCoreApi.linkVouchers(invId, payload));
        }
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Cấn trừ thành công!");
      setIsDirty(false);
      onSuccess();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || err.message || "Có lỗi khi cấn trừ",
      );
    },
  });

  const validateNetOffMap = (): string | null => {
    for (const [invId, txns] of Object.entries(netOffMap)) {
      const invoice = selectedInvoices.find((i) => i.id === invId);
      if (!invoice) continue;

      const invoiceTotal = Number(invoice.totalAmount) || 0;
      const existing = existingNetOffsMap[invId];
      let alreadyNetOff: number;
      if (existing) {
        alreadyNetOff = existing.reduce(
          (sum, v) => sum + (Number(v.netOffAmount || v.net_off_amount) || 0),
          0,
        );
      } else {
        alreadyNetOff = Number((invoice as any).netOffAmount) || 0;
      }

      const invoiceRemaining = invoiceTotal - alreadyNetOff;
      const sessionTotal = Object.values(txns).reduce(
        (sum, data) => sum + (data.amount || 0),
        0,
      );

      if (sessionTotal > invoiceRemaining) {
        return `Hóa đơn ${invoice.invoiceNo || invId}: tổng cấn trừ (${money(sessionTotal)}) vượt quá giá trị còn lại (${money(invoiceRemaining)}).`;
      }
    }

    return null;
  };

  const actions: DrawerAction[] = [
    {
      label: "Xác nhận cấn trừ",
      primary: true,
      onClick: () => {
        const errorMsg = validateNetOffMap();
        if (errorMsg) {
          toast.error(errorMsg);
          return;
        }
        submitMutation.mutate();
      },
      loading: submitMutation.isPending,
      disabled:
        Object.keys(netOffMap).length === 0 &&
        Object.keys(deletedNetOffs).length === 0 &&
        Object.keys(updatedNetOffs).length === 0,
    },
  ];

  const totalInvoices = selectedInvoices.length;
  let totalNetOffAmt = 0;
  let fullyNettedOff = 0;
  let invoicesWithSelection = 0;

  for (const inv of selectedInvoices) {
    const selections = netOffMap[inv.id] || {};
    let invNetOffAmt = 0;
    for (const data of Object.values(selections)) {
      invNetOffAmt += data.amount || 0;
    }
    totalNetOffAmt += invNetOffAmt;
    if (invNetOffAmt > 0) invoicesWithSelection++;
    if (getAmounts(inv).remaining <= 0) fullyNettedOff++;
  }

  const activeInvoice = selectedInvoices.find((i) => i.id === activeInvoiceId);

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="create"
        collapsibleRightPanel={true}
        title="Chỉnh sửa hàng loạt hóa đơn"
        subtitle={`${selectedInvoices.length} hóa đơn được chọn`}
        layout="2-columns"
        size="xl"
        actions={actions}
        confirmOnClose={isDirty}
        rightPanelTitle="ĐỐI SOÁT THÔNG MINH"
        rightPanelDefaultCollapsed={false}
        rightPanel={
          <div className="space-y-6">
            <div>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-semibold text-indigo-900 dark:text-indigo-200">
                      Gợi ý Database Engine
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                      Truy vấn trực tiếp số tiền, số HĐ và tên đối tác trên toàn
                      bộ lịch sử sao kê (không giới hạn thời gian).
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Trạng thái gợi ý
                  </span>
                  {isLoadingSuggestions ? (
                    <span className="text-[10px] flex items-center text-blue-600 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Đang phân tích...
                    </span>
                  ) : (
                    <span className="text-[10px] flex items-center text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Đã hoàn tất ({Object.keys(suggestionsMap).length} gợi ý)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4">
                TÓM TẮT CẤN TRỪ
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Hóa đơn đã chọn:
                  </span>
                  <span className="font-medium">
                    {invoicesWithSelection} / {totalInvoices}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600 dark:text-slate-400">
                    Đã đủ tiền:
                  </span>
                  <span className="font-medium text-emerald-600">
                    {fullyNettedOff} HĐ
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                  <span className="text-slate-800 dark:text-slate-200">
                    Tổng tiền cấn trừ:
                  </span>
                  <span className="text-primary text-base">
                    {money(totalNetOffAmt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 text-xs text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Sau khi cấn trừ, bút toán nhật ký của giao dịch sao kê sẽ được
                  tự động cập nhật và phân tách theo HĐ.
                </span>
              </div>
            </div>
          </div>
        }
        leftPanel={
          <div className="h-[calc(100vh-180px)] flex flex-col pr-1 space-y-4 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                Chi tiết theo từng hóa đơn ({invoicesWithSelection}/
                {totalInvoices})
              </label>
            </div>
            <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 flex flex-col overflow-hidden">
              <DataTable<ErpInvoice>
                variant="spreadsheet"
                items={displayedInvoices}
                columns={columns}
                getRowKey={(r) => r.id}
                emptyLabel="Không có hóa đơn nào"
                enableColumnResizing={true}
              />
            </div>
          </div>
        }
      />
      <BankTransactionDetailDrawer
        transactionId={detailTxnId!}
        isOpen={!!detailTxnId}
        onClose={() => setDetailTxnId(null)}
      />

      {/* Modal for Selecting Bank Transactions */}
      {activeInvoiceId && (
        <VoucherNetoffSelectionModal
          open={!!activeInvoiceId}
          onClose={() => setActiveInvoiceId(null)}
          invoice={activeInvoice}
          existingVoucherIds={Object.keys(netOffMap[activeInvoiceId] || {})}
          onSelect={(selectedVouchers) => {
            setIsDirty(true);
            setNetOffMap((prev) => {
              const newMap = { ...prev };
              const invMap: Record<
                string,
                { amount: number; maxAmount?: number; txn?: any }
              > = {};
              selectedVouchers.forEach((v) => {
                const oldData = (prev[activeInvoiceId] || {})[v.id];
                invMap[v.id] = {
                  amount: v.amount,
                  maxAmount: v.maxAmount ?? oldData?.maxAmount,
                  txn: v.txn ?? oldData?.txn,
                };
              });
              if (Object.keys(invMap).length === 0) {
                delete newMap[activeInvoiceId];
              } else {
                newMap[activeInvoiceId] = invMap;
              }
              return newMap;
            });
            setActiveInvoiceId(null);
          }}
        />
      )}
    </>
  );
}
