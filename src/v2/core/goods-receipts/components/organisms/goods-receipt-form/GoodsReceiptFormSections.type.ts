import type {
  GoodsReceiptFormValue,
  GoodsReceiptSourceOrderLoader,
} from "@/v2/core/goods-receipts";

export interface FormSectionsProps {
  form: GoodsReceiptFormValue;
  viewing: boolean;
  codeEditable: boolean;
  onRegenerateCode: () => void;
  errorField: string | null;
  errorMessage: string;
  t: (key: string, fallback?: string) => string;
  setField: <K extends keyof GoodsReceiptFormValue>(
    key: K,
    value: GoodsReceiptFormValue[K],
  ) => void;
  /** Có cấu hình thì phiếu gắn đơn mua: chọn đơn, NCC/chi nhánh/tổng đơn chỉ đọc */
  sourceOrder?: GoodsReceiptSourceOrderLoader;
  onPickOrder?: (orderId: string | null) => void;
  /** Phiếu đã lưu kèm đơn mua: không đổi đơn */
  orderLocked?: boolean;
  hideLines?: boolean;
  columns?: 1 | 2;
}
