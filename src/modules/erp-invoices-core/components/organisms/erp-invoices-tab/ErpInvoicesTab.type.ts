export interface ErpInvoicesTabProps {
  direction?: "IN" | "OUT";
  initialTab?: "overview" | "in" | "in-lines" | "out" | "out-lines" | "draft";
  initialDateFrom?: string;
  initialDateTo?: string;
  isDrawer?: boolean;
  instanceIndex?: 1 | 2;
  partnerTaxCode?: string;
}
