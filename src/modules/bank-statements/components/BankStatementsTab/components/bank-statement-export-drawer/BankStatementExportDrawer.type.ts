export type BankStatementExportMode = "by-period" | "by-current-filter";

export interface BankStatementColumnFilterItem {
  id: string;
  columnKey: string;
  columnLabel: string;
  displayValue: string;
  type?: "values" | "search";
}

export interface BankStatementFilterSummary {
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  accountName?: string;
  transactionType?: string;
  branchName?: string;
  hasActiveFilters?: boolean;
  filterCount?: number;
  columnFiltersSummary?: BankStatementColumnFilterItem[];
}

export interface BankStatementExportDrawerProps {
  open: boolean;
  onClose: () => void;
  type: "bank" | "cash";
  accountsData: any[];
  branches?: Array<{ id: string; name: string }>;
  buildBaseQuery?: () => any;
  currentFilterSummary?: BankStatementFilterSummary;
}
