export interface PurchaseOrderDrawerState {
  open: boolean;
  /** Id đơn đang xem/sửa; null nghĩa là tạo mới */
  recordId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
}
