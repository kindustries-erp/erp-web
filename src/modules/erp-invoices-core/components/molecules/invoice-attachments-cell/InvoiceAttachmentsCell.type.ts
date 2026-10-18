import type { TFunction } from "i18next";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface InvoiceAttachmentsCellProps {
  inv: ErpInvoice;
  t: TFunction<any, any>;
  openPopoverId: string | null;
  setOpenPopoverId: (id: string | null) => void;
  handleDownload: (id: string, type: "pdf" | "xml") => Promise<void>;
  handlePreviewPdf: (
    id: string,
    key: string,
    filename: string,
  ) => Promise<void>;
  setPreviewPdf: (
    pdf: {
      url: string;
      filename: string;
      fileKey: string;
      invoiceId: string;
      isAttachment?: boolean;
    } | null,
  ) => void;
}
