/** Dòng PO như API trả về (số dạng chuỗi theo contract erp-api) */
export interface PurchaseOrderRecordLine {
  id?: string;
  lineNo?: number;
  itemId?: string | null;
  itemCode?: string | null;
  itemName: string;
  description?: string | null;
  qtyOrdered: string;
  qtyReceived?: string | null;
  unitPrice: string;
  amount?: string | null;
}

/** Dòng PO trên form (chuỗi để phục vụ input). clientKey dùng làm key React, không gửi lên API */
export interface PurchaseOrderFormLine {
  clientKey: string;
  id?: string;
  itemCode: string;
  itemName: string;
  description: string;
  qtyOrdered: string;
  qtyReceived: string;
  unitPrice: string;
  amount: string;
}
