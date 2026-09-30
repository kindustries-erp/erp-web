export interface PartnerInvoiceDrawerProps {
  open: boolean;
  onClose: () => void;
  taxCode?: string;
  partnerName?: string;
  filterState?: any;
}
