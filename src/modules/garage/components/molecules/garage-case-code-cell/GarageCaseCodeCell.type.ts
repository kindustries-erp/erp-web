export interface GarageCaseCodeCellItem {
  id: string;
  soChungTu?: string | null;
  bienSoXe?: string | null;
  tenTinhTrangDichVu?: string | null;
  linkedInvoiceCount?: number | string | null;
  linkedInvoiceOutCount?: number | string | null;
  linkedInvoiceInCount?: number | string | null;
}

export interface GarageCaseCodeCellProps {
  item: GarageCaseCodeCellItem;
  onOpenDetail: (caseId: string) => void;
  onOpenFinancials?: (caseId: string) => void;
}
