import type { ProcurementApi } from "../../../procurement.types";

export interface ProcurementAuditSectionProps {
  documentId: string;
  api: ProcurementApi<unknown>;
  queryKey: string;
  defaultCollapsed?: boolean;
  className?: string;
}
