import type { FinancialReconciliationDto } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface AdjustmentFinancialSummaryProps {
  financial: FinancialReconciliationDto;
  role: "ORIGINAL" | "ADJUSTING" | "REPLACEMENT" | "STANDARD";
  onExecuteNetoff?: () => void;
  isExecuting?: boolean;
  className?: string;
}
