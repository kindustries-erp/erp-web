import * as React from "react";
import { V2ConfirmModal } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementListConfig } from "../hooks/procurementListConfig.type";
import type { ProcurementListState } from "../hooks/useProcurementList";
import { ProcurementReasonModal } from "./ProcurementReasonModal";

export interface ProcurementListModalsProps<T extends { id: string }> {
  config: ProcurementListConfig<T>;
  state: ProcurementListState<T>;
}

/** Bốn modal của màn danh sách: lý do, xóa nháp, xóa vĩnh viễn, xác nhận thao tác. */
export function ProcurementListModals<T extends { id: string }>({
  config,
  state,
}: ProcurementListModalsProps<T>) {
  const { t } = useV2Translation();
  const reasonLabel = state.reasonTarget
    ? `${t(`v2.procurement.actions.${state.reasonTarget.action}`, state.reasonTarget.action)} ${config.rowLabel(state.reasonTarget.row)}`
    : "";
  const confirm = state.confirmTarget;

  return (
    <>
      <ProcurementReasonModal
        open={Boolean(state.reasonTarget)}
        title={reasonLabel}
        isLoading={state.isTransitioning}
        onCancel={state.closeReason}
        onConfirm={state.submitReason}
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
        open={Boolean(confirm)}
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
