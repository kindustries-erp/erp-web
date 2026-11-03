import type { DrawerAction } from "@/v2/shared/components/molecules/v2-drawer-footer";

export type InvoiceSyncMethod = "GDT" | "XML";
export type InvoiceXmlStep = "select" | "importing" | "result";

export interface InvoiceSyncActionInput {
  method: InvoiceSyncMethod;
  xmlStep: InvoiceXmlStep;
  fileCount: number;
  /** Số hóa đơn vừa tạo, `null` khi chưa có kết quả import */
  createdCount: number | null;
  /** Trạng thái nút tải lại XML, chỉ dùng khi nguồn là GDT */
  bulkXml: { loading: boolean; disabled: boolean };
  labels: {
    close: string;
    cancel: string;
    preview: string;
    importMore: string;
    viewCreated: string;
    bulkXml: string;
    bulkXmlLoading: string;
  };
  handlers: {
    onClose: () => void;
    onCancel: () => void;
    onPreview: () => void;
    onImportMore: () => void;
    onBulkXml: () => void;
  };
}

/** Nút chân drawer theo phương thức đồng bộ và bước của luồng tải file XML */
export function buildInvoiceSyncActions(
  input: InvoiceSyncActionInput,
): DrawerAction[] {
  const {
    method,
    xmlStep,
    fileCount,
    createdCount,
    bulkXml,
    labels,
    handlers,
  } = input;

  if (method === "GDT") {
    return [
      {
        label: bulkXml.loading ? labels.bulkXmlLoading : labels.bulkXml,
        variant: "outline",
        align: "left",
        loading: bulkXml.loading,
        disabled: bulkXml.disabled,
        onClick: handlers.onBulkXml,
      },
      { label: labels.close, variant: "outline", onClick: handlers.onClose },
    ];
  }

  if (xmlStep === "select") {
    return [
      { label: labels.cancel, variant: "outline", onClick: handlers.onCancel },
      {
        label: labels.preview,
        variant: "primary",
        onClick: handlers.onPreview,
        disabled: fileCount === 0,
      },
    ];
  }

  if (xmlStep === "result" && createdCount !== null) {
    const actions: DrawerAction[] = [
      {
        label: labels.importMore,
        variant: "outline",
        onClick: handlers.onImportMore,
      },
    ];
    if (createdCount > 0) {
      actions.push({
        label: labels.viewCreated,
        variant: "secondary",
        onClick: handlers.onClose,
      });
    }
    actions.push({ label: labels.close, onClick: handlers.onClose });
    return actions;
  }

  return [];
}
