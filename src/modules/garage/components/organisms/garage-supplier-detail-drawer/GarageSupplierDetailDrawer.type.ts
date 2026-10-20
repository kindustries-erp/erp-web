export interface GarageSupplierDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  supplierId: string | null;
  supplierCode?: string;
  supplierName?: string;
  branchId?: string;
}
