import {
  V2ConfirmModal,
  V2StandardDrawer,
  V2DrawerLayout,
  V2DrawerSize,
} from "@/v2/shared/components";
import type { DrawerAction } from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { PurchaseOrderStatusBadge } from "../components/molecules/purchase-order-status-badge";
import { PurchaseOrderFormSections } from "../components/organisms/purchase-order-form";
import { PurchaseOrderLinesTable } from "../components/organisms/purchase-order-lines-editor";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import type { PurchaseOrderDrawerState } from "./PurchaseOrderDrawer.type";
import { usePurchaseOrderDrawer } from "./PurchaseOrderDrawer.hook";
import "../purchaseOrders.locale";

export type PurchaseOrderDrawerProps = PurchaseOrderDrawerState & {
  config: PurchaseOrderModuleConfig;
};

/** Drawer PO: cột trái là dòng hàng, cột phải là thông tin đơn; hành động theo trạng thái và quyền */
export function PurchaseOrderDrawer({
  config,
  ...props
}: PurchaseOrderDrawerProps) {
  const { t } = useV2Translation();
  const state = usePurchaseOrderDrawer({ config, state: props });

  const title = state.creating
    ? t("v2.purchaseOrders.form.create", "Thêm mới đơn mua hàng")
    : state.viewing
      ? t("v2.purchaseOrders.form.detail", "Chi tiết")
      : t("v2.purchaseOrders.form.edit", "Chỉnh sửa");

  const buildViewingActions = (): DrawerAction[] => {
    const actions: DrawerAction[] = [
      {
        label: t("v2.common.close", "Đóng"),
        onClick: props.onClose,
        variant: "outline",
      },
    ];
    if (state.canCancel) {
      actions.unshift({
        label: t("v2.purchaseOrders.actions.cancel", "Hủy đơn"),
        onClick: () => state.setCancelOpen(true),
        variant: "outline",
        loading: state.cancelling,
        disabled: state.cancelling || state.approving || state.confirming,
      });
    }
    if (state.canConfirm) {
      actions.unshift({
        label: t("v2.purchaseOrders.actions.confirm", "Xác nhận"),
        onClick: state.confirm,
        variant: "outline",
        loading: state.confirming,
        disabled: state.confirming || state.approving || state.cancelling,
      });
    }
    if (state.canApprove) {
      actions.unshift({
        label: t("v2.purchaseOrders.actions.approve", "Duyệt đơn"),
        onClick: state.approve,
        primary: true,
        loading: state.approving,
        disabled: state.approving || state.confirming || state.cancelling,
      });
    }
    return actions;
  };

  const editingActions: DrawerAction[] = [
    {
      label: t("v2.common.cancel", "Hủy"),
      onClick: props.onClose,
      variant: "outline",
      disabled: state.saving,
    },
    {
      label: t("v2.common.save", "Lưu"),
      onClick: state.submit,
      primary: true,
      loading: state.saving,
      disabled: state.saving || state.loading,
    },
  ];

  return (
    <>
      <V2StandardDrawer
        id={`purchaseOrder-${props.recordId ?? "new"}`}
        open={props.open}
        onClose={props.onClose}
        mode={state.creating ? "edit" : state.mode}
        onToggleEdit={
          state.viewing && state.canEdit
            ? () => state.setMode("edit")
            : undefined
        }
        title={title}
        subtitle={state.form.poNo || undefined}
        titleExtra={
          !state.creating ? (
            <PurchaseOrderStatusBadge status={state.form.status} />
          ) : undefined
        }
        layout={V2DrawerLayout.TWO_COLUMNS}
        size={V2DrawerSize.XL}
        loading={state.loading}
        confirmOnClose={state.dirty && !state.viewing}
        actions={state.viewing ? buildViewingActions() : editingActions}
        rightPanel={
          <PurchaseOrderFormSections
            form={state.form}
            viewing={state.viewing}
            creating={state.creating}
            onRegenerateNo={state.regenerateNo}
            errorField={state.errorField}
            errorMessage={state.errorMessage}
            t={t}
            setField={state.setField}
          />
        }
      >
        <PurchaseOrderLinesTable
          lines={state.form.lines}
          viewing={state.viewing}
          creating={state.creating}
          t={t}
          onChangeLines={(lines) => state.setField("lines", lines)}
        />
      </V2StandardDrawer>
      <V2ConfirmModal
        open={state.cancelOpen}
        title={t("v2.purchaseOrders.cancelConfirm.title", "Xác nhận hủy đơn")}
        message={t(
          "v2.purchaseOrders.cancelConfirm.message",
          "Bạn có chắc chắn muốn hủy đơn mua hàng này? Hành động này không hoàn tác.",
        )}
        confirmLabel={t("v2.purchaseOrders.actions.cancel", "Hủy đơn")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        isLoading={state.cancelling}
        onConfirm={state.confirmCancel}
        onCancel={() => state.setCancelOpen(false)}
        onOpenChange={(open) => !open && state.setCancelOpen(false)}
      />
    </>
  );
}
