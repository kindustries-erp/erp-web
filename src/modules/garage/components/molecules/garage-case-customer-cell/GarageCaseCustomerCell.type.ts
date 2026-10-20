export interface GarageCaseCustomerCellItem {
  khachHangName?: string | null;
  khachHangCode?: string | null;
  customerName?: string | null;
  customerCode?: string | null;
}

export interface GarageCaseCustomerCellProps {
  item: GarageCaseCustomerCellItem;
  className?: string;
  onOpenDetail?: (customer: { code: string; name: string }) => void;
}
