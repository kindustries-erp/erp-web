export interface ErpInvoiceNetOffSectionProps {
  invoiceId: string;
  direction: "IN" | "OUT";
  voucherNetOffs?: any[];
  editMode: boolean;
  onRefresh: () => void;
}
