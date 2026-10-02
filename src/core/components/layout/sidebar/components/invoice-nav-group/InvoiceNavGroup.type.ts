import type { PageKey } from "@/shared/types";

export interface InvoiceNavGroupProps {
  collapsed: boolean;
  currentPage: PageKey | string;
  navTo: (page: PageKey) => void;
  canReadInvoices: boolean;
  canReadDebts: boolean;
}
