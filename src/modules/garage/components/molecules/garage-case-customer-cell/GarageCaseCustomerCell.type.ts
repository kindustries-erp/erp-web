export interface GarageCaseCustomerCellItem {
  khachHangName?: string | null;
  khachHangCode?: string | null;
  /** Tên khách in trên phiếu KGara (V1 `tenKhachHang`, V2 `voucherCustomerName`). */
  tenKhachHang?: string | null;
  voucherCustomerName?: string | null;
  customerName?: string | null;
  customerCode?: string | null;
}

export interface GarageCaseCustomerCellProps {
  item: GarageCaseCustomerCellItem;
  className?: string;
  onOpenDetail?: (customer: { code: string; name: string }) => void;
}
