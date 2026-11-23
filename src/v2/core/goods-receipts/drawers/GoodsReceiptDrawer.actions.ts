import type { DrawerAction } from "@/v2/shared/components";

type Translate = (key: string, fallback?: string) => string;

/** Phần trạng thái và hành động của drawer mà bộ dựng nút cần */
export interface GoodsReceiptActionsInput {
  t: Translate;
  viewing: boolean;
  saving: boolean;
  loading: boolean;
  posting: boolean;
  cancelling: boolean;
  canPost: boolean;
  canCancel: boolean;
  /** Họ phiếu có hỗ trợ lưu và nhập kho trong một bước */
  canSaveAndPost: boolean;
  reverseBlocked: boolean;
  reverseBlockedReason: string;
  onClose: () => void;
  cancelEdit: () => void;
  submit: () => void;
  submitAndPost: () => void;
  post: () => void;
  openReverse: () => void;
}

/** Nút xem phiếu: Nhập kho (nháp), Hoàn nhập (đã nhập kho, mờ + lý do khi hàng đã dùng), Đóng */
function viewingActions(i: GoodsReceiptActionsInput): DrawerAction[] {
  const { t } = i;
  const actions: DrawerAction[] = [
    {
      label: t("v2.common.close", "Đóng"),
      onClick: i.onClose,
      variant: "outline",
    },
  ];
  if (i.canCancel) {
    actions.unshift({
      label: t("v2.goodsReceipts.actions.reverse", "Hoàn nhập"),
      onClick: i.openReverse,
      variant: "outline",
      loading: i.cancelling,
      disabled: i.cancelling || i.posting || i.reverseBlocked,
      disabledReason: i.reverseBlocked ? i.reverseBlockedReason : undefined,
    });
  }
  if (i.canPost) {
    actions.unshift({
      label: t("v2.goodsReceipts.actions.receive", "Nhập kho"),
      onClick: i.post,
      primary: true,
      loading: i.posting,
      disabled: i.posting || i.cancelling,
    });
  }
  return actions;
}

/** Nút tạo/sửa: Hủy | Lưu nháp (outline) | Nhập kho (primary, lưu + ghi sổ một bước) */
function editingActions(i: GoodsReceiptActionsInput): DrawerAction[] {
  const { t } = i;
  const busy = i.saving || i.posting || i.loading;
  const draft: DrawerAction = {
    label: t("v2.goodsReceipts.actions.saveDraft", "Lưu nháp"),
    onClick: i.submit,
    variant: i.canSaveAndPost ? "outline" : undefined,
    primary: !i.canSaveAndPost,
    loading: i.saving,
    disabled: busy,
  };
  const actions: DrawerAction[] = [
    {
      label: t("v2.common.cancel", "Hủy"),
      onClick: i.cancelEdit,
      variant: "outline",
      disabled: i.saving || i.posting,
    },
    draft,
  ];
  if (i.canSaveAndPost) {
    actions.push({
      label: t("v2.goodsReceipts.actions.receive", "Nhập kho"),
      onClick: i.submitAndPost,
      primary: true,
      loading: i.posting,
      disabled: busy,
    });
  }
  return actions;
}

export function buildGoodsReceiptActions(
  input: GoodsReceiptActionsInput,
): DrawerAction[] {
  return input.viewing ? viewingActions(input) : editingActions(input);
}
