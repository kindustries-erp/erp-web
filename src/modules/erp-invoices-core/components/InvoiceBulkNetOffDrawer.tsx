import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import {
  type DrawerAction,
  DrawerSection,
} from "@/shared/components/DrawerModal";
import {
  type DataTableColumn,
  createColumnHeaderFilter,
  TableColumnAlign,
} from "@/shared/components/DataTable";
import { StandardTable } from "@/shared/components/StandardTable";
import type { ActionDropdownItem } from "@/shared/components/ActionDropdown";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { PillTabs } from "@/shared/components/PillTabs";
import { FilterButton } from "@/shared/components/FilterPanel";
import {
  AlertCircle,
  Loader2,
  CheckCircle2,
  Search,
  Sparkles,
  Landmark,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Building2,
  Eye,
  SlidersHorizontal,
  Info,
  RotateCcw,
} from "lucide-react";
import { format } from "date-fns";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import toast from "react-hot-toast";
import {
  erpInvoicesCoreApi,
  type ErpInvoice,
  type SmartNetOffSuggestionItem,
} from "../api/erpInvoicesCoreApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { money, formatGMT7 } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { SuggestionBadgePill } from "@/modules/erp-invoices-core/components/SmartSuggestionCard";
import { SmartMatchComparisonPopover } from "@/modules/erp-invoices-core/components/SmartMatchComparisonPopover";
import { ComingSoonTabContent } from "@/modules/erp-invoices-core/components/VoucherNetoffSelectionModal/components/ComingSoonTabContent";
import { NetOffInput } from "@/modules/erp-invoices-core/components/VoucherNetoffSelectionModal/components/NetOffInput";
import { InvoiceNoCell } from "./ErpInvoicesTab/components/cells/InvoiceNoCell";
import { InvoicePartnerCell } from "./ErpInvoicesTab/components/cells/InvoicePartnerCell";
import { ErpInvoiceStandaloneDrawer } from "./ErpInvoiceStandaloneDrawer";

export type BulkSubTabKey = "bank_statement" | "cash_book";
export type BulkViewPreset =
  | "all"
  | "suggestions"
  | "selected"
  | "netted"
  | "unnetted";
export type FocusedViewPreset = "all" | "suggestions" | "selected" | "linked";

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
  const { t } = useTranslation(["erpInvoices", "common"]);

  // ─── 1. Sub-Tabs & View Presets State ───
  const [activeSubTab, setActiveSubTab] =
    useState<BulkSubTabKey>("bank_statement");
  const [bulkViewPreset, setBulkViewPreset] = useState<BulkViewPreset>("all");
  const [focusedInvoiceId, setFocusedInvoiceId] = useState<string | null>(null);
  const [focusedViewPreset, setFocusedViewPreset] =
    useState<FocusedViewPreset>("all");

  // State for Detail Drawers & Form dirty state
  const [detailTxnId, setDetailTxnId] = useState<string | null>(null);
  const [detailInvoiceId, setDetailInvoiceId] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // ─── 2. Data Queries ───
  const missingIds = useMemo(() => {
    const presentIds = new Set((invoices || []).map((inv) => inv.id));
    return selectedInvoiceIds.filter((id) => !presentIds.has(id));
  }, [invoices, selectedInvoiceIds]);

  const { data: missingInvoices = [], isLoading: isLoadingMissingInvoices } =
    useQuery({
      queryKey: ["erp-invoices-bulk-missing", missingIds],
      queryFn: async () => {
        if (missingIds.length === 0) return [];
        const results = await Promise.allSettled(
          missingIds.map((id) => erpInvoicesCoreApi.get(id)),
        );
        return results
          .filter(
            (r): r is PromiseFulfilledResult<ErpInvoice> =>
              r.status === "fulfilled" && !!r.value,
          )
          .map((r) => r.value);
      },
      enabled: open && missingIds.length > 0,
    });

  const allAvailableInvoices = useMemo(() => {
    const map = new Map<string, ErpInvoice>();
    (invoices || []).forEach((inv) => map.set(inv.id, inv));
    missingInvoices.forEach((inv) => map.set(inv.id, inv));
    return Array.from(map.values());
  }, [invoices, missingInvoices]);

  const selectedInvoices = useMemo(
    () =>
      allAvailableInvoices.filter((inv) => selectedInvoiceIds.includes(inv.id)),
    [allAvailableInvoices, selectedInvoiceIds],
  );

  // ─── 3. Net-Off Allocation States ───
  const [netOffMap, setNetOffMap] = useState<
    Record<
      string,
      Record<string, { amount: number; maxAmount?: number; txn?: any }>
    >
  >({});

  const [existingNetOffsMap, setExistingNetOffsMap] = useState<
    Record<string, any[]>
  >({});
  const [deletedNetOffs, setDeletedNetOffs] = useState<
    Record<string, Set<string>>
  >({});
  const [updatedNetOffs, setUpdatedNetOffs] = useState<
    Record<string, Record<string, number>>
  >({});

  // ─── 4. Table States & Pagination for Bulk Matrix Table ───
  const [bulkPage, setBulkPage] = useState<number>(1);
  const [bulkPageSize, setBulkPageSize] = useState<number>(50);
  const [bulkDateFrom, setBulkDateFrom] = useState<string>("");
  const [bulkDateTo, setBulkDateTo] = useState<string>("");
  const bulkTableState = useTableColumnState(
    "invoice-bulk-netoff-matrix-table",
  );

  // ─── 5. Fetch DB Net-Offs & Smart Suggestions ───
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
      setFocusedInvoiceId(null);
      setDetailInvoiceId(null);
      setBulkViewPreset("all");
      setFocusedViewPreset("all");
      setBulkPage(1);
      setBulkDateFrom("");
      setBulkDateTo("");
      setIsDirty(false);
    }
  }, [open]);

  // Helper tính toán số liệu công nợ từng hóa đơn
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

  // Tìm gợi ý hợp lệ tốt nhất cho từng hóa đơn
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

  // Quick Accept gợi ý đơn lẻ
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

  // 1-Click Auto Apply Tất cả gợi ý cho toàn bộ HĐ
  const handleAutoApplyAll = () => {
    let appliedCount = 0;
    setIsDirty(true);
    setNetOffMap((prev) => {
      const newMap = { ...prev };
      const currentUsage = { ...pendingTxnUsage };

      for (const inv of selectedInvoices) {
        const { remaining } = getAmounts(inv);
        if (remaining <= 0) continue;

        const suggestions = suggestionsData?.[inv.id] || [];
        const valid = suggestions.find((s) => {
          const txnRemaining =
            (Number(s.txn.remainingAmount) || 0) -
            (currentUsage[s.txn.id] || 0);
          return txnRemaining > 0;
        });

        if (valid) {
          const txn = valid.txn;
          const txnRemaining =
            (Number(txn.remainingAmount) || 0) - (currentUsage[txn.id] || 0);
          const amtToApply = Math.min(remaining, txnRemaining);

          if (amtToApply > 0) {
            const invMap = { ...(newMap[inv.id] || {}) };
            const credit = parseFloat(txn.creditAmount as any) || 0;
            const debit = parseFloat(txn.debitAmount as any) || 0;
            const baseAmt = credit > 0 ? credit : debit;
            const dbNetOff = parseFloat((txn as any).netOffAmount) || 0;
            const maxRemaining = baseAmt - dbNetOff;

            invMap[txn.id] = {
              amount: amtToApply,
              maxAmount: maxRemaining,
              txn,
            };
            newMap[inv.id] = invMap;
            currentUsage[txn.id] = (currentUsage[txn.id] || 0) + amtToApply;
            appliedCount++;
          }
        }
      }
      return newMap;
    });

    if (appliedCount > 0) {
      toast.success(
        `Đã tự động áp dụng ${appliedCount} gợi ý khớp thành công!`,
      );
    } else {
      toast.error("Không có thêm gợi ý khả dụng nào để áp dụng.");
    }
  };

  // ─── 6. Thống Kê Tổng Thể Toàn Bộ Phiên ───
  const totalInvoices = selectedInvoices.length;
  let totalInvoiceAmt = 0;
  let totalNetOffAmt = 0;
  let fullyNettedOff = 0;
  let invoicesWithSelection = 0;
  let withSuggestionsCount = 0;

  for (const inv of selectedInvoices) {
    const { total, nettedOff, remaining } = getAmounts(inv);
    totalInvoiceAmt += total;
    totalNetOffAmt += nettedOff;
    if (remaining <= 0) fullyNettedOff++;
    if (Object.keys(netOffMap[inv.id] || {}).length > 0)
      invoicesWithSelection++;
    if (suggestionsMap[inv.id]) withSuggestionsCount++;
  }

  const unnettedCount = totalInvoices - fullyNettedOff;
  const overallPaymentPercent =
    totalInvoiceAmt > 0
      ? Math.round((totalNetOffAmt / totalInvoiceAmt) * 100)
      : 0;
  const totalRemainingDebt = Math.max(0, totalInvoiceAmt - totalNetOffAmt);

  // ─── 7. Lọc & Sắp Xếp Danh Sách Hóa Đơn Cho Bảng Hàng Loạt (Bulk Matrix) ───
  const bulkListHook = useMemo(
    () => ({
      ...bulkTableState,
      dateFrom: bulkDateFrom,
      dateTo: bulkDateTo,
      setDateRange: (from?: string, to?: string) => {
        setBulkDateFrom(from || "");
        setBulkDateTo(to || "");
        setBulkPage(1);
      },
      setSort: (key: string, state: any) => {
        bulkTableState.setSort(key, state);
        setBulkPage(1);
      },
      setColumnFilter: (key: string, vals: string[]) => {
        bulkTableState.setColumnFilter(key, vals);
        setBulkPage(1);
      },
      setColumnSearch: (key: string, val: string) => {
        bulkTableState.setColumnSearch(key, val);
        setBulkPage(1);
      },
    }),
    [bulkTableState, bulkDateFrom, bulkDateTo],
  );

  const bulkHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: bulkListHook,
        items: selectedInvoices,
      }),
    [bulkListHook, selectedInvoices],
  );

  const bulkActiveFilterCount = useMemo(() => {
    let count = 0;
    if (bulkDateFrom || bulkDateTo) count += 1;
    Object.values(bulkTableState.columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(bulkTableState.columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    return count;
  }, [
    bulkTableState.columnFilters,
    bulkTableState.columnSearch,
    bulkDateFrom,
    bulkDateTo,
  ]);

  const displayedInvoices = useMemo(() => {
    // 1. View Preset Filter
    let filtered = selectedInvoices;
    if (bulkViewPreset === "suggestions") {
      filtered = filtered.filter((inv) => !!suggestionsMap[inv.id]);
    } else if (bulkViewPreset === "selected") {
      filtered = filtered.filter(
        (inv) =>
          Object.keys(netOffMap[inv.id] || {}).length > 0 ||
          (existingNetOffsMap[inv.id] || []).length > 0,
      );
    } else if (bulkViewPreset === "netted") {
      filtered = filtered.filter((inv) => getAmounts(inv).remaining <= 0);
    } else if (bulkViewPreset === "unnetted") {
      filtered = filtered.filter((inv) => getAmounts(inv).remaining > 0);
    }

    // 2. Date Range Filter
    if (bulkDateFrom || bulkDateTo) {
      filtered = filtered.filter((inv) => {
        if (!inv.invoiceDate) return false;
        const invDateStr = inv.invoiceDate.substring(0, 10);
        if (bulkDateFrom && invDateStr < bulkDateFrom) return false;
        if (bulkDateTo && invDateStr > bulkDateTo) return false;
        return true;
      });
    }

    // 3. Client-side Column Search
    const searchMap = bulkTableState.columnSearch;
    if (searchMap.invoiceNo && searchMap.invoiceNo.trim().length > 0) {
      const q = searchMap.invoiceNo.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.invoiceNo?.toLowerCase().includes(q) ||
          inv.serialNo?.toLowerCase().includes(q),
      );
    }
    if (searchMap.partner && searchMap.partner.trim().length > 0) {
      const q = searchMap.partner.toLowerCase();
      filtered = filtered.filter(
        (inv) =>
          inv.sellerName?.toLowerCase().includes(q) ||
          inv.buyerName?.toLowerCase().includes(q) ||
          inv.sellerTaxCode?.toLowerCase().includes(q) ||
          inv.buyerTaxCode?.toLowerCase().includes(q),
      );
    }
    if (searchMap.description && searchMap.description.trim().length > 0) {
      const q = searchMap.description.toLowerCase();
      filtered = filtered.filter((inv) =>
        inv.description?.toLowerCase().includes(q),
      );
    }
    if (searchMap.amount && searchMap.amount.trim().length > 0) {
      const q = searchMap.amount;
      filtered = filtered.filter((inv) => String(inv.totalAmount).includes(q));
    }

    // 4. Client-side Column Filters (Supporting __ALL_MATCHING__, __BLANK__, and array selections)
    const filterMap = bulkTableState.columnFilters;
    if (filterMap.invoiceNo && filterMap.invoiceNo.length > 0) {
      const vals = filterMap.invoiceNo;
      if (vals.includes("__ALL_MATCHING__")) {
        const searchKeyword = vals[1]
          ? String(vals[1]).toLowerCase().trim()
          : "";
        if (searchKeyword) {
          filtered = filtered.filter(
            (inv) =>
              inv.invoiceNo?.toLowerCase().includes(searchKeyword) ||
              inv.serialNo?.toLowerCase().includes(searchKeyword),
          );
        }
      } else {
        filtered = filtered.filter((inv) => {
          if (
            vals.includes("__BLANK__") &&
            (!inv.invoiceNo || inv.invoiceNo === "")
          ) {
            return true;
          }
          return vals.includes(inv.invoiceNo || "");
        });
      }
    }

    if (filterMap.partner && filterMap.partner.length > 0) {
      const vals = filterMap.partner;
      if (vals.includes("__ALL_MATCHING__")) {
        const searchKeyword = vals[1]
          ? String(vals[1]).toLowerCase().trim()
          : "";
        if (searchKeyword) {
          filtered = filtered.filter((inv) => {
            const text =
              (direction === "IN" ? inv.sellerName : inv.buyerName) || "";
            const tax =
              (direction === "IN" ? inv.sellerTaxCode : inv.buyerTaxCode) || "";
            return (
              text.toLowerCase().includes(searchKeyword) ||
              tax.toLowerCase().includes(searchKeyword)
            );
          });
        }
      } else {
        filtered = filtered.filter((inv) => {
          const text =
            (direction === "IN" ? inv.sellerName : inv.buyerName) || "";
          if (vals.includes("__BLANK__") && !text) return true;
          return vals.includes(text);
        });
      }
    }

    if (filterMap.description && filterMap.description.length > 0) {
      const vals = filterMap.description;
      if (vals.includes("__ALL_MATCHING__")) {
        const searchKeyword = vals[1]
          ? String(vals[1]).toLowerCase().trim()
          : "";
        if (searchKeyword) {
          filtered = filtered.filter((inv) =>
            inv.description?.toLowerCase().includes(searchKeyword),
          );
        }
      } else {
        filtered = filtered.filter((inv) => {
          if (
            vals.includes("__BLANK__") &&
            (!inv.description || inv.description === "")
          ) {
            return true;
          }
          return vals.includes(inv.description || "");
        });
      }
    }

    if (filterMap.amount && filterMap.amount.length > 0) {
      const vals = filterMap.amount;
      if (vals.includes("__ALL_MATCHING__")) {
        const searchKeyword = vals[1]
          ? String(vals[1]).toLowerCase().trim()
          : "";
        if (searchKeyword) {
          filtered = filtered.filter((inv) =>
            String(inv.totalAmount).includes(searchKeyword),
          );
        }
      } else {
        filtered = filtered.filter((inv) =>
          vals.some((val) => {
            if (val === "NETTED") return getAmounts(inv).remaining <= 0;
            if (val === "UNNETTED") return getAmounts(inv).remaining > 0;
            if (val === "__BLANK__") return !inv.totalAmount;
            return String(inv.totalAmount) === val;
          }),
        );
      }
    }

    // 5. Client-side Sorting
    const activeSort = bulkTableState.sorts[0];
    if (activeSort) {
      const isDesc = activeSort.startsWith("-");
      const sortKey = isDesc ? activeSort.substring(1) : activeSort;

      filtered = [...filtered].sort((a, b) => {
        let valA: any = "";
        let valB: any = "";
        if (sortKey === "invoiceDate") {
          valA = a.invoiceDate || "";
          valB = b.invoiceDate || "";
        } else if (sortKey === "invoiceNo") {
          valA = a.invoiceNo || "";
          valB = b.invoiceNo || "";
        } else if (sortKey === "partner") {
          valA = (direction === "IN" ? a.sellerName : a.buyerName) || "";
          valB = (direction === "IN" ? b.sellerName : b.buyerName) || "";
        } else if (sortKey === "description") {
          valA = a.description || "";
          valB = b.description || "";
        } else if (sortKey === "amount") {
          valA = Number(a.totalAmount) || 0;
          valB = Number(b.totalAmount) || 0;
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return isDesc
            ? valB.localeCompare(valA, "vi-VN")
            : valA.localeCompare(valB, "vi-VN");
        }
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return filtered;
  }, [
    selectedInvoices,
    bulkViewPreset,
    suggestionsMap,
    netOffMap,
    existingNetOffsMap,
    bulkDateFrom,
    bulkDateTo,
    bulkTableState.columnSearch,
    bulkTableState.columnFilters,
    bulkTableState.sorts,
    direction,
  ]);

  // Paginated slice for Bulk Matrix Table
  const paginatedInvoices = useMemo(() => {
    const start = (bulkPage - 1) * bulkPageSize;
    return displayedInvoices.slice(start, start + bulkPageSize);
  }, [displayedInvoices, bulkPage, bulkPageSize]);

  const bulkTotalPages = useMemo(
    () => Math.ceil(displayedInvoices.length / bulkPageSize) || 1,
    [displayedInvoices.length, bulkPageSize],
  );

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

  const descriptionOptions = useMemo(() => {
    const set = new Set<string>();
    selectedInvoices.forEach((inv) => {
      if (inv.description) set.add(inv.description);
    });
    return Array.from(set).map((v) => ({ label: v, value: v }));
  }, [selectedInvoices]);

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

  // ─── 8. Định Nghĩa Cột Cho Bảng Bulk Matrix ───
  const bulkColumns = useMemo<DataTableColumn<ErpInvoice>[]>(
    () => [
      {
        key: "stt",
        header: <span className="w-full block text-center font-bold">#</span>,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        size: 40,
        enableResizing: false,
        cell: (_inv, idx) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx}
          </span>
        ),
      },
      {
        key: "invoiceDate",
        header: bulkHeaderFilter.date(
          "invoiceDate",
          t("tableColInvoiceDate", "NGÀY HĐ"),
        ),
        headerClassName: "text-center",
        className: "text-center",
        size: 95,
        enableResizing: true,
        cell: (inv) => {
          if (!inv.invoiceDate) {
            return (
              <span className="text-muted-foreground font-mono text-xs text-center block">
                —
              </span>
            );
          }
          try {
            return (
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 text-center block">
                {format(new Date(inv.invoiceDate), "dd-MM-yyyy")}
              </span>
            );
          } catch {
            return (
              <span className="text-xs font-mono text-slate-700 dark:text-slate-300 text-center block">
                {inv.invoiceDate.substring(0, 10)}
              </span>
            );
          }
        },
      },
      {
        key: "invoiceNo",
        header: bulkHeaderFilter.client(
          "invoiceNo",
          t("tableColInvoiceNo", "SỐ HĐ"),
          { filterOptions: invoiceNoOptions },
        ),
        headerClassName: "text-center",
        className: "text-left",
        size: 130,
        enableResizing: true,
        cell: (inv) => {
          return (
            <InvoiceNoCell
              inv={inv}
              handleOpenInternal={() => setDetailInvoiceId(inv.id)}
            />
          );
        },
      },
      {
        key: "partner",
        header: bulkHeaderFilter.client(
          "partner",
          direction === "IN"
            ? t("tableColSeller", "BÊN BÁN")
            : t("tableColBuyer", "BÊN MUA"),
          { filterOptions: partnerOptions },
        ),
        headerClassName: "text-center",
        className: "text-left",
        size: 260,
        enableResizing: true,
        cell: (inv) => {
          return <InvoicePartnerCell inv={inv} direction={direction} />;
        },
      },
      {
        key: "amount",
        header: bulkHeaderFilter.amount(
          "amount",
          t("tableColAmount", "Giá trị"),
          { filterOptions: amountOptions },
        ),
        headerClassName: "text-center",
        size: 130,
        enableResizing: true,
        cell: (inv) => {
          const { remaining, nettedOff } = getAmounts(inv);
          const suggestion = suggestionsMap[inv.id];
          const hasMatchedAmount = suggestion && suggestion.score.amountMatch;
          return (
            <div className={`text-right ${remaining <= 0 ? "opacity-75" : ""}`}>
              <div className="font-bold font-mono text-xs text-slate-900 dark:text-slate-100">
                {hasMatchedAmount ? (
                  <mark className="bg-amber-200 text-amber-900 rounded-sm px-0.5 not-italic dark:bg-amber-900/60 dark:text-amber-200">
                    {money(Number(inv.totalAmount))}
                  </mark>
                ) : (
                  money(Number(inv.totalAmount))
                )}
              </div>
              <div className="text-[10.5px] text-slate-500 font-mono mt-0.5">
                Đã cấn: {money(nettedOff)}
              </div>
              <div
                className={`text-[10.5px] font-mono font-medium mt-0.5 ${
                  remaining <= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
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
          <span className="font-bold text-center block">Cấn trừ / Gợi ý</span>
        ),
        headerClassName: "text-center",
        size: 320,
        enableResizing: true,
        cell: (inv) => {
          const currentSelections = Object.entries(netOffMap[inv.id] || {});
          const existingNetOffs = existingNetOffsMap[inv.id] || [];
          const deletedIds = deletedNetOffs[inv.id] || new Set();
          const existingValidNetOffs = existingNetOffs.filter(
            (no) => !deletedIds.has(no.bankTransactionId),
          );
          const totalLinkedCount =
            existingValidNetOffs.length + currentSelections.length;
          const suggestion = suggestionsMap[inv.id];
          const { remaining, nettedOff } = getAmounts(inv);
          const invDone = remaining <= 0;

          // ─── 1. ĐÃ CÓ GIAO DỊCH LIÊN KẾT (Đã cấn đủ hoặc Đang cấn 1 phần) ───
          if (totalLinkedCount > 0) {
            return (
              <div className="flex flex-col justify-center gap-0.5 py-0.5 max-w-[290px]">
                {/* Dòng 1: Status Badge & Số tiền */}
                <div className="flex items-center justify-between gap-1">
                  {invDone ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4.5 bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold"
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600 inline" />
                      Đã cấn đủ {money(nettedOff)}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 h-4.5 bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                    >
                      Đã gán {totalLinkedCount} GD: {money(nettedOff)}
                    </Badge>
                  )}

                  <div className="flex items-center gap-1">
                    {!invDone && (
                      <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-medium">
                        Thiếu: {money(remaining)}
                      </span>
                    )}
                    <button
                      type="button"
                      className="text-[10px] text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-0.5"
                      title="Hủy tất cả cấn trừ HĐ này"
                      onClick={() => {
                        setIsDirty(true);
                        setNetOffMap((prev) => {
                          const newMap = { ...prev };
                          delete newMap[inv.id];
                          return newMap;
                        });
                        setDeletedNetOffs((prev) => {
                          const newMap = { ...prev };
                          const existingIds = (
                            existingNetOffsMap[inv.id] || []
                          ).map((v) => v.bankTransactionId);
                          newMap[inv.id] = new Set(existingIds);
                          return newMap;
                        });
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Dòng 2: Tóm tắt giao dịch liên kết */}
                <div className="text-[10px] text-muted-foreground truncate font-mono">
                  {totalLinkedCount === 1
                    ? (() => {
                        const txn =
                          currentSelections[0]?.[1]?.txn ||
                          existingValidNetOffs[0]?.bankTransaction;
                        const amt =
                          currentSelections[0]?.[1]?.amount ||
                          Number(
                            existingValidNetOffs[0]?.netOffAmount ||
                              existingValidNetOffs[0]?.net_off_amount,
                          ) ||
                          0;
                        return `Ref: ${txn?.referenceNumber || txn?.seqNo || "—"} (${money(amt)})`;
                      })()
                    : `${existingValidNetOffs.length} đã lưu DB • ${currentSelections.length} chờ lưu`}
                </div>

                {/* Dòng 3: Thao tác xem / sửa chi tiết */}
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
                    onClick={() => setFocusedInvoiceId(inv.id)}
                  >
                    <SlidersHorizontal className="w-2.5 h-2.5" />
                    <span>
                      {invDone ? "Xem / Sửa chi tiết" : "+ Đối soát thêm..."}
                    </span>
                  </button>
                  {totalLinkedCount > 1 && (
                    <span className="text-slate-400 text-[9.5px]">
                      {totalLinkedCount} giao dịch
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // ─── 2. CÓ GỢI Ý SMART MATCH (Chưa gán giao dịch nào) ───
          if (suggestion) {
            const { txn, score } = suggestion;
            const txnRemaining = Math.max(
              0,
              (Number(txn.remainingAmount) || 0) -
                (pendingTxnUsage[txn.id] || 0),
            );
            const amtToApply = Math.min(remaining, txnRemaining);
            const txnGrossAmount =
              Number(direction === "IN" ? txn.debitAmount : txn.creditAmount) ||
              0;

            return (
              <div className="flex flex-col justify-center gap-1 py-0.5 max-w-[310px]">
                {/* Dòng 1: Badge gợi ý + Điểm + Gợi ý cấn + Nút Áp dụng */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <SuggestionBadgePill
                      badgeType={score.badge}
                      showShortLabel={true}
                    />
                    {score.score !== undefined && (
                      <span
                        className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700 shrink-0"
                        title={`Điểm tin cậy đối soát: ${score.score}/100`}
                      >
                        {score.score}đ
                      </span>
                    )}
                    <div className="flex items-baseline gap-1 min-w-0">
                      <span className="text-[9.5px] text-muted-foreground uppercase font-medium tracking-tight">
                        Cấn:
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100 truncate tabular-nums">
                        {money(amtToApply)}
                      </span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleQuickAccept(inv.id, txn, amtToApply)}
                    className="h-5 text-[10px] px-1.5 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Áp dụng</span>
                  </Button>
                </div>

                {/* Dòng 2: Thông tin giao dịch gợi ý & Số tiền gốc GD sao kê */}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono leading-tight">
                  <span
                    className="truncate max-w-[180px]"
                    title={`Ref: ${txn.referenceNumber || txn.seqNo || "—"} (${formatGMT7(txn.transDate, "date")})`}
                  >
                    Ref: {txn.referenceNumber || txn.seqNo || "—"} (
                    {formatGMT7(txn.transDate, "date")})
                  </span>
                  <span
                    className="text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-1 text-[9.5px]"
                    title={`Tổng phát sinh giao dịch sao kê: ${money(txnGrossAmount)} (Khả dụng: ${money(txnRemaining)})`}
                  >
                    GD: {money(txnGrossAmount)}
                  </span>
                </div>

                {/* Dòng 3: Link đối chiếu & Chọn khác */}
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <SmartMatchComparisonPopover
                    invoice={inv}
                    suggestion={suggestion}
                    invoiceRemaining={remaining}
                    direction={direction}
                    onApply={() => handleQuickAccept(inv.id, txn, amtToApply)}
                    onViewTxnDetail={(id) => setDetailTxnId(id)}
                    onManualSelect={() => setFocusedInvoiceId(inv.id)}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer"
                    >
                      <Info className="w-3 h-3" />
                      <span>Lý do gợi ý</span>
                    </button>
                  </SmartMatchComparisonPopover>

                  <button
                    type="button"
                    className="text-slate-400 hover:text-primary hover:underline cursor-pointer"
                    onClick={() => setFocusedInvoiceId(inv.id)}
                  >
                    Chọn khác ↗
                  </button>
                </div>
              </div>
            );
          }

          // ─── 3. CHƯA CÓ GIAO DỊCH KHỚP & CHƯA GÁN ───
          return (
            <div className="flex flex-col justify-center gap-1 py-0.5 max-w-[290px]">
              <div className="text-[10.5px] text-slate-400 italic">
                Chưa có giao dịch khớp
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-5.5 text-[10.5px] px-2 py-0 w-full font-normal text-muted-foreground hover:text-primary hover:border-primary/50 justify-start"
                onClick={() => setFocusedInvoiceId(inv.id)}
              >
                <Search className="w-3 h-3 mr-1 text-slate-400" />
                <span>Chọn giao dịch sao kê...</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [
      bulkHeaderFilter,
      direction,
      suggestionsMap,
      netOffMap,
      existingNetOffsMap,
      updatedNetOffs,
      deletedNetOffs,
      pendingTxnUsage,
      invoiceNoOptions,
      partnerOptions,
      descriptionOptions,
      amountOptions,
      t,
    ],
  );

  // Row Actions (Floating Actions & Context Menu) cho Bảng Hàng Loạt
  const getBulkRowActions = useCallback(
    (inv: ErpInvoice): ActionDropdownItem[] => {
      const { remaining } = getAmounts(inv);
      const suggestion = suggestionsMap[inv.id];
      const hasSelections =
        Object.keys(netOffMap[inv.id] || {}).length > 0 ||
        (existingNetOffsMap[inv.id] || []).length > 0;

      return [
        {
          groupLabel: "TRA CỨU",
          items: [
            {
              label: "Xem chi tiết hóa đơn",
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => setDetailInvoiceId(inv.id),
            },
            {
              label: "Đối soát chi tiết",
              icon: <SlidersHorizontal className="w-3.5 h-3.5" />,
              onClick: () => setFocusedInvoiceId(inv.id),
            },
          ],
        },
        {
          groupLabel: "THAO TÁC",
          items: [
            ...(suggestion && remaining > 0
              ? [
                  {
                    label: "Áp dụng gợi ý này",
                    icon: <Sparkles className="w-3.5 h-3.5 text-indigo-600" />,
                    onClick: () => {
                      const txn = suggestion.txn;
                      const txnRemaining = Math.max(
                        0,
                        (Number(txn.remainingAmount) || 0) -
                          (pendingTxnUsage[txn.id] || 0),
                      );
                      const amt = Math.min(remaining, txnRemaining);
                      handleQuickAccept(inv.id, txn, amt);
                    },
                  },
                ]
              : []),
            ...(hasSelections
              ? [
                  {
                    label: "Hủy cấn trừ HĐ này",
                    icon: (
                      <RotateCcw className="w-3.5 h-3.5 text-destructive" />
                    ),
                    variant: "danger" as const,
                    onClick: () => {
                      setIsDirty(true);
                      setNetOffMap((prev) => {
                        const newMap = { ...prev };
                        delete newMap[inv.id];
                        return newMap;
                      });
                      setDeletedNetOffs((prev) => {
                        const newMap = { ...prev };
                        const existingIds = (
                          existingNetOffsMap[inv.id] || []
                        ).map((v) => v.bankTransactionId);
                        newMap[inv.id] = new Set(existingIds);
                        return newMap;
                      });
                    },
                  },
                ]
              : []),
          ],
        },
      ];
    },
    [
      existingNetOffsMap,
      netOffMap,
      pendingTxnUsage,
      suggestionsMap,
      deletedNetOffs,
    ],
  );

  // ─── 9. Chế Độ Deep-Dive Từng HĐ (Master-Detail Inspector) ───
  const focusedInvoice = useMemo(
    () => selectedInvoices.find((i) => i.id === focusedInvoiceId) || null,
    [selectedInvoices, focusedInvoiceId],
  );

  const focusedIndex = useMemo(
    () =>
      focusedInvoiceId
        ? selectedInvoices.findIndex((i) => i.id === focusedInvoiceId)
        : -1,
    [selectedInvoices, focusedInvoiceId],
  );

  const [focusedPage, setFocusedPage] = useState<number>(1);
  const [focusedPageSize, setFocusedPageSize] = useState<number>(50);
  const [focusedDateFrom, setFocusedDateFrom] = useState<string>("");
  const [focusedDateTo, setFocusedDateTo] = useState<string>("");
  const focusedTableState = useTableColumnState(
    "bulk-focused-invoice-settlement-table",
  );

  // Clear all filters whenever focusedInvoiceId changes or opens
  useEffect(() => {
    if (focusedInvoiceId) {
      focusedTableState.resetFilters();
      setFocusedDateFrom("");
      setFocusedDateTo("");
      setFocusedPage(1);
      setFocusedViewPreset("all");
    }
  }, [focusedInvoiceId]);

  const focusedListHook = useMemo(
    () => ({
      ...focusedTableState,
      dateFrom: focusedDateFrom,
      dateTo: focusedDateTo,
      setDateRange: (from?: string, to?: string) => {
        setFocusedDateFrom(from || "");
        setFocusedDateTo(to || "");
        setFocusedPage(1);
      },
      setSort: (key: string, state: any) => {
        focusedTableState.setSort(key, state);
        setFocusedPage(1);
      },
      setColumnFilter: (key: string, vals: string[]) => {
        focusedTableState.setColumnFilter(key, vals);
        setFocusedPage(1);
      },
      setColumnSearch: (key: string, val: string) => {
        focusedTableState.setColumnSearch(key, val);
        setFocusedPage(1);
      },
    }),
    [focusedTableState, focusedDateFrom, focusedDateTo],
  );

  const focusedHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: focusedListHook,
        queryKeyPrefix: "bulk-focused-bank-statement-options",
        fetchOptions: ({
          columnKey,
          search,
          pageParam,
          pageSize: optPageSize,
          filtersStr,
        }) =>
          bankStatementApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            optPageSize || 20,
            filtersStr,
          ),
      }),
    [focusedListHook],
  );

  const focusedActiveFilterCount = useMemo(() => {
    let count = 0;
    Object.values(focusedTableState.columnFilters).forEach((vals) => {
      if (vals && vals.length > 0) count += 1;
    });
    Object.values(focusedTableState.columnSearch).forEach((val) => {
      if (val && val.trim().length > 0) count += 1;
    });
    if (focusedDateFrom || focusedDateTo) count += 1;
    return count;
  }, [
    focusedTableState.columnFilters,
    focusedTableState.columnSearch,
    focusedDateFrom,
    focusedDateTo,
  ]);

  const settlementType = direction === "IN" ? "PAYMENT" : "RECEIPT";

  // Query giao dịch sao kê cho Focused Invoice
  const { data: focusedVouchersData, isLoading: isLoadingFocusedVouchers } =
    useQuery({
      queryKey: [
        "bank-statement-transactions-for-bulk-focused",
        focusedPage,
        focusedPageSize,
        settlementType,
        focusedDateFrom,
        focusedDateTo,
        focusedTableState.columnFilters,
        focusedTableState.sorts,
        focusedTableState.columnSearch,
      ],
      queryFn: () => {
        const sortField =
          focusedTableState.sorts[0]?.replace("-", "") || "transDate";
        const sortOrder = focusedTableState.sorts[0]?.startsWith("-")
          ? "DESC"
          : "ASC";
        return bankStatementApi.getTransactions({
          page: focusedPage,
          pageSize: focusedPageSize,
          sortBy: sortField,
          sortOrder,
          startDate: focusedDateFrom || undefined,
          endDate: focusedDateTo || undefined,
          column_filters:
            Object.keys(focusedTableState.columnFilters).length > 0
              ? JSON.stringify(focusedTableState.columnFilters)
              : undefined,
          column_search:
            Object.keys(focusedTableState.columnSearch).length > 0
              ? JSON.stringify(focusedTableState.columnSearch)
              : undefined,
        });
      },
      enabled: open && !!focusedInvoiceId && activeSubTab === "bank_statement",
    });

  const focusedVouchers = (focusedVouchersData?.items ||
    focusedVouchersData?.data ||
    []) as any[];
  const focusedTotalVouchers = Number(focusedVouchersData?.total || 0);
  const focusedTotalPages = Number(focusedVouchersData?.totalPages || 0);

  // Danh sách các giao dịch đã chọn trong phiên cho focused invoice
  const focusedSelectedList = useMemo(() => {
    if (!focusedInvoiceId) return [];
    const entries = Object.entries(netOffMap[focusedInvoiceId] || {});
    return entries.map(([txnId, data]) => ({
      id: txnId,
      ...data.txn,
      amount: data.amount,
      maxAmount: data.maxAmount,
    }));
  }, [focusedInvoiceId, netOffMap]);

  // Danh sách các giao dịch đã cấn trừ trong DB cho focused invoice
  const focusedExistingList = useMemo(() => {
    if (!focusedInvoiceId) return [];
    return (existingNetOffsMap[focusedInvoiceId] || []).filter(
      (v) => !deletedNetOffs[focusedInvoiceId]?.has(v.bankTransactionId),
    );
  }, [focusedInvoiceId, existingNetOffsMap, deletedNetOffs]);

  // Danh sách gợi ý cho focused invoice
  const focusedSuggestionsList = useMemo(() => {
    if (!focusedInvoiceId || !suggestionsData) return [];
    return suggestionsData[focusedInvoiceId] || [];
  }, [focusedInvoiceId, suggestionsData]);

  // Map danh sách hiển thị theo Preset của Focused Table
  const focusedDisplayItems = useMemo<any[]>(() => {
    if (focusedViewPreset === "suggestions") {
      return focusedSuggestionsList.map((s) => ({
        ...s.txn,
        isSuggestion: true,
        matchScore: s.score?.badge || "PERFECT",
        matchedKeywords: s.matchedKeywords || [],
      }));
    }
    if (focusedViewPreset === "selected") {
      return focusedSelectedList;
    }
    if (focusedViewPreset === "linked") {
      return focusedExistingList.map((v) => ({
        id: v.bankTransactionId || v.id,
        ...v.bankTransaction,
        netOffAmount:
          (updatedNetOffs[focusedInvoiceId!]?.[v.bankTransactionId] !==
          undefined
            ? updatedNetOffs[focusedInvoiceId!]?.[v.bankTransactionId]
            : Number(v.netOffAmount || v.net_off_amount)) || 0,
        isLinked: true,
      }));
    }
    return focusedVouchers;
  }, [
    focusedViewPreset,
    focusedSuggestionsList,
    focusedSelectedList,
    focusedExistingList,
    focusedVouchers,
    focusedInvoiceId,
    updatedNetOffs,
  ]);

  // Helper toggle chọn dòng trong focused table
  const handleToggleFocusedRow = (row: any) => {
    if (!focusedInvoiceId || !focusedInvoice) return;
    setIsDirty(true);
    const txnId = row.id;
    const isSelected = !!(netOffMap[focusedInvoiceId] || {})[txnId];

    if (isSelected) {
      setNetOffMap((prev) => {
        const newMap = { ...prev };
        const invMap = { ...(newMap[focusedInvoiceId] || {}) };
        delete invMap[txnId];
        if (Object.keys(invMap).length === 0) {
          delete newMap[focusedInvoiceId];
        } else {
          newMap[focusedInvoiceId] = invMap;
        }
        return newMap;
      });
    } else {
      const credit = parseFloat(row.creditAmount as any) || 0;
      const debit = parseFloat(row.debitAmount as any) || 0;
      const baseAmt = credit > 0 ? credit : debit;
      const dbNetOff = parseFloat((row as any).netOffAmount) || 0;
      const remainingTxn = Math.max(
        0,
        baseAmt - dbNetOff - (pendingTxnUsage[txnId] || 0),
      );
      const remainingInv = getAmounts(focusedInvoice).remaining;
      const initialAmt = Math.min(remainingTxn, remainingInv);

      setNetOffMap((prev) => {
        const newMap = { ...prev };
        const invMap = { ...(newMap[focusedInvoiceId] || {}) };
        invMap[txnId] = {
          amount: initialAmt > 0 ? initialAmt : remainingTxn,
          maxAmount: baseAmt - dbNetOff,
          txn: row,
        };
        newMap[focusedInvoiceId] = invMap;
        return newMap;
      });
    }
  };

  // Focused Table Columns
  const focusedColumns = useMemo<DataTableColumn<any>[]>(
    () => [
      {
        key: "stt",
        header: <span className="w-full block text-center font-bold">#</span>,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        size: 40,
        enableResizing: false,
        cell: (_row: any, idx: number) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx}
          </span>
        ),
      },
      {
        key: "selection",
        header: "",
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (row: any) => {
          const isLinked = focusedExistingList.some(
            (v) => (v.bankTransactionId || v.id) === row.id,
          );
          if (isLinked) {
            return (
              <div className="flex items-center justify-center">
                <span
                  title="Đã cấn trừ vào hóa đơn này"
                  className="w-2.5 h-2.5 rounded-full bg-emerald-500"
                />
              </div>
            );
          }
          const isSelected = !!(netOffMap[focusedInvoiceId || ""] || {})[
            row.id
          ];
          return (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleToggleFocusedRow(row)}
              />
            </div>
          );
        },
      },
      {
        key: "source",
        header: focusedHeaderFilter("source", "Nguồn / Tài khoản", {
          align: TableColumnAlign.LEFT,
        }),
        size: 130,
        enableResizing: true,
        cell: (row: any) => (
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
              {row.bankAccount?.bankName || row.bankName || "Ngân hàng"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">
              {row.bankAccount?.accountNumber || row.accountNumber || "---"}
            </span>
          </div>
        ),
      },
      {
        key: "transDate",
        header: focusedHeaderFilter.date("transDate", "Ngày GD", {
          align: "center",
          className: "w-full justify-center",
        }),
        size: 105,
        enableResizing: true,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (row: any) => (
          <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
            {formatGMT7(row.transDate, "date")}
          </span>
        ),
      },
      {
        key: "referenceNumber",
        header: focusedHeaderFilter("referenceNumber", "Số tham chiếu", {
          align: TableColumnAlign.LEFT,
          showBlankOption: true,
        }),
        size: 130,
        enableResizing: true,
        cell: (row: any) => (
          <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate block">
            {row.referenceNumber || row.seqNo || "---"}
          </span>
        ),
      },
      {
        key: "partnerName",
        header: focusedHeaderFilter("partnerName", "Đối tác sao kê", {
          align: TableColumnAlign.LEFT,
          showBlankOption: true,
        }),
        size: 180,
        enableResizing: true,
        cell: (row: any) => (
          <span className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">
            {row.correspondentName || row.partnerName || "---"}
          </span>
        ),
      },
      {
        key: "description",
        header: focusedHeaderFilter("description", "Nội dung giao dịch", {
          align: TableColumnAlign.LEFT,
          showBlankOption: true,
        }),
        size: 220,
        enableResizing: true,
        cell: (row: any) => (
          <span className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
            {row.description || "---"}
          </span>
        ),
      },
      {
        key: "amount",
        header: focusedHeaderFilter.amount(
          "amount",
          direction === "IN" ? "Tiền chi" : "Tiền thu",
          { align: TableColumnAlign.RIGHT },
        ),
        size: 110,
        enableResizing: true,
        cell: (row: any) => {
          const amt =
            Number(direction === "IN" ? row.debitAmount : row.creditAmount) ||
            0;
          return (
            <div className="text-right font-bold font-mono text-xs text-slate-900 dark:text-slate-100">
              {money(amt)}
            </div>
          );
        },
      },
      {
        key: "netOffAmount",
        header: (
          <span className="block text-right font-bold">Tiền cấn trừ</span>
        ),
        size: 130,
        enableResizing: true,
        cell: (row: any) => {
          if (!focusedInvoiceId) return null;
          const selectedData = (netOffMap[focusedInvoiceId] || {})[row.id];
          const isLinked = focusedExistingList.some(
            (v) => (v.bankTransactionId || v.id) === row.id,
          );

          if (isLinked) {
            const currentAmt =
              (updatedNetOffs[focusedInvoiceId]?.[row.id] !== undefined
                ? updatedNetOffs[focusedInvoiceId]?.[row.id]
                : Number(row.netOffAmount || row.net_off_amount)) || 0;
            return (
              <div className="text-right font-bold font-mono text-xs text-emerald-600">
                {money(currentAmt)}
              </div>
            );
          }

          if (!selectedData)
            return <span className="text-slate-300 text-center block">—</span>;

          return (
            <NetOffInput
              initialValue={selectedData.amount}
              maxAmount={selectedData.maxAmount ?? selectedData.amount}
              onChange={(val: number) => {
                setIsDirty(true);
                setNetOffMap((prev) => {
                  const newMap = { ...prev };
                  const invMap = { ...(newMap[focusedInvoiceId] || {}) };
                  invMap[row.id] = { ...selectedData, amount: val };
                  newMap[focusedInvoiceId] = invMap;
                  return newMap;
                });
              }}
            />
          );
        },
      },
    ],
    [
      focusedExistingList,
      focusedInvoiceId,
      netOffMap,
      direction,
      updatedNetOffs,
      focusedHeaderFilter,
      handleToggleFocusedRow,
    ],
  );

  // Row Actions (Floating Actions & Context Menu) cho Bảng Giao Dịch Sao Kê (Mode B)
  const getFocusedRowActions = useCallback(
    (row: any): ActionDropdownItem[] => {
      const isLinked = focusedExistingList.some(
        (v) => (v.bankTransactionId || v.id) === row.id,
      );
      const isSelected = !!(netOffMap[focusedInvoiceId || ""] || {})[row.id];

      return [
        {
          groupLabel: "TRA CỨU",
          items: [
            {
              label: "Xem chi tiết giao dịch",
              icon: <Eye className="w-3.5 h-3.5" />,
              onClick: () => setDetailTxnId(row.id),
            },
          ],
        },
        ...(!isLinked
          ? [
              {
                groupLabel: "THAO TÁC",
                items: [
                  {
                    label: isSelected
                      ? "Bỏ chọn giao dịch này"
                      : "Chọn giao dịch cấn trừ",
                    icon: isSelected ? (
                      <RotateCcw className="w-3.5 h-3.5 text-destructive" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ),
                    variant: isSelected ? ("danger" as const) : undefined,
                    onClick: () => handleToggleFocusedRow(row),
                  },
                ],
              },
            ]
          : []),
      ];
    },
    [focusedExistingList, focusedInvoiceId, handleToggleFocusedRow, netOffMap],
  );

  // ─── 10. Mutation Submit Cấn Trừ Hàng Loạt ───
  const submitMutation = useMutation({
    mutationFn: async () => {
      const promises: Promise<any>[] = [];

      // 1. Delete removed links
      for (const [invId, txnIds] of Object.entries(deletedNetOffs)) {
        for (const txnId of txnIds) {
          promises.push(erpInvoicesCoreApi.removeVoucherLink(invId, txnId));
        }
      }

      // 2. Collect all upserts
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

      // 3. Link vouchers
      for (const [invId, payload] of Object.entries(allUpserts)) {
        if (payload.length > 0) {
          promises.push(erpInvoicesCoreApi.linkVouchers(invId, payload));
        }
      }

      await Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Cấn trừ hàng loạt thành công!");
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
      label: t("common:cancel", "Hủy"),
      variant: "outline",
      onClick: onClose,
      disabled: submitMutation.isPending,
    },
    {
      label: submitMutation.isPending
        ? t("common:saving", "Đang lưu cấn trừ...")
        : t("confirmBulkNetOffWithCount", "Xác nhận cấn trừ ({{count}} HĐ)", {
            count:
              Object.keys(netOffMap).length || fullyNettedOff || totalInvoices,
          }),
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

  // Quick Preset Items cho Bulk Matrix Table
  const bulkPresetItems: {
    key: BulkViewPreset;
    label: string;
    icon: any;
    count: number;
  }[] = [
    {
      key: "all",
      label: t("presetAll", "Tất cả"),
      icon: Landmark,
      count: totalInvoices,
    },
    {
      key: "suggestions",
      label: t("presetSuggestions", "Có gợi ý"),
      icon: Sparkles,
      count: withSuggestionsCount,
    },
    {
      key: "selected",
      label: t("presetSelected", "Đang chọn"),
      icon: CheckCircle2,
      count: invoicesWithSelection,
    },
    {
      key: "netted",
      label: t("presetNetted", "Đã cấn đủ"),
      icon: CheckCircle2,
      count: fullyNettedOff,
    },
    {
      key: "unnetted",
      label: t("presetUnnetted", "Chưa cấn"),
      icon: Receipt,
      count: unnettedCount,
    },
  ];

  // Quick Preset Items cho Focused Table
  const focusedPresetItems: {
    key: FocusedViewPreset;
    label: string;
    icon: any;
    count: number;
  }[] = [
    {
      key: "all",
      label: t("presetAll", "Tất cả"),
      icon: Landmark,
      count: focusedTotalVouchers,
    },
    {
      key: "suggestions",
      label: t("presetSuggestions", "Gợi ý khớp"),
      icon: Sparkles,
      count: focusedSuggestionsList.length,
    },
    {
      key: "selected",
      label: t("presetSelected", "Đang chọn"),
      icon: CheckCircle2,
      count: focusedSelectedList.length,
    },
    {
      key: "linked",
      label: t("presetLinked", "Đã cấn trừ"),
      icon: Receipt,
      count: focusedExistingList.length,
    },
  ];

  return (
    <>
      <StandardFormDrawer
        open={open}
        onClose={onClose}
        mode="create"
        collapsibleRightPanel={true}
        title={t("bulkNetOffTitle", "Đối soát dòng tiền hàng loạt")}
        subtitle={t(
          "bulkNetOffSubtitle",
          "Đề xuất cấn trừ sao kê cho {{count}} hóa đơn đã chọn",
          { count: selectedInvoices.length },
        )}
        layout="2-columns"
        size="xl"
        actions={actions}
        confirmOnClose={isDirty}
        rightPanelTitle="ĐỐI SOÁT & CÔNG NỢ HÀNG LOẠT"
        rightPanelDefaultCollapsed={false}
        rightPanel={
          <div className="space-y-4 pb-3">
            {/* ─── SECTION 1: ĐỐI SOÁT THÔNG MINH & 1-CLICK AUTO APPLY ─── */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>
                    {t("smartReconciliationTitle", "Đối soát thông minh")}
                  </span>
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="space-y-3 pt-0.5">
                <div className="p-2.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-1">
                  <span className="font-semibold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Database Matching Engine
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-tight">
                    Tự động dò tìm số tiền, số HĐ và tên đối tác trên toàn bộ
                    lịch sử sao kê ngân hàng.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Trạng thái gợi ý:
                  </span>
                  {isLoadingSuggestions || isLoadingMissingInvoices ? (
                    <span className="text-[11px] flex items-center text-blue-600 font-medium">
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                      Đang phân tích...
                    </span>
                  ) : (
                    <span className="text-[11px] flex items-center text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Đã hoàn tất ({withSuggestionsCount} gợi ý)
                    </span>
                  )}
                </div>

                {withSuggestionsCount > 0 && (
                  <Button
                    size="sm"
                    onClick={handleAutoApplyAll}
                    className="w-full h-8 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Áp dụng tất cả gợi ý ({withSuggestionsCount})</span>
                  </Button>
                )}
              </div>
            </DrawerSection>

            {/* ─── SECTION 2: CÔNG NỢ & TIẾN ĐỘ HÀNG LOẠT (TỔNG THỂ) ─── */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {t(
                      "overallDebtProgressTitle",
                      "Công nợ & Tiến độ hàng loạt",
                    )}
                  </span>
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="space-y-2.5 pt-0.5">
                {/* Header Card: Chiều đối soát */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {direction === "IN" ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hóa đơn Mua vào (Chi tiền NCC)</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownLeft className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hóa đơn Bán ra (Thu tiền KH)</span>
                      </>
                    )}
                  </div>

                  <span
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold border",
                      fullyNettedOff === totalInvoices && totalInvoices > 0
                        ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                        : totalNetOffAmt > 0
                          ? "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
                          : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
                    )}
                  >
                    {fullyNettedOff === totalInvoices && totalInvoices > 0
                      ? "✓ ĐÃ CẤN ĐỦ 100%"
                      : `TIẾN ĐỘ ${overallPaymentPercent}%`}
                  </span>
                </div>

                {/* Dòng số liệu & Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Đã cấn trừ ròng:
                    </span>
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
                        {money(totalNetOffAmt)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono ml-1">
                        / {money(totalInvoiceAmt)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200/80 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        fullyNettedOff === totalInvoices && totalInvoices > 0
                          ? "bg-emerald-600"
                          : "bg-slate-700 dark:bg-slate-300",
                      )}
                      style={{
                        width: `${Math.min(overallPaymentPercent, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">
                      Số HĐ đã hoàn tất:
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {fullyNettedOff} / {totalInvoices} HĐ
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600 dark:text-slate-400 font-sans">
                      Công nợ còn lại:
                    </span>
                    <span
                      className={cn(
                        "font-bold text-sm",
                        totalRemainingDebt === 0 && totalInvoiceAmt > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400",
                      )}
                    >
                      {money(totalRemainingDebt)}
                    </span>
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* ─── SECTION 3: CHI TIẾT HÓA ĐƠN ĐANG CHỌN (NẾU FOCUSED) ─── */}
            {focusedInvoice && (
              <DrawerSection
                title={
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span>HĐ #{focusedInvoice.invoiceNo}</span>
                  </div>
                }
                collapsible={true}
                defaultCollapsed={false}
              >
                <div className="space-y-2 pt-0.5 text-xs">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {direction === "IN"
                      ? focusedInvoice.sellerName
                      : focusedInvoice.buyerName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    MST:{" "}
                    {direction === "IN"
                      ? focusedInvoice.sellerTaxCode
                      : focusedInvoice.buyerTaxCode}
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Giá trị HĐ:</span>
                      <span className="font-bold font-mono">
                        {money(Number(focusedInvoice.totalAmount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cấn trừ đợt này:</span>
                      <span className="font-bold font-mono text-primary">
                        {money(getAmounts(focusedInvoice).nettedOff)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Còn lại:</span>
                      <span
                        className={cn(
                          "font-bold font-mono",
                          getAmounts(focusedInvoice).remaining <= 0
                            ? "text-emerald-600"
                            : "text-rose-600",
                        )}
                      >
                        {money(getAmounts(focusedInvoice).remaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </DrawerSection>
            )}

            {/* ─── SECTION 4: QUY TẮC BÙ TRỪ & LƯU Ý KẾ TOÁN ─── */}
            <div className="pt-2 text-xs text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-tight">
                  Sau khi cấn trừ, bút toán nhật ký của từng giao dịch sao kê sẽ
                  được tự động cập nhật và phân tách chi tiết theo từng HĐ.
                </span>
              </div>
            </div>
          </div>
        }
        leftPanel={
          <div className="h-[calc(100vh-140px)] flex flex-col pr-1 space-y-3 overflow-hidden">
            {/* ─── THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + PRESETS ─── */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5 shrink-0">
              {/* Bên trái: Sub-Tabs 1. Sao kê / 2. Sổ quỹ */}
              <div className="flex items-center gap-2">
                <PillTabs
                  size="sm"
                  value={activeSubTab}
                  onValueChange={(val) => setActiveSubTab(val as BulkSubTabKey)}
                  items={[
                    {
                      value: "bank_statement",
                      label: t("tabBankStatement", "1. Sao kê"),
                      icon: Landmark,
                      badgeCount:
                        invoicesWithSelection > 0
                          ? invoicesWithSelection
                          : undefined,
                    },
                    {
                      value: "cash_book",
                      label: t("tabCashBook", "2. Sổ quỹ"),
                      icon: Receipt,
                    },
                  ]}
                />
              </div>

              {/* Bên phải: Quick View Preset Pills khi ở tab Sao kê */}
              {activeSubTab === "bank_statement" && !focusedInvoiceId && (
                <div className="flex items-center gap-1 p-0.5 flex-wrap">
                  {bulkPresetItems.map((preset) => {
                    const isActive = bulkViewPreset === preset.key;
                    const Icon = preset.icon;
                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() => {
                          setBulkViewPreset(preset.key);
                          setBulkPage(1);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap",
                          isActive
                            ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800",
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{preset.label}</span>
                        {preset.count > 0 && (
                          <span
                            className={cn(
                              "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
                              isActive
                                ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
                            )}
                          >
                            {preset.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ─── NỘI DUNG CHÍNH (MODE MATRIX vs MODE FOCUSED) ─── */}
            {activeSubTab === "cash_book" ? (
              <div className="flex-1 flex flex-col min-h-0 h-full w-full pb-1">
                <ComingSoonTabContent
                  title={t("comingSoonCashBookTitle", "Sổ quỹ tiền mặt")}
                  description={t(
                    "comingSoonCashBookDesc",
                    "Tính năng đối soát hàng loạt sổ quỹ tiền mặt đang được phát triển.",
                  )}
                  badge={t("comingSoonBadge", "Sắp ra mắt")}
                  className="flex-1 h-full w-full"
                />
              </div>
            ) : focusedInvoiceId && focusedInvoice ? (
              /* ─── MODE B: CHI TIẾT TỪNG HÓA ĐƠN TRONG DRAWER SECTION ─── */
              <DrawerSection
                title={
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    <Landmark className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Giao dịch sao kê — HĐ #{focusedInvoice.invoiceNo}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      (
                      {focusedViewPreset === "all"
                        ? focusedTotalVouchers
                        : focusedDisplayItems.length}{" "}
                      giao dịch)
                    </span>
                  </div>
                }
                titleExtra={
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setFocusedInvoiceId(null)}
                      className="h-6 text-[11px] px-2 font-medium cursor-pointer"
                    >
                      <ArrowLeft className="w-3 h-3 mr-1" />
                      Quay lại bảng hàng loạt
                    </Button>

                    <div className="flex items-center gap-1 border-l pl-2 border-slate-300 dark:border-slate-600">
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={focusedIndex <= 0}
                        onClick={() =>
                          setFocusedInvoiceId(
                            selectedInvoices[focusedIndex - 1]?.id,
                          )
                        }
                        className="h-6 w-6 p-0 cursor-pointer"
                        title="Hóa đơn trước"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                        {focusedIndex + 1}/{totalInvoices}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={focusedIndex >= totalInvoices - 1}
                        onClick={() =>
                          setFocusedInvoiceId(
                            selectedInvoices[focusedIndex + 1]?.id,
                          )
                        }
                        className="h-6 w-6 p-0 cursor-pointer"
                        title="Hóa đơn tiếp theo"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Presets cho Focused Table */}
                    <div className="flex items-center gap-1 border-l pl-2 border-slate-300 dark:border-slate-600">
                      {focusedPresetItems.map((preset) => {
                        const isActive = focusedViewPreset === preset.key;
                        const Icon = preset.icon;
                        return (
                          <button
                            key={preset.key}
                            type="button"
                            onClick={() => setFocusedViewPreset(preset.key)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer",
                              isActive
                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 dark:hover:bg-slate-700",
                            )}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{preset.label}</span>
                            {preset.count > 0 && (
                              <span className="px-1 rounded-full text-[9px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {preset.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {focusedActiveFilterCount > 0 && (
                      <div className="border-l pl-2 border-slate-300 dark:border-slate-600">
                        <FilterButton
                          activeCount={focusedActiveFilterCount}
                          onClick={() => {}}
                          onClear={() => {
                            focusedTableState.resetFilters();
                            setFocusedDateFrom("");
                            setFocusedDateTo("");
                            setFocusedPage(1);
                          }}
                        />
                      </div>
                    )}
                  </div>
                }
                collapsible={true}
                defaultCollapsed={false}
                className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
                bodyClassName="p-0"
              >
                <div className="h-[calc(100vh-280px)] min-h-[300px] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                  <StandardTable<any>
                    tableId="bulk-focused-invoice-settlement-table"
                    variant="spreadsheet"
                    items={focusedDisplayItems}
                    getRowKey={(r: any) => r.id}
                    loading={
                      isLoadingFocusedVouchers && focusedViewPreset === "all"
                    }
                    emptyLabel="Không tìm thấy giao dịch sao kê phù hợp"
                    page={focusedViewPreset === "all" ? focusedPage : 1}
                    pageSize={
                      focusedViewPreset === "all"
                        ? focusedPageSize
                        : focusedDisplayItems.length || 50
                    }
                    total={
                      focusedViewPreset === "all"
                        ? focusedTotalVouchers
                        : focusedDisplayItems.length
                    }
                    totalPages={
                      focusedViewPreset === "all" ? focusedTotalPages : 1
                    }
                    onPage={
                      focusedViewPreset === "all"
                        ? (p: number) => setFocusedPage(p)
                        : undefined
                    }
                    onPageSize={
                      focusedViewPreset === "all"
                        ? (ps: number) => {
                            setFocusedPageSize(ps);
                            setFocusedPage(1);
                          }
                        : undefined
                    }
                    columns={focusedColumns}
                    actions={getFocusedRowActions}
                    hideLegacyActionColumn={true}
                    containerClassName="flex-1 min-h-0"
                  />
                </div>
              </DrawerSection>
            ) : (
              /* ─── MODE A: BẢNG TỔNG QUAN HÀNG LOẠT TRONG DRAWER SECTION ─── */
              <DrawerSection
                title={
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    <Landmark className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {t(
                        "bulkInvoicesList",
                        "Danh sách hóa đơn đối soát hàng loạt",
                      )}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({displayedInvoices.length} {t("records", "hóa đơn")})
                    </span>
                  </div>
                }
                titleExtra={
                  <div className="flex items-center gap-2">
                    {bulkActiveFilterCount > 0 && (
                      <FilterButton
                        activeCount={bulkActiveFilterCount}
                        onClick={() => {}}
                        onClear={() => {
                          bulkTableState.resetFilters();
                          setBulkDateFrom("");
                          setBulkDateTo("");
                          setBulkPage(1);
                        }}
                      />
                    )}
                  </div>
                }
                collapsible={true}
                defaultCollapsed={false}
                className="p-2.5 mb-0 border border-slate-200/80 dark:border-slate-800"
                bodyClassName="p-0"
              >
                <div className="h-[calc(100vh-280px)] min-h-[300px] flex flex-col overflow-hidden bg-white dark:bg-slate-900">
                  <StandardTable<ErpInvoice>
                    tableId="invoice-bulk-netoff-matrix-table"
                    items={paginatedInvoices}
                    columns={bulkColumns}
                    getRowKey={(r) => r.id}
                    variant="spreadsheet"
                    enableColumnResizing={true}
                    page={bulkPage}
                    pageSize={bulkPageSize}
                    total={displayedInvoices.length}
                    totalPages={bulkTotalPages}
                    onPage={(p) => setBulkPage(p)}
                    onPageSize={(ps) => {
                      setBulkPageSize(ps);
                      setBulkPage(1);
                    }}
                    actions={getBulkRowActions}
                    hideLegacyActionColumn={true}
                    emptyLabel="Không có hóa đơn nào phù hợp với bộ lọc"
                    containerClassName="flex-1 min-h-0"
                  />
                </div>
              </DrawerSection>
            )}
          </div>
        }
      />

      <BankTransactionDetailDrawer
        transactionId={detailTxnId!}
        isOpen={!!detailTxnId}
        onClose={() => setDetailTxnId(null)}
      />

      <ErpInvoiceStandaloneDrawer
        isOpen={!!detailInvoiceId}
        invoiceId={detailInvoiceId}
        onClose={() => setDetailInvoiceId(null)}
      />
    </>
  );
}
