import type {
  ErpInvoice,
  CreateErpInvoicePayload,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceGeneralInfoSectionProps {
  invoice: ErpInvoice | null;
  form?: CreateErpInvoicePayload;
  editMode?: boolean;
  fieldSet?: (key: string, value: unknown) => void;
  direction?: "IN" | "OUT";
  invoiceId?: string | null;
  pendingTagIds?: string[];
  onPendingTagsChange?: (ids: string[]) => void;
  defaultCollapsed?: boolean;
  className?: string;
  showTags?: boolean;
  showRelatedInvoices?: boolean;
}
