import type { VoucherDrawerAction } from "@/modules/inventory-core/components/inventory-voucher-drawer/InventoryVoucherFormDrawer";
import type { UseGrDrawerReturn } from "@/modules/goods-receipts-core/hooks/useGrDrawer";

interface BuildGrFormActionsProps {
  drawer: UseGrDrawerReturn;
  isAdmin: boolean;
  handlePrint: () => void;
  t: (key: string, ...args: any[]) => string;
}

export function buildGrFormActions({
  drawer,
  isAdmin,
  handlePrint,
  t,
}: BuildGrFormActionsProps): VoucherDrawerAction[] {
  const { viewOnly, loading, editing, saving, close, handleSave } = drawer;

  if (viewOnly || loading) {
    return [
      ...(editing && editing.status !== "DRAFT" && isAdmin
        ? [
            {
              label: t("common.print"),
              onClick: handlePrint,
              variant: "secondary" as const,
              disabled: loading,
            },
          ]
        : []),
      {
        label: t("Đóng"),
        onClick: close,
        variant: "outline" as const,
        disabled: loading,
      },
    ];
  }

  return [
    {
      label: t("Hủy"),
      onClick: close,
      variant: "outline" as const,
      disabled: saving,
    },
    {
      label: t("Lưu nháp"),
      onClick: () => void handleSave("DRAFT"),
      variant: "secondary" as const,
      loading: saving,
      disabled: saving,
    },
    {
      label: editing ? t("Cập nhật") : t("Tạo mới"),
      onClick: () => void handleSave("POSTED"),
      primary: true,
      loading: saving,
      disabled: saving,
    },
  ];
}
