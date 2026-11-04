/** Dòng phụ tùng trong phiếu nhập kho, dùng chung cho mọi họ phiếu nhập */
export interface GoodsReceiptFormLine {
  id?: string;
  /** Khóa React ổn định phía client, không gửi lên API */
  clientKey?: string;
  itemCode: string;
  itemName: string;
  unit: string;
  qtyReceived: string;
  unitCost: string;
  amount: string;
  notes: string;
}
