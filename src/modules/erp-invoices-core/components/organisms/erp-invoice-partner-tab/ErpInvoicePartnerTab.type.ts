import type React from "react";
import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoicePartnerTabProps {
  detailInvoice: ErpInvoice | null;
  direction?: "IN" | "OUT";
  defaultViewMode?: "details" | "invoices" | "lines" | "analytics";
  children?: React.ReactNode;
  onViewModeChange?: (
    mode: "details" | "invoices" | "lines" | "analytics",
  ) => void;
  form?: any;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  onLinkExistingAttachment?: (attachmentId: string) => void;
  onUnlinkAttachment?: (attachmentId: string) => void;
}
