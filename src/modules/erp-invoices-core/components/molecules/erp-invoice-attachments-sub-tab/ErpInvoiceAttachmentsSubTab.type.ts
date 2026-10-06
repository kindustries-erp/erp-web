import type { InvoiceDocumentWorkspaceProps } from "@/modules/erp-invoices-core/components/organisms/invoice-document-workspace";
import type { ErpInvoice } from "../../../api/erpInvoicesCoreApi";

export interface ErpInvoiceAttachmentsSubTabProps extends Omit<
  InvoiceDocumentWorkspaceProps,
  "detailInvoice"
> {
  invoice: ErpInvoice | null;
}
