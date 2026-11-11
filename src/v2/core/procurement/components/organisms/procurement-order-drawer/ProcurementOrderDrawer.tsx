import { V2StandardDrawer } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { ProcurementDrawerProps } from "../../../procurement.drawer.type";
import { ProcurementDiscardModal } from "../../ProcurementDiscardModal";
import { ProcurementStatusBadge } from "../../molecules/procurement-status-badge";
import { useProcurementOrderDrawer } from "./ProcurementOrderDrawer.hook";
import { ProcurementOrderMainSections } from "./ProcurementOrderMainSections";
import { ProcurementOrderHeaderSection } from "./sections/ProcurementOrderHeaderSection";
import { ProcurementOrderSummarySection } from "./sections/ProcurementOrderSummarySection";
import { ProcurementAuditSection } from "../procurement-audit-section";

/** Drawer đơn mua hàng 2 cột: trái là dòng hàng, phải là đầu đơn và tổng quan. */
export function ProcurementOrderDrawer(props: ProcurementDrawerProps) {
  const { t } = useV2Translation();
  const state = useProcurementOrderDrawer(props);
  const title = state.creating
    ? t("v2.procurement.drawer.createOrder", "Tạo đơn mua hàng")
    : state.viewing
      ? t("v2.procurement.drawer.order", "Đơn mua hàng")
      : t("v2.procurement.drawer.editOrder", "Sửa đơn mua hàng");

  return (
    <>
      <V2StandardDrawer
        id={`procurement-order-${props.documentId ?? "new"}`}
        open={props.open}
        onClose={props.onClose}
        mode={state.viewing ? "view" : "edit"}
        onToggleEdit={
          state.viewing && state.editable && props.canUpdate && !state.creating
            ? () => state.setMode("edit")
            : undefined
        }
        confirmOnClose={state.dirty && !state.viewing}
        title={title}
        titleExtra={
          state.detail ? (
            <ProcurementStatusBadge value={state.status} t={t} />
          ) : undefined
        }
        subtitle={state.detail?.orderNo}
        layout="2-columns"
        size="xl"
        loading={state.loading}
        actions={
          state.viewing
            ? [
                ...(props.receive && state.detail
                  ? [
                      {
                        label: t("v2.procurement.actions.receive", "Nhập kho"),
                        onClick: () =>
                          props.receive?.onReceive({ id: state.detail!.id }),
                        primary: true,
                        disabled: !props.receive.canReceive(state.detail),
                      },
                    ]
                  : []),
                {
                  label: t("v2.common.close", "Đóng"),
                  onClick: props.onClose,
                  variant: "outline",
                },
              ]
            : [
                {
                  label: t("v2.common.cancel", "Hủy"),
                  onClick: state.cancelEdit,
                  variant: "outline",
                  disabled: state.saving,
                },
                {
                  label: t("v2.procurement.actions.saveDraft", "Lưu nháp"),
                  onClick: state.submit,
                  primary: !state.directConfirm,
                  loading: state.saving,
                  disabled: state.saving || state.loading,
                },
                ...(state.directConfirm
                  ? [
                      {
                        label: state.creating
                          ? t("v2.procurement.actions.create", "Tạo mới")
                          : t("v2.procurement.actions.update", "Cập nhật"),
                        onClick: state.confirmSubmit,
                        primary: true,
                        loading: state.saving,
                        disabled: state.saving || state.loading,
                      },
                    ]
                  : []),
              ]
        }
        leftPanel={
          <ProcurementOrderMainSections
            form={state.form}
            errors={state.errors}
            viewing={state.viewing}
            linesLocked={state.linesLocked}
            itemCodeRequired={state.itemCodeRequired}
            setField={state.setField}
          />
        }
        rightPanel={
          <div className="space-y-3">
            <ProcurementOrderHeaderSection
              form={state.form}
              errors={state.errors}
              viewing={state.viewing}
              branchLocked={state.branchLocked}
              branchOptional={state.branchOptional}
              invoicePicker={state.invoicePicker}
              setField={state.setField}
              canPickRequest={state.canPickRequest}
              requestLabel={state.requestLabel}
              requestApi={state.requestApi}
              onPickRequest={state.pickRequest}
            />
            <ProcurementOrderSummarySection
              form={state.form}
              detail={state.detail}
            />
            {!state.creating && props.documentId && (
              <ProcurementAuditSection
                documentId={props.documentId}
                api={props.api}
                queryKey={props.queryKey}
              />
            )}
          </div>
        }
      />
      <ProcurementDiscardModal
        open={state.discardOpen}
        onCancel={state.closeDiscard}
        onConfirm={state.confirmDiscard}
      />
    </>
  );
}
