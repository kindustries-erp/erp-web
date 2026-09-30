import React from "react";
import { InvoiceDocumentWorkspace } from "@/modules/erp-invoices-core/components/InvoiceDocumentWorkspace";
import type { ErpInvoicePdfPreviewProps } from "./ErpInvoicePdfPreview.type";

export const ErpInvoicePdfPreview = React.memo(function ErpInvoicePdfPreview(
  props: ErpInvoicePdfPreviewProps,
) {
  return <InvoiceDocumentWorkspace {...props} />;
});
