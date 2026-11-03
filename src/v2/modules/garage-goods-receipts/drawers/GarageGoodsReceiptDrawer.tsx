import { V2StandardDrawer } from "@/v2/shared/components/organisms/v2-standard-drawer";
import type { DrawerAction } from "@/v2/shared/components/organisms/v2-standard-drawer";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import { GarageGoodsReceiptStatusBadge } from "@/v2/modules/garage-goods-receipts/components/molecules/garage-goods-receipt-status-badge";
import { GarageGoodsReceiptFormSections } from "@/v2/modules/garage-goods-receipts/components/organisms/garage-goods-receipt-form";
import type { GarageGoodsReceiptDrawerState } from "./GarageGoodsReceiptDrawer.hook";
import { useGarageGoodsReceiptDrawer } from "./GarageGoodsReceiptDrawer.hook";

export function GarageGoodsReceiptDrawer(props: GarageGoodsReceiptDrawerState) {
  const { t } = useV2Translation();
  const state = useGarageGoodsReceiptDrawer(props);
  const title = state.creating
    ? t("v2.garageGoodsReceipts.form.create", "Thêm mới")
    : state.viewing
      ? t("v2.garageGoodsReceipts.form.detail", "Chi tiết")
      : t("v2.garageGoodsReceipts.form.edit", "Chỉnh sửa");

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
        label: t("v2.garageGoodsReceipts.actions.cancel", "Hủy phiếu"),
        onClick: state.cancel,
        variant: "outline",
        loading: state.cancelling,
        disabled: state.cancelling || state.posting,
      });
    }

    if (state.canPost) {
      actions.unshift({
        label: t("v2.garageGoodsReceipts.actions.post", "Ghi sổ nhập kho"),
        onClick: state.post,
        primary: true,
        loading: state.posting,
        disabled: state.posting || state.cancelling,
      });
    }

    return actions;
  };

  return (
    <V2StandardDrawer
      id={`garageGoodsReceipt-${props.recordId ?? "new"}`}
      open={props.open}
      onClose={props.onClose}
      mode={state.creating ? "edit" : state.mode}
      onToggleEdit={
        state.viewing && state.canEdit ? () => state.setMode("edit") : undefined
      }
      title={title}
      subtitle={state.form.receiptNo || undefined}
      titleExtra={
        !state.creating ? (
          <GarageGoodsReceiptStatusBadge status={state.form.status} />
        ) : undefined
      }
      layout="1-column"
      size="xl"
      loading={state.loading}
      confirmOnClose={state.dirty && !state.viewing}
      actions={
        state.viewing
          ? buildViewingActions()
          : [
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
            ]
      }
    >
      <GarageGoodsReceiptFormSections
        form={state.form}
        viewing={state.viewing}
        codeEditable={state.codeEditable}
        onRegenerateCode={state.regenerateCode}
        errorField={state.errorField}
        errorMessage={state.errorMessage}
        t={t}
        setField={state.setField}
      />
    </V2StandardDrawer>
  );
}
