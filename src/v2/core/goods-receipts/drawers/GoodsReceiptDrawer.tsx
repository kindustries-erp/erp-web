import {
  V2ConfirmModal,
  V2StandardDrawer,
  V2DrawerLayout,
  V2DrawerSize,
} from "@/v2/shared/components";
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
import { buildGoodsReceiptActions } from "./GoodsReceiptDrawer.actions";

export type GoodsReceiptDrawerProps = GoodsReceiptDrawerState & {
  config: GoodsReceiptModuleConfig;
};

export function GoodsReceiptDrawer({
  config,
  ...props
}: GoodsReceiptDrawerProps) {
  const { t } = useV2Translation();
  const state = useGoodsReceiptDrawer({ config, state: props });
  // Mô tả chế độ nằm ở dòng phụ; tiêu đề là mã phiếu kèm Badge trạng thái ngay bên cạnh
  const modeLabel = state.creating
    ? t("v2.goodsReceipts.form.create", "Thêm mới")
    : state.viewing
      ? t("v2.goodsReceipts.form.detail", "Chi tiết")
      : t("v2.goodsReceipts.form.edit", "Chỉnh sửa");

  const handleLinesChange = (newLines: GoodsReceiptFormLine[]) => {
    state.setField("lines", newLines);
    state.setField("totalAmount", String(sumGoodsReceiptLineAmounts(newLines)));
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
        title={state.form.receiptNo || modeLabel}
        subtitle={state.form.receiptNo ? modeLabel : undefined}
        titleExtra={<GoodsReceiptStatusBadge status={state.form.status} />}
        layout={V2DrawerLayout.TWO_COLUMNS}
        size={V2DrawerSize.XL}
        loading={state.loading}
        confirmOnClose={state.dirty && !state.viewing}
        actions={buildGoodsReceiptActions({
          ...state,
          t,
          onClose: props.onClose,
        })}
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
            sourceOrder={config.sourceOrder}
            onPickOrder={state.pickOrder}
            orderLocked={state.orderLocked}
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
      <V2ConfirmModal
        open={state.reverseOpen}
        title={t(
          "v2.goodsReceipts.actions.reverseConfirmTitle",
          "Hoàn nhập phiếu?",
        )}
        message={t(
          "v2.goodsReceipts.actions.reverseConfirmMessage",
          "Phiếu chuyển sang Đã hủy và tồn kho được trả về như trước khi nhập. Chỉ làm được khi hàng chưa sử dụng.",
        )}
        confirmLabel={t("v2.goodsReceipts.actions.reverse", "Hoàn nhập")}
        cancelLabel={t("v2.common.cancel", "Hủy")}
        variant="danger"
        className="z-[700]"
        overlayClassName="z-[699]"
        onConfirm={state.reverse}
        onCancel={state.closeReverse}
        onOpenChange={(next) => !next && state.closeReverse()}
      />
    </>
  );
}
