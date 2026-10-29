import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer/DrawerFooter.type";

export interface BankDetailActionsInput {
  mode: "view" | "edit";
  saving: boolean;
  canSave: boolean;
  t: (key: string) => string;
  onClose: () => void;
  onCancel: () => void;
  onSave: () => void;
}

/** Nút chân drawer ngân hàng: chế độ xem có Đóng; chế độ sửa có Hủy và Lưu */
export function buildBankDetailActions({
  mode,
  saving,
  canSave,
  t,
  onClose,
  onCancel,
  onSave,
}: BankDetailActionsInput): DrawerAction[] {
  if (mode === "view") {
    return [
      {
        label: t("v2.bankStatements.bankDetail.actions.close"),
        onClick: onClose,
        variant: "outline",
      },
    ];
  }
  return [
    {
      label: t("v2.bankStatements.bankDetail.actions.cancel"),
      onClick: onCancel,
      variant: "outline",
      disabled: saving,
    },
    {
      label: t("v2.bankStatements.bankDetail.actions.save"),
      onClick: onSave,
      primary: true,
      loading: saving,
      disabled: saving || !canSave,
    },
  ];
}
