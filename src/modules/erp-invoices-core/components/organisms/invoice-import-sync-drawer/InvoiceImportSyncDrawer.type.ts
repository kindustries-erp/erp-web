import type { ReactNode } from "react";
import type { BulkImportResult } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";
import type {
  Direction,
  FileEntry,
} from "@/modules/erp-invoices-core/hooks/invoiceXmlUpload.type";

export interface XmlPreviewSlotProps {
  open: boolean;
  files: FileEntry[];
  direction: Direction;
  onConfirm: (
    selectedFiles: FileEntry[],
    manualMatches: Record<string, string>,
  ) => void;
  onCancel: () => void;
}

export interface InvoiceDetailSlotProps {
  invoiceId: string | null;
  onClose: () => void;
}

export interface XmlResultTablesSlotProps {
  result: BulkImportResult;
  onOpenInvoice: (invoiceId: string) => void;
}

export interface InvoiceImportSyncDrawerProps {
  open: boolean;
  onClose: () => void;
  onImported: (dir: "IN" | "OUT") => void;
  initialDirection: "IN" | "OUT";
  /** Mở drawer đăng nhập Cổng Thuế; drawer này do cha mount duy nhất một lần */
  onOpenLogin: () => void;
  /** Modal xem trước XML do cha cung cấp, để drawer không import organism anh em */
  renderXmlPreview: (props: XmlPreviewSlotProps) => ReactNode;
  /** Drawer chi tiết hóa đơn do cha cung cấp */
  renderInvoiceDetail: (props: InvoiceDetailSlotProps) => ReactNode;
  /** Bảng kết quả import XML do cha cung cấp */
  renderXmlResultTables: (props: XmlResultTablesSlotProps) => ReactNode;
}
