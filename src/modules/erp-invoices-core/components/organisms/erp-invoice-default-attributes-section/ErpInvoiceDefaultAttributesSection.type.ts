import type {
  CreateErpInvoicePayload,
  ErpInvoice,
} from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface ErpInvoiceDefaultAttributesSectionProps {
  form: CreateErpInvoicePayload;
  editMode: boolean;
  fieldSet: (key: string, value: unknown) => void;
  direction: "IN" | "OUT";
  detailInvoice: ErpInvoice | null;
  onRefreshDetail?: () => void;
}
