import React, { useMemo, useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { type DrawerAction } from "@/shared/components/DrawerModal";
import { DatePicker } from "@/shared/components/DatePicker";
import { DataTable, type DataTableColumn } from "@/shared/components/DataTable";
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
import { type ComboboxOption } from "@/shared/components/Combobox";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";

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
  invoiceNoMatch: boolean;
  correspondentMatch: boolean;
  badge:
    | "PERFECT"
    | "HIGH"
    | "LIKELY"
    | "POSSIBLE"
    | "NOTICE_STRONG"
    | "NOTICE"
    | "NONE";
}

const PAGE_SIZE = 200;
const MAX_RECORDS = 1000;

// ---------------------------------------------------------------------------
// SCORING LOGIC
// ---------------------------------------------------------------------------

// Helper: tách keyword từ tên công ty, bỏ các từ generic
function extractKeywords(name: string | undefined | null): string[] {
  if (!name || name.length <= 2) return [];
  return name
    .toLowerCase()
    .replace(/công ty|tnhh|cổ phần|\bmtv\b|\bcp\b|chi nhánh/gi, "")
    .trim()
    .split(/\s+/)
    .filter((w: string) => w.length > 2);
}

function scoreTransaction(
  txn: BankTxn,
  invoice: ErpInvoice,
  direction: "IN" | "OUT",
): MatchResult {
  // 1. SỐ TIỀN — chỉ exact match (< 0.1% sai lệch)
  const targetAmt = parseFloat(invoice.totalAmount as any) || 0;
  const txnAmt =
    direction === "IN"
      ? parseFloat(txn.debitAmount as any) || 0
      : parseFloat(txn.creditAmount as any) || 0;
  const amtDiff = targetAmt > 0 ? Math.abs(txnAmt - targetAmt) / targetAmt : 1;
  const amountMatch = amtDiff < 0.001;

  let score = amountMatch ? 10 : 0;

  // 2. SỐ HĐ trong diễn giải (txn.description)
  const desc = (txn.description || "").toLowerCase();
  const invoiceNoMatch = !!(
    invoice.invoiceNo && desc.includes(invoice.invoiceNo.toLowerCase())
  );
  if (invoiceNoMatch) score += 8;

  // 3. TÊN ĐỐI ỨNG (txn.correspondentName) so với đối tác HĐ
  //    - HĐ đầu vào (IN)  → Bên bán (sellerName)  ↔ Tên đối ứng
  //    - HĐ đầu ra  (OUT) → Bên mua (buyerName)   ↔ Tên đối ứng
  const partnerName =
    direction === "IN" ? invoice.sellerName : invoice.buyerName;
  const corrName = (txn.correspondentName || "").toLowerCase();
  const keywords = extractKeywords(partnerName);
  const correspondentMatch =
    corrName.length > 0 &&
    keywords.length > 0 &&
    keywords.some((kw) => corrName.includes(kw));
  if (correspondentMatch) score += 5;

  // 4. BONUS: cùng tháng
  if (txn.transDate?.substring(0, 7) === invoice.invoiceDate?.substring(0, 7))
    score += 2;

  // 5. XÁC ĐỊNH BADGE
  let badge: MatchResult["badge"];
  if (amountMatch) {
    // Nhóm 1 — Có khớp tiền: hiện gợi ý + nút Nhận
    if (invoiceNoMatch && correspondentMatch) badge = "PERFECT";
    else if (invoiceNoMatch) badge = "HIGH";
    else if (correspondentMatch) badge = "LIKELY";
    else badge = "POSSIBLE";
  } else {
    // Nhóm 2 — Không khớp tiền nhưng có tín hiệu text: chỉ hiện badge cảnh báo, không có nút Nhận
    if (invoiceNoMatch && correspondentMatch) badge = "NOTICE_STRONG";
    else if (invoiceNoMatch) badge = "NOTICE";
    else badge = "NONE";
  }

  return { score, amountMatch, invoiceNoMatch, correspondentMatch, badge };
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

  // Reset when drawer opens/closes or dates change
  useEffect(() => {
    if (!open) {
      setAllTxns([]);
      setNetOffMap({});
      setExistingNetOffsMap({});
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
        transactionType: direction === "IN" ? "OUT" : "IN", // Đầu vào -> quét tiền chi; Đầu ra -> quét tiền thu
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

      // Dừng sớm khi mọi invoice đã có ít nhất 1 PERFECT hoặc HIGH match (nhóm có khớp tiền)
      // NOTICE_STRONG / NOTICE không kích hoạt fetch thêm — chỉ xuất hiện tình cờ trong pool đã load
      const combined = pageToFetch === 1 ? newTxns : [...allTxns, ...newTxns];
      let needsMore = false;
      for (const inv of selectedInvoices) {
        const hasGoodMatch = combined.some((t: BankTxn) => {
          const r = scoreTransaction(t, inv, direction);
          return r.badge === "PERFECT" || r.badge === "HIGH";
        });
        if (!hasGoodMatch) {
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

  const getAmounts = (inv: ErpInvoice) => {
    const total = Number(inv.totalAmount) || 0;

    // Ưu tiên dùng existingNetOffsMap nếu đã tải xong, fallback về inv.netOffAmount
    const existing = existingNetOffsMap[inv.id];
    let currentNetOff: number;
    if (existing) {
      currentNetOff = existing.reduce((sum, v) => {
        const txnId = v.bankTransactionId;
        if (deletedNetOffs[inv.id]?.has(txnId)) return sum; // Ignore deleted
        const updatedAmount = updatedNetOffs[inv.id]?.[txnId];
        if (updatedAmount !== undefined) return sum + updatedAmount; // Use updated amount
        return sum + (Number(v.netOffAmount || v.net_off_amount) || 0); // Use original
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

  const getTxnEffectiveRemaining = (txn: BankTxn): number => {
    const baseAmt = Math.max(
      parseFloat(txn.creditAmount as any) || 0,
      parseFloat(txn.debitAmount as any) || 0,
    );
    const dbNetOff = parseFloat((txn as any).netOffAmount) || 0;
    const pendingUsed = pendingTxnUsage[txn.id] || 0;
    return Math.max(0, baseAmt - dbNetOff - pendingUsed);
  };

  // Thứ tự ưu tiên badge: PERFECT > HIGH > LIKELY > POSSIBLE > NOTICE_STRONG > NOTICE
  const BADGE_PRIORITY: Record<MatchResult["badge"], number> = {
    PERFECT: 6,
    HIGH: 5,
    LIKELY: 4,
    POSSIBLE: 3,
    NOTICE_STRONG: 2,
    NOTICE: 1,
    NONE: 0,
  };

  // Find best suggestion for each invoice
  const suggestionsMap = useMemo(() => {
    const map: Record<string, { txn: BankTxn; score: MatchResult }> = {};
    for (const inv of selectedInvoices) {
      const amounts = getAmounts(inv);
      if (amounts.remaining <= 0) continue; // HĐ đã cấn đủ

      let bestTxn: BankTxn | null = null;
      let bestScore: MatchResult | null = null;
      for (const txn of allTxns) {
        const txnRemaining = getTxnEffectiveRemaining(txn);
        if (txnRemaining <= 0) continue; // txn hết tiền (DB + pending)

        const score = scoreTransaction(txn, inv, direction);
        if (score.badge === "NONE") continue;
        if (
          !bestScore ||
          BADGE_PRIORITY[score.badge] > BADGE_PRIORITY[bestScore.badge] ||
          (BADGE_PRIORITY[score.badge] === BADGE_PRIORITY[bestScore.badge] &&
            score.score > bestScore.score)
        ) {
          bestTxn = txn;
          bestScore = score;
        }
      }
      if (bestTxn && bestScore) {
        map[inv.id] = { txn: bestTxn, score: bestScore };
      }
    }
    return map;
  }, [allTxns, selectedInvoices, direction, pendingTxnUsage]);

  const displayedInvoices = useMemo(() => {
    let filtered = selectedInvoices;

    // 3. Column Search
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

    // 4. Column Sort
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

    // 5. Column Checkbox Filters
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
          if (val === "HAS_SUGGESTION") return badge && badge !== "NONE";
          if (val === "PERFECT_HIGH")
            return badge === "PERFECT" || badge === "HIGH";
          if (val === "NOTICE")
            return badge === "NOTICE_STRONG" || badge === "NOTICE";
          if (val === "NO_SUGGESTION") return !badge || badge === "NONE";
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

  const handleQuickAccept = (invId: string, txn: BankTxn, amt: number) => {
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
              <div className="font-medium text-xs text-slate-800">
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
          const matchTokens =
            suggestion && suggestion.txn.description
              ? suggestion.txn.description.match(/[a-zA-Z0-9_]{4,}/g) || []
              : [];
          return (
            <div className={getAmounts(inv).remaining <= 0 ? "opacity-60" : ""}>
              <div
                className="text-xs text-slate-700 whitespace-normal break-words"
                title={text || ""}
              >
                {hasMatchedPartner && text
                  ? highlightText(text, extractKeywords(text))
                  : text || "---"}
              </div>
              {taxCode && (
                <div className="text-[10px] text-slate-500 font-mono mt-1">
                  MST: {taxCode}
                </div>
              )}
              {inv.description && (
                <div className="text-[10px] text-slate-400 italic mt-0.5 whitespace-normal break-words">
                  {matchTokens.length > 0
                    ? highlightText(inv.description, matchTokens)
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
              <div className="font-medium text-xs text-slate-800">
                {hasMatchedAmount ? (
                  <mark className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic">
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

          // HĐ đã cấn đủ và không có thay đổi trong session này
          if (
            invDone &&
            currentSelections.length === 0 &&
            existingNetOffs.length === 0
          ) {
            return (
              <div className="flex items-center justify-center p-2 rounded text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Đã cấn đủ
              </div>
            );
          }

          // Đã có selections hoặc existing net-offs
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

                  // Calculate max value for this existing net off
                  const remaining = getAmounts(inv).remaining;
                  const maxAllowed = currentAmount + remaining;

                  return (
                    <TransactionCard
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
                {!invDone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] w-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                    onClick={() => setActiveInvoiceId(inv.id)}
                  >
                    Nhấn để chọn thêm giao dịch...
                  </Button>
                )}
              </div>
            );
          }

          // Có gợi ý
          if (suggestion) {
            const { txn, score } = suggestion;

            const BADGE_CONFIG: Record<
              Exclude<MatchResult["badge"], "NONE">,
              {
                label: string;
                badgeClasses: string;
                glowClasses: string;
                dotClasses: string;
              }
            > = {
              PERFECT: {
                label: "Tiền + Số HĐ + Đối ứng",
                badgeClasses:
                  "text-emerald-800 bg-emerald-100 border-emerald-300",
                glowClasses: "bg-emerald-500",
                dotClasses: "bg-emerald-600",
              },
              HIGH: {
                label: "Tiền + Số HĐ",
                badgeClasses:
                  "text-emerald-700 bg-emerald-50 border-emerald-200",
                glowClasses: "bg-emerald-400",
                dotClasses: "bg-emerald-500",
              },
              LIKELY: {
                label: "Tiền + Đối ứng",
                badgeClasses: "text-blue-700 bg-blue-50 border-blue-200",
                glowClasses: "bg-blue-400",
                dotClasses: "bg-blue-500",
              },
              POSSIBLE: {
                label: "Chỉ khớp tiền",
                badgeClasses: "text-amber-700 bg-amber-50 border-amber-200",
                glowClasses: "bg-amber-400",
                dotClasses: "bg-amber-500",
              },
              NOTICE_STRONG: {
                label: "Khớp Số HĐ + Đối ứng (khác tiền)",
                badgeClasses: "text-orange-700 bg-orange-100 border-orange-300",
                glowClasses: "bg-orange-500",
                dotClasses: "bg-orange-600",
              },
              NOTICE: {
                label: "Khớp Số HĐ (khác tiền)",
                badgeClasses: "text-orange-600 bg-orange-50 border-orange-200",
                glowClasses: "bg-orange-400",
                dotClasses: "bg-orange-500",
              },
            };

            const cfg =
              score.badge !== "NONE" ? BADGE_CONFIG[score.badge] : null;
            if (!cfg) return null;

            const txnAmt =
              Number(direction === "IN" ? txn.debitAmount : txn.creditAmount) ||
              0;
            const txnEffectiveRemaining = getTxnEffectiveRemaining(txn);
            const remaining = getAmounts(inv).remaining;
            const amtToApply = Math.min(remaining, txnEffectiveRemaining);

            const partnerName =
              direction === "IN" ? inv.sellerName : inv.buyerName;

            return (
              <div className="flex flex-col gap-2">
                <TransactionCard
                  txn={txn}
                  amount={txnAmt}
                  isSuggestion={true}
                  matchInfo={{
                    invoiceNo: inv.invoiceNo,
                    keywords: extractKeywords(partnerName),
                  }}
                  suggestionProps={{
                    badgeLabel: cfg.label,
                    badgeClasses: cfg.badgeClasses,
                    glowClasses: cfg.glowClasses,
                    dotClasses: cfg.dotClasses,
                    onAccept: () => handleQuickAccept(inv.id, txn, amtToApply),
                  }}
                  onViewDetail={(id) => setDetailTxnId(id)}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] w-full text-slate-500 hover:text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setActiveInvoiceId(inv.id)}
                >
                  <Search className="w-3 h-3 mr-1.5" />
                  Bỏ qua & Chọn thủ công...
                </Button>
              </div>
            );
          }

          // Không có gợi ý -> fallback
          return (
            <div
              className="flex items-center justify-center p-2 border border-dashed rounded text-xs text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors"
              onClick={() => setActiveInvoiceId(inv.id)}
            >
              <Search className="w-3 h-3 mr-1.5" />
              Nhấn để chọn giao dịch...
            </div>
          );
        },
      },
    ],
    [direction, suggestionsMap, netOffMap, getAmounts],
  );

  const submitMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<any>[] = [];

      // 1. Process deletions
      for (const [invId, txnIds] of Object.entries(deletedNetOffs)) {
        for (const txnId of txnIds) {
          promises.push(erpInvoicesCoreApi.removeVoucherLink(invId, txnId));
        }
      }

      // 2. Process new and updated net-offs
      // Combine netOffMap (new) and updatedNetOffs (existing but edited)
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
          // If it's not already in deletedNetOffs, we upsert it
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
    // 1. Check invoice-side: session total <= invoice remaining
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

    // 2. Check txn-side: cross-invoice total <= txn remaining
    const txnTotalUsage: Record<
      string,
      { total: number; txnRemaining: number; invoiceNos: string[] }
    > = {};

    for (const [invId, txns] of Object.entries(netOffMap)) {
      const invoice = selectedInvoices.find((i) => i.id === invId);
      for (const [txnId, data] of Object.entries(txns)) {
        if (!txnTotalUsage[txnId]) {
          const txn = allTxns.find((t) => t.id === txnId) || data.txn;
          let txnRemaining = Infinity;
          if (txn) {
            const baseAmt = Math.max(
              parseFloat(txn.creditAmount as any) || 0,
              parseFloat(txn.debitAmount as any) || 0,
            );
            const dbNetOff = parseFloat((txn as any).netOffAmount) || 0;
            txnRemaining = baseAmt - dbNetOff;
          }
          txnTotalUsage[txnId] = { total: 0, txnRemaining, invoiceNos: [] };
        }
        txnTotalUsage[txnId].total += data.amount || 0;
        if (invoice?.invoiceNo) {
          txnTotalUsage[txnId].invoiceNos.push(invoice.invoiceNo);
        }
      }
    }

    for (const [, usage] of Object.entries(txnTotalUsage)) {
      if (usage.total > usage.txnRemaining) {
        return `Phiếu sao kê được cấn trừ vượt quá số tiền còn lại (tổng cấn trừ: ${money(usage.total)}, tối đa: ${money(usage.txnRemaining)}). Vui lòng kiểm tra lại các hóa đơn: ${usage.invoiceNos.join(", ")}.`;
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
    if (getAmounts(inv).remaining <= 0) fullyNettedOff++;
  }

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="create"
        collapsibleRightPanel={true}
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
          <div className="h-[calc(100vh-180px)] flex flex-col pr-1 space-y-4 overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <label className="text-xs font-semibold text-slate-700 shrink-0">
                Chi tiết theo từng hóa đơn ({invoicesWithSelection}/
                {totalInvoices})
              </label>
            </div>
            <div className="flex-1 min-h-0 bg-white flex flex-col overflow-hidden">
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
          excludeTxnIds={allTxns
            .filter((t) => getTxnEffectiveRemaining(t) <= 0)
            .map((t) => t.id)}
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
// HELPER FOR TEXT HIGHLIGHT
// ---------------------------------------------------------------------------
function highlightText(
  text: string,
  pattern?: string | string[],
): React.ReactNode {
  if (!text || !pattern) return text;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  if (patterns.length === 0) return text;

  // Build a regex that matches any of the patterns, case-insensitive
  const escapedPatterns = patterns.map((p) =>
    p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  const regex = new RegExp(`(${escapedPatterns.join("|")})`, "gi");

  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic"
      >
        {part}
      </mark>
    ) : (
      part
    ),
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
  matchInfo,
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
    onAccept?: () => void;
  };
  netOffProps?: {
    value: number;
    maxValue?: number;
    onChange: (val: number) => void;
    onRemove: () => void;
  };
  matchInfo?: { invoiceNo?: string; keywords?: string[] };
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

  const renderDescription = () => {
    const desc = txn?.description || "—";
    if (!isSuggestion || !matchInfo) return desc;

    // Highlight invoiceNo and keywords in description
    const patternsToHighlight = [];
    if (matchInfo.invoiceNo) patternsToHighlight.push(matchInfo.invoiceNo);
    if (matchInfo.keywords) patternsToHighlight.push(...matchInfo.keywords);

    return highlightText(desc, patternsToHighlight);
  };

  return (
    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm relative group">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] text-slate-400 font-medium">
            {txn?.transDate ? formatGMT7(txn.transDate, "date") : ""}
          </span>
          <span
            className="text-[10px] font-mono font-semibold text-slate-800 cursor-pointer hover:opacity-75 truncate"
            onClick={() => txn && onViewDetail(txn.id)}
            title="Nhấn để xem chi tiết sao kê"
          >
            {refText}
          </span>
        </div>

        <div className="flex items-start gap-1.5 shrink-0">
          <div className="text-right flex flex-col items-end">
            <div className="font-medium text-xs text-slate-800">
              {money(amount)}
            </div>
            {isSuggestion && suggestionProps && (
              <div
                className={`mt-0.5 flex items-start px-1.5 py-0.5 rounded text-[9px] border whitespace-normal text-right max-w-[140px] leading-[1.2] ${suggestionProps.badgeClasses}`}
              >
                <span className="relative flex h-1.5 w-1.5 mr-1 shrink-0 mt-[2px]">
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
        <div className="text-[10px] text-slate-500 whitespace-normal break-words mt-0.5 cursor-help">
          {renderDescription()}
        </div>
      </Tooltip>

      {isSuggestion && suggestionProps && suggestionProps.onAccept && (
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
