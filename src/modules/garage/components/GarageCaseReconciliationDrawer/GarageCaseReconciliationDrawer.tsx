import React, { useMemo } from "react";
import { Landmark, Receipt, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import {
  StandardFormDrawer,
  type DrawerTopTabItem,
} from "@/shared/components/StandardFormDrawer";
import { money } from "@/shared/utils/format";
import { ErpInvoiceStandaloneDrawer } from "@/modules/erp-invoices-core/components/ErpInvoiceStandaloneDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { FilePreviewDrawer } from "@/shared/components/FilePreviewDrawer";

import { useGarageCaseReconciliationLogic } from "./useGarageCaseReconciliationLogic";
import { BankCashTabContent } from "./components/BankCashTabContent";
import { ManualCashflowTabContent } from "./components/ManualCashflowTabContent";
import { InvoiceTabContent } from "./components/InvoiceTabContent";
import { ReconciliationRightPanel } from "./components/ReconciliationRightPanel";
import type {
  GarageCaseReconciliationDrawerProps,
  ReconciliationTabKey,
} from "./types";

export function GarageCaseReconciliationDrawer(
  props: GarageCaseReconciliationDrawerProps,
) {
  const { open, onClose, caseId, caseCode } = props;
  const logic = useGarageCaseReconciliationLogic(props);
  const { t } = logic;

  // ─── MEMOIZED TOP NAVIGATION TABS (Standardize-Drawer SOP) ────────────────
  const drawerTabs: DrawerTopTabItem[] = useMemo(() => {
    return [
      // TAB 1: Hóa đơn Đầu ra
      {
        key: "invoices_out",
        label: t("cases.financials.tabInvoicesOut", "1. HĐ Đầu ra"),
        icon: <ArrowDownLeft className="w-3.5 h-3.5 text-muted-foreground" />,
        badgeCount:
          logic.selectedInvoicesCount > 0 && logic.activeTab === "invoices_out"
            ? logic.selectedInvoicesCount
            : logic.initialLinkedOutCount > 0
              ? logic.initialLinkedOutCount
              : undefined,
        content: (
          <InvoiceTabContent
            invoiceDirection="OUT"
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
            onViewInvoiceDetail={(id) => logic.setViewInvoiceId(id)}
            onPreviewInvoicePdf={(pdf) => logic.setPreviewPdf(pdf)}
            onSetInvoicePage={logic.setInvoicePage}
            onSetInvoicePageSize={logic.setInvoicePageSize}
            onSetInvoiceDateFrom={logic.setInvoiceDateFrom}
            onSetInvoiceDateTo={logic.setInvoiceDateTo}
            editMode={true}
            viewPreset={logic.viewPreset}
            onSelectAllSuggestions={logic.handleSelectAllSuggestions}
            suggestionsCount={logic.invoiceSuggestions.length}
          />
        ),
      },

      // TAB 2: Hóa đơn Đầu vào
      {
        key: "invoices_in",
        label: t("cases.financials.tabInvoicesIn", "2. HĐ Đầu vào"),
        icon: <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />,
        badgeCount:
          logic.selectedInvoicesCount > 0 && logic.activeTab === "invoices_in"
            ? logic.selectedInvoicesCount
            : logic.initialLinkedInCount > 0
              ? logic.initialLinkedInCount
              : undefined,
        content: (
          <InvoiceTabContent
            invoiceDirection="IN"
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
            onViewInvoiceDetail={(id) => logic.setViewInvoiceId(id)}
            onPreviewInvoicePdf={(pdf) => logic.setPreviewPdf(pdf)}
            onSetInvoicePage={logic.setInvoicePage}
            onSetInvoicePageSize={logic.setInvoicePageSize}
            onSetInvoiceDateFrom={logic.setInvoiceDateFrom}
            onSetInvoiceDateTo={logic.setInvoiceDateTo}
            editMode={true}
            viewPreset={logic.viewPreset}
            onSelectAllSuggestions={logic.handleSelectAllSuggestions}
            suggestionsCount={logic.invoiceSuggestions.length}
          />
        ),
      },

      // TAB 3: Sao kê
      {
        key: "bank_statement",
        label: t("cases.financials.tabBankStatement", "3. Sao kê"),
        icon: <Landmark className="w-3.5 h-3.5" />,
        badgeCount:
          logic.selectedIds.length > 0 && logic.activeTab === "bank_statement"
            ? logic.selectedIds.length
            : undefined,
        content: (
          <BankCashTabContent
            sourceType="BANK"
            vouchers={logic.vouchers}
            selectedBankItems={logic.selectedBankItems}
            selectedIds={logic.selectedIds}
            netOffAmounts={logic.netOffAmounts}
            maxAmounts={logic.maxAmounts}
            currentSelectedBankTotal={logic.currentSelectedBankTotal}
            bankDataTotal={logic.displayBankTotal}
            bankDataTotalPages={logic.displayBankTotalPages}
            bankPage={logic.bankPage}
            bankPageSize={logic.bankPageSize}
            isLoadingBank={logic.isLoadingBank && logic.viewPreset === "all"}
            bankDateFrom={logic.bankDateFrom}
            bankDateTo={logic.bankDateTo}
            bankTableState={logic.bankTableState}
            onSelectBankTxn={logic.handleSelectBankTxn}
            onSelectAllBankTxns={logic.handleSelectAllBankTxns}
            onBankAmountChange={logic.handleBankAmountChange}
            onViewBankDetail={(id) => logic.setDetailTxnId(id)}
            onSetBankPage={logic.setBankPage}
            onSetBankPageSize={logic.setBankPageSize}
            onSetBankDateFrom={logic.setBankDateFrom}
            onSetBankDateTo={logic.setBankDateTo}
            onNavigateToInvoiceTab={logic.handleNavigateToInvoiceTab}
            settlementType={logic.settlementType}
            editMode={true}
            viewPreset={logic.viewPreset}
            onSelectAllSuggestions={logic.handleSelectAllSuggestions}
            suggestionsCount={logic.bankSuggestions.length}
          />
        ),
      },

      // TAB 4: Sổ quỹ
      {
        key: "cash_book",
        label: t("cases.financials.tabCashBook", "4. Sổ quỹ"),
        icon: <Receipt className="w-3.5 h-3.5" />,
        badgeCount:
          logic.selectedIds.length > 0 && logic.activeTab === "cash_book"
            ? logic.selectedIds.length
            : undefined,
        content: (
          <BankCashTabContent
            sourceType="CASH"
            vouchers={logic.vouchers}
            selectedBankItems={logic.selectedBankItems}
            selectedIds={logic.selectedIds}
            netOffAmounts={logic.netOffAmounts}
            maxAmounts={logic.maxAmounts}
            currentSelectedBankTotal={logic.currentSelectedBankTotal}
            bankDataTotal={logic.displayBankTotal}
            bankDataTotalPages={logic.displayBankTotalPages}
            bankPage={logic.bankPage}
            bankPageSize={logic.bankPageSize}
            isLoadingBank={logic.isLoadingBank && logic.viewPreset === "all"}
            bankDateFrom={logic.bankDateFrom}
            bankDateTo={logic.bankDateTo}
            bankTableState={logic.bankTableState}
            onSelectBankTxn={logic.handleSelectBankTxn}
            onSelectAllBankTxns={logic.handleSelectAllBankTxns}
            onBankAmountChange={logic.handleBankAmountChange}
            onViewBankDetail={(id) => logic.setDetailTxnId(id)}
            onSetBankPage={logic.setBankPage}
            onSetBankPageSize={logic.setBankPageSize}
            onSetBankDateFrom={logic.setBankDateFrom}
            onSetBankDateTo={logic.setBankDateTo}
            onNavigateToInvoiceTab={logic.handleNavigateToInvoiceTab}
            settlementType={logic.settlementType}
            editMode={true}
            viewPreset={logic.viewPreset}
            onSelectAllSuggestions={logic.handleSelectAllSuggestions}
            suggestionsCount={logic.bankSuggestions.length}
          />
        ),
      },

      // TAB 5: Thu / Chi khác
      {
        key: "manual_cashflow",
        label: t("cases.financials.tabManualCash", "5. Thu / Chi khác"),
        icon: <Receipt className="w-3.5 h-3.5" />,
        content: (
          <ManualCashflowTabContent
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
        ),
      },
    ];
  }, [t, logic]);

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
        activeTabKey={logic.activeTab}
        onTabChange={(key) => logic.setActiveTab(key as ReconciliationTabKey)}
        rightPanel={
          <ReconciliationRightPanel
            caseId={caseId}
            caseCode={caseCode}
            caseSummary={logic.caseSummary}
            settlementType={logic.settlementType}
            activeTab={logic.activeTab}
            domainDirection={logic.domainDirection}
            onSetDomainDirection={logic.setDomainDirection}
            targetRevenue={logic.targetRevenue}
            targetCost={logic.targetCost}
            totalCollected={logic.totalCollected}
            totalPaid={logic.totalPaid}
            activeTabSettlementTotal={logic.activeTabSettlementTotal}
            isPaidFull={logic.isPaidFull}
            paymentPercent={logic.paymentPercent}
            remainingDebt={logic.remainingDebt}
            remainingAfterNetOff={logic.remainingAfterNetOff}
            selectedIds={logic.selectedIds}
            selectedInvoicesCount={logic.selectedInvoicesCount}
            invoiceNote={logic.invoiceNote}
            editMode={true}
            onSetSettlementType={logic.setSettlementType}
            onSetInvoiceNote={logic.setInvoiceNote}
          />
        }
        actions={[
          {
            label: t("common.cancel", "Hủy"),
            variant: "outline",
            onClick: onClose,
          },
          ...(logic.activeTab === "bank_statement" ||
          logic.activeTab === "cash_book" ||
          logic.activeTab === "manual_cashflow"
            ? [
                {
                  label:
                    logic.activeTab === "bank_statement" ||
                    logic.activeTab === "cash_book"
                      ? logic.selectedIds.length > 0
                        ? t("cases.reconciliation.confirmBankNetoff", {
                            amount: money(logic.currentSelectedBankTotal),
                            count: logic.selectedIds.length,
                            defaultValue: `Xác nhận cấn trừ ${money(logic.currentSelectedBankTotal)} (${logic.selectedIds.length} GD)`,
                          })
                        : t(
                            "cases.reconciliation.confirmBankNetoffDefault",
                            "Xác nhận cấn trừ",
                          )
                      : logic.currentManualAmount > 0
                        ? t("cases.reconciliation.recordManualCash", {
                            amount: money(logic.currentManualAmount),
                            defaultValue: `Ghi nhận dòng tiền: ${money(logic.currentManualAmount)}`,
                          })
                        : t(
                            "cases.reconciliation.recordManualCashDefault",
                            "Ghi nhận dòng tiền ngoài",
                          ),
                  disabled:
                    logic.activeTab === "bank_statement" ||
                    logic.activeTab === "cash_book"
                      ? logic.selectedIds.length === 0 ||
                        logic.currentSelectedBankTotal <= 0
                      : logic.currentManualAmount <= 0,
                  loading: logic.isSubmitting,
                  onClick: logic.handleSubmitBankAndCash,
                },
              ]
            : [
                {
                  label: logic.hasInvoiceChanges
                    ? t("cases.reconciliation.saveInvoiceLinks", {
                        count: logic.selectedInvoicesCount,
                        defaultValue: `Lưu liên kết (${logic.selectedInvoicesCount} HĐ)`,
                      })
                    : t(
                        "cases.reconciliation.noInvoiceChanges",
                        "Chưa có thay đổi",
                      ),
                  disabled: !logic.hasInvoiceChanges,
                  loading: logic.isSubmitting,
                  onClick: logic.handleSubmitInvoices,
                },
              ]),
        ]}
      />

      {/* ─── POPUPS CHO XEM CHI TIẾT SAO KÊ & HÓA ĐƠN ─── */}
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
          onClose={() => logic.setViewInvoiceId(null)}
          invoiceId={logic.viewInvoiceId}
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
    </>
  );
}
