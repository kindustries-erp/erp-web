export interface GoodsReceiptDrawerState {
  open: boolean;
  recordId: string | null;
  mode: "view" | "edit";
  canUpdate: boolean;
  onClose: () => void;
}
