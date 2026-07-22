import { StandardFormDrawer } from "@/shared/components/StandardFormDrawer";
import { useTranslation } from "react-i18next";
import { type ErpInvoice } from "../api/erpInvoicesCoreApi";
import { RefreshCw, Download } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  editMode: boolean;
  detailInvoice: ErpInvoice | null;
  startEdit: () => void;
  saving: boolean;
  handleSave: (statusOverride?: string) => void;
  cancelEdit: () => void;
  rightPanel?: React.ReactNode;
  children: React.ReactNode;
  onSyncDetail?: () => void;
  onDownload?: (id: string, type: "pdf" | "xml") => void;
  loadingDetail?: boolean;
}

export function ErpInvoiceInternalDrawer({
  open,
  onClose,
  editMode,
  detailInvoice,
  startEdit,
  saving,
  handleSave,
  cancelEdit,
  rightPanel,
  children,
  onSyncDetail,
  onDownload,
  loadingDetail,
}: Props) {
  const { t } = useTranslation("erpInvoices");

  // Header extras: Sync + Download (view mode only)
  const titleExtra =
    !editMode && detailInvoice ? (
      <div className="flex items-center gap-2">
        {onSyncDetail && (
          <button
            type="button"
            onClick={onSyncDetail}
            disabled={loadingDetail}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loadingDetail ? "animate-spin" : ""}`}
            />
            {t("syncFromGdt", "Đồng bộ từ GĐT")}
          </button>
        )}
        {onDownload && (
          <button
            type="button"
            onClick={() => onDownload(detailInvoice.id, "xml")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            XML
          </button>
        )}
      </div>
    ) : undefined;

  const viewActions = [
    {
      label: t("actionClose", "Đóng"),
      onClick: onClose,
      variant: "outline" as const,
    },
  ];

  const editActions = [
    {
      label: t("actionCancel", "Hủy"),
      onClick: cancelEdit,
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
    ? `${t("internalTitle", "Thông tin nội bộ")}: ${detailInvoice.invoiceNo}`
    : t("internalTitle", "Thông tin nội bộ");

  return (
    <StandardFormDrawer
      open={open}
      mode={editMode ? "edit" : "view"}
      onClose={onClose}
      onToggleEdit={!editMode ? startEdit : undefined}
      title={drawerTitle}
      titleExtra={titleExtra}
      size="xl"
      layout={rightPanel ? "2-columns" : "1-column"}
      confirmOnClose={editMode}
      actions={editMode ? editActions : viewActions}
      leftPanel={children}
      rightPanel={rightPanel}
    />
  );
}
