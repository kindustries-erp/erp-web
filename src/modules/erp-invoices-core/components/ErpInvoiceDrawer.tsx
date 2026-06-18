import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
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
  children: React.ReactNode;
}

export function ErpInvoiceDrawer({
  open,
  onClose,
  editMode,
  detailInvoice,
  startEdit,
  saving,
  handleSave,
  setEditMode,
  setDeleteConfirm,
  children,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const viewActions = [
    {
      label: t("actionClose", "Đóng"),
      onClick: onClose,
      variant: "outline" as const,
    },
  ];

  const editActions = [
    {
      label: detailInvoice
        ? t("actionCancel", "Hủy")
        : t("actionClose", "Đóng"),
      onClick: detailInvoice ? () => setEditMode(false) : onClose,
      variant: "outline" as const,
      disabled: saving,
    },
    ...(detailInvoice
      ? [
          {
            label: t("actionDelete", "Xóa"),
            onClick: () => setDeleteConfirm(true),
            variant: "outline" as const,
            disabled: saving,
          },
        ]
      : []),
    ...(!detailInvoice || detailInvoice.status === "DRAFT"
      ? [
          {
            label: t("actionSaveDraft", "Lưu nháp"),
            variant: "secondary" as const,
            disabled: saving,
            onClick: () => handleSave("DRAFT"),
          },
        ]
      : []),
    {
      label: saving
        ? t("actionSaving", "Đang lưu...")
        : detailInvoice
          ? t("actionSaveChange", "Lưu thay đổi")
          : t("actionCreate", "Tạo mới"),
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: () => handleSave("CONFIRMED"),
    },
  ];

  const drawerTitle = editMode
    ? detailInvoice
      ? t("drawerTitleEdit", {
          invoiceNo: detailInvoice.invoiceNo,
          defaultValue: `Chỉnh sửa: ${detailInvoice.invoiceNo}`,
        })
      : t("drawerTitleNew", "Tạo hóa đơn mới")
    : detailInvoice
      ? t("drawerTitleView", {
          invoiceNo: detailInvoice.invoiceNo,
          defaultValue: `Chi tiết: ${detailInvoice.invoiceNo}`,
        })
      : t("invoice", "Hóa đơn");

  return (
    <DrawerModal
      open={open}
      onClose={onClose}
      headerExtra={
        !editMode && detailInvoice ? (
          <Button variant="secondary" size="sm" onClick={startEdit}>
            {t("actionEdit", "Chỉnh sửa")}
          </Button>
        ) : undefined
      }
      title={drawerTitle}
      panelClassName="min-[1024px]:w-[1400px]"
      actions={editMode ? editActions : viewActions}
    >
      {children}
    </DrawerModal>
  );
}
