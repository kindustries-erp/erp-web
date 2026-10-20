import type { CreateErpInvoicePayload } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface LinkedDocument {
  id: string;
  type: "PO" | "BANK" | "CASE";
  refId: string;
  refNo: string;
  date?: string;
  amount?: number;
  status?: string;
  isNew?: boolean;
}

export interface ErpInvoiceLinkedDocumentsProps {
  form: CreateErpInvoicePayload;
  fieldSet: (key: string, value: unknown) => void;
  invoiceId: string;
  invoiceNo: string;
  direction: "IN" | "OUT";
  voucherNetOffs?: any[];
  relatedPos?: any[];
  editMode: boolean;
  onRefresh: () => void;
}
