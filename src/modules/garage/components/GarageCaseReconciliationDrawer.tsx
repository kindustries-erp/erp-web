import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { StandardTable } from "@/shared/components/StandardTable";
import { type DataTableColumn } from "@/shared/components/DataTable";
import { TableColumnHeaderFilter } from "@/shared/components/DataTable/TableColumnHeaderFilter";
import { TableDateCell } from "@/shared/components/DataTable/TableDateCell";
import { DateRangeColumnSlot } from "@/shared/components/DataTable/DateRangeColumnSlot";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Tooltip } from "@/core/components/ui/Tooltip";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { FilterButton } from "@/shared/components/FilterPanel";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import toast from "react-hot-toast";
import {
  Sparkles,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Link2,
  Eye,
  ExternalLink,
  Landmark,
  Receipt,
  SlidersHorizontal,
  Trash2,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";

import {
  erpInvoicesCoreApi,
  type ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import { bankStatementApi } from "@/modules/bank-statements/api/bankStatementApi";
import { garageApi } from "@/modules/garage/api/garageApi";
import { SmartSuggestionCard } from "@/modules/erp-invoices-core/components/SmartSuggestionCard";
import { SmartInvoiceSuggestionCard } from "./SmartInvoiceSuggestionCard";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";

// ─── BẢNG CÁC GIAO DỊCH SAO KÊ ĐÃ CHỌN (CHUẨN STANDARDIZE-TABLE SOP) ─────────
function SelectedBankTransactionsTable({
  items,
  netOffAmounts,
  maxAmounts,
  onAmountChange,
  onRemove,
  onViewDetail,
}: {
  items: any[];
  netOffAmounts: Record<string, number>;
  maxAmounts: Record<string, number>;
  onAmountChange: (txn: any, val: number) => void;
  onRemove: (txn: any) => void;
  onViewDetail: (id: string) => void;
}) {
  const columns: DataTableColumn<any>[] = useMemo(
    () => [
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_, idx) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx + 1}
          </span>
        ),
      },
      {
        key: "transDate",
        header: "Ngày GD",
        size: 95,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (row) =>
          row.transDate ? format(new Date(row.transDate), "dd/MM/yyyy") : "—",
      },
      {
        key: "account",
        header: "Nguồn",
        size: 140,
        cell: (row) => (
          <div className="flex flex-col text-xs leading-tight">
            <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.bankName || "Ngân hàng"
                : row.cashBook?.name || "Sổ quỹ"}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono truncate">
              {row.sourceType === "BANK"
                ? row.bankAccount?.accountNumber || "---"
                : "Tiền mặt"}
            </span>
          </div>
        ),
      },
      {
        key: "referenceNumber",
        header: "Tham chiếu",
        size: 180,
        cell: (row) =>
          row.referenceNumber ? (
            <Tooltip content={`Số tham chiếu: ${row.referenceNumber}`}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(row.id);
                }}
                className="font-mono font-semibold text-primary hover:underline cursor-pointer text-xs truncate max-w-full block text-left"
              >
                {row.referenceNumber}
              </button>
            </Tooltip>
          ) : (
            <span className="text-muted-foreground font-mono text-xs">—</span>
          ),
      },
      {
        key: "description",
        header: "Nội dung",
        size: 380,
        cell: (row) => (
          <Tooltip content={row.description || "—"}>
            <div className="text-xs text-slate-600 dark:text-slate-300 truncate cursor-default max-w-full">
              {row.description || "—"}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "originalAmount",
        header: "Số tiền gốc",
        size: 120,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const isCredit = Number(row.creditAmount || 0) > 0;
          const originalAmount = isCredit
            ? Number(row.creditAmount || 0)
            : Number(row.debitAmount || 0);
          return (
            <span
              className={cn(
                "text-xs font-mono font-semibold tabular-nums",
                isCredit
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-[#ea580c] dark:text-orange-400",
              )}
            >
              {isCredit ? `+${money(originalAmount)}` : money(originalAmount)}
            </span>
          );
        },
      },
      {
        key: "netOffAmount",
        header: "Tiền cấn trừ",
        size: 140,
        headerClassName: "text-right",
        className: "text-right",
        cell: (row) => {
          const netOffVal =
            netOffAmounts[row.id] !== undefined ? netOffAmounts[row.id] : 0;
          const maxVal = maxAmounts[row.id];
          return (
            <div className="w-full">
              <NetOffInput
                initialValue={netOffVal}
                maxAmount={maxVal}
                onChange={(val) => onAmountChange(row, val)}
              />
            </div>
          );
        },
      },
    ],
    [netOffAmounts, maxAmounts, onAmountChange, onViewDetail],
  );

  if (items.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic text-center py-3 px-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border">
        Chưa có giao dịch nào được chọn. Hãy tick chọn các dòng từ bảng danh
        sách bên dưới hoặc từ gợi ý thông minh.
      </div>
    );
  }

  return (
    <StandardTable
      tableId="garage-reconciliation-selected-bank-txns-table"
      items={items}
      columns={columns}
      getRowKey={(row: any) => row.id}
      variant="spreadsheet"
      enableColumnResizing={true}
      enableRowHoverActions={true}
      enableRowContextMenu={true}
      hideLegacyActionColumn={true}
      actions={(row) => [
        {
          label: "Xem chi tiết giao dịch",
          icon: <Eye className="w-4 h-4" />,
          onClick: () => onViewDetail(row.id),
        },
        {
          label: "Bỏ chọn giao dịch",
          icon: <Trash2 className="w-4 h-4 text-rose-600" />,
          variant: "danger",
          onClick: () => onRemove(row),
        },
      ]}
      minWidth={1150}
      containerClassName="max-h-[155px] overflow-y-auto scrollbar-thin"
    />
  );
}

// ─── BẢNG CÁC HÓA ĐƠN ĐÃ CHỌN (CHUẨN STANDARDIZE-TABLE SOP) ───────────────────
function SelectedInvoicesTable({
  invoices,
  onRemove,
  onViewDetail,
}: {
  invoices: ErpInvoice[];
  onRemove: (inv: ErpInvoice) => void;
  onViewDetail: (id: string) => void;
}) {
  const columns: DataTableColumn<ErpInvoice>[] = useMemo(
    () => [
      {
        key: "stt",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        enableResizing: false,
        cell: (_, idx) => (
          <span className="w-full block text-center font-mono text-xs text-muted-foreground">
            {idx}
          </span>
        ),
      },
      {
        key: "invoiceNo",
        header: "Số & Ký hiệu HĐ",
        size: 180,
        cell: (inv) => (
          <Tooltip
            content={`Hóa đơn: #${inv.invoiceNo || inv.id?.slice(0, 8)}${
              inv.serialNo ? ` (Ký hiệu: ${inv.serialNo})` : ""
            }`}
          >
            <div className="flex items-center gap-1 font-mono text-xs truncate max-w-full">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail(inv.id);
                }}
                className="font-semibold text-primary hover:underline cursor-pointer truncate"
              >
                #{inv.invoiceNo || inv.id?.slice(0, 8)}
              </button>
              {inv.serialNo && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  ({inv.serialNo})
                </span>
              )}
            </div>
          </Tooltip>
        ),
      },
      {
        key: "invoiceDate",
        header: "Ngày phát hành",
        size: 100,
        headerClassName: "text-center",
        className:
          "text-center font-mono text-xs text-slate-600 dark:text-slate-400",
        cell: (inv) =>
          inv.invoiceDate
            ? format(new Date(inv.invoiceDate), "dd/MM/yyyy")
            : "—",
      },
      {
        key: "partnerName",
        header: "Đối tác",
        size: 160,
        cell: (inv) => {
          const partnerName = inv.sellerName || inv.buyerName || "—";
          return (
            <Tooltip content={partnerName || "—"}>
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate block max-w-[160px] cursor-default">
                {partnerName}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "description",
        header: "Nội dung",
        size: 380,
        cell: (inv) => (
          <Tooltip content={inv.description || "—"}>
            <span className="text-xs text-slate-600 dark:text-slate-300 truncate block max-w-full cursor-default">
              {inv.description || "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "totalAmount",
        header: "Tổng tiền VAT",
        size: 130,
        headerClassName: "text-right",
        className: "text-right",
        cell: (inv) => (
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 tabular-nums">
            {money(inv.totalAmount || 0)}
          </span>
        ),
      },
    ],
    [onViewDetail],
  );

  if (invoices.length === 0) {
    return (
      <div className="text-xs text-muted-foreground italic text-center py-3 px-3 bg-slate-50/50 dark:bg-slate-900/30 rounded-lg border border-dashed border-border">
        Chưa có hóa đơn nào được chọn. Hãy tick chọn các dòng từ bảng danh sách
        bên dưới hoặc từ gợi ý thông minh.
      </div>
    );
  }

  return (
    <StandardTable
      tableId="garage-reconciliation-selected-invoices-table"
      items={invoices}
      columns={columns}
      getRowKey={(inv: ErpInvoice) => inv.id}
      variant="spreadsheet"
      enableColumnResizing={true}
      enableRowHoverActions={true}
      enableRowContextMenu={true}
      hideLegacyActionColumn={true}
      actions={(inv) => [
        {
          label: "Xem chi tiết hóa đơn",
          icon: <Eye className="w-4 h-4" />,
          onClick: () => onViewDetail(inv.id),
        },
        {
          label: "Bỏ chọn hóa đơn",
          icon: <Trash2 className="w-4 h-4 text-rose-600" />,
          variant: "danger",
          onClick: () => onRemove(inv),
        },
      ]}
      minWidth={1050}
      containerClassName="max-h-[155px] overflow-y-auto scrollbar-thin"
    />
  );
}

export type ReconciliationTabKey =
  | "bank_cash"
  | "manual_cashflow"
  | "invoices_out"
  | "invoices_in";

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

export interface InvoiceLinkPayloadItem {
  invoiceId: string;
  linkType: "IN" | "OUT";
  note?: string;
  invoice?: ErpInvoice;
}

export interface GarageCaseReconciliationDrawerProps {
  open: boolean;
  onClose: () => void;
  caseId?: string;
  caseCode?: string;
  initialTab?: ReconciliationTabKey;
  defaultType?: "RECEIPT" | "PAYMENT";
  suggestedAmount?: number;
  remainingReceivable?: number;
  remainingPayable?: number;
  existingTxnIds?: string[];
  editingItem?: SettlementSubmissionItem | null;
  onSuccess?: () => void;
  onSubmitSettlements?: (
    items: SettlementSubmissionItem[],
  ) => Promise<void> | void;
  onSubmitInvoices?: (
    payloads: InvoiceLinkPayloadItem[] | InvoiceLinkPayloadItem,
  ) => Promise<void> | void;
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
      const three = readThreeDigits(g, isHighest);
      result += three + " " + units[i] + " ";
    }
  }

  result = result.trim();
  if (result.length > 0) {
    result = result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
  }
  return result;
}

function NetOffInput({
  initialValue,
  maxAmount,
  onChange,
}: {
  initialValue: number | string;
  maxAmount?: number;
  onChange: (val: number) => void;
}) {
  const [val, setVal] = useState<string>(
    initialValue !== "" && initialValue !== undefined
      ? String(initialValue)
      : "",
  );

  useEffect(() => {
    setVal(
      initialValue !== "" && initialValue !== undefined
        ? String(initialValue)
        : "",
    );
  }, [initialValue]);

  const handleBlur = () => {
    let parsed = parseFloat(val) || 0;
    if (parsed < 0) parsed = 0;
    if (maxAmount !== undefined && maxAmount > 0 && parsed > maxAmount) {
      parsed = maxAmount;
    }
    setVal(parsed > 0 ? String(parsed) : "");
    onChange(parsed);
  };

  return (
    <input
      type="number"
      className={cn(
        "w-full text-right h-6 px-1.5 text-xs font-mono font-bold transition-all rounded",
        "bg-transparent border border-transparent hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/70 dark:hover:bg-slate-900/50",
        "focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none",
        "text-slate-800 dark:text-slate-100 placeholder:text-muted-foreground/30 tabular-nums",
      )}
      value={val}
      placeholder={maxAmount ? money(maxAmount) : "0"}
      min={0}
      max={maxAmount || undefined}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

export function GarageCaseReconciliationDrawer({
  open,
  onClose,
  caseId,
  caseCode,
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

  // Active Tab State (Top Header Tabs)
  const [activeTab, setActiveTab] = useState<ReconciliationTabKey>(initialTab);

  // Sync initialTab when drawer opens
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

  // Query Bank Transactions
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
  const [previewPdf, setPreviewPdf] = useState<{
    url: string;
    filename: string;
    fileKey: string;
    invoiceId: string;
    isAttachment?: boolean;
  } | null>(null);

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

      // Default allocate min(remaining, currentRemaining)
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

  // ─── TAB 1: BANK TABLE COLUMNS & HEADER ───────────────────────────────────
  const renderBankHeaderFilter = (key: string, label: string) => {
    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={
          bankTableState.sorts[0] === key
            ? "asc"
            : bankTableState.sorts[0] === `-${key}`
              ? "desc"
              : "none"
        }
        onSortChange={(state) =>
          bankTableState.setSort(key, state as "asc" | "desc" | "none")
        }
        searchValue={bankTableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          bankTableState.setColumnSearch(key, val);
          setBankPage(1);
        }}
        selectedFilters={bankTableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          bankTableState.setColumnFilter(key, vals);
          setBankPage(1);
        }}
        columnKey={key}
        allFilters={bankTableState.columnFilters}
        fetchOptions={async ({ columnKey, search, pageParam, filtersStr }) =>
          bankStatementApi.getColumnOptions(
            columnKey,
            search,
            pageParam,
            20,
            filtersStr,
          )
        }
        queryKeyPrefix="garage-reconciliation-bank-column-options"
      />
    );
  };

  const isAllBankSelected =
    vouchers.length > 0 &&
    vouchers.every((row: any) => selectedIds.includes(row.id));

  const bankColumns: any[] = [
    {
      key: "selection",
      header: (
        <div
          className="flex items-center justify-center p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllBankSelected}
            onCheckedChange={(c: any) => handleSelectAllBankTxns(!!c)}
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
              onCheckedChange={(c: any) => handleSelectBankTxn(row, !!c)}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "account",
      header: renderBankHeaderFilter(
        "account",
        t("cases.reconciliation.source", "Nguồn"),
      ),
      size: 130,
      cell: (row: any) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
            {row.sourceType === "BANK"
              ? row.bankAccount?.bankName || "---"
              : row.cashBook?.name || "Sổ quỹ tiền mặt"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {row.sourceType === "BANK"
              ? row.bankAccount?.accountNumber || "Ngân hàng"
              : "Tiền mặt"}
          </span>
        </div>
      ),
    },
    {
      key: "transDate",
      dataIndex: "transDate",
      header: (
        <TableColumnHeaderFilter
          title={t("cases.reconciliation.date", "Ngày GD")}
          align="center"
          className="w-full justify-center"
          sortState={
            bankTableState.sorts[0] === "transDate"
              ? "asc"
              : bankTableState.sorts[0] === "-transDate"
                ? "desc"
                : "none"
          }
          onSortChange={(state) =>
            bankTableState.setSort(
              "transDate",
              state as "asc" | "desc" | "none",
            )
          }
          searchValue=""
          onSearchChange={() => {}}
          selectedFilters={[]}
          onFilterChange={() => {}}
          hideFilter={true}
          hideFooter={true}
          isActive={Boolean(bankDateFrom || bankDateTo)}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={bankDateFrom}
              dateTo={bankDateTo}
              onChange={(from, to) => {
                setBankDateFrom(from);
                setBankDateTo(to);
                setBankPage(1);
              }}
              onClose={close}
            />
          )}
        />
      ),
      cell: (row: any) => (
        <TableDateCell
          date={row.transDate}
          format="date"
          className="justify-end w-full font-mono text-xs text-slate-600 dark:text-slate-400"
        />
      ),
      size: 110,
      className: "text-right",
      sortable: false,
    },
    {
      key: "referenceNumber",
      header: renderBankHeaderFilter(
        "referenceNumber",
        t("cases.reconciliation.refNumber", "Tham chiếu"),
      ),
      size: 150,
      cell: (row: any) => {
        // Smart check: Does this transaction already match / netoff with an Invoice?
        const hasLinkedInvoice =
          Number(row.netOffAmount || 0) > 0 ||
          Boolean(row.invoiceNo || row.linkedInvoiceNo);
        const invoiceNo = row.invoiceNo || row.linkedInvoiceNo;

        return (
          <div className="flex items-center gap-1.5 min-w-0">
            {row.referenceNumber ? (
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline truncate cursor-pointer text-left font-mono"
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailTxnId(row.id);
                }}
                title={row.referenceNumber}
              >
                {row.referenceNumber}
              </button>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}

            {/* Smart Cross-Navigation Trigger if transaction is linked to an invoice */}
            {hasLinkedInvoice && (
              <Tooltip
                content={
                  invoiceNo
                    ? `Đã cấn trừ với HĐ số: ${invoiceNo}. Nhấn để chuyển sang Tab Hóa đơn`
                    : "Giao dịch này đã có cấn trừ hóa đơn. Nhấn để chuyển sang Tab Hóa đơn đối soát"
                }
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToInvoiceTab(
                      settlementType === "RECEIPT" ? "OUT" : "IN",
                      invoiceNo,
                    );
                  }}
                  className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:bg-blue-100 transition-colors border border-blue-200 dark:border-blue-800 shrink-0 cursor-pointer"
                >
                  <Link2 className="w-2.5 h-2.5" />
                  <span>{invoiceNo ? `#${invoiceNo}` : "Xem HĐ"}</span>
                </button>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      key: "correspondentName",
      header: renderBankHeaderFilter(
        "correspondentName",
        t("cases.reconciliation.partner", "Đối tác"),
      ),
      size: 160,
      cell: (row: any) => (
        <span
          className="text-xs text-slate-700 dark:text-slate-300 truncate block font-medium"
          title={row.correspondentName || ""}
        >
          {row.correspondentName || "—"}
        </span>
      ),
    },
    {
      key: "description",
      dataIndex: "description",
      header: renderBankHeaderFilter(
        "description",
        t("cases.reconciliation.description", "Nội dung"),
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
      header: renderBankHeaderFilter(
        "thu",
        t("cases.reconciliation.thu", "Thu"),
      ),
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        if (credit > 0)
          return (
            <span className="text-emerald-600 font-medium font-mono">
              +{money(credit)}
            </span>
          );
        return null;
      },
      className: "text-right",
      size: 120,
      sortable: false,
    },
    {
      key: "chi",
      header: renderBankHeaderFilter(
        "chi",
        t("cases.reconciliation.chi", "Chi"),
      ),
      cell: (row: any) => {
        const debit = parseFloat(row.debitAmount) || 0;
        if (debit > 0)
          return (
            <span className="text-[#ea580c] font-medium font-mono">
              {money(debit)}
            </span>
          );
        return null;
      },
      className: "text-right",
      size: 120,
      sortable: false,
    },
    {
      key: "netOffAmount",
      header: renderBankHeaderFilter(
        "netOffAmount",
        t("cases.reconciliation.alreadyNetOff", "Đã cấn trừ"),
      ),
      className: "text-right",
      headerClassName: "text-center",
      size: 120,
      cell: (row: any) => {
        const netOff = parseFloat(row.netOffAmount) || 0;
        if (netOff === 0) return "--";
        return (
          <span className="text-blue-600 font-medium font-mono">
            {money(netOff)}
          </span>
        );
      },
    },
    {
      key: "remainingAmount",
      header: renderBankHeaderFilter(
        "remainingAmount",
        t("cases.reconciliation.remaining", "Còn lại"),
      ),
      className: "text-right font-semibold",
      headerClassName: "text-center",
      size: 120,
      cell: (row: any) => {
        const credit = parseFloat(row.creditAmount) || 0;
        const debit = parseFloat(row.debitAmount) || 0;
        const amount = credit > 0 ? credit : debit;
        const netOff = parseFloat(row.netOffAmount) || 0;
        const remaining = amount - netOff;
        if (remaining === 0)
          return <span className="text-emerald-600 font-medium">0</span>;
        return (
          <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">
            {money(remaining)}
          </span>
        );
      },
    },
    {
      key: "currentNetOff",
      header: renderBankHeaderFilter(
        "currentNetOff",
        t("cases.reconciliation.netOffNow", "Cấn trừ đợt này"),
      ),
      className: "text-right",
      headerClassName: "text-center",
      size: 150,
      cell: (row: any) => {
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
              onChange={(val: number) => handleBankAmountChange(row, val)}
            />
          </div>
        );
      },
    },
  ];

  // ─── TAB 3 & 4: INVOICE TABLE COLUMNS & HEADER ────────────────────────────
  const renderInvoiceHeaderFilter = (key: string, label: string) => {
    return (
      <TableColumnHeaderFilter
        title={label}
        align="center"
        className="w-full justify-center"
        sortState={
          invoiceTableState.sorts[0] === key
            ? "asc"
            : invoiceTableState.sorts[0] === `-${key}`
              ? "desc"
              : "none"
        }
        onSortChange={(state) =>
          invoiceTableState.setSort(key, state as "asc" | "desc" | "none")
        }
        searchValue={invoiceTableState.columnSearch[key] || ""}
        onSearchChange={(val) => {
          invoiceTableState.setColumnSearch(key, val);
          setInvoicePage(1);
        }}
        selectedFilters={invoiceTableState.columnFilters[key] || []}
        onFilterChange={(vals) => {
          invoiceTableState.setColumnFilter(key, vals);
          setInvoicePage(1);
        }}
        columnKey={key}
        allFilters={invoiceTableState.columnFilters}
      />
    );
  };

  const invoiceItems = invoiceData?.items || [];
  const isAllInvoiceSelected =
    invoiceItems.length > 0 &&
    invoiceItems.every((inv: ErpInvoice) => !!selectedInvoicesMap[inv.id]);

  const handleSelectAllInvoices = (checked: boolean) => {
    if (!checked) {
      setSelectedInvoicesMap({});
      return;
    }
    const map: Record<string, ErpInvoice> = {};
    invoiceItems.forEach((inv: ErpInvoice) => {
      map[inv.id] = inv;
    });
    setSelectedInvoicesMap(map);
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

  const invoiceColumns: any[] = [
    {
      key: "selection",
      header: (
        <div
          className="flex items-center justify-center p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isAllInvoiceSelected}
            onCheckedChange={(c: any) => handleSelectAllInvoices(!!c)}
          />
        </div>
      ),
      size: 45,
      cell: (inv: ErpInvoice) => {
        const isSelected = !!selectedInvoicesMap[inv.id];
        return (
          <div
            className="flex justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleToggleInvoice(inv)}
            />
          </div>
        );
      },
      sortable: false,
    },
    {
      key: "invoiceDate",
      header: (
        <TableColumnHeaderFilter
          title={t("cases.reconciliation.invoiceDate", "Ngày HĐ")}
          align="center"
          className="w-full justify-center"
          sortState={
            invoiceTableState.sorts[0] === "invoiceDate"
              ? "asc"
              : invoiceTableState.sorts[0] === "-invoiceDate"
                ? "desc"
                : "none"
          }
          onSortChange={(state) =>
            invoiceTableState.setSort(
              "invoiceDate",
              state as "asc" | "desc" | "none",
            )
          }
          searchValue=""
          onSearchChange={() => {}}
          selectedFilters={[]}
          onFilterChange={() => {}}
          hideFilter={true}
          hideFooter={true}
          isActive={Boolean(invoiceDateFrom || invoiceDateTo)}
          dateRangeSlot={({ close }) => (
            <DateRangeColumnSlot
              dateFrom={invoiceDateFrom}
              dateTo={invoiceDateTo}
              onChange={(from, to) => {
                setInvoiceDateFrom(from);
                setInvoiceDateTo(to);
                setInvoicePage(1);
              }}
              onClose={close}
            />
          )}
        />
      ),
      size: 110,
      cell: (inv: ErpInvoice) => (
        <TableDateCell
          date={inv.invoiceDate}
          format="date"
          className="justify-end w-full font-mono text-xs text-slate-600 dark:text-slate-400"
        />
      ),
      className: "text-right",
      sortable: false,
    },
    {
      key: "invoiceNo",
      header: renderInvoiceHeaderFilter(
        "invoiceNo",
        t("cases.reconciliation.invoiceNo", "Số HĐ"),
      ),
      size: 130,
      cell: (inv: ErpInvoice) => (
        <div className="flex items-center gap-1 min-w-0">
          <button
            type="button"
            className="text-xs font-mono font-bold text-primary hover:underline truncate cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setViewInvoiceId(inv.id);
            }}
          >
            {inv.invoiceNo || "---"}
          </button>
          {inv.pdfFileKey && (
            <Tooltip content="Xem PDF hóa đơn">
              <button
                type="button"
                className="text-slate-400 hover:text-primary transition-colors cursor-pointer p-0.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewPdf({
                    url: `/api/v1/erp-invoices-core/${inv.id}/pdf`,
                    filename: `HD_${inv.invoiceNo || inv.id}.pdf`,
                    fileKey: inv.pdfFileKey || "",
                    invoiceId: inv.id,
                  });
                }}
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          )}
        </div>
      ),
    },
    {
      key: "serialNo",
      header: renderInvoiceHeaderFilter(
        "serialNo",
        t("cases.reconciliation.serialNo", "Ký hiệu"),
      ),
      size: 95,
      cell: (inv: ErpInvoice) => (
        <span className="text-xs font-mono text-slate-500">
          {inv.serialNo || "—"}
        </span>
      ),
    },
    {
      key: "partnerName",
      header: renderInvoiceHeaderFilter(
        "partnerName",
        invoiceDirection === "OUT"
          ? t("cases.reconciliation.buyerName", "Bên mua")
          : t("cases.reconciliation.sellerName", "Bên bán"),
      ),
      size: 200,
      cell: (inv: ErpInvoice) => (
        <span
          className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate block"
          title={
            invoiceDirection === "OUT"
              ? inv.buyerName || inv.buyerPersonalName || ""
              : inv.sellerName || ""
          }
        >
          {invoiceDirection === "OUT"
            ? inv.buyerName || inv.buyerPersonalName || "—"
            : inv.sellerName || "—"}
        </span>
      ),
    },
    {
      key: "licensePlate",
      header: renderInvoiceHeaderFilter(
        "licensePlate",
        t("cases.reconciliation.licensePlate", "Biển số xe"),
      ),
      size: 110,
      cell: (inv: ErpInvoice) =>
        inv.licensePlate ? (
          <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            {inv.licensePlate}
          </span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        ),
    },
    {
      key: "description",
      header: renderInvoiceHeaderFilter(
        "description",
        t("cases.reconciliation.description", "Diễn giải"),
      ),
      size: 230,
      cell: (inv: ErpInvoice) => (
        <div
          className="whitespace-pre-wrap line-clamp-2 text-xs text-slate-600 dark:text-slate-300"
          title={inv.description || ""}
        >
          {inv.description || "—"}
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: renderInvoiceHeaderFilter(
        "totalAmount",
        t("cases.reconciliation.totalAmount", "Tổng tiền VAT"),
      ),
      size: 130,
      cell: (inv: ErpInvoice) => (
        <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 tabular-nums">
          {money(inv.totalAmount)}
        </span>
      ),
      className: "text-right",
    },
  ];

  // ─── MEMOIZED TOP NAVIGATION TABS (Standardize-Drawer SOP) ────────────────
  const drawerTabs: DrawerTopTabItem[] = useMemo(() => {
    return [
      // TAB 1: Cấn trừ Sao kê / Sổ quỹ ERP
      {
        key: "bank_cash",
        label: t(
          "cases.reconciliation.tabBankCash",
          "1. Cấn trừ Sao kê / Sổ quỹ ERP",
        ),
        icon: <Landmark className="w-3.5 h-3.5" />,
        badgeCount: selectedIds.length > 0 ? selectedIds.length : undefined,
        content: (
          <div className="space-y-3 pb-2">
            {/* SECTION 1: CÁC GIAO DỊCH ĐÃ CHỌN ĐỢT NÀY */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {t(
                      "cases.reconciliation.selectedBankListTitle",
                      "Giao dịch đã chọn",
                    )}
                  </span>
                  {selectedIds.length > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/30"
                    >
                      {selectedIds.length} {t("selected", "giao dịch")}
                    </Badge>
                  )}
                  {selectedIds.length > 0 && (
                    <span className="text-xs font-mono font-bold text-primary ml-auto">
                      Tổng: {money(currentSelectedBankTotal)}
                    </span>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0"
            >
              <SelectedBankTransactionsTable
                items={selectedBankItems}
                netOffAmounts={netOffAmounts}
                maxAmounts={maxAmounts}
                onAmountChange={handleBankAmountChange}
                onRemove={(row) => handleSelectBankTxn(row, false)}
                onViewDetail={(id) => setDetailTxnId(id)}
              />
            </DrawerSection>

            {/* SECTION 2: TOÀN BỘ DANH SÁCH SAO KÊ & SỔ QUỸ */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {t(
                      "cases.reconciliation.bankListTitle",
                      "Danh sách giao dịch sao kê & sổ quỹ",
                    )}
                  </span>
                  {bankData?.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({bankData.total} {t("records", "giao dịch")})
                    </span>
                  )}
                </div>
              }
              titleExtra={
                <div className="flex items-center gap-2">
                  {bankTableState.activeFilterCount +
                    (bankDateFrom || bankDateTo ? 1 : 0) >
                    0 && (
                    <FilterButton
                      activeCount={
                        bankTableState.activeFilterCount +
                        (bankDateFrom || bankDateTo ? 1 : 0)
                      }
                      onClick={() => {}}
                      onClear={() => {
                        bankTableState.resetFilters();
                        setBankDateFrom("");
                        setBankDateTo("");
                        setBankPage(1);
                      }}
                    />
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0"
            >
              <div className="h-[calc(100vh-320px)] min-h-[300px] flex flex-col">
                <StandardTable
                  tableId="garage-reconciliation-bank-table"
                  items={vouchers}
                  columns={bankColumns}
                  getRowKey={(row: any) => row.id}
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  loading={isLoadingBank}
                  page={bankPage}
                  pageSize={bankPageSize}
                  total={bankData?.total || 0}
                  totalPages={bankData?.totalPages || 0}
                  onPage={setBankPage}
                  onPageSize={setBankPageSize}
                  minWidth={1150}
                  containerClassName="flex-1 min-h-0"
                />
              </div>
            </DrawerSection>
          </div>
        ),
      },

      // TAB 2: Ghi nhận Ngoài sổ sách
      {
        key: "manual_cashflow",
        label: t(
          "cases.reconciliation.tabManualCash",
          "2. Ghi nhận Ngoài sổ sách",
        ),
        icon: <Receipt className="w-3.5 h-3.5" />,
        content: (
          <div className="space-y-3 pb-2">
            <DrawerSection
              title={t(
                "cases.reconciliation.manualTitle",
                "Thông tin chi tiết Dòng tiền Ngoài sổ sách",
              )}
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0 space-y-4"
            >
              {/* Quick % Selection Buttons */}
              {baseRemaining > 0 && (
                <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {t(
                        "cases.reconciliation.quickPick",
                        "Gợi ý chọn nhanh số tiền",
                      )}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setManualAmount(baseRemaining)}
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
                        {money(baseRemaining)}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setManualAmount(Math.round(baseRemaining * 0.5))
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
                    >
                      50% ({money(Math.round(baseRemaining * 0.5))})
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setManualAmount(Math.round(baseRemaining * 0.3))
                      }
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary text-slate-600 dark:text-slate-300 hover:text-primary transition-all shadow-2xs cursor-pointer"
                    >
                      30% ({money(Math.round(baseRemaining * 0.3))})
                    </button>
                  </div>
                </div>
              )}

              {/* Visual Radio Cards for Channel */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t(
                    "cases.reconciliation.channel",
                    "Phương thức Dòng tiền Ngoài sổ sách *",
                  )}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div
                    onClick={() => setManualCategory("TIEN_MAT_NGOAI")}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                      manualCategory === "TIEN_MAT_NGOAI"
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        💵 Tiền mặt ngoài
                      </span>
                      {manualCategory === "TIEN_MAT_NGOAI" && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Thu/chi tiền mặt trực tiếp không qua sổ quỹ công ty
                    </span>
                  </div>

                  <div
                    onClick={() => setManualCategory("CHUYEN_KHOAN_CA_NHAN")}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                      manualCategory === "CHUYEN_KHOAN_CA_NHAN"
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        🏦 CK Cá nhân
                      </span>
                      {manualCategory === "CHUYEN_KHOAN_CA_NHAN" && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Tài khoản ngân hàng cá nhân ngoài hệ thống ERP
                    </span>
                  </div>

                  <div
                    onClick={() => setManualCategory("KHAC")}
                    className={cn(
                      "p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col gap-1.5",
                      manualCategory === "KHAC"
                        ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-xs"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        ✨ Hình thức khác
                      </span>
                      {manualCategory === "KHAC" && (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      Cấn trừ nợ đối ứng, bù trừ dịch vụ đặc thù
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>
                      {t(
                        "cases.reconciliation.amount",
                        "Số tiền ghi nhận (VNĐ) *",
                      )}
                    </span>
                    {Number(manualAmount) > 0 && (
                      <span className="text-[11px] text-primary font-medium italic">
                        {readVietnameseCurrency(Number(manualAmount))}
                      </span>
                    )}
                  </label>
                  <Input
                    type="number"
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="font-mono text-base font-bold text-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t(
                      "cases.reconciliation.transDate",
                      "Ngày phát sinh giao dịch *",
                    )}
                  </label>
                  <Input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t(
                      "cases.reconciliation.payerOrReceiver",
                      "Người nộp / Người nhận / Đối tác liên quan",
                    )}
                  </label>
                  <Input
                    value={manualPartner}
                    onChange={(e) => setManualPartner(e.target.value)}
                    placeholder="Ví dụ: Anh Nam (Tài xế), Chị Hương..."
                  />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t(
                      "cases.reconciliation.note",
                      "Ghi chú & Diễn giải chi tiết",
                    )}
                  </label>
                  <Textarea
                    value={manualNote}
                    onChange={(e) => setManualNote(e.target.value)}
                    placeholder="Nhập lý do thu/chi ngoài sổ sách..."
                    rows={3}
                  />
                </div>
              </div>
            </DrawerSection>
          </div>
        ),
      },

      // TAB 3: Hóa đơn Bán ra (Doanh thu)
      {
        key: "invoices_out",
        label: t(
          "cases.reconciliation.tabInvoicesOut",
          "3. Hóa đơn Bán ra (Doanh thu)",
        ),
        icon: <ArrowDownLeft className="w-3.5 h-3.5 text-muted-foreground" />,
        badgeCount:
          selectedInvoicesCount > 0
            ? selectedInvoicesCount
            : initialLinkedOutCount > 0
              ? initialLinkedOutCount
              : undefined,
        content: (
          <div className="space-y-3 pb-2">
            {/* SECTION 1: CÁC HÓA ĐƠN BÁN RA ĐÃ CHỌN */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {t(
                      "cases.reconciliation.selectedInvoicesListTitle",
                      "Hóa đơn Bán ra đã chọn",
                    )}
                  </span>
                  {selectedInvoicesCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                    >
                      {selectedInvoicesCount} {t("invoices", "hóa đơn")}
                    </Badge>
                  )}
                  {selectedInvoicesCount > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 ml-auto">
                      Tổng: {money(selectedInvoicesTotal)}
                    </span>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0"
            >
              <SelectedInvoicesTable
                invoices={selectedInvoicesList}
                onRemove={handleToggleInvoice}
                onViewDetail={(id) => setViewInvoiceId(id)}
              />
            </DrawerSection>

            {/* SECTION 2: TOÀN BỘ DANH SÁCH HÓA ĐƠN BÁN RA */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {t(
                      "cases.reconciliation.outInvoicesList",
                      "Danh sách Hóa đơn Bán ra (Doanh thu)",
                    )}
                  </span>
                  {invoiceData?.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({invoiceData.total} {t("invoices", "hóa đơn")})
                    </span>
                  )}
                </div>
              }
              titleExtra={
                <div className="flex items-center gap-2">
                  {invoiceTableState.activeFilterCount +
                    (invoiceDateFrom || invoiceDateTo ? 1 : 0) >
                    0 && (
                    <FilterButton
                      activeCount={
                        invoiceTableState.activeFilterCount +
                        (invoiceDateFrom || invoiceDateTo ? 1 : 0)
                      }
                      onClick={() => {}}
                      onClear={() => {
                        invoiceTableState.resetFilters();
                        setInvoiceDateFrom("");
                        setInvoiceDateTo("");
                        setInvoicePage(1);
                      }}
                    />
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0"
            >
              <div className="h-[calc(100vh-320px)] min-h-[300px] flex flex-col">
                <StandardTable
                  tableId="garage-reconciliation-invoice-out-table"
                  items={invoiceItems}
                  columns={invoiceColumns}
                  getRowKey={(inv: ErpInvoice) => inv.id}
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  loading={isLoadingInvoices}
                  page={invoicePage}
                  pageSize={invoicePageSize}
                  total={invoiceData?.total || 0}
                  totalPages={invoiceData?.totalPages || 0}
                  onPage={setInvoicePage}
                  onPageSize={setInvoicePageSize}
                  minWidth={980}
                  containerClassName="flex-1 min-h-0"
                />
              </div>
            </DrawerSection>
          </div>
        ),
      },

      // TAB 4: Hóa đơn Mua vào (Chi phí)
      {
        key: "invoices_in",
        label: t(
          "cases.reconciliation.tabInvoicesIn",
          "4. Hóa đơn Mua vào (Chi phí)",
        ),
        icon: <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />,
        badgeCount:
          selectedInvoicesCount > 0
            ? selectedInvoicesCount
            : initialLinkedInCount > 0
              ? initialLinkedInCount
              : undefined,
        content: (
          <div className="space-y-3 pb-2">
            {/* SECTION 1: CÁC HÓA ĐƠN MUA VÀO ĐÃ CHỌN */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {t(
                      "cases.reconciliation.selectedInvoicesInListTitle",
                      "Hóa đơn Mua vào đã chọn",
                    )}
                  </span>
                  {selectedInvoicesCount > 0 && (
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                    >
                      {selectedInvoicesCount} {t("invoices", "hóa đơn")}
                    </Badge>
                  )}
                  {selectedInvoicesCount > 0 && (
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 ml-auto">
                      Tổng: {money(selectedInvoicesTotal)}
                    </span>
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0"
            >
              <SelectedInvoicesTable
                invoices={selectedInvoicesList}
                onRemove={handleToggleInvoice}
                onViewDetail={(id) => setViewInvoiceId(id)}
              />
            </DrawerSection>

            {/* SECTION 2: TOÀN BỘ DANH SÁCH HÓA ĐƠN MUA VÀO */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2 flex-wrap">
                  <span>
                    {t(
                      "cases.reconciliation.inInvoicesList",
                      "Danh sách Hóa đơn Mua vào (Chi phí)",
                    )}
                  </span>
                  {invoiceData?.total !== undefined && (
                    <span className="text-xs font-normal text-muted-foreground lowercase">
                      ({invoiceData.total} {t("invoices", "hóa đơn")})
                    </span>
                  )}
                </div>
              }
              titleExtra={
                <div className="flex items-center gap-2">
                  {invoiceTableState.activeFilterCount +
                    (invoiceDateFrom || invoiceDateTo ? 1 : 0) >
                    0 && (
                    <FilterButton
                      activeCount={
                        invoiceTableState.activeFilterCount +
                        (invoiceDateFrom || invoiceDateTo ? 1 : 0)
                      }
                      onClick={() => {}}
                      onClear={() => {
                        invoiceTableState.resetFilters();
                        setInvoiceDateFrom("");
                        setInvoiceDateTo("");
                        setInvoicePage(1);
                      }}
                    />
                  )}
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
              className="mb-0 p-3"
              bodyClassName="p-0"
            >
              <div className="h-[calc(100vh-295px)] min-h-[350px] flex flex-col">
                <StandardTable
                  tableId="garage-reconciliation-invoice-in-table"
                  items={invoiceItems}
                  columns={invoiceColumns}
                  getRowKey={(inv: ErpInvoice) => inv.id}
                  variant="spreadsheet"
                  enableColumnResizing={true}
                  loading={isLoadingInvoices}
                  page={invoicePage}
                  pageSize={invoicePageSize}
                  total={invoiceData?.total || 0}
                  totalPages={invoiceData?.totalPages || 0}
                  onPage={setInvoicePage}
                  onPageSize={setInvoicePageSize}
                  minWidth={980}
                  containerClassName="flex-1 min-h-0"
                />
              </div>
            </DrawerSection>
          </div>
        ),
      },
    ];
  }, [
    t,
    settlementType,
    currentTargetAmount,
    baseRemaining,
    currentSelectedBankTotal,
    currentManualAmount,
    projectedRemaining,
    bankData,
    selectedIds,
    selectedBankItems,
    maxAmounts,
    netOffAmounts,
    bankTableState,
    bankDateFrom,
    bankDateTo,
    vouchers,
    bankColumns,
    isLoadingBank,
    bankPage,
    bankPageSize,
    manualAmount,
    manualCategory,
    manualDate,
    manualPartner,
    manualNote,
    invoiceData,
    selectedInvoicesList,
    selectedInvoicesCount,
    selectedInvoicesTotal,
    activeTab,
    invoiceTableState,
    invoiceDateFrom,
    invoiceDateTo,
    invoiceItems,
    invoiceColumns,
    isLoadingInvoices,
    invoicePage,
    invoicePageSize,
    initialLinkedOutCount,
    initialLinkedInCount,
  ]);

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={t(
          "cases.reconciliation.drawerTitle",
          "Đối soát Dòng tiền & Hóa đơn: {{code}}",
          { code: caseCode || caseId || "" },
        )}
        subtitle={t(
          "cases.reconciliation.drawerSubtitle",
          "Đối soát cấn trừ sao kê ngân hàng, sổ quỹ và liên kết hóa đơn VAT 2 chiều cho {{code}}",
          { code: caseCode || caseId || "" },
        )}
        layout="2-columns"
        size="xl"
        collapsibleRightPanel={true}
        tabs={drawerTabs}
        activeTabKey={activeTab}
        onTabChange={(key) => setActiveTab(key as ReconciliationTabKey)}
        rightPanel={
          <div className="space-y-3 pb-3">
            {/* SECTION 1: CHIỀU ĐỐI SOÁT (MODE SWITCHER CARDS) */}
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5 font-semibold">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {t("cases.reconciliation.directionLabel", "Chiều đối soát")}
                  </span>
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSettlementType("RECEIPT")}
                  className={cn(
                    "p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 border-2",
                    settlementType === "RECEIPT"
                      ? "border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 shadow-xs ring-2 ring-emerald-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-400",
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 transition-colors",
                      settlementType === "RECEIPT"
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500",
                    )}
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Thu tiền</span>
                      {settlementType === "RECEIPT" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Tiền vào từ khách
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSettlementType("PAYMENT")}
                  className={cn(
                    "p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center gap-2 border-2",
                    settlementType === "PAYMENT"
                      ? "border-[#ea580c] bg-orange-50/80 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 shadow-xs ring-2 ring-orange-500/20"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 text-slate-600 dark:text-slate-400",
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 transition-colors",
                      settlementType === "PAYMENT"
                        ? "bg-[#ea580c] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500",
                    )}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>Chi tiền</span>
                      {settlementType === "PAYMENT" && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#ea580c] shrink-0" />
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      Chi phí NCC / thợ
                    </div>
                  </div>
                </button>
              </div>
            </DrawerSection>

            {/* SECTION 2: THÔNG TIN VỤ VIỆC & ĐỐI TÁC */}
            <DrawerSection
              title={t(
                "cases.reconciliation.caseInfoTitle",
                "Thông tin Vụ việc & Đối tác",
              )}
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Mã vụ việc:</span>
                  <span className="font-mono font-bold text-primary">
                    {caseCode || caseId || "—"}
                  </span>
                </div>
                {caseSummary?.licensePlate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Biển số xe:</span>
                    <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                      🚗 {caseSummary.licensePlate}
                    </span>
                  </div>
                )}
                {caseSummary?.customerName && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-muted-foreground shrink-0">
                      Khách hàng:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-right truncate">
                      {caseSummary.customerName}
                    </span>
                  </div>
                )}
                <div className="pt-1.5 border-t border-border flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">
                    Doanh thu mục tiêu:
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {targetRevenue > 0 ? money(targetRevenue) : "—"}
                  </span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-muted-foreground">
                    Chi phí mục tiêu:
                  </span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                    {targetCost > 0 ? money(targetCost) : "—"}
                  </span>
                </div>
              </div>
            </DrawerSection>

            {/* SECTION 3: TIẾN ĐỘ & MỤC TIÊU TÀI CHÍNH */}
            <DrawerSection
              title={
                <div className="flex items-center gap-1.5 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>
                    {t(
                      "cases.reconciliation.progressTitle",
                      "Tiến độ & Mục tiêu Tài chính",
                    )}
                  </span>
                </div>
              }
              collapsible={true}
              defaultCollapsed={false}
            >
              <div className="space-y-2.5 text-xs">
                {/* Thu tiền / Doanh thu */}
                <div
                  className={cn(
                    "p-3 rounded-xl border space-y-2 transition-all",
                    settlementType === "RECEIPT" &&
                      (activeTab === "bank_cash" ||
                        activeTab === "manual_cashflow")
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 shadow-xs"
                      : "bg-card border-border/70",
                  )}
                >
                  <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>Thu tiền (Doanh thu)</span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-200">
                      {targetRevenue > 0 ? money(targetRevenue) : "—"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-[11px] border-t border-border/50">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Đã thu trước đó:</span>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {money(totalCollected)}
                      </span>
                    </div>

                    {/* Real-time staged preview for RECEIPT */}
                    {settlementType === "RECEIPT" &&
                      (activeTab === "bank_cash" ||
                        activeTab === "manual_cashflow") &&
                      activeTabSettlementTotal > 0 && (
                        <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/60 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                          <span>⚡ Cấn trừ đợt này:</span>
                          <span className="font-mono">
                            +{money(activeTabSettlementTotal)}
                          </span>
                        </div>
                      )}

                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-border/60">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {settlementType === "RECEIPT" &&
                        (activeTab === "bank_cash" ||
                          activeTab === "manual_cashflow") &&
                        activeTabSettlementTotal > 0
                          ? "Còn lại sau đợt này:"
                          : "Cần thu còn lại:"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const isStaging =
                            settlementType === "RECEIPT" &&
                            (activeTab === "bank_cash" ||
                              activeTab === "manual_cashflow") &&
                            activeTabSettlementTotal > 0;
                          const projectedTotal = isStaging
                            ? totalCollected + activeTabSettlementTotal
                            : totalCollected;
                          const isOver =
                            targetRevenue > 0 && projectedTotal > targetRevenue;
                          const isExact =
                            targetRevenue > 0 &&
                            projectedTotal === targetRevenue;

                          if (isOver) {
                            return (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 font-mono font-bold"
                              >
                                Thu vượt: +
                                {money(projectedTotal - targetRevenue)}
                              </Badge>
                            );
                          }
                          if (isExact) {
                            return (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                              >
                                Đủ 100%
                              </Badge>
                            );
                          }
                          if (targetRevenue === 0) {
                            return (
                              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                +{money(projectedTotal)}
                              </span>
                            );
                          }
                          return (
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                              {money(
                                Math.max(0, targetRevenue - projectedTotal),
                              )}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chi tiền / Chi phí */}
                <div
                  className={cn(
                    "p-3 rounded-xl border space-y-2 transition-all",
                    settlementType === "PAYMENT" &&
                      (activeTab === "bank_cash" ||
                        activeTab === "manual_cashflow")
                      ? "bg-orange-50/70 dark:bg-orange-950/40 border-orange-300 dark:border-orange-700/80 shadow-xs"
                      : "bg-card border-border/70",
                  )}
                >
                  <div className="flex items-center justify-between font-bold text-orange-900 dark:text-orange-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>Chi tiền (Chi phí)</span>
                    </div>
                    <span className="font-mono text-slate-700 dark:text-slate-200">
                      {targetCost > 0 ? money(targetCost) : "—"}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-1 text-[11px] border-t border-border/50">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Đã chi trước đó:</span>
                      <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                        {money(totalPaid)}
                      </span>
                    </div>

                    {/* Real-time staged preview for PAYMENT */}
                    {settlementType === "PAYMENT" &&
                      (activeTab === "bank_cash" ||
                        activeTab === "manual_cashflow") &&
                      activeTabSettlementTotal > 0 && (
                        <div className="flex items-center justify-between font-bold text-[#ea580c] dark:text-orange-400 bg-orange-100/60 dark:bg-orange-900/40 px-1.5 py-0.5 rounded">
                          <span>⚡ Cấn trừ đợt này:</span>
                          <span className="font-mono">
                            +{money(activeTabSettlementTotal)}
                          </span>
                        </div>
                      )}

                    <div className="flex items-center justify-between pt-1 border-t border-dashed border-border/60">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {settlementType === "PAYMENT" &&
                        (activeTab === "bank_cash" ||
                          activeTab === "manual_cashflow") &&
                        activeTabSettlementTotal > 0
                          ? "Còn lại sau đợt này:"
                          : "Cần chi còn lại:"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {(() => {
                          const isStaging =
                            settlementType === "PAYMENT" &&
                            (activeTab === "bank_cash" ||
                              activeTab === "manual_cashflow") &&
                            activeTabSettlementTotal > 0;
                          const projectedTotal = isStaging
                            ? totalPaid + activeTabSettlementTotal
                            : totalPaid;
                          const isOver =
                            targetCost > 0 && projectedTotal > targetCost;
                          const isExact =
                            targetCost > 0 && projectedTotal === targetCost;

                          if (isOver) {
                            return (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 font-mono font-bold"
                              >
                                Chi vượt: +{money(projectedTotal - targetCost)}
                              </Badge>
                            );
                          }
                          if (isExact) {
                            return (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 font-semibold"
                              >
                                Đủ 100%
                              </Badge>
                            );
                          }
                          if (targetCost === 0) {
                            return (
                              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                                +{money(projectedTotal)}
                              </span>
                            );
                          }
                          return (
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                              {money(Math.max(0, targetCost - projectedTotal))}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </DrawerSection>

            {/* SECTION 4: GỢI Ý THÔNG MINH CONTEXTUAL */}
            {activeTab === "bank_cash" && (
              <DrawerSection
                title={
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      {settlementType === "RECEIPT"
                        ? t(
                            "cases.reconciliation.suggestReceipt",
                            "Gợi ý Thu tiền (Vào)",
                          )
                        : t(
                            "cases.reconciliation.suggestPayment",
                            "Gợi ý Chi tiền (Ra)",
                          )}
                    </span>
                    {bankSuggestions.length > 0 && (
                      <Badge variant="outline" className="text-[10px] ml-1">
                        {bankSuggestions.length}
                      </Badge>
                    )}
                  </div>
                }
                collapsible={true}
                defaultCollapsed={false}
              >
                {isLoadingBankSuggestions ? (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang phân tích sao kê...</span>
                  </div>
                ) : bankSuggestions.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {bankSuggestions.map((sug: any) => {
                      const isSelected = selectedIds.includes(
                        sug.bankTransaction?.id || sug.transactionId,
                      );
                      const txn = sug.bankTransaction || sug.transaction;
                      return (
                        <div
                          key={sug.id || txn?.id || sug.transactionId}
                          className="space-y-1"
                        >
                          <SmartSuggestionCard
                            txn={txn}
                            amount={
                              txn?.debitAmount > 0
                                ? txn.debitAmount
                                : txn?.creditAmount
                            }
                            isSuggestion={true}
                            badgeType={sug.score?.badge || "exact"}
                            matchedKeywords={sug.matchedKeywords || []}
                            onAccept={() => {
                              if (txn) {
                                handleSelectBankTxn(txn, !isSelected);
                              }
                            }}
                            onViewDetail={(id) => setDetailTxnId(id)}
                          />

                          {/* If suggestion is cross-linked with an invoice, show navigate button */}
                          {(txn?.invoiceNo || sug.invoiceNo) && (
                            <div className="px-2 py-1 rounded bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-between text-[10px]">
                              <span className="text-blue-700 dark:text-blue-300 font-medium">
                                🔗 Có HĐ #{txn?.invoiceNo || sug.invoiceNo}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleNavigateToInvoiceTab(
                                    settlementType === "RECEIPT" ? "OUT" : "IN",
                                    txn?.invoiceNo || sug.invoiceNo,
                                  )
                                }
                                className="text-primary hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
                              >
                                <span>Chuyển sang Tab HĐ</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic text-center py-3">
                    Không tìm thấy giao dịch sao kê khớp chính xác. Bạn có thể
                    tìm trong danh sách bảng bên trái.
                  </div>
                )}
              </DrawerSection>
            )}

            {(activeTab === "invoices_out" || activeTab === "invoices_in") && (
              <DrawerSection
                title={
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>
                      {activeTab === "invoices_out"
                        ? t(
                            "cases.reconciliation.suggestInvoiceOut",
                            "Gợi ý HĐ Bán ra",
                          )
                        : t(
                            "cases.reconciliation.suggestInvoiceIn",
                            "Gợi ý HĐ Mua vào",
                          )}
                    </span>
                    {invoiceSuggestions.length > 0 && (
                      <Badge variant="outline" className="text-[10px] ml-1">
                        {invoiceSuggestions.length}
                      </Badge>
                    )}
                  </div>
                }
                collapsible={true}
                defaultCollapsed={false}
              >
                {isLoadingInvoiceSuggestions ? (
                  <div className="flex items-center justify-center py-4 text-xs text-muted-foreground gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tìm kiếm hóa đơn khớp...</span>
                  </div>
                ) : invoiceSuggestions.length > 0 ? (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {invoiceSuggestions.map((sug) => {
                      const isSelected = !!selectedInvoicesMap[sug.invoice.id];
                      return (
                        <SmartInvoiceSuggestionCard
                          key={sug.invoice.id}
                          suggestion={sug}
                          isSelected={isSelected}
                          onAccept={() =>
                            handleToggleInvoice(sug.invoice as any)
                          }
                          onViewDetail={(item) => setViewInvoiceId(item.id)}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground italic text-center py-3">
                    Không tìm thấy hóa đơn khớp chính xác. Bạn có thể chọn từ
                    danh sách bảng bên trái.
                  </div>
                )}
              </DrawerSection>
            )}

            {/* SECTION 5: GHI CHÚ LIÊN KẾT / ĐỐI SOÁT */}
            {(activeTab === "invoices_out" || activeTab === "invoices_in") && (
              <DrawerSection
                title={t("cases.reconciliation.noteTitle", "Ghi chú liên kết")}
                collapsible={true}
                defaultCollapsed={false}
              >
                <Textarea
                  value={invoiceNote}
                  onChange={(e) => setInvoiceNote(e.target.value)}
                  placeholder="Ghi chú mục đích liên kết hóa đơn này với sổ báo giá..."
                  rows={2}
                  className="text-xs"
                />
              </DrawerSection>
            )}
          </div>
        }
        actions={[
          {
            label: t("common.cancel", "Hủy"),
            variant: "outline",
            onClick: onClose,
          },
          ...(activeTab === "bank_cash" || activeTab === "manual_cashflow"
            ? [
                {
                  label:
                    activeTab === "bank_cash"
                      ? selectedIds.length > 0
                        ? `Xác nhận cấn trừ ${money(currentSelectedBankTotal)} (${selectedIds.length} GD)`
                        : "Xác nhận cấn trừ"
                      : currentManualAmount > 0
                        ? `Ghi nhận dòng tiền: ${money(currentManualAmount)}`
                        : "Ghi nhận dòng tiền ngoài",
                  disabled:
                    activeTab === "bank_cash"
                      ? selectedIds.length === 0 ||
                        currentSelectedBankTotal <= 0
                      : currentManualAmount <= 0,
                  loading: isSubmitting,
                  onClick: handleSubmitBankAndCash,
                },
              ]
            : [
                {
                  label: hasInvoiceChanges
                    ? `Lưu liên kết (${selectedInvoicesCount} HĐ)`
                    : "Chưa có thay đổi",
                  disabled: !hasInvoiceChanges,
                  loading: isSubmitting,
                  onClick: handleSubmitInvoices,
                },
              ]),
        ]}
      />

      {/* ─── POPUPS CHO XEM CHI TIẾT SAO KÊ & HÓA ĐƠN ─── */}
      {detailTxnId && (
        <BankTransactionDetailDrawer
          isOpen={!!detailTxnId}
          onClose={() => setDetailTxnId(null)}
          transactionId={detailTxnId}
        />
      )}

      {viewInvoiceId && (
        <ErpInvoiceStandaloneDrawer
          isOpen={!!viewInvoiceId}
          onClose={() => setViewInvoiceId(null)}
          invoiceId={viewInvoiceId}
        />
      )}

      {previewPdf && (
        <FilePreviewDrawer
          open={Boolean(previewPdf)}
          onClose={() => setPreviewPdf(null)}
          previewUrl={previewPdf.url}
          fileName={previewPdf.filename}
        />
      )}
    </>
  );
}
