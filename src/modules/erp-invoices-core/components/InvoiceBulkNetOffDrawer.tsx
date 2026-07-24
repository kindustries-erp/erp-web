import React, { useMemo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { type DrawerAction } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
import { SearchInput } from "@/shared/components/SearchInput";
import { Button } from "@/shared/components/ui/Button";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Search,
  Check,
  X,
} from "lucide-react";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import toast from "react-hot-toast";
import { erpInvoicesCoreApi, type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { VoucherNetoffSelectionModal } from "@/modules/erp-invoices-core/components/VoucherNetoffSelectionModal";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedInvoiceIds: string[];
  invoices: ErpInvoice[];
  direction?: "IN" | "OUT";
  onSuccess: () => void;
}

// ---------------------------------------------------------------------------
// TYPES & CONSTANTS
// ---------------------------------------------------------------------------

interface BankTxn {
  id: string;
  transDate: string;
  description: string;
  debitAmount: string | number;
  creditAmount: string | number;
  remainingAmount?: string | number;
  correspondentName?: string;
  sourceType?: string;
  bankAccount?: any;
}

interface MatchResult {
  score: number;
  amountMatch: boolean;
  textMatch: boolean;
  badge: "STRONG" | "AMOUNT_ONLY" | "WARNING" | "NONE";
}

const PAGE_SIZE = 100;
const MAX_RECORDS = 500;

// ---------------------------------------------------------------------------
// SCORING LOGIC
// ---------------------------------------------------------------------------

function scoreTransaction(
  txn: BankTxn,
  invoice: ErpInvoice,
  direction: "IN" | "OUT",
): MatchResult {
  let score = 0;

  // 1. KIỂM TRA SỐ TIỀN
  const targetAmt = parseFloat(invoice.totalAmount as any) || 0;
  const txnAmt =
    direction === "IN"
      ? parseFloat(txn.debitAmount as any) || 0
      : parseFloat(txn.creditAmount as any) || 0;

  const amtDiff = targetAmt > 0 ? Math.abs(txnAmt - targetAmt) / targetAmt : 1;

  let amountMatch = false;
  if (amtDiff < 0.001) {
    score += 10;
    amountMatch = true;
  } else if (amtDiff < 0.05) {
    score += 5;
    amountMatch = true;
  } else if (amtDiff < 0.2) {
    score += 2;
  }

  // 2. KIỂM TRA TEXT
  const desc = (txn.description || "").toLowerCase();
  let textScore = 0;

  const partnerName =
    direction === "IN" ? invoice.sellerName : invoice.buyerName;
  if (partnerName && partnerName.length > 2) {
    const keywords = partnerName
      .toLowerCase()
      .replace(/công ty|tnhh|cổ phần|mtv|cp\b/gi, "")
      .trim()
      .split(/\s+/)
      .filter((w: string) => w.length > 2);
    if (keywords.some((kw: string) => desc.includes(kw))) textScore += 5;
  }

  if (invoice.invoiceNo && desc.includes(invoice.invoiceNo.toLowerCase())) {
    textScore += 8;
  }

  const txnMonth = txn.transDate?.substring(0, 7);
  const invMonth = invoice.invoiceDate?.substring(0, 7);
  if (txnMonth && txnMonth === invMonth) score += 2;

  score += textScore;
  const textMatch = textScore >= 5;

  // 3. XÁC ĐỊNH BADGE
  let badge: MatchResult["badge"] = "NONE";
  if (amountMatch && textMatch) badge = "STRONG";
  else if (amountMatch) badge = "AMOUNT_ONLY";
  else if (textMatch) badge = "WARNING";

  return { score, amountMatch, textMatch, badge };
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

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
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const displayedInvoices = useMemo(() => {
    if (!invoiceSearch.trim()) return selectedInvoices;
    const lower = invoiceSearch.toLowerCase();
    return selectedInvoices.filter(
      (inv) =>
        inv.invoiceNo?.toLowerCase().includes(lower) ||
        inv.buyerName?.toLowerCase().includes(lower) ||
        inv.sellerName?.toLowerCase().includes(lower),
    );
  }, [selectedInvoices, invoiceSearch]);

  // Cấu hình kỳ
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Paginated Smart Load state
  const [allTxns, setAllTxns] = useState<BankTxn[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedCap, setReachedCap] = useState(false);

  // { invoiceId: { txnId: amount } }
  const [netOffMap, setNetOffMap] = useState<
    Record<
      string,
      Record<string, { amount: number; maxAmount?: number; txn?: any }>
    >
  >({});
  const [isDirty, setIsDirty] = useState(false);

  // State for BankTransactionDetailDrawer
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);

  // State for VoucherNetoffSelectionModal
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);

  // Auto-compute union window
  useEffect(() => {
    if (!open || !selectedInvoices.length) return;
    const dates = selectedInvoices
      .map((i) => i.invoiceDate?.substring(0, 10))
      .filter(Boolean)
      .sort();
    if (dates.length > 0) {
      const minDate = new Date(dates[0]);
      const maxDate = new Date(dates[dates.length - 1]);
      minDate.setMonth(minDate.getMonth() - 2);
      minDate.setDate(1);
      maxDate.setMonth(maxDate.getMonth() + 4);
      maxDate.setDate(0);
      setDateFrom(minDate.toISOString().slice(0, 10));
      setDateTo(maxDate.toISOString().slice(0, 10));
    }
  }, [open, selectedInvoiceIds]); // Notice we don't depend on selectedInvoices to avoid loop

  // Reset when drawer opens/closes or dates change
  useEffect(() => {
    if (!open) {
      setAllTxns([]);
      setNetOffMap({});
      setActiveInvoiceId(null);
      setIsDirty(false);
      return;
    }
  }, [open]);

  const fetchPage = async (pageToFetch: number) => {
    try {
      setLoadingMore(true);
      const res = await bankStatementApi.getTransactions({
        page: pageToFetch,
        pageSize: PAGE_SIZE,
        startDate: dateFrom,
        endDate: dateTo,
        sortBy: "transDate",
        sortOrder: "DESC", // Lấy giao dịch mới nhất trước
      });

      const newTxns = res.items || [];
      setAllTxns((prev) =>
        pageToFetch === 1 ? newTxns : [...prev, ...newTxns],
      );

      if (
        newTxns.length < PAGE_SIZE ||
        pageToFetch * PAGE_SIZE >= MAX_RECORDS
      ) {
        if (pageToFetch * PAGE_SIZE >= MAX_RECORDS) {
          setReachedCap(true);
        }
        setLoadingMore(false);
        return;
      }

      // Check if we have enough STRONG matches
      const combined = pageToFetch === 1 ? newTxns : [...allTxns, ...newTxns];
      let needsMore = false;
      for (const inv of selectedInvoices) {
        let strongCount = 0;
        for (const t of combined) {
          const res = scoreTransaction(t, inv, direction);
          if (res.badge === "STRONG") strongCount++;
        }
        if (strongCount < 1) {
          // Giảm xuống 1 để quét nhanh hơn, vì UI chỉ hiện 1 gợi ý
          needsMore = true;
          break;
        }
      }

      if (needsMore) {
        fetchPage(pageToFetch + 1);
      } else {
        setLoadingMore(false);
      }
    } catch (e) {
      console.error("Error fetching transactions", e);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (open && dateFrom && dateTo) {
      setAllTxns([]);
      setReachedCap(false);
      fetchPage(1);
    }
  }, [open, dateFrom, dateTo]);

  const getRemainingAmount = (inv: ErpInvoice) => {
    const total = Number(inv.totalAmount) || 0;
    const currentNetOff = (inv.voucherNetOffs || []).reduce(
      (sum, v) => sum + (Number(v.netOffAmount) || 0),
      0,
    );
    const pendingNetOff = Object.values(netOffMap[inv.id] || {}).reduce(
      (sum, val) => sum + (val.amount || 0),
      0,
    );
    return Math.max(0, total - currentNetOff - pendingNetOff);
  };

  // Find best suggestion for each invoice
  const suggestionsMap = useMemo(() => {
    const map: Record<string, { txn: BankTxn; score: MatchResult }> = {};
    for (const inv of selectedInvoices) {
      let bestTxn: BankTxn | null = null;
      let bestScore: MatchResult | null = null;
      for (const txn of allTxns) {
        const score = scoreTransaction(txn, inv, direction);
        if (score.badge !== "NONE") {
          if (!bestScore || score.score > bestScore.score) {
            bestTxn = txn;
            bestScore = score;
          }
        }
      }
      if (bestTxn && bestScore) {
        map[inv.id] = { txn: bestTxn, score: bestScore };
      }
    }
    return map;
  }, [allTxns, selectedInvoices, direction]);

  const handleQuickAccept = (invId: string, txn: BankTxn, amt: number) => {
    setIsDirty(true);
    setNetOffMap((prev) => {
      const invMap = { ...(prev[invId] || {}) };
      const credit = parseFloat(txn.creditAmount as any) || 0;
      const debit = parseFloat(txn.debitAmount as any) || 0;
      const baseAmt = credit > 0 ? credit : debit;
      const remaining = txn.remainingAmount
        ? parseFloat(txn.remainingAmount as any)
        : baseAmt;
      invMap[txn.id] = { amount: amt, maxAmount: remaining, txn };
      return { ...prev, [invId]: invMap };
    });
  };

  const columns = useMemo<DataTableColumn<ErpInvoice>[]>(
    () => [
      {
        key: "invoiceNo",
        header: "Thông tin HĐ",
        size: 150,
        cell: (inv) => (
          <div>
            <div className="font-medium text-xs text-slate-800">
              {inv.invoiceNo}
            </div>
            <div className="text-[10px] text-slate-500">
              {inv.serialNo || "---"}
            </div>
            <div className="text-[10px] text-slate-500">
              {inv.invoiceDate?.substring(0, 10)}
            </div>
          </div>
        ),
      },
      {
        key: "partner",
        header: "Đối tác",
        size: 200,
        cell: (inv) => {
          const text = direction === "IN" ? inv.sellerName : inv.buyerName;
          const taxCode =
            direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode;
          return (
            <div>
              <div
                className="text-xs text-slate-700 whitespace-normal line-clamp-2"
                title={text || ""}
              >
                {text || "---"}
              </div>
              {taxCode && (
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  MST: {taxCode}
                </div>
              )}
            </div>
          );
        },
      },
      {
        key: "amount",
        header: "Giá trị",
        size: 150,
        cell: (inv) => {
          const remaining = getRemainingAmount(inv);
          const nettedOff = Number(inv.totalAmount) - remaining;
          return (
            <div className="text-right">
              <div className="font-medium text-xs text-slate-800">
                {money(Number(inv.totalAmount))}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Đã cấn: {money(nettedOff)}
              </div>
              <div className="text-[10px] text-emerald-600 mt-0.5">
                Còn lại: {money(remaining)}
              </div>
            </div>
          );
        },
      },
      {
        key: "suggestion",
        header: "Gợi ý thông minh",
        size: 250,
        cell: (inv) => {
          const suggestion = suggestionsMap[inv.id];
          const hasSelection = Object.keys(netOffMap[inv.id] || {}).length > 0;
          if (hasSelection) {
            return (
              <div className="text-xs text-slate-500 italic">
                Đã chọn giao dịch
              </div>
            );
          }
          if (!suggestion) {
            return <div className="text-xs text-slate-400">Đang quét...</div>;
          }

          const { txn, score } = suggestion;
          let badgeClasses = "";
          let glowClasses = "";
          let dotClasses = "";
          let label = "";
          if (score.badge === "STRONG") {
            badgeClasses = "text-emerald-700 bg-emerald-50 border-emerald-200";
            glowClasses = "bg-emerald-400";
            dotClasses = "bg-emerald-500";
            label = "Phù hợp";
          } else if (score.badge === "AMOUNT_ONLY") {
            badgeClasses = "text-blue-700 bg-blue-50 border-blue-200";
            glowClasses = "bg-blue-400";
            dotClasses = "bg-blue-500";
            label = "Khớp tiền";
          } else if (score.badge === "WARNING") {
            badgeClasses = "text-amber-700 bg-amber-50 border-amber-200";
            glowClasses = "bg-amber-400";
            dotClasses = "bg-amber-500";
            label = "Xem xét";
          }

          const txnAmt =
            Number(direction === "IN" ? txn.debitAmount : txn.creditAmount) ||
            0;
          const remaining = getRemainingAmount(inv);
          const amtToApply = Math.min(remaining, txnAmt);

          return (
            <TransactionCard
              txn={txn}
              amount={txnAmt}
              isSuggestion={true}
              suggestionProps={{
                badgeLabel: label,
                badgeClasses: badgeClasses,
                glowClasses: glowClasses,
                dotClasses: dotClasses,
                onAccept: () => handleQuickAccept(inv.id, txn, amtToApply),
              }}
              onViewDetail={(id) => setDetailTxnId(id)}
            />
          );
        },
      },
      {
        key: "action",
        header: "Giao dịch cấn trừ",
        size: 250,
        cell: (inv) => {
          const currentSelections = Object.entries(netOffMap[inv.id] || {});
          return (
            <div className="flex flex-col gap-2">
              {currentSelections.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {currentSelections.map(([txnId, data]) => (
                    <TransactionCard
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
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] w-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setActiveInvoiceId(inv.id)}
                  >
                    Nhấn để chọn thêm giao dịch...
                  </Button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-center p-2 border border-dashed rounded text-xs text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  onClick={() => setActiveInvoiceId(inv.id)}
                >
                  <Search className="w-3 h-3 mr-1.5" />
                  Nhấn để chọn giao dịch...
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [direction, suggestionsMap, netOffMap, getRemainingAmount],
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const promises = Object.entries(netOffMap).map(([invId, txns]) => {
        const payload = Object.entries(txns).map(
          ([bankTransactionId, data]) => ({
            bankTransactionId,
            netOffAmount: data.amount,
          }),
        );
        if (payload.length > 0) {
          return erpInvoicesCoreApi.linkVouchers(invId, payload);
        }
        return Promise.resolve();
      });
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

  const actions: DrawerAction[] = [
    {
      label: "Xác nhận cấn trừ",
      primary: true,
      onClick: () => submitMutation.mutate(),
      loading: submitMutation.isPending,
      disabled: Object.keys(netOffMap).length === 0,
    },
  ];

  // Calculate Summary
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
    if (getRemainingAmount(inv) <= 0) fullyNettedOff++;
  }

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="create"
        title="Chỉnh sửa hàng loạt hóa đơn" // Matching the requested UI title pattern
        subtitle={`${selectedInvoices.length} hóa đơn được chọn`}
        layout="2-columns"
        size="xl"
        actions={actions}
        confirmOnClose={isDirty}
        rightPanelTitle="CẤU HÌNH QUÉT SAO KÊ"
        rightPanelDefaultCollapsed={false}
        rightPanel={
          <div className="space-y-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Từ ngày
                  </label>
                  <DatePicker
                    value={dateFrom}
                    onChange={(val) => setDateFrom(val || "")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Đến ngày
                  </label>
                  <DatePicker
                    value={dateTo}
                    onChange={(val) => setDateTo(val || "")}
                  />
                </div>
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Trạng thái quét
                  </span>
                  {loadingMore ? (
                    <span className="text-[10px] flex items-center text-blue-600 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Đang quét...
                    </span>
                  ) : reachedCap ? (
                    <span
                      className="text-[10px] flex items-center text-amber-600 font-medium"
                      title="Đã giới hạn ở 500 giao dịch để đảm bảo hiệu suất"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Dừng ở 500 dòng
                    </span>
                  ) : (
                    <span className="text-[10px] flex items-center text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Đã hoàn tất
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                TÓM TẮT CẤN TRỪ
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Hóa đơn đã chọn:</span>
                  <span className="font-medium">
                    {invoicesWithSelection} / {totalInvoices}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Đã đủ tiền:</span>
                  <span className="font-medium text-emerald-600">
                    {fullyNettedOff} HĐ
                  </span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center font-bold">
                  <span className="text-slate-800">Tổng tiền cấn trừ:</span>
                  <span className="text-primary text-base">
                    {money(totalNetOffAmt)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-4 text-xs text-blue-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
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
          <div className="h-full flex flex-col pr-1 space-y-4 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <label className="text-xs font-semibold text-slate-700 shrink-0">
                Chi tiết theo từng hóa đơn ({invoicesWithSelection}/
                {totalInvoices})
              </label>
              <div className="w-full md:w-64 shrink-0">
                <SearchInput
                  value={invoiceSearch}
                  onChange={setInvoiceSearch}
                  placeholder="Tìm kiếm hóa đơn..."
                  className="w-full"
                  inputClassName="h-8 text-xs bg-white"
                />
              </div>
            </div>
            <div className="flex-1 min-h-0 bg-white flex flex-col">
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

      {/* Standard Modal for Bank Transactions */}
      {activeInvoiceId && (
        <VoucherNetoffSelectionModal
          open={!!activeInvoiceId}
          onClose={() => setActiveInvoiceId(null)}
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

// ---------------------------------------------------------------------------
// TRANSACTION CARD COMPONENT
// ---------------------------------------------------------------------------

const TransactionCard = ({
  txn,
  amount,
  isSuggestion,
  suggestionProps,
  netOffProps,
  onViewDetail,
}: {
  txn?: BankTxn & { referenceNumber?: string; seqNo?: string };
  amount: number;
  isSuggestion?: boolean;
  suggestionProps?: {
    badgeLabel: string;
    badgeClasses: string;
    glowClasses?: string;
    dotClasses?: string;
    onAccept: () => void;
  };
  netOffProps?: {
    value: number;
    maxValue?: number;
    onChange: (val: number) => void;
    onRemove: () => void;
  };
  onViewDetail: (id: string) => void;
}) => {
  const [localVal, setLocalVal] = useState<string>(
    netOffProps
      ? netOffProps.value === 0
        ? ""
        : String(netOffProps.value)
      : "",
  );

  useEffect(() => {
    if (netOffProps) {
      setLocalVal(netOffProps.value === 0 ? "" : String(netOffProps.value));
    }
  }, [netOffProps?.value]);

  const handleBlur = () => {
    if (!netOffProps) return;
    const val = parseFloat(localVal) || 0;
    const safeVal = netOffProps.maxValue
      ? Math.min(val, netOffProps.maxValue)
      : val;
    setLocalVal(safeVal === 0 ? "" : String(safeVal));
    netOffProps.onChange(safeVal);
  };

  const refText =
    txn?.referenceNumber || txn?.seqNo || txn?.id.split("-")[0] || "---";

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm relative group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 font-medium">
            {txn?.transDate ? formatGMT7(txn.transDate, "date") : ""}
          </span>
          <span
            className="text-[10px] font-mono font-semibold text-slate-800 cursor-pointer hover:opacity-75"
            onClick={() => txn && onViewDetail(txn.id)}
            title="Nhấn để xem chi tiết sao kê"
          >
            {refText}
          </span>
        </div>

        <div className="flex items-start gap-1.5">
          <div className="text-right flex flex-col items-end">
            <div className="font-medium text-xs text-slate-800">
              {money(amount)}
            </div>
            {isSuggestion && suggestionProps && (
              <div
                className={`mt-0.5 flex items-center px-1.5 py-0.5 rounded text-[9px] border ${suggestionProps.badgeClasses}`}
              >
                <span className="relative flex h-1.5 w-1.5 mr-1">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${suggestionProps.glowClasses}`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-1.5 w-1.5 ${suggestionProps.dotClasses}`}
                  ></span>
                </span>
                {suggestionProps.badgeLabel}
              </div>
            )}
          </div>
          {!isSuggestion && netOffProps && (
            <button
              className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50"
              onClick={netOffProps.onRemove}
              title="Xóa giao dịch này"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <Tooltip content={txn?.description || ""}>
        <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 cursor-help">
          {txn?.description || "—"}
        </div>
      </Tooltip>

      {isSuggestion && suggestionProps && (
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-[10px] w-full mt-1.5 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
          onClick={suggestionProps.onAccept}
        >
          <Check className="w-3 h-3 mr-1" />
          Nhận gợi ý
        </Button>
      )}

      {!isSuggestion && netOffProps && (
        <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">
            Cấn trừ:
          </span>
          <input
            type="number"
            className="form-input text-right text-xs h-6 px-1.5 w-full bg-slate-50 border-slate-200 focus:bg-white"
            value={localVal}
            min={0}
            max={netOffProps.maxValue || undefined}
            onChange={(e) => setLocalVal(e.target.value)}
            onBlur={handleBlur}
            title={
              netOffProps.maxValue
                ? `Tối đa: ${money(netOffProps.maxValue)}`
                : undefined
            }
          />
        </div>
      )}
    </div>
  );
};
