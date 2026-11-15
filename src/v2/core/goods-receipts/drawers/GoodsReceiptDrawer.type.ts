import type { GoodsReceiptPrefill } from "../goodsReceipts.config.type";

export interface GoodsReceiptDrawerState {
  open: boolean;
  recordId: string | null;
  mode: "view" | "edit";
  /** Chỉ dùng khi tạo mới từ đơn mua: dữ liệu điền sẵn */
  prefill?: GoodsReceiptPrefill;
  canUpdate: boolean;
  onClose: () => void;
}
