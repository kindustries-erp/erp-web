import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  DataTable,
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GarageTrendItem } from "../api/garageDashboardApi";
import { GarageMonthClassificationCasesDrawer } from "./GarageMonthClassificationCasesDrawer";
import {
  Wallet,
  Truck,
  Wrench,
  Building2,
  ExternalLink,
  HelpCircle,
  FileText,
  FileX,
  Table as TableIcon,
  PieChart,
  Eye,
} from "lucide-react";

interface GarageMonthDetailDrawerProps {
  open: boolean;
  item: GarageTrendItem | null;
  activeTab: "RECEIPT" | "PAYMENT";
  onClose: () => void;
}

interface MonthClassificationRow {
  key: string;
  name: string;
  subLabel?: string;
  icon: React.ReactNode;
  badgeClass: string;
  caseCount: number;
  billed: number;
  paid: number;
  remaining: number;
  rate: number;
  shareRate: number;
}

interface MonthInvoiceRow {
  key: string;
  name: string;
  icon: React.ReactNode;
  caseCount?: number;
  billed: number;
  paid: number;
  remaining: number;
  rate: number;
  shareRate: number;
}

function RateBar({
  rate,
  isReceipt = true,
}: {
  rate: number;
  isReceipt?: boolean;
}) {
  const color = isReceipt
    ? "bg-emerald-500 dark:bg-emerald-400"
    : "bg-orange-500 dark:bg-orange-400";
  const capped = Math.min(100, Math.max(0, rate));

  const badgeClass =
    rate >= 100
      ? isReceipt
        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
        : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80";

  return (
    <div className="flex items-center gap-2.5 w-full">
      <Badge
        variant="outline"
        className={cn(
          "font-bold px-2 py-0.5 text-xs border tabular-nums w-fit shrink-0",
          badgeClass,
        )}
      >
        {rate.toFixed(1)}%
      </Badge>
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            color,
          )}
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  );
}

function MoneyRow({
  label,
  value,
  valueClass,
  secondary,
}: {
  label: string;
  value: number;
  valueClass?: string;
  secondary?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 px-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
      <span className="text-[12px] text-muted-foreground font-medium shrink-0">
        {label}
      </span>
      <div className="text-right shrink-0">
        <span
          className={cn(
            "text-[12px] font-mono font-semibold tabular-nums whitespace-nowrap",
            valueClass ?? "text-foreground",
          )}
        >
          {money(value)}
        </span>
        {secondary && (
          <span className="block text-[10px] text-muted-foreground/75 font-normal whitespace-nowrap">
            {secondary}
          </span>
        )}
      </div>
    </div>
  );
}

export function GarageMonthDetailDrawer({
  open,
  item,
  activeTab,
  onClose,
}: GarageMonthDetailDrawerProps) {
  const { t } = useTranslation(["garage", "common"]);
  const isReceipt = activeTab === "RECEIPT";

  const [classificationDrawerState, setClassificationDrawerState] = useState<{
    open: boolean;
    filterType: "CLASSIFICATION" | "INVOICE";
    filterKey: string;
    filterLabel: string;
  }>({
    open: false,
    filterType: "CLASSIFICATION",
    filterKey: "",
    filterLabel: "",
  });

  // Table Column State Hooks for Client-side Filter & Sort
  const classificationTableId = "garage-month-detail-classification-table";
  const classificationTableHook = useTableColumnState(classificationTableId);

  const invoiceTableId = "garage-month-detail-invoice-table";
  const invoiceTableHook = useTableColumnState(invoiceTableId);

  const safeItem = useMemo<GarageTrendItem>(
    () =>
      item ?? {
        label: "",
        month: "",
        tienCoThue: 0,
        paid: 0,
        receivable: 0,
        collectionRate: 0,
        cost: 0,
        paidCost: 0,
        payableCost: 0,
        costPaymentRate: 0,
        caseCount: 0,
        revenue: 0,
        profit: 0,
        margin: 0,
        collectionRateDiff: 0,
        costPaymentRateDiff: 0,
      },
    [item],
  );

  const formatMonth = (m?: string) => {
    if (!m) return "";
    const parts = m.split("-");
    if (parts.length === 2) return `Tháng ${parts[1]}/${parts[0]}`;
    return m;
  };

  // ── RECEIPT tab values ──────────────────────────────────────────
  const totalBilled = safeItem.tienCoThue ?? safeItem.totalBilled ?? 0;
  const totalPaid = safeItem.paid ?? 0;
  const totalReceivable = safeItem.receivable ?? 0;
  const collectionRate =
    safeItem.collectionRate ??
    (totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0);

  // ── PAYMENT tab values ──────────────────────────────────────────
  const totalCost = safeItem.cost ?? 0;
  const totalPaidCost = safeItem.paidCost ?? 0;
  const totalPayable = safeItem.payableCost ?? 0;
  const costPaymentRate =
    safeItem.costPaymentRate ??
    (totalCost > 0 ? (totalPaidCost / totalCost) * 100 : 0);

  const monthLabel = formatMonth(safeItem.label);
  const mainRate = isReceipt ? collectionRate : costPaymentRate;
  const mainBilled = isReceipt ? totalBilled : totalCost;
  const mainPaid = isReceipt ? totalPaid : totalPaidCost;
  const mainRemaining = isReceipt ? totalReceivable : totalPayable;

  // ── Classification: Sửa chữa chung ──────────────────────────────
  const billedScc = isReceipt
    ? (safeItem.billedSuaChuaChung ?? 0)
    : (safeItem.costSuaChuaChung ?? 0);
  const paidScc = isReceipt
    ? (safeItem.paidSuaChuaChung ?? 0)
    : (safeItem.paidCostSuaChuaChung ?? 0);
  const rateScc = isReceipt
    ? (safeItem.rateSuaChuaChung ?? 0)
    : (safeItem.costRateSuaChuaChung ?? 0);
  const countScc = safeItem.caseCountSuaChuaChung ?? 0;

  // ── Classification: Ký gửi / Nội bộ ─────────────────────────────
  const billedKgNb = isReceipt
    ? (safeItem.billedKyGuiNoiBo ?? 0)
    : (safeItem.costKyGuiNoiBo ?? 0);
  const paidKgNb = isReceipt
    ? (safeItem.paidKyGuiNoiBo ?? 0)
    : (safeItem.paidCostKyGuiNoiBo ?? 0);
  const rateKgNb = isReceipt
    ? (safeItem.rateKyGuiNoiBo ?? 0)
    : (safeItem.costRateKyGuiNoiBo ?? 0);
  const countKgNb = safeItem.caseCountKyGuiNoiBo ?? 0;

  // ── Classification: OJ Ngoài ────────────────────────────────────
  const billedOj = isReceipt
    ? (safeItem.billedOj ?? 0)
    : (safeItem.costOj ?? 0);
  const paidOj = isReceipt
    ? (safeItem.paidOj ?? 0)
    : (safeItem.paidCostOj ?? 0);
  const rateOj = isReceipt
    ? (safeItem.rateOj ?? 0)
    : (safeItem.costRateOj ?? 0);
  const countOj = safeItem.caseCountOj ?? 0;

  // ── Classification: Khác / Chưa phân loại ───────────────────────
  const billedOther = isReceipt
    ? (safeItem.billedOther ?? 0)
    : (safeItem.costOther ?? 0);
  const paidOther = isReceipt
    ? (safeItem.paidOther ?? 0)
    : (safeItem.paidCostOther ?? 0);
  const rateOther = isReceipt
    ? (safeItem.rateOther ?? 0)
    : (safeItem.costRateOther ?? 0);
  const countOther = safeItem.caseCountOther ?? 0;

  // ── Table Data: Classification Rows ─────────────────────────────
  const classificationRows = useMemo<MonthClassificationRow[]>(() => {
    const rows: MonthClassificationRow[] = [
      {
        key: "SUA_CHUA_CHUNG",
        name: "Sửa chữa chung",
        subLabel: "Bảo dưỡng định kỳ, sửa chữa tổng quát",
        icon: (
          <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        ),
        badgeClass:
          "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/40",
        caseCount: countScc,
        billed: billedScc,
        paid: paidScc,
        remaining: Math.max(0, billedScc - paidScc),
        rate: rateScc,
        shareRate: mainBilled > 0 ? (billedScc / mainBilled) * 100 : 0,
      },
      {
        key: "KY_GUI_NOI_BO",
        name: "Ký gửi / Nội bộ",
        subLabel: "Xe công ty, nội bộ hoặc nhận ký gửi",
        icon: (
          <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
        ),
        badgeClass:
          "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/40",
        caseCount: countKgNb,
        billed: billedKgNb,
        paid: paidKgNb,
        remaining: Math.max(0, billedKgNb - paidKgNb),
        rate: rateKgNb,
        shareRate: mainBilled > 0 ? (billedKgNb / mainBilled) * 100 : 0,
      },
    ];

    if (billedOj > 0 || countOj > 0) {
      rows.push({
        key: "OJ_NGOAI",
        name: "OJ / Ngoài hệ thống",
        subLabel: "Gia công hoặc ghi nhận ngoài",
        icon: (
          <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
        ),
        badgeClass:
          "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800/40",
        caseCount: countOj,
        billed: billedOj,
        paid: paidOj,
        remaining: Math.max(0, billedOj - paidOj),
        rate: rateOj,
        shareRate: mainBilled > 0 ? (billedOj / mainBilled) * 100 : 0,
      });
    }

    if (billedOther > 0 || countOther > 0) {
      rows.push({
        key: "OTHER",
        name: "Khác / Chưa phân loại",
        subLabel: "Chưa gắn mã phân loại",
        icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
        badgeClass:
          "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-300 dark:border-slate-800/40",
        caseCount: countOther,
        billed: billedOther,
        paid: paidOther,
        remaining: Math.max(0, billedOther - paidOther),
        rate: rateOther,
        shareRate: mainBilled > 0 ? (billedOther / mainBilled) * 100 : 0,
      });
    }

    return rows;
  }, [
    countScc,
    billedScc,
    paidScc,
    rateScc,
    countKgNb,
    billedKgNb,
    paidKgNb,
    rateKgNb,
    billedOj,
    paidOj,
    rateOj,
    countOj,
    billedOther,
    paidOther,
    rateOther,
    countOther,
    mainBilled,
  ]);

  // ── Table Data: Invoice Status Breakdown ──────────────────────────
  const billedWithInv = isReceipt
    ? (safeItem.billedWithInvoice ?? 0)
    : (safeItem.costWithInvoice ?? 0);
  const paidWithInv = isReceipt
    ? (safeItem.paidWithInvoice ?? 0)
    : (safeItem.paidCostWithInvoice ?? 0);
  const rateWithInv = isReceipt
    ? (safeItem.rateWithInvoice ?? 0)
    : (safeItem.costRateWithInvoice ?? 0);
  const countWithInv = safeItem.caseCountWithInvoice ?? 0;

  const billedNoInv = isReceipt
    ? (safeItem.billedNoInvoice ?? 0)
    : (safeItem.costNoInvoice ?? 0);
  const paidNoInv = isReceipt
    ? (safeItem.paidNoInvoice ?? 0)
    : (safeItem.paidCostNoInvoice ?? 0);
  const rateNoInv = isReceipt
    ? (safeItem.rateNoInvoice ?? 0)
    : (safeItem.costRateNoInvoice ?? 0);
  const countNoInv = safeItem.caseCountNoInvoice ?? 0;

  const invoiceRows = useMemo<MonthInvoiceRow[]>(
    () => [
      {
        key: "WITH_INVOICE",
        name: "Có hóa đơn (HĐ)",
        icon: (
          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        ),
        caseCount: countWithInv,
        billed: billedWithInv,
        paid: paidWithInv,
        remaining: Math.max(0, billedWithInv - paidWithInv),
        rate: rateWithInv,
        shareRate: mainBilled > 0 ? (billedWithInv / mainBilled) * 100 : 0,
      },
      {
        key: "NO_INVOICE",
        name: "Không hóa đơn",
        icon: <FileX className="w-3.5 h-3.5 text-slate-500" />,
        caseCount: countNoInv,
        billed: billedNoInv,
        paid: paidNoInv,
        remaining: Math.max(0, billedNoInv - paidNoInv),
        rate: rateNoInv,
        shareRate: mainBilled > 0 ? (billedNoInv / mainBilled) * 100 : 0,
      },
    ],
    [
      countWithInv,
      billedWithInv,
      paidWithInv,
      rateWithInv,
      countNoInv,
      billedNoInv,
      paidNoInv,
      rateNoInv,
      mainBilled,
    ],
  );

  // ── Column Header Filter Builders (Client-side auto extraction) ───
  const classificationHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: classificationTableHook,
        items: classificationRows,
        defaultAlign: "center",
      }),
    [classificationTableHook, classificationRows],
  );

  const invoiceHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: invoiceTableHook,
        items: invoiceRows,
        defaultAlign: "center",
      }),
    [invoiceTableHook, invoiceRows],
  );

  // ── Filtered Rows (Universal client filter & sorter) ───────────────
  const filteredClassificationRows = useMemo(
    () => filterClientItems(classificationRows, classificationTableHook),
    [classificationRows, classificationTableHook],
  );

  const filteredInvoiceRows = useMemo(
    () => filterClientItems(invoiceRows, invoiceTableHook),
    [invoiceRows, invoiceTableHook],
  );

  // ── Table Columns: Classification DataTable ──────────────────────
  const classificationColumns = useMemo<
    DataTableColumn<MonthClassificationRow>[]
  >(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "name",
        header: classificationHeaderFilter(
          "name",
          t("progress.columns.classification", "Loại nghiệp vụ"),
          { align: "left" },
        ),
        size: 210,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        className: "text-left",
        cell: (row: MonthClassificationRow) => (
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              setClassificationDrawerState({
                open: true,
                filterType: "CLASSIFICATION",
                filterKey: row.key,
                filterLabel: row.name,
              });
            }}
          >
            <span className="shrink-0 group-hover:scale-110 transition-transform">
              {row.icon}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-foreground text-xs truncate group-hover:text-primary group-hover:underline transition-colors">
                {row.name}
              </span>
              {row.subLabel && (
                <span className="text-[10px] text-muted-foreground truncate">
                  {row.subLabel}
                </span>
              )}
            </div>
            {row.caseCount > 0 && (
              <Badge
                variant="outline"
                className="ml-auto text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium tabular-nums shrink-0 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-colors"
              >
                {row.caseCount}p
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "billed",
        header: classificationHeaderFilter.amount(
          "billed",
          t("progress.columns.totalBilled", "Tổng phát sinh"),
          { align: "right" },
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums text-foreground",
        cell: (row: MonthClassificationRow) => (
          <Tooltip content={money(row.billed)} side="top">
            <span className="font-medium text-xs cursor-default">
              {money(row.billed)}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "paid",
        header: classificationHeaderFilter.amount(
          "paid",
          isReceipt
            ? t("progress.columns.paidReceipt", "Đã thu")
            : t("progress.columns.paidPayment", "Đã chi"),
          { align: "right" },
        ),
        size: 150,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums",
        cell: (row: MonthClassificationRow) => (
          <Tooltip
            content={
              <div className="text-xs font-mono">
                <div>Đã thanh toán: {money(row.paid)}</div>
                <div>Tỷ lệ hoàn tất: {row.rate.toFixed(1)}%</div>
              </div>
            }
            side="top"
          >
            <div className="flex flex-col items-end gap-0.5 cursor-default">
              <span className="font-bold text-foreground text-xs">
                {money(row.paid)}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {row.rate.toFixed(1)}%
                </span>
                <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isReceipt ? "bg-emerald-500" : "bg-orange-500",
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, row.rate))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Tooltip>
        ),
      },
      {
        key: "remaining",
        header: classificationHeaderFilter.amount(
          "remaining",
          isReceipt
            ? t("progress.columns.receivable", "Còn phải thu")
            : t("progress.columns.payable", "Còn phải trả"),
          { align: "right" },
        ),
        size: 140,
        enableResizing: true,
        headerClassName:
          "text-right bg-slate-100 dark:bg-slate-800/60 font-semibold",
        className:
          "text-right font-mono tabular-nums bg-slate-50 dark:bg-slate-800/30",
        cell: (row: MonthClassificationRow) => (
          <Tooltip
            content={
              row.remaining > 0
                ? `${isReceipt ? "Còn phải thu" : "Còn phải trả"}: ${money(row.remaining)}`
                : undefined
            }
            side="top"
          >
            <span
              className={cn(
                "text-xs font-mono tabular-nums cursor-default",
                row.remaining > 0
                  ? isReceipt
                    ? "font-bold text-amber-600 dark:text-amber-400"
                    : "font-bold text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground/60",
              )}
            >
              {row.remaining > 0 ? money(row.remaining) : "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "shareRate",
        header: classificationHeaderFilter.numeric(
          "shareRate",
          t("progress.columns.shareRate", "Tỷ trọng"),
          {
            align: "center",
            formatOptionLabel: (v) => {
              const num = typeof v === "number" ? v : parseFloat(String(v));
              return !Number.isNaN(num) ? `${num.toFixed(1)}%` : String(v);
            },
          },
        ),
        size: 100,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className: "text-center",
        cell: (row: MonthClassificationRow) => (
          <span className="w-full block text-center font-semibold text-xs tabular-nums text-foreground">
            {row.shareRate.toFixed(1)}%
          </span>
        ),
      },
    ],
    [classificationHeaderFilter, isReceipt, t],
  );

  // ── Summary Row for Classification Table ─────────────────────────
  const classificationSummaryRow = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;
    let caseCount = 0;
    filteredClassificationRows.forEach((r) => {
      billed += r.billed;
      paid += r.paid;
      remaining += r.remaining;
      caseCount += r.caseCount;
    });
    const rate = billed > 0 ? (paid / billed) * 100 : 0;
    const shareRate = mainBilled > 0 ? (billed / mainBilled) * 100 : 0;

    return {
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      name: (
        <span className="font-bold text-xs uppercase tracking-wider text-foreground">
          TỔNG CỘNG ({caseCount} phiếu)
        </span>
      ),
      billed: (
        <span className="font-bold text-right block font-mono tabular-nums text-foreground text-xs">
          {money(billed)}
        </span>
      ),
      paid: (
        <div className="flex flex-col items-end">
          <span className="font-bold text-foreground font-mono text-xs">
            {money(paid)}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {rate.toFixed(1)}% Hoàn tất
          </span>
        </div>
      ),
      remaining: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums text-xs",
            remaining > 0
              ? isReceipt
                ? "text-amber-600 dark:text-amber-400"
                : "text-orange-600 dark:text-orange-400"
              : "text-muted-foreground/60",
          )}
        >
          {remaining > 0 ? money(remaining) : "—"}
        </span>
      ),
      shareRate: (
        <span className="font-bold text-center block text-xs text-foreground">
          {shareRate.toFixed(1)}%
        </span>
      ),
    };
  }, [filteredClassificationRows, mainBilled, isReceipt]);

  // ── Table Columns: Invoice Status DataTable ───────────────────────
  const invoiceColumns = useMemo<DataTableColumn<MonthInvoiceRow>[]>(
    () => [
      {
        key: "index",
        header: <span className="w-full block text-center">#</span>,
        size: 40,
        enableResizing: false,
        headerClassName: "text-center w-[40px] min-w-[40px]",
        className: "text-center w-[40px] min-w-[40px]",
        cell: (_: any, idx: number) => (
          <span className="w-full block text-center text-muted-foreground font-medium">
            {idx}
          </span>
        ),
      },
      {
        key: "name",
        header: invoiceHeaderFilter(
          "name",
          t("progress.columns.invoiceStatus", "Trạng thái Hóa đơn"),
          { align: "left" },
        ),
        size: 210,
        enableResizing: true,
        headerClassName: "text-left font-semibold",
        className: "text-left",
        cell: (row: MonthInvoiceRow) => (
          <div
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              setClassificationDrawerState({
                open: true,
                filterType: "INVOICE",
                filterKey: row.key,
                filterLabel: row.name,
              });
            }}
          >
            <span className="shrink-0 group-hover:scale-110 transition-transform">
              {row.icon}
            </span>
            <span className="font-semibold text-foreground text-xs group-hover:text-primary group-hover:underline transition-colors">
              {row.name}
            </span>
            {row.caseCount !== undefined && row.caseCount > 0 && (
              <Badge
                variant="outline"
                className="ml-auto text-[10px] px-1.5 py-0 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium tabular-nums shrink-0 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/30 transition-colors"
              >
                {row.caseCount}p
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "billed",
        header: invoiceHeaderFilter.amount(
          "billed",
          t("progress.columns.totalBilled", "Tổng phát sinh"),
          { align: "right" },
        ),
        size: 140,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums text-foreground",
        cell: (row: MonthInvoiceRow) => (
          <Tooltip content={money(row.billed)} side="top">
            <span className="font-medium text-xs cursor-default">
              {money(row.billed)}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "paid",
        header: invoiceHeaderFilter.amount(
          "paid",
          isReceipt
            ? t("progress.columns.paidReceipt", "Đã thu")
            : t("progress.columns.paidPayment", "Đã chi"),
          { align: "right" },
        ),
        size: 150,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums",
        cell: (row: MonthInvoiceRow) => (
          <Tooltip
            content={
              <div className="text-xs font-mono">
                <div>Đã thanh toán: {money(row.paid)}</div>
                <div>Tỷ lệ hoàn tất: {row.rate.toFixed(1)}%</div>
              </div>
            }
            side="top"
          >
            <div className="flex flex-col items-end gap-0.5 cursor-default">
              <span className="font-bold text-foreground text-xs">
                {money(row.paid)}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {row.rate.toFixed(1)}%
                </span>
                <div className="w-12 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isReceipt ? "bg-emerald-500" : "bg-orange-500",
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, row.rate))}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Tooltip>
        ),
      },
      {
        key: "remaining",
        header: invoiceHeaderFilter.amount(
          "remaining",
          isReceipt
            ? t("progress.columns.receivable", "Còn phải thu")
            : t("progress.columns.payable", "Còn phải trả"),
          { align: "right" },
        ),
        size: 140,
        enableResizing: true,
        headerClassName:
          "text-right bg-slate-100 dark:bg-slate-800/60 font-semibold",
        className:
          "text-right font-mono tabular-nums bg-slate-50 dark:bg-slate-800/30",
        cell: (row: MonthInvoiceRow) => (
          <Tooltip
            content={
              row.remaining > 0
                ? `${isReceipt ? "Còn phải thu" : "Còn phải trả"}: ${money(row.remaining)}`
                : undefined
            }
            side="top"
          >
            <span
              className={cn(
                "text-xs font-mono tabular-nums cursor-default",
                row.remaining > 0
                  ? isReceipt
                    ? "font-bold text-amber-600 dark:text-amber-400"
                    : "font-bold text-orange-600 dark:text-orange-400"
                  : "text-muted-foreground/60",
              )}
            >
              {row.remaining > 0 ? money(row.remaining) : "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        key: "shareRate",
        header: invoiceHeaderFilter.numeric(
          "shareRate",
          t("progress.columns.shareRate", "Tỷ trọng"),
          {
            align: "center",
            formatOptionLabel: (v) => {
              const num = typeof v === "number" ? v : parseFloat(String(v));
              return !Number.isNaN(num) ? `${num.toFixed(1)}%` : String(v);
            },
          },
        ),
        size: 100,
        enableResizing: true,
        headerClassName: "text-center font-semibold",
        className: "text-center font-semibold text-xs text-foreground",
        cell: (row: MonthInvoiceRow) => (
          <span className="w-full block text-center font-semibold text-xs tabular-nums text-foreground">
            {row.shareRate.toFixed(1)}%
          </span>
        ),
      },
    ],
    [invoiceHeaderFilter, isReceipt, t],
  );

  // ── Summary Row for Invoice Table ────────────────────────────────
  const invoiceSummaryRow = useMemo(() => {
    let billed = 0;
    let paid = 0;
    let remaining = 0;
    let caseCount = 0;
    filteredInvoiceRows.forEach((r) => {
      billed += r.billed;
      paid += r.paid;
      remaining += r.remaining;
      caseCount += r.caseCount || 0;
    });
    const rate = billed > 0 ? (paid / billed) * 100 : 0;
    const shareRate = mainBilled > 0 ? (billed / mainBilled) * 100 : 0;

    return {
      index: (
        <span className="w-full block text-center font-bold text-muted-foreground">
          Σ
        </span>
      ),
      name: (
        <span className="font-bold text-xs uppercase tracking-wider text-foreground">
          TỔNG CỘNG ({caseCount} phiếu)
        </span>
      ),
      billed: (
        <span className="font-bold text-right block font-mono tabular-nums text-foreground text-xs">
          {money(billed)}
        </span>
      ),
      paid: (
        <div className="flex flex-col items-end">
          <span className="font-bold text-foreground font-mono text-xs">
            {money(paid)}
          </span>
          <span className="text-[10px] text-muted-foreground tabular-nums">
            {rate.toFixed(1)}% Hoàn tất
          </span>
        </div>
      ),
      remaining: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums text-xs",
            remaining > 0
              ? isReceipt
                ? "text-amber-600 dark:text-amber-400"
                : "text-orange-600 dark:text-orange-400"
              : "text-muted-foreground/60",
          )}
        >
          {remaining > 0 ? money(remaining) : "—"}
        </span>
      ),
      shareRate: (
        <span className="font-bold text-center block text-xs text-foreground">
          {shareRate.toFixed(1)}%
        </span>
      ),
    };
  }, [filteredInvoiceRows, mainBilled, isReceipt]);

  // ── LEFT PANEL: Standard Table of Classifications & Invoices ──────
  const leftPanel = (
    <div className="flex flex-col gap-4">
      {/* 1. Main Content: Table Phân loại theo Nghiệp vụ */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2">
            <span>Bảng phân loại theo Nghiệp vụ (Classification)</span>
            {classificationTableHook.activeFilterCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  classificationTableHook.resetFilters();
                }}
                className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full lowercase first-letter:uppercase tracking-normal font-sans"
              >
                <span>
                  Xóa bộ lọc ({classificationTableHook.activeFilterCount})
                </span>
              </button>
            )}
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        titleExtra={
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TableIcon className="w-3.5 h-3.5 text-primary mr-1" />
            {filteredClassificationRows.length} / {classificationRows.length}{" "}
            phân loại
          </div>
        }
      >
        <DataTable
          items={filteredClassificationRows}
          getRowKey={(row) => row.key}
          variant="spreadsheet"
          columns={classificationColumns}
          summaryRow={classificationSummaryRow}
          emptyLabel="Không tìm thấy phân loại phù hợp bộ lọc"
          enableColumnResizing={true}
          tableId={classificationTableId}
          onRowClick={(row: MonthClassificationRow) => {
            setClassificationDrawerState({
              open: true,
              filterType: "CLASSIFICATION",
              filterKey: row.key,
              filterLabel: row.name,
            });
          }}
          rowHoverActions={(row: MonthClassificationRow) => [
            {
              groupLabel: "TRA CỨU",
              items: [
                {
                  label: "Xem chi tiết danh sách vụ việc",
                  icon: <Eye className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setClassificationDrawerState({
                      open: true,
                      filterType: "CLASSIFICATION",
                      filterKey: row.key,
                      filterLabel: row.name,
                    });
                  },
                  quickAction: true,
                },
              ],
            },
          ]}
        />
      </DrawerSection>

      {/* 2. Secondary Table: Phân loại theo Hóa đơn Thuế */}
      <DrawerSection
        title={
          <div className="flex items-center gap-2">
            <span>Bảng phân loại theo Hóa đơn Thuế (VAT)</span>
            {invoiceTableHook.activeFilterCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  invoiceTableHook.resetFilters();
                }}
                className="text-[11px] font-medium text-destructive hover:underline flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-full lowercase first-letter:uppercase tracking-normal font-sans"
              >
                <span>Xóa bộ lọc ({invoiceTableHook.activeFilterCount})</span>
              </button>
            )}
          </div>
        }
        collapsible={true}
        defaultCollapsed={false}
        titleExtra={
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <PieChart className="w-3.5 h-3.5 text-emerald-600 mr-1" />
            {filteredInvoiceRows.length} / {invoiceRows.length} nhóm
          </div>
        }
      >
        <DataTable
          items={filteredInvoiceRows}
          getRowKey={(row) => row.key}
          variant="spreadsheet"
          columns={invoiceColumns}
          summaryRow={invoiceSummaryRow}
          emptyLabel="Không tìm thấy nhóm hóa đơn phù hợp bộ lọc"
          enableColumnResizing={true}
          tableId={invoiceTableId}
          onRowClick={(row: MonthInvoiceRow) => {
            setClassificationDrawerState({
              open: true,
              filterType: "INVOICE",
              filterKey: row.key,
              filterLabel: row.name,
            });
          }}
          rowHoverActions={(row: MonthInvoiceRow) => [
            {
              groupLabel: "TRA CỨU",
              items: [
                {
                  label: "Xem chi tiết danh sách vụ việc",
                  icon: <Eye className="w-3.5 h-3.5" />,
                  onClick: () => {
                    setClassificationDrawerState({
                      open: true,
                      filterType: "INVOICE",
                      filterKey: row.key,
                      filterLabel: row.name,
                    });
                  },
                  quickAction: true,
                },
              ],
            },
          ]}
        />
      </DrawerSection>
    </div>
  );

  // ── RIGHT PANEL: Separate Top-level DrawerSections ───────────────
  const rightPanel = (
    <div className="flex flex-col gap-3.5 w-full">
      {/* 1. Section: Tổng quan Thu tiền / Chi trả */}
      <DrawerSection
        title={isReceipt ? "Tổng quan Thu tiền" : "Tổng quan Chi trả"}
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="flex flex-col gap-2.5">
          <RateBar rate={mainRate} isReceipt={isReceipt} />
          <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden bg-background/50 divide-y divide-border/40">
            <MoneyRow
              label="Đã thanh toán"
              value={mainPaid}
              valueClass="font-bold text-foreground"
            />
            <MoneyRow label="Tổng phát sinh" value={mainBilled} />
            <MoneyRow
              label={isReceipt ? "Còn phải thu" : "Còn phải trả"}
              value={mainRemaining}
              valueClass={
                mainRemaining > 0
                  ? isReceipt
                    ? "text-amber-600 dark:text-amber-400 font-bold"
                    : "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-muted-foreground/60"
              }
            />
            {isReceipt && safeItem.revenue > 0 && (
              <MoneyRow
                label="Doanh thu thuần"
                value={safeItem.revenue}
                secondary="(chưa VAT)"
              />
            )}
          </div>
        </div>
      </DrawerSection>

      {/* 2. Section: Thống kê số lượng vụ việc theo Phân loại */}
      <DrawerSection
        title="Thống kê Vụ việc theo Phân loại"
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="grid grid-cols-2 gap-2">
          {/* Tổng vụ việc */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100/60 dark:bg-slate-800/50 border border-border/50 p-2.5 gap-0.5">
            <span className="text-xl font-bold tabular-nums text-foreground">
              {safeItem.caseCount}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium">
              Tổng vụ việc
            </span>
          </div>

          {/* Sửa chữa chung */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-blue-50/40 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/30 p-2.5 gap-0.5">
            <span className="text-xl font-bold tabular-nums text-blue-700 dark:text-blue-300">
              {countScc}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
              <Wrench className="w-3 h-3 text-blue-500" />
              Sửa chữa chung
            </span>
          </div>

          {/* Ký gửi / Nội bộ */}
          <div className="flex flex-col items-center justify-center rounded-xl bg-purple-50/40 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-800/30 p-2.5 gap-0.5">
            <span className="text-xl font-bold tabular-nums text-purple-700 dark:text-purple-300">
              {countKgNb}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
              <Building2 className="w-3 h-3 text-purple-500" />
              Ký gửi / Nội bộ
            </span>
          </div>

          {/* OJ Ngoài hoặc Khác */}
          {countOj > 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl bg-teal-50/40 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/30 p-2.5 gap-0.5">
              <span className="text-xl font-bold tabular-nums text-teal-700 dark:text-teal-300">
                {countOj}
              </span>
              <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
                <ExternalLink className="w-3 h-3 text-teal-500" />
                OJ Ngoài
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100/60 dark:bg-slate-800/50 border border-border/50 p-2.5 gap-0.5">
              <span className="text-xl font-bold tabular-nums text-foreground">
                {countOther}
              </span>
              <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-slate-400" />
                Khác
              </span>
            </div>
          )}
        </div>
      </DrawerSection>

      {/* 3. Section: Tỷ lệ hoàn tất theo từng Phân loại */}
      <DrawerSection
        title="Tỷ lệ Hoàn tất theo Phân loại"
        collapsible={true}
        defaultCollapsed={false}
      >
        <div className="flex flex-col gap-1.5">
          {/* Sửa chữa chung */}
          <div className="flex items-center justify-between rounded-lg bg-blue-50/30 dark:bg-blue-950/20 border border-blue-200/40 dark:border-blue-800/30 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              <Wrench className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sửa chữa chung
            </div>
            <Badge
              variant="outline"
              className="font-bold text-[11px] px-2 py-0 border tabular-nums bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25"
            >
              {rateScc.toFixed(1)}%
            </Badge>
          </div>

          {/* Ký gửi / Nội bộ */}
          <div className="flex items-center justify-between rounded-lg bg-purple-50/30 dark:bg-purple-950/20 border border-purple-200/40 dark:border-purple-800/30 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Ký gửi / Nội bộ
            </div>
            <Badge
              variant="outline"
              className="font-bold text-[11px] px-2 py-0 border tabular-nums bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25"
            >
              {rateKgNb.toFixed(1)}%
            </Badge>
          </div>

          {/* OJ Ngoài (if any) */}
          {(billedOj > 0 || countOj > 0) && (
            <div className="flex items-center justify-between rounded-lg bg-teal-50/30 dark:bg-teal-950/20 border border-teal-200/40 dark:border-teal-800/30 px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
                <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                OJ Ngoài
              </div>
              <Badge
                variant="outline"
                className="font-bold text-[11px] px-2 py-0 border tabular-nums bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
              >
                {rateOj.toFixed(1)}%
              </Badge>
            </div>
          )}
        </div>
      </DrawerSection>
    </div>
  );

  if (!item) return null;

  return (
    <>
      <StandardFormDrawer
        open={open}
        mode="view"
        onClose={onClose}
        title={monthLabel}
        subtitle={
          isReceipt
            ? "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Thu & Đã Thu"
            : "Tiến độ Dòng tiền & Phân loại Vụ việc – Phải Trả & Đã Trả"
        }
        titleExtra={
          <Badge
            variant="outline"
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 border",
              mainRate >= 100
                ? isReceipt
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30"
                : "bg-slate-100 dark:bg-slate-800 text-foreground border-border",
            )}
          >
            {isReceipt ? (
              <Wallet className="w-3 h-3 inline mr-1" />
            ) : (
              <Truck className="w-3 h-3 inline mr-1" />
            )}
            {mainRate.toFixed(1)}% Hoàn tất
          </Badge>
        }
        size="xl"
        layout="2-columns"
        collapsibleRightPanel={true}
        rightPanelDefaultCollapsed={false}
        leftPanel={leftPanel}
        rightPanel={rightPanel}
        actions={[{ label: "Đóng", variant: "outline", onClick: onClose }]}
      />

      {/* Classification Cases 2-Column Drawer */}
      <GarageMonthClassificationCasesDrawer
        open={classificationDrawerState.open}
        month={safeItem.label}
        monthLabel={monthLabel}
        filterType={classificationDrawerState.filterType}
        filterKey={classificationDrawerState.filterKey}
        filterLabel={classificationDrawerState.filterLabel}
        activeTab={activeTab}
        onClose={() =>
          setClassificationDrawerState((prev) => ({ ...prev, open: false }))
        }
      />
    </>
  );
}
