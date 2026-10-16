export const INVOICE_EXPORT_GROUP_KEYS = [
  "general",
  "partner",
  "amountTax",
  "operation",
  "netOff",
] as const;

export type InvoiceExportGroupKey = (typeof INVOICE_EXPORT_GROUP_KEYS)[number];

export interface InvoiceExportColumnSelectorProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
  onResetDefault: () => void;
  defaultCollapsed?: boolean;
}

export interface InvoiceExportColumnActionsProps {
  onSelectAll: () => void;
  onResetDefault: () => void;
  onDeselectAll: () => void;
}
