import type { InvoiceDocumentWorkspaceProps } from "@/modules/erp-invoices-core/components/InvoiceDocumentWorkspace";
import type { ErpInvoice } from "../../../api/erpInvoicesCoreApi";

export interface ErpInvoiceAttachmentsSubTabProps extends Omit<
  InvoiceDocumentWorkspaceProps,
  "detailInvoice"
> {
  invoice: ErpInvoice | null;
}
