export interface ErpInvoicesTabProps {
  direction?: "IN" | "OUT";
  initialTab?: "dashboard" | "in" | "in-lines" | "out" | "out-lines" | "draft";
  initialDateFrom?: string;
  initialDateTo?: string;
  isDrawer?: boolean;
  instanceIndex?: 1 | 2;
  partnerTaxCode?: string;
}
