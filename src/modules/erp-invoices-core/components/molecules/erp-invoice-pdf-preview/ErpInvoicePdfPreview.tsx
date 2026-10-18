import React from "react";
import { InvoiceDocumentWorkspace } from "@/modules/erp-invoices-core/components/organisms/invoice-document-workspace";
import type { ErpInvoicePdfPreviewProps } from "./ErpInvoicePdfPreview.type";

export const ErpInvoicePdfPreview = React.memo(function ErpInvoicePdfPreview(
  props: ErpInvoicePdfPreviewProps,
) {
  return <InvoiceDocumentWorkspace {...props} />;
});
