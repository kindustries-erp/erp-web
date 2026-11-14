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
  /** Id dòng đơn mua nguồn (nếu nhập từ đơn mua); không hiển thị, gửi lên API */
  sourceLineId?: string;
  /** Số tối đa được nhận trên dòng (phần còn lại của đơn mua lúc lập phiếu); chỉ để chặn nhập quá, không gửi API */
  maxQty?: number;
}
