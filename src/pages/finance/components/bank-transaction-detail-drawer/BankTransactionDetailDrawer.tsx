import React from "react";
import { useTranslation } from "react-i18next";
import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { BankTransactionGeneralInfoSection } from "@/modules/bank-statements/components/BankTransactionGeneralInfoSection";
import { BankTransactionCashflowSection } from "@/modules/bank-statements/components/BankTransactionCashflowSection";
import { BankTransactionPartnerField } from "@/modules/bank-statements/components/BankTransactionPartnerField";
import { InvoiceNetoffSelectionModal } from "@/modules/bank-statements/components/InvoiceNetoffSelectionModal";
import { useBankTransactionDetailDrawer } from "./BankTransactionDetailDrawer.hook";
import { useBankTransactionDrawerTabs } from "./BankTransactionDrawerTabs";
import type { BankTransactionDetailDrawerProps } from "./BankTransactionDetailDrawer.type";

export const BankTransactionDetailDrawer = React.memo(
  function BankTransactionDetailDrawer(
    props: BankTransactionDetailDrawerProps,
  ) {
    const { isOpen, onClose, customTabs } = props;
    const { t } = useTranslation();

    const drawer = useBankTransactionDetailDrawer(props);

    const tabs = useBankTransactionDrawerTabs({
      transaction: drawer.transaction,
      editMode: drawer.editMode,
      isPosted: drawer.isPosted,
      subTabKey: drawer.subTabKey,
      onSubTabChange: drawer.setSubTabKey,
      partnerSubTabKey: drawer.partnerSubTabKey,
      accountingEnabled: drawer.accountingEnabled,
      onToggleAccounting: () => drawer.setAccountingEnabled((v) => !v),
      postingState: drawer.postingState,
      defaultPostingDate: drawer.defaultPostingDate,
      baseDescription: drawer.baseDescription,
      unpostMutation: drawer.unpostMutation,
      onOpenNetoffModal: () => drawer.setShowInvoiceNetOffModal(true),
      onUnlinkNode: drawer.handleUnlinkInvoiceNode,
      auditItems: drawer.auditItems,
      customTabs,
    });

    if (!isOpen) return null;

    const rightPanelContent = drawer.transaction ? (
      <div className="space-y-4">
        <BankTransactionGeneralInfoSection
          transaction={drawer.transaction}
          editMode={drawer.editMode}
          branchIds={drawer.editBranchIds}
          onBranchChange={drawer.setEditBranchIds}
          description={drawer.editDescription}
          onDescriptionChange={drawer.setEditDescription}
          partnerField={
            <BankTransactionPartnerField
              editMode={drawer.editMode}
              direction={
                Number(drawer.transaction.creditAmount) > 0 ? "OUT" : "IN"
              }
              value={drawer.editPartnerValue}
              label={drawer.editPartnerLabel}
              onChange={(value, label) => {
                drawer.setEditPartnerValue(value);
                drawer.setEditPartnerLabel(label);
              }}
            />
          }
        />
        <BankTransactionCashflowSection
          classification={drawer.cashflowClassification}
          purpose={drawer.cashflowPurpose}
          editMode={drawer.editMode}
          onClassificationChange={drawer.setCashflowClassification}
          onPurposeChange={drawer.setCashflowPurpose}
        />
      </div>
    ) : null;

    return (
      <>
        <StandardFormDrawer
          open={isOpen}
          onClose={onClose}
          mode={drawer.editMode ? "edit" : "view"}
          title={t("bankStatement.actionDetail", {
            defaultValue: "Chi tiết giao dịch",
          })}
          loading={drawer.isLoading}
          tabs={tabs}
          rightPanel={rightPanelContent}
          layout="2-columns"
          size="xl"
          collapsibleRightPanel={true}
          onToggleEdit={
            !drawer.isLoading && drawer.transaction
              ? drawer.startEdit
              : undefined
          }
          actions={drawer.editMode ? drawer.editActions : drawer.viewActions}
          error={drawer.formError}
          confirmOnClose={drawer.editMode && drawer.postingState.isDirty}
        />

        {drawer.showInvoiceNetOffModal && drawer.transaction && (
          <InvoiceNetoffSelectionModal
            open={drawer.showInvoiceNetOffModal}
            onClose={() => drawer.setShowInvoiceNetOffModal(false)}
            onSelect={drawer.handleSelectInvoicesForNetOff}
            existingInvoiceIds={(drawer.transaction.invoiceNetOffs || []).map(
              (n: any) => n.invoiceId || n.invoice?.id,
            )}
            maxAvailableAmount={
              Math.max(
                Number(drawer.transaction.creditAmount || 0),
                Number(drawer.transaction.debitAmount || 0),
              ) - (drawer.transactionInsights?.netOffTotal || 0)
            }
            direction={
              Number(drawer.transaction.creditAmount || 0) > 0 ? "OUT" : "IN"
            }
          />
        )}
      </>
    );
  },
);
