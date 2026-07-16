import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
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
  onPostInvoice?: () => void;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
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
  onPostInvoice,
  leftPanel,
  rightPanel,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const viewActions = [
    ...(detailInvoice && detailInvoice.status !== "CANCELLED"
      ? [
          {
            label:
              detailInvoice.postingStatus === "POSTED"
                ? "Xem hạch toán"
                : "Hạch toán",
            onClick: onPostInvoice!,
            variant: "secondary" as const,
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

  let drawerTitle = editMode
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

  if (detailInvoice) {
    const targetName =
      detailInvoice.direction === "IN"
        ? detailInvoice.sellerName
        : detailInvoice.buyerName;
    if (targetName) {
      drawerTitle += ` - ${targetName}`;
    }
  }

  // Extra action buttons in header (Sync, Download) — shown in view mode
  const titleExtra =
    !editMode && detailInvoice ? (
      <div className="flex items-center gap-2">
        {onSyncDetail && (
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
        {detailInvoice.xmlFileKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(detailInvoice.id, "xml")}
          >
            <Download className="w-4 h-4 mr-1.5" />
            XML
          </Button>
        )}
        {detailInvoice.pdfFileKey && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownload(detailInvoice.id, "pdf")}
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>
        )}
      </div>
    ) : undefined;

  return (
    <StandardFormDrawer
      open={open}
      mode={editMode ? "edit" : "view"}
      onClose={onClose}
      onToggleEdit={!editMode && detailInvoice ? startEdit : undefined}
      titleExtra={titleExtra}
      title={drawerTitle}
      size="xl"
      layout="2-columns"
      loading={loadingDetail}
      rightPanelTitle={t("generalInfo", "Thông tin chung")}
      stickyRightPanel={false}
      actions={editMode ? editActions : viewActions}
      leftPanel={leftPanel}
      rightPanel={rightPanel}
    />
  );
}
