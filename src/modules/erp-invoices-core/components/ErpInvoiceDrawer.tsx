import { DrawerModal } from "@/shared/components/DrawerModal";
import { Button } from "@/shared/components/ui/Button";
import { Download, RefreshCw } from "lucide-react";
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
  onDownload: (id: string, type: "pdf" | "xml") => void;
  loadingDetail?: boolean;
  onSyncDetail?: () => void;
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
  onDownload,
  loadingDetail,
  onSyncDetail,
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
        <div className="flex items-center gap-2">
          {!editMode && detailInvoice && onSyncDetail && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSyncDetail}
              disabled={loadingDetail}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1.5 ${loadingDetail ? "animate-spin" : ""}`}
              />
              {t("actionSync", "Đồng bộ từ GDT")}
            </Button>
          )}
          {!editMode && detailInvoice?.xmlFileKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(detailInvoice.id, "xml")}
            >
              <Download className="w-4 h-4 mr-1.5" />
              XML
            </Button>
          )}
          {!editMode && detailInvoice?.pdfFileKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(detailInvoice.id, "pdf")}
            >
              <Download className="w-4 h-4 mr-1.5" />
              PDF
            </Button>
          )}
          {!editMode && detailInvoice && (
            <Button variant="secondary" size="sm" onClick={startEdit}>
              {t("actionEdit", "Chỉnh sửa")}
            </Button>
          )}
        </div>
      }
      title={drawerTitle}
      panelClassName="min-[1024px]:w-[1400px]"
      actions={editMode ? editActions : viewActions}
    >
      <div className="relative w-full h-full min-h-[300px]">
        {loadingDetail && (
          <div className="absolute inset-0 bg-white/70 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm text-gray-600 font-medium">
                {t("loadingDetail", "Đang tải dữ liệu...")}
              </span>
            </div>
          </div>
        )}
        <div className={loadingDetail ? "opacity-30 pointer-events-none" : ""}>
          {children}
        </div>
      </div>
    </DrawerModal>
  );
}
