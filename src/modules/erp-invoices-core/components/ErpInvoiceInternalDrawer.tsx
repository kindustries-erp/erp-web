import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useTranslation } from "react-i18next";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  open: boolean;
  onClose: () => void;
  editMode: boolean;
  detailInvoice: ErpInvoice | null;
  startEdit: () => void;
  saving: boolean;
  handleSave: (statusOverride?: string) => void;
  setEditMode: (mode: boolean) => void;
  setDeleteConfirm: (confirm: boolean) => void;
  onOpenInfo?: () => void;
  children: React.ReactNode;
}

export function ErpInvoiceInternalDrawer({
  open,
  onClose,
  editMode,
  detailInvoice,
  startEdit,
  saving,
  handleSave,
  setEditMode,
  setDeleteConfirm,
  onOpenInfo,
  children,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const viewActions = [
    ...(onOpenInfo && detailInvoice
      ? [
          {
            label: "Chi tiết hóa đơn",
            onClick: onOpenInfo,
            variant: "outline" as const,
            align: "left" as const,
          },
        ]
      : []),
    {
      label: t("actionClose", "Đóng"),
      onClick: onClose,
      variant: "outline" as const,
    },
  ];

  const editActions = [
    ...(onOpenInfo && detailInvoice
      ? [
          {
            label: "Chi tiết hóa đơn",
            onClick: onOpenInfo,
            variant: "outline" as const,
            align: "left" as const,
            disabled: saving,
          },
        ]
      : []),
    {
      label: t("actionCancel", "Hủy"),
      onClick: () => setEditMode(false),
      variant: "outline" as const,
      disabled: saving,
    },
    {
      label: t("actionDelete", "Xóa"),
      onClick: () => setDeleteConfirm(true),
      variant: "outline" as const,
      disabled: saving,
    },
    {
      label: saving
        ? t("actionSaving", "Đang lưu...")
        : t("actionSaveChange", "Lưu thay đổi"),
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: () => handleSave("CONFIRMED"),
    },
  ];

  const drawerTitle = detailInvoice
    ? `Thông tin nội bộ: ${detailInvoice.invoiceNo}`
    : "Thông tin nội bộ";

  return (
    <StandardFormDrawer
      open={open}
      mode={editMode ? "edit" : "view"}
      onClose={onClose}
      onToggleEdit={!editMode ? startEdit : undefined}
      title={drawerTitle}
      size="md"
      layout="1-column"
      confirmOnClose={editMode}
      actions={editMode ? editActions : viewActions}
      leftPanel={children}
    />
  );
}
