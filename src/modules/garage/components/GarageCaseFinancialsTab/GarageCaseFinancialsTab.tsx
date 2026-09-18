import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Landmark,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { PillTabs } from "@/shared/components/PillTabs";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/utils";
import { money } from "@/shared/utils/format";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";
import { ManualCashflowTabContent } from "../GarageCaseReconciliationDrawer/components/ManualCashflowTabContent";
import { InvoiceTabContent } from "../GarageCaseReconciliationDrawer/components/InvoiceTabContent";
import { useGarageCaseFinancials } from "./context/GarageCaseFinancialsContext";
import type {
  GarageCaseFinancialsTabProps,
  FinancialsSubTabKey,
  FinancialsTableViewPreset,
} from "./types";

export function GarageCaseFinancialsTab(props: GarageCaseFinancialsTabProps) {
  void props;
  const { t } = useTranslation(["garage", "erpInvoices", "common"]);
  const logic = useGarageCaseFinancials();

  // Sub-tabs list filtered by active domainDirection & hasVat (Non-VAT cases only show manual cashflow)
  const subTabItems = useMemo(() => {
    if (!logic.hasVat) {
      if (logic.domainDirection === "REVENUE") {
        return [
          {
            value: "manual_cashflow",
            label: t(
              "cases.financials.tabManualCashReceiptSingle",
              "Thu ngoài sổ",
            ),
            icon: Receipt,
          },
        ];
      }
      return [
        {
          value: "manual_cashflow",
          label: t(
            "cases.financials.tabManualCashPaymentSingle",
            "Chi ngoài sổ",
          ),
          icon: Receipt,
        },
      ];
    }

    if (logic.domainDirection === "REVENUE") {
      return [
        {
          value: "invoices_out",
          label: t("cases.financials.tabInvoicesOut", "1. HĐ Đầu ra"),
          icon: ArrowDownLeft,
          badgeCount:
            logic.selectedInvoicesCount > 0 &&
            logic.activeTab === "invoices_out"
              ? logic.selectedInvoicesCount
              : logic.initialLinkedOutCount > 0
                ? logic.initialLinkedOutCount
                : undefined,
        },
        {
          value: "manual_cashflow",
          label: t("cases.financials.tabManualCashReceipt", "2. Thu ngoài sổ"),
          icon: Receipt,
        },
      ];
    }

    return [
      {
        value: "invoices_in",
        label: t("cases.financials.tabInvoicesIn", "1. HĐ Đầu vào"),
        icon: ArrowUpRight,
        badgeCount:
          logic.selectedInvoicesCount > 0 && logic.activeTab === "invoices_in"
            ? logic.selectedInvoicesCount
            : logic.initialLinkedInCount > 0
              ? logic.initialLinkedInCount
              : undefined,
      },
      {
        value: "manual_cashflow",
        label: t("cases.financials.tabManualCashPayment", "2. Chi ngoài sổ"),
        icon: Receipt,
      },
    ];
  }, [
    logic.hasVat,
    logic.domainDirection,
    logic.activeTab,
    logic.selectedInvoicesCount,
    logic.initialLinkedOutCount,
    logic.initialLinkedInCount,
    t,
  ]);

  // Presets list for Invoices
  const invoicePresetItems: {
    key: FinancialsTableViewPreset;
    label: string;
    icon: any;
    count: number;
  }[] = useMemo(() => {
    const isOut = logic.activeTab === "invoices_out";
    const linkedCount = isOut
      ? logic.initialLinkedOutCount
      : logic.initialLinkedInCount;

    return [
      {
        key: "all",
        label: t("cases.financials.presetAll", "Tất cả"),
        icon: Landmark,
        count: logic.invoiceData?.total || 0,
      },
      {
        key: "suggestions",
        label: t("cases.financials.presetSuggestions", "Gợi ý khớp"),
        icon: Sparkles,
        count: logic.invoiceSuggestions.length,
      },
      {
        key: "selected",
        label: t("cases.financials.presetSelected", "Đang chọn"),
        icon: CheckCircle2,
        count: logic.selectedInvoicesCount,
      },
      {
        key: "linked",
        label: t("cases.financials.presetLinked", "Đã cấn trừ"),
        icon: Receipt,
        count: linkedCount,
      },
    ];
  }, [
    logic.activeTab,
    logic.initialLinkedOutCount,
    logic.initialLinkedInCount,
    logic.invoiceData?.total,
    logic.invoiceSuggestions.length,
    logic.selectedInvoicesCount,
    t,
  ]);

  return (
    <div className="space-y-3 pb-2">
      {/* ─── 0. MASTER DOMAIN SWITCHER (2 LÀN TÀI CHÍNH) ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5 p-0.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-md">
          <button
            type="button"
            onClick={() => logic.setDomainDirection("REVENUE")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer select-none",
              logic.domainDirection === "REVENUE"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                logic.domainDirection === "REVENUE"
                  ? "bg-white animate-pulse"
                  : "bg-emerald-500",
              )}
            />
            <span>
              {t("cases.financials.domainRevenue", "1. DOANH THU (KHÁCH HÀNG)")}
            </span>
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded font-normal",
                logic.domainDirection === "REVENUE"
                  ? "bg-black/20 text-white"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
              )}
            >
              {money(logic.targetRevenue)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => logic.setDomainDirection("COST")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer select-none",
              logic.domainDirection === "COST"
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200",
            )}
          >
            <span
              className={cn(
                "w-2 h-2 rounded-full",
                logic.domainDirection === "COST"
                  ? "bg-white dark:bg-slate-900 animate-pulse"
                  : "bg-slate-400",
              )}
            />
            <span>
              {t(
                "cases.financials.domainCost",
                "2. CHI PHÍ (NHÀ CUNG CẤP / THỢ)",
              )}
            </span>
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded font-normal",
                logic.domainDirection === "COST"
                  ? "bg-black/20 text-white dark:bg-black/10 dark:text-slate-900"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
              )}
            >
              {money(logic.targetCost)}
            </span>
          </button>
        </div>

        {/* Quick KPI stats in header */}
        <div className="flex items-center gap-3 text-xs pr-2">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">
              {logic.domainDirection === "REVENUE"
                ? t("cases.financials.collected", "Đã thu:")
                : t("cases.financials.paid", "Đã chi:")}
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {money(
                logic.domainDirection === "REVENUE"
                  ? logic.totalCollected
                  : logic.totalPaid,
              )}
            </span>
          </div>

          <div className="h-3 w-[1px] bg-slate-300 dark:bg-slate-700" />

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">
              {logic.domainDirection === "REVENUE"
                ? t("cases.financials.remainingReceivable", "Còn phải thu:")
                : t("cases.financials.remainingPayable", "Còn phải chi:")}
            </span>
            <span
              className={cn(
                "font-mono font-bold",
                (logic.domainDirection === "REVENUE"
                  ? logic.effectiveReceivable
                  : logic.effectivePayable) > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400",
              )}
            >
              {money(
                logic.domainDirection === "REVENUE"
                  ? logic.effectiveReceivable
                  : logic.effectivePayable,
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 1. THANH ĐIỀU HƯỚNG TỔNG HỢP: SUB-TABS + PRESET PILLS ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        {/* Bên trái: Sub-Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <PillTabs
            size="sm"
            value={logic.activeTab}
            onValueChange={(val) => {
              logic.setActiveTab(val as FinancialsSubTabKey);
              logic.setViewPreset("all");
            }}
            items={subTabItems}
          />
        </div>

        {/* Bên phải: Preset Pills khi ở tab Hóa đơn */}
        {(logic.activeTab === "invoices_out" ||
          logic.activeTab === "invoices_in") && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 p-0.5">
              {invoicePresetItems.map((preset) => {
                const isActive = logic.viewPreset === preset.key;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => logic.setViewPreset(preset.key)}
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

            {logic.editMode && logic.selectedInvoicesCount > 0 && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                  {money(logic.selectedInvoicesTotal)}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => logic.handleSelectAllInvoices(false)}
                  className="h-6 text-[11px] px-1.5 text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                >
                  {t("cases.financials.unselect", "Bỏ chọn")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 2. NỘI DUNG TƯƠNG ỨNG VỚI SUB-TAB ─── */}
      {logic.activeTab === "manual_cashflow" && (
        <ManualCashflowTabContent
          editMode={logic.editMode}
          activeSettlements={logic.activeSettlements}
          onRemoveSettlement={logic.onRemoveSettlement}
          settlementType={logic.settlementType}
          baseRemaining={logic.baseRemaining}
          manualAmount={logic.manualAmount}
          manualCategory={logic.manualCategory}
          manualDate={logic.manualDate}
          manualPartner={logic.manualPartner}
          manualNote={logic.manualNote}
          onSetManualAmount={logic.setManualAmount}
          onSetManualCategory={logic.setManualCategory}
          onSetManualDate={logic.setManualDate}
          onSetManualPartner={logic.setManualPartner}
          onSetManualNote={logic.setManualNote}
        />
      )}

      {(logic.activeTab === "invoices_out" ||
        logic.activeTab === "invoices_in") && (
        <InvoiceTabContent
          invoiceDirection={logic.activeTab === "invoices_in" ? "IN" : "OUT"}
          invoiceItems={logic.invoiceItems}
          selectedInvoicesList={logic.selectedInvoicesList}
          selectedInvoicesCount={logic.selectedInvoicesCount}
          selectedInvoicesTotal={logic.selectedInvoicesTotal}
          selectedInvoicesMap={logic.selectedInvoicesMap}
          invoiceDataTotal={logic.displayInvoiceTotal}
          invoiceDataTotalPages={logic.displayInvoiceTotalPages}
          invoicePage={logic.invoicePage}
          invoicePageSize={logic.invoicePageSize}
          isLoadingInvoices={
            logic.isLoadingInvoices && logic.viewPreset === "all"
          }
          invoiceDateFrom={logic.invoiceDateFrom}
          invoiceDateTo={logic.invoiceDateTo}
          invoiceTableState={logic.invoiceTableState}
          onToggleInvoice={logic.handleToggleInvoice}
          onSelectAllInvoices={logic.handleSelectAllInvoices}
          onViewInvoiceDetail={(id: string) => logic.setViewInvoiceId(id)}
          onPreviewInvoicePdf={(pdf: any) => logic.setPreviewPdf(pdf)}
          onSetInvoicePage={logic.setInvoicePage}
          onSetInvoicePageSize={logic.setInvoicePageSize}
          onSetInvoiceDateFrom={logic.setInvoiceDateFrom}
          onSetInvoiceDateTo={logic.setInvoiceDateTo}
          editMode={logic.editMode}
          viewPreset={logic.viewPreset}
          onSelectAllSuggestions={logic.handleSelectAllSuggestions}
          suggestionsCount={logic.invoiceSuggestions.length}
        />
      )}

      {/* ─── 3. DETAIL DRAWERS & PREVIEWS ─── */}
      {logic.detailTxnId && (
        <BankTransactionDetailDrawer
          isOpen={!!logic.detailTxnId}
          onClose={() => logic.setDetailTxnId(null)}
          transactionId={logic.detailTxnId}
        />
      )}

      {logic.viewInvoiceId && (
        <ErpInvoiceStandaloneDrawer
          isOpen={!!logic.viewInvoiceId}
          invoiceId={logic.viewInvoiceId}
          onClose={() => logic.setViewInvoiceId(null)}
        />
      )}

      {logic.previewPdf && (
        <FilePreviewDrawer
          open={Boolean(logic.previewPdf)}
          onClose={() => logic.setPreviewPdf(null)}
          previewUrl={logic.previewPdf.url}
          fileName={logic.previewPdf.filename}
        />
      )}
    </div>
  );
}
