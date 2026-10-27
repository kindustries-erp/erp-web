import { V2ConfirmModal } from "@/v2/shared/components/molecules/v2-confirm-modal";
import { V2AlertBanner } from "@/v2/shared/components/molecules/v2-alert-banner";
import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { CashPostingSection } from "../components/organisms/cash-posting-section";
import { CashTraceabilitySection } from "../components/organisms/cash-traceability-section";
import {
  existingInvoiceIdsOf,
  netOffCapacityOf,
} from "./CashTransactionDetailDrawer.helper";
import { CashGeneralInfo } from "../components/organisms/cash-general-info";
import { buildCashDetailActions } from "./CashTransactionDetailDrawer.actions";
import { buildCashDetailTabs } from "./CashTransactionDetailDrawer.tabs";
import {
  useCashTransactionDetailDrawer,
  type CashTransactionDetailDrawerProps,
} from "./CashTransactionDetailDrawer.hook";
import type { CashDetailTab } from "../domain/rules/resolveDetailTab";
import { canShowPartnerTabs } from "../domain/rules/partnerTabVisibility";
import { CashPartnerAnalytics } from "../components/organisms/cash-partner-analytics";
import { CashPartnerTransactions } from "../components/organisms/cash-partner-transactions";

/** Chi tiết giao dịch tiền mặt (V2): tab Chi tiết và Lịch sử, cột phải thông tin chung, sửa và lưu */
export function CashTransactionDetailDrawer(
  props: CashTransactionDetailDrawerProps,
) {
  const state = useCashTransactionDetailDrawer(props);
  const { t, tx, draft } = state;
  const editing = state.mode === "edit";
  const showPartner = tx ? canShowPartnerTabs(tx) : false;
  const activeKey =
    state.activeTab === "partner" && !showPartner ? "details" : state.activeTab;
  const partner =
    tx && showPartner ? (
      <div className="space-y-4">
        <CashPartnerTransactions
          correspondentAccount={tx.correspondentAccount ?? ""}
          correspondentName={tx.correspondentName ?? ""}
          onSelectTransaction={props.onSelectTransaction}
        />
        <CashPartnerAnalytics
          correspondentAccount={tx.correspondentAccount ?? ""}
          correspondentName={tx.correspondentName ?? ""}
        />
      </div>
    ) : undefined;
  const traceability = tx ? (
    <CashTraceabilitySection
      transactionId={tx.id}
      editMode={editing}
      direction={Number(tx.creditAmount) > 0 ? "OUT" : "IN"}
      existingInvoiceIds={existingInvoiceIdsOf(tx)}
      maxAvailableAmount={netOffCapacityOf(tx)}
    />
  ) : null;
  const accounting = (
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
  );

  return (
    <>
      <V2StandardDrawer
        id={`cash-transaction-${props.transactionId ?? "none"}`}
        open={props.isOpen}
        onClose={props.onClose}
        mode={state.mode}
        onToggleEdit={tx && !editing ? () => state.setMode("edit") : undefined}
        title={t("v2.bankStatements.cashDetail.title")}
        subtitle={tx?.referenceNumber || undefined}
        layout="2-columns"
        size="xl"
        collapsibleRightPanel
        loading={state.loading}
        confirmOnClose={editing && state.dirty}
        tabs={
          tx
            ? buildCashDetailTabs({
                transaction: tx,
                historyItems: state.historyItems,
                accounting,
                traceability,
                partner,
                t,
              })
            : []
        }
        activeTabKey={activeKey satisfies CashDetailTab}
        onTabChange={(key) => state.setActiveTab(key as CashDetailTab)}
        rightPanel={
          tx && draft ? (
            <CashGeneralInfo
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
        actions={buildCashDetailActions({
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
        title={t("v2.bankStatements.cashDetail.posting.unpostConfirm.title")}
        message={t(
          "v2.bankStatements.cashDetail.posting.unpostConfirm.message",
        )}
        confirmLabel={t(
          "v2.bankStatements.cashDetail.posting.unpostConfirm.confirm",
        )}
        variant="danger"
        onConfirm={state.confirmUnpostAction}
        onCancel={() => state.setConfirmUnpost(false)}
      />
    </>
  );
}
