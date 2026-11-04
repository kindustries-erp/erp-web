import {
  V2StandardDrawer,
  V2DrawerLayout,
  V2DrawerSize,
} from "@/v2/shared/components";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { PurchaseOrderCancelModal } from "../components/molecules/purchase-order-cancel-modal";
import { PurchaseOrderStatusBadge } from "../components/molecules/purchase-order-status-badge";
import { PurchaseOrderFormSections } from "../components/organisms/purchase-order-form";
import { PurchaseOrderLinesTable } from "../components/organisms/purchase-order-lines-editor";
import type { PurchaseOrderModuleConfig } from "../purchaseOrders.config.type";
import type { PurchaseOrderDrawerState } from "./PurchaseOrderDrawer.type";
import { buildPurchaseOrderDrawerActions } from "./PurchaseOrderDrawer.actions";
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
        actions={buildPurchaseOrderDrawerActions({
          t,
          state,
          onClose: props.onClose,
        })}
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
      <PurchaseOrderCancelModal
        open={state.cancelOpen}
        loading={state.cancelling}
        onConfirm={state.confirmCancel}
        onClose={() => state.setCancelOpen(false)}
      />
    </>
  );
}
