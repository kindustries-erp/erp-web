import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { BankTransactionDetailDrawer } from "@/pages/finance/components/BankTransactionDetailDrawer";
import { type VoucherNetoffSelectionModalProps } from "./types";
import { useVoucherNetoffSelectionLogic } from "./hooks/useVoucherNetoffSelectionLogic";
import { useVoucherNetoffTabs } from "./hooks/useVoucherNetoffTabs";
import { NetOffRightPanel } from "./components/NetOffRightPanel";

export function VoucherNetoffSelectionModal(
  props: VoucherNetoffSelectionModalProps,
) {
  const { t } = useTranslation(["erpInvoices", "common"]);
  const logic = useVoucherNetoffSelectionLogic(props);
  const { invoiceDrawerTabs, garageDrawerTabs } = useVoucherNetoffTabs({
    logic,
    invoiceDirection: props.invoiceDirection,
  });

  return (
    <>
      <StandardFormDrawer
        open={props.open}
        mode="edit"
        onClose={props.onClose}
        title={logic.computedTitle}
        subtitle={logic.computedSubtitle}
        layout="2-columns"
        size="xl"
        tabs={
          logic.isInvoiceContext
            ? invoiceDrawerTabs
            : props.isTabsMode
              ? garageDrawerTabs
              : undefined
        }
        activeTabKey={
          logic.isInvoiceContext
            ? logic.activeInvoiceTab
            : props.isTabsMode
              ? logic.activeGarageTab
              : undefined
        }
        onTabChange={
          logic.isInvoiceContext
            ? (k) => logic.setActiveInvoiceTab(k as any)
            : props.isTabsMode
              ? (k) => logic.setActiveGarageTab(k as any)
              : undefined
        }
        collapsibleRightPanel={true}
        stickyRightPanel={false}
        actions={[
          {
            label: t("common:cancel", "Hủy"),
            variant: "outline",
            onClick: props.onClose,
            disabled: props.isSubmitting,
          },
          {
            label: props.isSubmitting
              ? t("common:saving", "Đang lưu...")
              : (logic.isInvoiceContext &&
                    logic.activeInvoiceTab === "bank_statement") ||
                  (!logic.isInvoiceContext &&
                    logic.activeGarageTab === "ON_SYSTEM")
                ? logic.selectedIds.length > 0
                  ? logic.isInvoiceContext
                    ? t(
                        "confirmNetOffWithCount",
                        "Xác nhận cấn trừ ({{count}} GD)",
                        {
                          count: logic.selectedIds.length,
                        },
                      )
                    : logic.settlementType === "RECEIPT"
                      ? t(
                          "confirmReceiptWithCount",
                          "Xác nhận thu cấn trừ ({{count}})",
                          { count: logic.selectedIds.length },
                        )
                      : t(
                          "confirmPaymentWithCount",
                          "Xác nhận chi cấn trừ ({{count}})",
                          { count: logic.selectedIds.length },
                        )
                  : t("confirm", "Xác nhận cấn trừ")
                : logic.settlementType === "RECEIPT"
                  ? t("confirmManualReceipt", "Xác nhận ghi nhận thu ngoài")
                  : t("confirmManualPayment", "Xác nhận ghi nhận chi ngoài"),
            primary: true,
            disabled:
              props.isSubmitting ||
              (logic.isInvoiceContext &&
                logic.activeInvoiceTab === "cash_book") ||
              (!logic.isInvoiceContext &&
                logic.activeGarageTab === "ON_SYSTEM" &&
                (logic.selectedIds.length === 0 || logic.isOverRemaining)) ||
              (logic.isInvoiceContext &&
                logic.activeInvoiceTab === "bank_statement" &&
                (logic.selectedIds.length === 0 || logic.isOverRemaining)) ||
              (!logic.isInvoiceContext &&
                logic.activeGarageTab === "OFF_SYSTEM_MANUAL" &&
                (!logic.manualAmount || logic.manualAmount <= 0)),
            onClick: logic.handleSubmit,
          },
        ]}
        rightPanel={
          <NetOffRightPanel
            isInvoiceContext={logic.isInvoiceContext}
            invoiceDirection={props.invoiceDirection}
            settlementType={logic.settlementType}
            handleSwitchSettlementType={logic.handleSwitchSettlementType}
            resolvedTarget={logic.resolvedTarget}
            invoice={props.invoice}
            caseCode={props.caseCode}
            currentRemaining={logic.currentRemaining}
            totalCurrentNetOff={logic.totalCurrentNetOff}
            remainingAfterNetOff={logic.remainingAfterNetOff}
            isOverRemaining={logic.isOverRemaining}
            suggestedDebtDiff={logic.suggestedDebtDiff}
            filteredSuggestions={logic.filteredSuggestions}
            isLoadingSuggestions={logic.isLoadingSuggestions}
            handleSelectAllFilteredSuggestions={
              logic.handleSelectAllFilteredSuggestions
            }
            selectedIds={logic.selectedIds}
            netOffAmounts={logic.netOffAmounts}
            handleAmountChange={logic.handleAmountChange}
            handleToggleSuggestion={logic.handleToggleSuggestion}
            setDetailTxnId={logic.setDetailTxnId}
            existingCaseSettlements={props.existingCaseSettlements}
          />
        }
      />

      {logic.detailTxnId && (
        <BankTransactionDetailDrawer
          transactionId={logic.detailTxnId}
          isOpen={!!logic.detailTxnId}
          onClose={() => logic.setDetailTxnId(null)}
        />
      )}
    </>
  );
}
