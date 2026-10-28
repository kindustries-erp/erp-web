import type { V2Column } from "@/v2/shared/components";
import type {
  FakeInvoice,
  InvoiceDirection,
} from "@/v2/modules/finance-invoice/domain/entities/invoiceShape.data";
import { getBaseInvoiceColumns } from "./invoiceColumns.base";
import { getAuditInvoiceColumns } from "./invoiceColumns.audit";

export type InvoiceView = "overview" | "audit" | "tax";

export const buildInvoiceColumns = (
  view: InvoiceView,
  onOpen: (id: string) => void,
  direction: InvoiceDirection = "IN",
): V2Column<FakeInvoice>[] => {
  const baseColumns = getBaseInvoiceColumns(onOpen, direction);
  if (view === "overview") return baseColumns;
  return [...baseColumns, ...getAuditInvoiceColumns()];
};
