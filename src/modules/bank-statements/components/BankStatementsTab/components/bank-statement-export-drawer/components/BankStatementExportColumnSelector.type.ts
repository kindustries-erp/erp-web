export const BANK_STATEMENT_EXPORT_GROUP_KEYS = [
  "general",
  "amount",
  "correspondent",
  "invoiceNetOff",
] as const;

export type BankStatementExportGroupKey =
  (typeof BANK_STATEMENT_EXPORT_GROUP_KEYS)[number];

export interface BankStatementExportColumnSelectorProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
  onResetDefault: () => void;
  defaultCollapsed?: boolean;
}

export interface BankStatementExportColumnActionsProps {
  onSelectAll: () => void;
  onResetDefault: () => void;
  onDeselectAll: () => void;
}
