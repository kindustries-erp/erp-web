import {
  V2ConfirmModal,
  V2StandardDrawer,
  V2DrawerLayout,
  V2DrawerSize,
} from "@/v2/shared/components";
import type { DrawerAction } from "@/v2/shared/components";
import {
  GoodsReceiptLinesTable,
  sumGoodsReceiptLineAmounts,
  GoodsReceiptStatusBadge,
  GoodsReceiptFormSections,
} from "@/v2/core/goods-receipts";
import type { GoodsReceiptFormLine } from "@/v2/core/goods-receipts";
import { useV2Translation } from "@/v2/shared/hooks/useV2Translation";
import type { GoodsReceiptDrawerState } from "./GoodsReceiptDrawer.type";
import type { GoodsReceiptModuleConfig } from "../goodsReceipts.config.type";
import { useGoodsReceiptDrawer } from "./GoodsReceiptDrawer.hook";

export type GoodsReceiptDrawerProps = GoodsReceiptDrawerState & {
  config: GoodsReceiptModuleConfig;
};

export function GoodsReceiptDrawer({
  config,
  ...props
}: GoodsReceiptDrawerProps) {
  const { t } = useV2Translation();
  const state = useGoodsReceiptDrawer({ config, state: props });
  const title = state.creating
    ? t("v2.goodsReceipts.form.create", "Thêm mới")
    : state.viewing
      ? t("v2.goodsReceipts.form.detail", "Chi tiết")
      : t("v2.goodsReceipts.form.edit", "Chỉnh sửa");

  const handleLinesChange = (newLines: GoodsReceiptFormLine[]) => {
    state.setField("lines", newLines);
    state.setField("totalAmount", String(sumGoodsReceiptLineAmounts(newLines)));
  };

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
        label: t("v2.goodsReceipts.actions.cancel", "Hủy phiếu"),
        onClick: state.cancel,
        variant: "outline",
        loading: state.cancelling,
        disabled: state.cancelling || state.posting,
      });
    }

    if (state.canPost) {
      actions.unshift({
        label: t("v2.goodsReceipts.actions.post", "Ghi sổ nhập kho"),
        onClick: state.post,
        primary: true,
        loading: state.posting,
        disabled: state.posting || state.cancelling,
      });
    }

    return actions;
  };

  return (
    <>
      <V2StandardDrawer
        id={`goodsReceipt-${props.recordId ?? "new"}`}
        open={props.open}
        onClose={props.onClose}
        mode={state.creating ? "edit" : state.mode}
        onToggleEdit={
          state.viewing && state.canEdit
            ? () => state.setMode("edit")
            : undefined
        }
        title={title}
        subtitle={state.form.receiptNo || undefined}
        titleExtra={
          !state.creating ? (
            <GoodsReceiptStatusBadge status={state.form.status} />
          ) : undefined
        }
        layout={V2DrawerLayout.TWO_COLUMNS}
        size={V2DrawerSize.XL}
        loading={state.loading}
        confirmOnClose={state.dirty && !state.viewing}
        actions={
          state.viewing
            ? buildViewingActions()
            : [
                {
                  label: t("v2.common.cancel", "Hủy"),
                  onClick: state.cancelEdit,
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
        rightPanel={
          <GoodsReceiptFormSections
            form={state.form}
            viewing={state.viewing}
            codeEditable={state.codeEditable}
            onRegenerateCode={state.regenerateCode}
            errorField={state.errorField}
            errorMessage={state.errorMessage}
            t={t}
            setField={state.setField}
            hideLines
            columns={1}
          />
        }
      >
        <GoodsReceiptLinesTable
          lines={state.form.lines || []}
          viewing={state.viewing}
          t={t}
          onChangeLines={handleLinesChange}
        />
      </V2StandardDrawer>
      <V2ConfirmModal
        open={state.discardOpen}
        title={t("v2.goodsReceipts.discard.title", "Bỏ thay đổi?")}
        message={t(
          "v2.goodsReceipts.discard.message",
          "Các thay đổi chưa lưu sẽ bị bỏ. Bạn có chắc không?",
        )}
        confirmLabel={t("v2.goodsReceipts.discard.confirm", "Bỏ thay đổi")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        className="z-[700]"
        overlayClassName="z-[699]"
        onConfirm={state.confirmDiscard}
        onCancel={state.closeDiscard}
        onOpenChange={(next) => !next && state.closeDiscard()}
      />
    </>
  );
}
