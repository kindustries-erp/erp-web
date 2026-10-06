import type { ErpInvoice } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface BranchOption {
  label: string;
  value: string;
}

export interface BulkEditDrawerProps {
  open: boolean;
  onClose: () => void;
  selectedIds: string[];
  invoices: ErpInvoice[];
  branches: BranchOption[];
  onSuccess: () => void;
}

export interface NotesInputCellProps {
  invId: string;
  initialValue: string;
  onNotesChange: (id: string, value: string) => void;
  t: any;
}
