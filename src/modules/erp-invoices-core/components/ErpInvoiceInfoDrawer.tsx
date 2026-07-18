import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { Button } from "@/shared/components/ui/Button";
import { Download, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";

interface Props {
  open: boolean;
  onClose: () => void;
  detailInvoice: ErpInvoice | null;
  onDownload: (id: string, type: "pdf" | "xml") => void;
  loadingDetail?: boolean;
  onSyncDetail?: () => void;
  onPostInvoice?: () => void;
  onOpenInternal?: () => void;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  editMode?: boolean;
  saving?: boolean;
  handleSave?: (statusOverride?: string) => void;
}

export function ErpInvoiceInfoDrawer({
  open,
  onClose,
  detailInvoice,
  onDownload,
  loadingDetail,
  onSyncDetail,
  onPostInvoice,
  onOpenInternal,
  leftPanel,
  rightPanel,
  editMode = false,
  saving = false,
  handleSave,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  const viewActions = [
    ...(onOpenInternal && detailInvoice
      ? [
          {
            label: "Quản lý nội bộ",
            onClick: onOpenInternal,
            variant: "outline" as const,
            align: "left" as const,
          },
        ]
      : []),
    ...(detailInvoice && detailInvoice.status !== "CANCELLED"
      ? [
          {
            label: "Hạch toán",
            onClick: onPostInvoice!,
            variant: "secondary" as const,
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

  // For creation mode only
  const editActions = [
    {
      label: t("actionClose", "Đóng"),
      onClick: onClose,
      variant: "outline" as const,
      disabled: saving,
    },
    ...(!detailInvoice || detailInvoice.status === "DRAFT"
      ? [
          {
            label: t("actionSaveDraft", "Lưu nháp"),
            variant: "secondary" as const,
            disabled: saving,
            onClick: () => handleSave?.("DRAFT"),
          },
        ]
      : []),
    {
      label: saving
        ? t("actionSaving", "Đang lưu...")
        : t("actionCreate", "Tạo mới"),
      primary: true,
      loading: saving,
      disabled: saving,
      onClick: () => handleSave?.("CONFIRMED"),
    },
  ];

  let drawerTitle = editMode
    ? t("drawerTitleNew", "Tạo hóa đơn mới")
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
      titleExtra={titleExtra}
      title={drawerTitle}
      size="xl"
      layout={!editMode && detailInvoice ? "1-column" : "2-columns"}
      loading={loadingDetail}
      rightPanelTitle={t("generalInfo", "Thông tin chung")}
      stickyRightPanel={false}
      actions={editMode ? editActions : viewActions}
      leftPanel={leftPanel}
      rightPanel={!editMode && detailInvoice ? undefined : rightPanel}
    />
  );
}
