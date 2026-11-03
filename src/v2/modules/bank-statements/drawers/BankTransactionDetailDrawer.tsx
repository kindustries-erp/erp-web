import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { CashPostingSection } from "../components/organisms/cash-posting-section";
import { CashTraceabilitySection } from "../components/organisms/cash-traceability-section";
import {
  existingInvoiceIdsOf,
  netOffCapacityOf,
} from "./BankTransactionDetailDrawer.helper";
import { BankGeneralInfo } from "../components/organisms/bank-general-info";
import { buildBankDetailActions } from "./BankTransactionDetailDrawer.actions";
import { buildBankDetailTabs } from "./BankTransactionDetailDrawer.tabs";
import { useBankTransactionDetailDrawer } from "./BankTransactionDetailDrawer.hook";
import type {
  BankTopTabKey,
  BankTransactionDetailDrawerProps,
} from "./BankTransactionDetailDrawer.type";
import { canShowPartnerTabs } from "../domain/rules/partnerTabVisibility";
import { CashPartnerAnalytics } from "../components/organisms/cash-partner-analytics";
import { CashPartnerTransactions } from "../components/organisms/cash-partner-transactions";

/** Chi tiết giao dịch ngân hàng (V2): Top Tab & Sub-tab 2 tầng chuẩn erp-invoice */
export function BankTransactionDetailDrawer(
  props: BankTransactionDetailDrawerProps,
) {
  const state = useBankTransactionDetailDrawer(props);
  const { t, tx, draft } = state;
  const editing = state.mode === "edit";
  const showPartner = tx ? canShowPartnerTabs(tx) : false;
  const activeKey =
    state.activeTab === "partner" && !showPartner ? "details" : state.activeTab;

  const partnerList =
    tx && showPartner ? (
      <CashPartnerTransactions
        correspondentAccount={tx.correspondentAccount ?? ""}
        correspondentName={tx.correspondentName ?? ""}
        onSelectTransaction={props.onSelectTransaction}
      />
    ) : undefined;

  const partnerAnalytics =
    tx && showPartner ? (
      <CashPartnerAnalytics
        correspondentAccount={tx.correspondentAccount ?? ""}
        correspondentName={tx.correspondentName ?? ""}
      />
    ) : undefined;

  const traceability = tx ? (
    <CashTraceabilitySection
      transactionId={tx.id}
      editMode={editing}
      direction={Number(tx.creditAmount || 0) > 0 ? "OUT" : "IN"}
      existingInvoiceIds={existingInvoiceIdsOf(tx)}
      maxAvailableAmount={netOffCapacityOf(tx)}
    />
  ) : null;

  const accounting = state.posting ? (
    <CashPostingSection
      posting={state.posting}
      editMode={editing}
      accounts={state.accounts}
      onToggleAccounting={state.postingActions.setAccountingEnabled}
      onPostingDateChange={state.postingActions.setPostingDate}
      onDescriptionChange={state.postingActions.setDescription}
      onLinesChange={state.postingActions.setLines}
      t={t}
    />
  ) : null;

  return (
    <>
      <V2StandardDrawer
        id={`bank-transaction-${props.transactionId ?? "none"}`}
        open={props.isOpen}
        onClose={props.onClose}
        mode={state.mode}
        onToggleEdit={tx && !editing ? () => state.setMode("edit") : undefined}
        title={t("v2.bankStatements.bankDetail.title")}
        subtitle={tx?.referenceNumber || undefined}
        layout="2-columns"
        size="xl"
        collapsibleRightPanel
        loading={state.loading}
        confirmOnClose={editing && state.dirty}
        tabs={
          tx
            ? buildBankDetailTabs({
                transaction: tx,
                historyItems: state.historyItems,
                accounting,
                traceability,
                partnerList,
                partnerAnalytics,
                detailsSubTab: state.detailsSubTab,
                onDetailsSubTabChange: state.setDetailsSubTab,
                partnerSubTab: state.partnerSubTab,
                onPartnerSubTabChange: state.setPartnerSubTab,
                isPosted: tx.postingStatus === "POSTED",
                netOffCount: state.netOffCount,
                customTabs: props.customTabs,
                t,
              })
            : []
        }
        activeTabKey={activeKey satisfies BankTopTabKey}
        onTabChange={(key) => state.setActiveTab(key as BankTopTabKey)}
        rightPanel={
          tx && draft ? (
            <BankGeneralInfo
              transaction={tx}
              editMode={editing}
              draft={draft}
              branchOptions={state.branchOptions}
              onBranchChange={(ids) => state.updateDraft("branchIds", ids)}
              onPartnerChange={(value, label) => {
                state.updateDraft("partnerValue", value);
                state.updateDraft("partnerLabel", label);
              }}
              onDescriptionChange={(value) =>
                state.updateDraft("description", value)
              }
              onClassificationChange={(value) =>
                state.updateDraft("classification", value)
              }
              onPurposeChange={(value) => state.updateDraft("purpose", value)}
              t={t}
            />
          ) : undefined
        }
        footerLeft={
          state.formError ? (
            <V2AlertBanner>{state.formError}</V2AlertBanner>
          ) : undefined
        }
        actions={buildBankDetailActions({
          mode: state.mode,
          saving: state.saving,
          canSave: state.dirty,
          t,
          onClose: props.onClose,
          onCancel: state.cancelEdit,
          onSave: state.submit,
        })}
      />
      <V2ConfirmModal
        open={state.confirmUnpost}
        onOpenChange={state.setConfirmUnpost}
        title={t("v2.bankStatements.bankDetail.posting.unpostConfirm.title")}
        message={t(
          "v2.bankStatements.bankDetail.posting.unpostConfirm.message",
        )}
        confirmLabel={t(
          "v2.bankStatements.bankDetail.posting.unpostConfirm.confirm",
        )}
        variant="danger"
        onConfirm={state.confirmUnpostAction}
        onCancel={() => state.setConfirmUnpost(false)}
      />
    </>
  );
}
