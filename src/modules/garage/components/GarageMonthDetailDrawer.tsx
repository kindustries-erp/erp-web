import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { DrawerSection } from "@/shared/components/DrawerModal";
import { Badge } from "@/shared/components/ui/badge";
import { cn } from "@/shared/utils";
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
  const collectionRate =
    safeItem.collectionRate ??
    (totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 0);

  // ── PAYMENT tab values ──────────────────────────────────────────
  const totalCost = safeItem.cost ?? 0;
  const totalPaidCost = safeItem.paidCost ?? 0;
  const costPaymentRate =
    safeItem.costPaymentRate ??
    (totalCost > 0 ? (totalPaidCost / totalCost) * 100 : 0);

  const monthLabel = formatMonth(safeItem.label);
  const mainRate = isReceipt ? collectionRate : costPaymentRate;
  const mainBilled = isReceipt ? totalBilled : totalCost;

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
  const classificationCount = new Set([
    ...receivableClassificationRows.map((row) => row.key),
    ...payableClassificationRows.map((row) => row.key),
  ]).size;

  // ── Build Drawer Top Tabs (Main Tabs cấp Drawer chuẩn /standardize-drawer) ──
  const drawerTabs = useMemo<DrawerTopTabItem[]>(() => {
    const tabs: DrawerTopTabItem[] = [
      // Main Tab 1: Phân loại Nghiệp vụ
      {
        key: "classification",
        label: isReceipt ? "Phân loại Nghiệp vụ" : "Phân loại Chi phí",
        icon: <TableIcon className="w-3.5 h-3.5" />,
        badgeCount: classificationCount,
        content: (
          <div className="space-y-4">
            <DrawerSection
              title={t(
                "progress.sections.receivableClassification",
                "Bảng Phải thu theo nghiệp vụ",
              )}
              titleExtra={`${receivableClassificationRows.length}/${receivableClassificationRows.length} phân loại`}
              collapsible
              defaultCollapsed={false}
            >
              <MonthClassificationTable
                rows={receivableClassificationRows}
                debtType="receivables"
                totalBilled={totalBilled}
                tableId="garage-month-detail-receivables-table"
                onSelectClassification={handleSelectClassification}
              />
            </DrawerSection>
            <DrawerSection
              title={t(
                "progress.sections.payableClassification",
                "Bảng Phải trả theo chi phí",
              )}
              titleExtra={`${payableClassificationRows.length}/${payableClassificationRows.length} phân loại`}
              collapsible
              defaultCollapsed={false}
            >
              <MonthClassificationTable
                rows={payableClassificationRows}
                debtType="payables"
                totalBilled={totalCost}
                tableId="garage-month-detail-payables-table"
                onSelectClassification={handleSelectClassification}
              />
            </DrawerSection>
          </div>
        ),
      },
    ];

    // Main Tab 2: Chi tiết Thu KH & Thu BH theo Đối tượng Hóa đơn (Chỉ hiển thị khi là Phải Thu)
    if (isReceipt) {
      tabs.push({
        key: "partner_breakdown",
        label: t(
          "progress.tabs.partnerClassification",
          "Phân loại theo đối tượng",
        ),
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        badgeCount: insuranceCompanies.length + customerPartners.length,
        content: (
          <div className="flex flex-col gap-3.5">
            {vatWarningInfo?.hasVatWithoutInvoice && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Cảnh báo VAT:</strong> Có{" "}
                  {vatWarningInfo.casesWithVatNoInvoiceCount} vụ việc chưa xuất
                  hoặc đính kèm hóa đơn điện tử.
                </span>
              </div>
            )}
            <DrawerSection
              title={t(
                "progress.sections.customerCollection",
                "Thu khách hàng",
              )}
              titleExtra={`${customerPartners.length} đối tượng`}
              collapsible
              defaultCollapsed={false}
            >
              <MonthInvoicePartnerTable
                items={customerPartners}
                tableId="garage-month-detail-customer-partners-table"
                totalBilled={breakdownSummary?.totalBilled ?? mainBilled}
                onSelectGroup={handleSelectPartnerGroup}
              />
            </DrawerSection>
            <DrawerSection
              title={t("progress.sections.insuranceCollection", "Thu bảo hiểm")}
              titleExtra={`${insuranceCompanies.length} đối tượng`}
              collapsible
              defaultCollapsed={false}
            >
              <MonthInvoicePartnerTable
                items={insuranceCompanies}
                tableId="garage-month-detail-insurance-companies-table"
                totalBilled={breakdownSummary?.totalBilled ?? mainBilled}
                onSelectGroup={handleSelectPartnerGroup}
              />
            </DrawerSection>
          </div>
        ),
      });
    }

    return tabs;
  }, [
    isReceipt,
    t,
    classificationCount,
    receivableClassificationRows,
    payableClassificationRows,
    totalBilled,
    totalCost,
    insuranceCompanies,
    customerPartners,
    breakdownSummary,
    vatWarningInfo,
    mainBilled,
    handleSelectClassification,
    handleSelectPartnerGroup,
  ]);

  const rightPanel =
    isReceipt && breakdownSummary ? (
      <div className="flex flex-col gap-3.5 w-full">
        <DrawerSection
          title={t(
            "progress.sections.payerComposition",
            "Cơ cấu Thu KH vs Thu BH",
          )}
          collapsible
          defaultCollapsed={false}
        >
          <MonthPayerKpiGrid summary={breakdownSummary} />
        </DrawerSection>
      </div>
    ) : undefined;
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
