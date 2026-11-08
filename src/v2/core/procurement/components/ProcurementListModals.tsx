import * as React from "react";
import { V2ConfirmModal } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementListConfig } from "../hooks/procurementListConfig.type";
import type { ProcurementListState } from "../hooks/useProcurementList";
import { ProcurementReasonModal } from "./ProcurementReasonModal";
import { SubmitApprovalModal } from "./organisms/submit-approval-modal";
import { ProcurementApproveModal } from "./organisms/procurement-approve-modal";

export interface ProcurementListModalsProps<T extends { id: string }> {
  config: ProcurementListConfig<T>;
  state: ProcurementListState<T>;
}

/** Bốn modal của màn danh sách: lý do, xóa nháp, xóa vĩnh viễn, duyệt, xác nhận thao tác. */
export function ProcurementListModals<T extends { id: string }>({
  config,
  state,
}: ProcurementListModalsProps<T>) {
  const { t } = useV2Translation();
  const reasonLabel = state.reasonTarget
    ? `${t(`v2.procurement.actions.${state.reasonTarget.action}`, state.reasonTarget.action)} ${config.rowLabel(state.reasonTarget.row)}`
    : "";
  const confirm = state.confirmTarget;
  const isApproveConfirm = confirm?.action === "approve";

  return (
    <>
      <ProcurementReasonModal
        open={Boolean(state.reasonTarget)}
        title={reasonLabel}
        isLoading={state.isTransitioning}
        onCancel={state.closeReason}
        onConfirm={state.submitReason}
      />
      <SubmitApprovalModal
        open={Boolean(state.approval.submitTarget)}
        rowLabel={
          state.approval.submitTarget
            ? config.rowLabel(state.approval.submitTarget)
            : ""
        }
        target={state.approval.submitTarget}
        onViewDetail={() => {
          if (state.approval.submitTarget) {
            state.openView(state.approval.submitTarget.id);
            state.approval.closeSubmit();
          }
        }}
        approvers={state.approval.approvers}
        loading={state.approval.approversLoading}
        submitting={state.isTransitioning}
        onConfirm={state.submitWithApprover}
        onCancel={state.approval.closeSubmit}
      />
      <ProcurementApproveModal
        open={Boolean(confirm && isApproveConfirm)}
        rowLabel={confirm ? config.rowLabel(confirm.row) : ""}
        target={confirm?.row}
        loading={state.isTransitioning}
        onConfirm={state.confirmAction}
        onCancel={state.closeConfirm}
        onViewDetail={() => {
          if (confirm?.row) {
            state.openView(confirm.row.id);
            state.closeConfirm();
          }
        }}
      />
      <V2ConfirmModal
        open={Boolean(state.deleteTarget)}
        title={t("v2.procurement.delete.title", "Xóa đơn nháp")}
        message={
          state.deleteTarget
            ? `${t("v2.procurement.delete.message", "Đơn nháp sẽ bị xóa. Bạn có chắc không?")} ${config.rowLabel(state.deleteTarget)}`
            : ""
        }
        confirmLabel={t("v2.procurement.actions.delete", "Xóa")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        isLoading={state.isTransitioning}
        onConfirm={state.confirmDelete}
        onCancel={state.closeDelete}
        onOpenChange={(open) => !open && state.closeDelete()}
      />
      <V2ConfirmModal
        open={Boolean(state.purgeTarget)}
        title={t("v2.procurement.purge.title", "Xóa vĩnh viễn đơn nháp")}
        message={
          state.purgeTarget
            ? `${t("v2.procurement.purge.message", "Đơn nháp sẽ bị xóa khỏi hệ thống và không khôi phục được. Bạn có chắc không?")} ${config.rowLabel(state.purgeTarget)}`
            : ""
        }
        confirmLabel={t("v2.procurement.actions.purge", "Xóa vĩnh viễn")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        isLoading={state.isTransitioning}
        onConfirm={state.confirmPurge}
        onCancel={state.closePurge}
        onOpenChange={(open) => !open && state.closePurge()}
      />
      <V2ConfirmModal
        open={Boolean(confirm && !isApproveConfirm)}
        title={t("v2.procurement.confirm.title", "Xác nhận thao tác")}
        message={
          confirm
            ? `${t("v2.procurement.confirm.message", "Bạn có chắc muốn thực hiện thao tác này?")} ${config.rowLabel(confirm.row)}`
            : ""
        }
        confirmLabel={
          confirm
            ? t(`v2.procurement.actions.${confirm.action}`, confirm.action)
            : ""
        }
        cancelLabel={t("v2.common.cancel", "Hủy")}
        isLoading={state.isTransitioning}
        onConfirm={state.confirmAction}
        onCancel={state.closeConfirm}
        onOpenChange={(open) => !open && state.closeConfirm()}
      />
    </>
  );
}
