export interface ErpInvoiceStandaloneDrawerProps {
  isOpen: boolean;
  invoiceId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}
