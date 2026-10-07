export interface InvoiceSyncAdvancedModalProps {
  open: boolean;
  onClose: () => void;
  defaultCompanyTaxCode?: string;
  onSuccess?: () => void;
}
