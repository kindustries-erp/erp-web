import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { money } from "@/shared/utils/format";
import { cn } from "@/shared/utils";
import {
  createColumnHeaderFilter,
  filterClientItems,
  type DataTableColumn,
} from "@/shared/components/DataTable";
import { useTableColumnState } from "@/shared/hooks/useTableColumnState";
import { Tooltip } from "@/core/components/ui/Tooltip";
import type { GarageTrendItem } from "../api/garageDashboardApi";
import { GarageMonthClassificationCasesDrawer } from "./GarageMonthClassificationCasesDrawer";
import { GaragePartnerMonthDetailDrawer } from "./organisms/garage-partner-month-detail-drawer";
import { useGarageMonthReceivablesBreakdown } from "../hooks/useGarageMonthReceivablesBreakdown";
import { MonthPayerKpiGrid } from "./organisms/garage-month-detail-drawer/components/MonthPayerKpiGrid";
import { MonthInvoicePartnerTable } from "./organisms/garage-month-detail-drawer/components/MonthInvoicePartnerTable";
import { MonthClassificationTable } from "./organisms/garage-month-detail-drawer/components/MonthClassificationTable";
import type {
  MonthClassificationRow,
  MonthDebtType,
} from "./organisms/garage-month-detail-drawer/components/MonthClassificationTable.type";
import type { MonthlyReceivablesGroupItem } from "../api/garageDashboardApi";
import {
  Wallet,
  Truck,
  Wrench,
  Building2,
  ExternalLink,
  HelpCircle,
  Table as TableIcon,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface GarageMonthDetailDrawerProps {
  open: boolean;
  item: GarageTrendItem | null;
  activeTab: "RECEIPT" | "PAYMENT";
  onClose: () => void;
}

function buildMonthClassificationRows(
  item: GarageTrendItem,
  debtType: MonthDebtType,
): MonthClassificationRow[] {
  const isReceivable = debtType === "receivables";
  const value = (
    receivableKey: keyof GarageTrendItem,
    payableKey: keyof GarageTrendItem,
  ) => Number(item[isReceivable ? receivableKey : payableKey] ?? 0);
  const billed = (
    key: keyof GarageTrendItem,
    payableKey: keyof GarageTrendItem,
  ) => value(key, payableKey);
  const total = isReceivable
    ? Number(item.tienCoThue ?? 0)
    : Number(item.cost ?? 0);

  const definitions = [
    {
      key: "SUA_CHUA_CHUNG",
      name: "Sửa chữa chung",
      subLabel: "Bảo dưỡng định kỳ, sửa chữa tổng quát",
      icon: (
        <Wrench className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      ),
      billed: billed("billedSuaChuaChung", "costSuaChuaChung"),
      paid: billed("paidSuaChuaChung", "paidCostSuaChuaChung"),
      rate: billed("rateSuaChuaChung", "costRateSuaChuaChung"),
      caseCount: Number(item.caseCountSuaChuaChung ?? 0),
      withInvoice: value(
        "receivableWithInvoiceSuaChuaChung",
        "payableCostWithInvoiceSuaChuaChung",
      ),
      withoutInvoice: value(
        "receivableNoInvoiceSuaChuaChung",
        "payableCostNoInvoiceSuaChuaChung",
      ),
    },
    {
      key: "KY_GUI_NOI_BO",
      name: "Ký gửi / Nội bộ",
      subLabel: "Xe công ty, nội bộ hoặc nhận ký gửi",
      icon: (
        <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
      ),
      billed: billed("billedKyGuiNoiBo", "costKyGuiNoiBo"),
      paid: billed("paidKyGuiNoiBo", "paidCostKyGuiNoiBo"),
      rate: billed("rateKyGuiNoiBo", "costRateKyGuiNoiBo"),
      caseCount: Number(item.caseCountKyGuiNoiBo ?? 0),
      withInvoice: value(
        "receivableWithInvoiceKyGuiNoiBo",
        "payableCostWithInvoiceKyGuiNoiBo",
      ),
      withoutInvoice: value(
        "receivableNoInvoiceKyGuiNoiBo",
        "payableCostNoInvoiceKyGuiNoiBo",
      ),
    },
    {
      key: "OJ_NGOAI",
      name: "OJ / Ngoài hệ thống",
      subLabel: "Gia công hoặc ghi nhận ngoài",
      icon: (
        <ExternalLink className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
      ),
      billed: billed("billedOj", "costOj"),
      paid: billed("paidOj", "paidCostOj"),
      rate: billed("rateOj", "costRateOj"),
      caseCount: Number(item.caseCountOj ?? 0),
      withInvoice: value("receivableWithInvoiceOj", "payableCostWithInvoiceOj"),
      withoutInvoice: value("receivableNoInvoiceOj", "payableCostNoInvoiceOj"),
    },
    {
      key: "OTHER",
      name: "Khác / Chưa phân loại",
      subLabel: "Chưa gắn mã phân loại",
      icon: <HelpCircle className="w-3.5 h-3.5 text-slate-500" />,
      billed: billed("billedOther", "costOther"),
      paid: billed("paidOther", "paidCostOther"),
      rate: billed("rateOther", "costRateOther"),
      caseCount: Number(item.caseCountOther ?? 0),
      withInvoice: value(
        "receivableWithInvoiceOther",
        "payableCostWithInvoiceOther",
      ),
      withoutInvoice: value(
        "receivableNoInvoiceOther",
        "payableCostNoInvoiceOther",
      ),
    },
  ];

  return definitions
    .filter((row) => row.billed > 0 || row.caseCount > 0)
    .map((row) => ({
      ...row,
      remaining: Math.max(0, row.billed - row.paid),
      remainingWithInvoice: row.withInvoice,
      remainingNoInvoice: row.withoutInvoice,
      shareRate: total > 0 ? (row.billed / total) * 100 : 0,
    }));
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
  const [currentTab, setCurrentTab] = useState<"RECEIPT" | "PAYMENT">(
    activeTab || "RECEIPT",
  );

  useEffect(() => {
    if (activeTab) setCurrentTab(activeTab);
  }, [activeTab]);

  const isReceipt = currentTab === "RECEIPT";

  const [classificationDrawerState, setClassificationDrawerState] = useState<{
    open: boolean;
    filterType: "CLASSIFICATION" | "INVOICE" | "PARTNER_GROUP";
    filterKey: string;
    filterLabel: string;
    caseCodes?: string[];
  }>({
    open: false,
    filterType: "CLASSIFICATION",
    filterKey: "",
    filterLabel: "",
    caseCodes: undefined,
  });

  const [partnerMonthDrawerState, setPartnerMonthDrawerState] = useState<{
    open: boolean;
    customerCode?: string | null;
    customerName?: string | null;
    taxCode?: string | null;
    initialCases?: any[];
  }>({
    open: false,
    customerCode: null,
    customerName: null,
    taxCode: null,
    initialCases: undefined,
  });

  // Table Column State Hook for Client-side Filter & Sort
  const classificationTableId = "garage-month-detail-classification-table";
  const classificationTableHook = useTableColumnState(classificationTableId);

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

  // Hook lấy phân rã Phải thu Khách hàng & Bảo hiểm theo đối tượng HĐ
  const {
    summary: breakdownSummary,
    insuranceCompanies,
    customerPartners,
    allGroups,
    warning: vatWarningInfo,
  } = useGarageMonthReceivablesBreakdown({
    month: safeItem.label,
    enabled: open && isReceipt,
  });

  const handleSelectPartnerGroup = (group: MonthlyReceivablesGroupItem) => {
    setPartnerMonthDrawerState({
      open: true,
      customerCode: group.taxCode || group.key,
      customerName: group.title,
      taxCode: group.taxCode,
      initialCases: group.cases,
    });
  };

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
  const remainingWithInvScc = isReceipt
    ? (safeItem.receivableWithInvoiceSuaChuaChung ?? 0)
    : (safeItem.payableCostWithInvoiceSuaChuaChung ?? 0);
  const remainingNoInvScc = isReceipt
    ? (safeItem.receivableNoInvoiceSuaChuaChung ?? 0)
    : (safeItem.payableCostNoInvoiceSuaChuaChung ?? 0);

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
  const remainingWithInvKgNb = isReceipt
    ? (safeItem.receivableWithInvoiceKyGuiNoiBo ?? 0)
    : (safeItem.payableCostWithInvoiceKyGuiNoiBo ?? 0);
  const remainingNoInvKgNb = isReceipt
    ? (safeItem.receivableNoInvoiceKyGuiNoiBo ?? 0)
    : (safeItem.payableCostNoInvoiceKyGuiNoiBo ?? 0);

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
  const remainingWithInvOj = isReceipt
    ? (safeItem.receivableWithInvoiceOj ?? 0)
    : (safeItem.payableCostWithInvoiceOj ?? 0);
  const remainingNoInvOj = isReceipt
    ? (safeItem.receivableNoInvoiceOj ?? 0)
    : (safeItem.payableCostNoInvoiceOj ?? 0);

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
  const remainingWithInvOther = isReceipt
    ? (safeItem.receivableWithInvoiceOther ?? 0)
    : (safeItem.payableCostWithInvoiceOther ?? 0);
  const remainingNoInvOther = isReceipt
    ? (safeItem.receivableNoInvoiceOther ?? 0)
    : (safeItem.payableCostNoInvoiceOther ?? 0);

  // ── Table Data: Classification Rows ─────────────────────────────
  const classificationRows = useMemo<MonthClassificationRow[]>(() => {
    const rows: MonthClassificationRow[] = [
      {
        key: "SUA_CHUA_CHUNG",
        name: "Sửa chữa chung",
        subLabel: "Bảo dưỡng định kỳ, sửa chữa tổng quát",
        icon: (
          <Wrench className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
        ),
        badgeClass:
          "bg-slate-100 text-slate-850 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
        caseCount: countScc,
        billed: billedScc,
        paid: paidScc,
        remaining: Math.max(0, billedScc - paidScc),
        remainingWithInvoice: remainingWithInvScc,
        remainingNoInvoice: remainingNoInvScc,
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
        remainingWithInvoice: remainingWithInvKgNb,
        remainingNoInvoice: remainingNoInvKgNb,
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
        remainingWithInvoice: remainingWithInvOj,
        remainingNoInvoice: remainingNoInvOj,
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
        remainingWithInvoice: remainingWithInvOther,
        remainingNoInvoice: remainingNoInvOther,
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
    remainingWithInvScc,
    remainingNoInvScc,
    countKgNb,
    billedKgNb,
    paidKgNb,
    rateKgNb,
    remainingWithInvKgNb,
    remainingNoInvKgNb,
    billedOj,
    paidOj,
    rateOj,
    countOj,
    remainingWithInvOj,
    remainingNoInvOj,
    billedOther,
    paidOther,
    rateOther,
    countOther,
    remainingWithInvOther,
    remainingNoInvOther,
    mainBilled,
  ]);

  // ── Column Header Filter Builder (Client-side auto extraction) ───
  const classificationHeaderFilter = useMemo(
    () =>
      createColumnHeaderFilter({
        listHook: classificationTableHook,
        items: classificationRows,
        defaultAlign: "center",
      }),
    [classificationTableHook, classificationRows],
  );

  // ── Filtered Rows (Universal client filter & sorter) ───────────────
  const filteredClassificationRows = useMemo(
    () => filterClientItems(classificationRows, classificationTableHook),
    [classificationRows, classificationTableHook],
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
        size: 200,
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
        size: 150,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums text-foreground",
        cell: (row: MonthClassificationRow) => {
          const total = row.billed;
          const paid = row.paid;
          const bal = row.remaining;
          if (total <= 0) {
            return (
              <span className="text-muted-foreground/40 font-normal select-none">
                —
              </span>
            );
          }
          const isAllPaid = bal <= 0 && paid > 0;
          const isUnpaid = paid <= 0 && total > 0;
          const rate = row.rate;

          const tooltipText = isReceipt
            ? isAllPaid
              ? `Đã thu đủ 100%: ${money(paid)}`
              : isUnpaid
                ? `Chưa thu (0%): Còn phải thu ${money(bal)} / Tổng ${money(total)}`
                : `Đã thu: ${money(paid)} / ${money(total)} (${rate.toFixed(1)}%) • Còn phải thu: ${money(bal)}`
            : isAllPaid
              ? `Đã trả đủ 100%: ${money(paid)}`
              : isUnpaid
                ? `Chưa trả (0%): Còn phải trả ${money(bal)} / Tổng ${money(total)}`
                : `Đã trả: ${money(paid)} / ${money(total)} (${rate.toFixed(1)}%) • Còn phải trả: ${money(bal)}`;

          return (
            <Tooltip content={tooltipText} side="top">
              <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
                <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
                  <span className="font-semibold text-foreground font-mono">
                    {money(total)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isAllPaid
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : isUnpaid
                          ? "bg-transparent"
                          : isReceipt
                            ? "bg-emerald-600 dark:bg-emerald-500"
                            : "bg-slate-600 dark:bg-slate-400",
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
                  />
                </div>
              </div>
            </Tooltip>
          );
        },
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
        size: 140,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums text-foreground",
        cell: (row: MonthClassificationRow) => (
          <Tooltip content={money(row.paid)} side="top">
            <span className="font-semibold text-xs cursor-default">
              {money(row.paid)}
            </span>
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
        key: "remainingWithInvoice",
        header: classificationHeaderFilter.amount(
          "remainingWithInvoice",
          isReceipt
            ? t("progress.columns.receivableWithInvoice", "Còn phải thu có HĐ")
            : t(
                "progress.columns.payableCostWithInvoice",
                "Còn phải trả có HĐ",
              ),
          { align: "right" },
        ),
        size: 150,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums",
        cell: (row: MonthClassificationRow) => {
          const val = row.remainingWithInvoice;
          return (
            <Tooltip
              content={
                val > 0
                  ? `${isReceipt ? "Còn phải thu có HĐ" : "Còn phải trả có HĐ"}: ${money(val)}`
                  : undefined
              }
              side="top"
            >
              <span
                className={cn(
                  "text-xs font-mono tabular-nums cursor-default",
                  val > 0
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {val > 0 ? money(val) : "—"}
              </span>
            </Tooltip>
          );
        },
      },
      {
        key: "remainingNoInvoice",
        header: classificationHeaderFilter.amount(
          "remainingNoInvoice",
          isReceipt
            ? t("progress.columns.receivableNoInvoice", "Còn phải thu không HĐ")
            : t(
                "progress.columns.payableCostNoInvoice",
                "Còn phải trả không HĐ",
              ),
          { align: "right" },
        ),
        size: 150,
        enableResizing: true,
        headerClassName: "text-right font-semibold",
        className: "text-right font-mono tabular-nums",
        cell: (row: MonthClassificationRow) => {
          const val = row.remainingNoInvoice;
          return (
            <Tooltip
              content={
                val > 0
                  ? `${isReceipt ? "Còn phải thu không HĐ" : "Còn phải trả không HĐ"}: ${money(val)}`
                  : undefined
              }
              side="top"
            >
              <span
                className={cn(
                  "text-xs font-mono tabular-nums cursor-default",
                  val > 0
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground/60",
                )}
              >
                {val > 0 ? money(val) : "—"}
              </span>
            </Tooltip>
          );
        },
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
        size: 90,
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
    let remainingWithInvoice = 0;
    let remainingNoInvoice = 0;
    let caseCount = 0;
    filteredClassificationRows.forEach((r) => {
      billed += r.billed;
      paid += r.paid;
      remaining += r.remaining;
      remainingWithInvoice += r.remainingWithInvoice;
      remainingNoInvoice += r.remainingNoInvoice;
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
        <Tooltip
          content={
            billed > 0
              ? isReceipt
                ? `Đã thu: ${money(paid)} / ${money(billed)} (${rate.toFixed(1)}%) • Còn phải thu: ${money(remaining)}`
                : `Đã trả: ${money(paid)} / ${money(billed)} (${rate.toFixed(1)}%) • Còn phải trả: ${money(remaining)}`
              : undefined
          }
          side="top"
        >
          <div className="flex flex-col gap-1 w-full py-0.5 justify-center cursor-default">
            <div className="flex items-center justify-end text-xs tabular-nums leading-tight">
              <span className="font-bold text-foreground font-mono">
                {money(billed)}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-300",
                  remaining <= 0 && paid > 0
                    ? "bg-emerald-500 dark:bg-emerald-400"
                    : paid <= 0
                      ? "bg-transparent"
                      : isReceipt
                        ? "bg-emerald-600 dark:bg-emerald-500"
                        : "bg-slate-600 dark:bg-slate-400",
                )}
                style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
              />
            </div>
          </div>
        </Tooltip>
      ),
      paid: (
        <span className="font-bold text-right block font-mono tabular-nums text-foreground text-xs">
          {money(paid)}
        </span>
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
      remainingWithInvoice: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums text-xs",
            remainingWithInvoice > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {remainingWithInvoice > 0 ? money(remainingWithInvoice) : "—"}
        </span>
      ),
      remainingNoInvoice: (
        <span
          className={cn(
            "font-mono font-bold text-right block tabular-nums text-xs",
            remainingNoInvoice > 0
              ? "text-foreground"
              : "text-muted-foreground/60",
          )}
        >
          {remainingNoInvoice > 0 ? money(remainingNoInvoice) : "—"}
        </span>
      ),
      shareRate: (
        <span className="font-bold text-center block text-xs text-foreground">
          {shareRate.toFixed(1)}%
        </span>
      ),
    };
  }, [filteredClassificationRows, mainBilled, isReceipt]);

  const receivableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeItem, "receivables"),
    [safeItem],
  );
  const payableClassificationRows = useMemo(
    () => buildMonthClassificationRows(safeItem, "payables"),
    [safeItem],
  );

  const handleSelectClassification = (row: MonthClassificationRow) => {
    setClassificationDrawerState({
      open: true,
      filterType: "CLASSIFICATION",
      filterKey: row.key,
      filterLabel: row.name,
    });
  };

  // ── Build Drawer Top Tabs (Main Tabs cấp Drawer chuẩn /standardize-drawer) ──
  const drawerTabs = useMemo<DrawerTopTabItem[]>(() => {
    const tabs: DrawerTopTabItem[] = [
      // Main Tab 1: Phân loại Nghiệp vụ
      {
        key: "classification",
        label: isReceipt ? "Phân loại Nghiệp vụ" : "Phân loại Chi phí",
        icon: <TableIcon className="w-3.5 h-3.5" />,
        badgeCount: classificationRows.length,
        content: (
          <div className="space-y-4">
            <MonthClassificationTable
              rows={receivableClassificationRows}
              debtType="receivables"
              totalBilled={totalBilled}
              tableId="garage-month-detail-receivables-table"
              title="Bảng Phải thu theo nghiệp vụ"
              onSelectClassification={handleSelectClassification}
            />
            <MonthClassificationTable
              rows={payableClassificationRows}
              debtType="payables"
              totalBilled={totalCost}
              tableId="garage-month-detail-payables-table"
              title="Bảng Phải trả theo chi phí"
              onSelectClassification={handleSelectClassification}
            />
          </div>
        ),
      },
    ];

    // Main Tab 2: Chi tiết Thu KH & Thu BH theo Đối tượng Hóa đơn (Chỉ hiển thị khi là Phải Thu)
    if (isReceipt) {
      tabs.push({
        key: "partner_breakdown",
        label: "Đối tượng HĐ (Thu KH & BH)",
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        badgeCount: insuranceCompanies.length + customerPartners.length,
        content: (
          <div className="flex flex-col gap-3.5">
            {/* 2 Thẻ KPI tương phản Thu KH vs Thu BH */}
            <MonthPayerKpiGrid summary={breakdownSummary} />

            {/* Bảng Gom nhóm Đối tượng HĐ & Từng Cty BH (có PillTabs sub-navigation chuẩn erp-invoice) */}
            <DrawerSection
              title={
                <div className="flex items-center gap-2">
                  <span>Chi tiết Thu KH & Thu BH theo Đối tượng Hóa đơn</span>
                  {vatWarningInfo?.hasVatWithoutInvoice && (
                    <Badge
                      variant="outline"
                      className="bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/35 font-bold text-[10px] gap-1 px-1.5"
                    >
                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                      Có {vatWarningInfo.casesWithVatNoInvoiceCount} vụ việc VAT
                      chưa HĐ
                    </Badge>
                  )}
                </div>
              }
              collapsible={false}
              titleExtra={
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 mr-1" />
                  {insuranceCompanies.length} Cty BH • {customerPartners.length}{" "}
                  Khách hàng
                </div>
              }
            >
              <div className="pt-1 flex flex-col gap-6">
                {vatWarningInfo?.hasVatWithoutInvoice && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>Cảnh báo VAT:</strong> Có{" "}
                      {vatWarningInfo.casesWithVatNoInvoiceCount} vụ việc chưa
                      xuất hoặc đính kèm hóa đơn điện tử.
                    </span>
                  </div>
                )}
                <MonthInvoicePartnerTable
                  items={customerPartners}
                  title={`Thu khách hàng (${customerPartners.length} nhóm)`}
                  tableId="garage-month-detail-customer-partners-table"
                  totalBilled={breakdownSummary?.totalBilled ?? mainBilled}
                  onSelectGroup={handleSelectPartnerGroup}
                />
                <MonthInvoicePartnerTable
                  items={insuranceCompanies}
                  title={`Thu bảo hiểm (${insuranceCompanies.length} nhóm)`}
                  tableId="garage-month-detail-insurance-companies-table"
                  totalBilled={breakdownSummary?.totalBilled ?? mainBilled}
                  onSelectGroup={handleSelectPartnerGroup}
                />
              </div>
            </DrawerSection>
          </div>
        ),
      });
    }

    return tabs;
  }, [
    isReceipt,
    classificationRows.length,
    classificationTableHook,
    filteredClassificationRows,
    classificationColumns,
    classificationSummaryRow,
    classificationTableId,
    insuranceCompanies,
    customerPartners,
    breakdownSummary,
    vatWarningInfo,
    allGroups,
    mainBilled,
  ]);

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

      {/* 1.1. Section: Cơ cấu Thu KH vs Thu BH (Chỉ hiện khi Xem Phải thu) */}
      {isReceipt && breakdownSummary && (
        <DrawerSection
          title="Cơ cấu Thu KH vs Thu BH"
          collapsible={true}
          defaultCollapsed={false}
        >
          <div className="flex flex-col rounded-xl border border-border/60 overflow-hidden bg-background/50 divide-y divide-border/40">
            <MoneyRow
              label="Thu Khách hàng"
              value={breakdownSummary.customer.billed}
              secondary={`Đã thu ${breakdownSummary.customer.rate.toFixed(1)}%`}
              valueClass="font-bold text-foreground"
            />
            <MoneyRow
              label="Thu Bảo hiểm"
              value={breakdownSummary.insurance.billed}
              secondary={`Đã thu ${breakdownSummary.insurance.rate.toFixed(1)}%`}
              valueClass="font-bold text-indigo-600 dark:text-indigo-400"
            />
            {vatWarningInfo?.hasVatWithoutInvoice && (
              <div className="flex items-center justify-between py-2 px-3 bg-amber-500/10 text-amber-900 dark:text-amber-200">
                <span className="text-[11px] font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  VAT chưa xuất HĐ
                </span>
                <span className="text-[11px] font-mono font-bold">
                  {money(vatWarningInfo.totalVatWithoutInvoice)}
                </span>
              </div>
            )}
          </div>
        </DrawerSection>
      )}

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
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100/60 dark:bg-slate-800/50 border border-border/50 p-2.5 gap-0.5">
            <span className="text-xl font-bold tabular-nums text-foreground">
              {countScc}
            </span>
            <span className="text-[11px] text-muted-foreground text-center font-medium flex items-center gap-1">
              <Wrench className="w-3 h-3 text-slate-500" />
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
          <div className="flex items-center justify-between rounded-lg bg-slate-100/50 dark:bg-slate-800/40 border border-border/50 px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              <Wrench className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              Sửa chữa chung
            </div>
            <Badge
              variant="outline"
              className="font-bold text-[11px] px-2 py-0 border tabular-nums bg-slate-100 dark:bg-slate-800 text-foreground border-border"
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
        tabs={drawerTabs}
        defaultTabKey="classification"
        collapsibleRightPanel={true}
        rightPanelDefaultCollapsed={false}
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
        activeTab={currentTab}
        caseCodes={classificationDrawerState.caseCodes}
        onClose={() =>
          setClassificationDrawerState((prev) => ({ ...prev, open: false }))
        }
      />

      {/* Partner Month Detail Drawer */}
      <GaragePartnerMonthDetailDrawer
        open={partnerMonthDrawerState.open}
        onClose={() =>
          setPartnerMonthDrawerState((prev) => ({ ...prev, open: false }))
        }
        month={safeItem.label}
        customerCode={partnerMonthDrawerState.customerCode}
        customerName={partnerMonthDrawerState.customerName}
        taxCode={partnerMonthDrawerState.taxCode}
        initialDebtType={isReceipt ? "receivables" : "payables"}
        initialCases={partnerMonthDrawerState.initialCases}
      />
    </>
  );
}
