import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { CashGeneralInfo } from "../components/organisms/cash-general-info";
import { buildCashDetailActions } from "./CashTransactionDetailDrawer.actions";
import { buildCashDetailTabs } from "./CashTransactionDetailDrawer.tabs";
import {
  useCashTransactionDetailDrawer,
  type CashTransactionDetailDrawerProps,
} from "./CashTransactionDetailDrawer.hook";
import type { CashDetailTab } from "../domain/rules/resolveDetailTab";

/** Chi tiết giao dịch tiền mặt (V2): tab Chi tiết và Lịch sử, cột phải thông tin chung, sửa và lưu */
export function CashTransactionDetailDrawer(
  props: CashTransactionDetailDrawerProps,
) {
  const state = useCashTransactionDetailDrawer(props);
  const { t, tx, draft } = state;
  const editing = state.mode === "edit";

  return (
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
      error={state.formError}
      confirmOnClose={editing && state.dirty}
      tabs={
        tx
          ? buildCashDetailTabs({
              transaction: tx,
              historyItems: state.historyItems,
              t,
            })
          : []
      }
      activeTabKey={state.activeTab satisfies CashDetailTab}
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
  );
}
