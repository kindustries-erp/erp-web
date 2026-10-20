import type {
  BankStatementExportMode,
  BankStatementFilterSummary,
  BankStatementPeriodType,
} from "../BankStatementExportDrawer.type";

export interface BankStatementExportConditionSectionProps {
  type: "bank" | "cash";
  exportMode: BankStatementExportMode;
  onExportModeChange: (mode: BankStatementExportMode) => void;
  periodType: BankStatementPeriodType;
  onPeriodTypeChange: (periodType: BankStatementPeriodType) => void;
  period: string;
  onPeriodChange: (period?: string) => void;
  periodOptions: Array<{ value: string; label: string }>;
  quarter: string;
  onQuarterChange: (quarter?: string) => void;
  quarterOptions: Array<{ value: string; label: string }>;
  dateFrom: string;
  onDateFromChange: (val?: string) => void;
  dateTo: string;
  onDateToChange: (val?: string) => void;
  accountOptions: Array<{ value: string; label: string }>;
  selectedAccountId: string;
  onSelectedAccountIdChange: (val?: string) => void;
  transactionTypeOptions: Array<{ value: string; label: string }>;
  transactionType: string;
  onTransactionTypeChange: (val?: string) => void;
  currentFilterSummary?: BankStatementFilterSummary;
  starting: boolean;
  onStartExport: () => void;
}
