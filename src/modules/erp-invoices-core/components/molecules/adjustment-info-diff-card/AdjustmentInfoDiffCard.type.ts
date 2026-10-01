import type { InfoDiffItemDto } from "@/modules/erp-invoices-core/api/erpInvoicesCoreApi";

export interface AdjustmentInfoDiffCardProps {
  diffs: InfoDiffItemDto[];
  className?: string;
}
