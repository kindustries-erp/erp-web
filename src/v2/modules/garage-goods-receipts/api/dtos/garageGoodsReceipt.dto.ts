/** Hình dạng bản ghi và payload của `/api/v1/garage-goods-receipts` (khớp backend, không phụ thuộc V1) */

export interface GarageGoodsReceiptLineDto {
  id?: string;
  lineNo?: number;
  itemCode?: string | null;
  itemName: string;
  unit?: string | null;
  qtyReceived: number;
  unitCost?: number | null;
  amount?: number | null;
  notes?: string | null;
  createdAt?: string | null;
}

export interface GarageGoodsReceiptDto {
  id: string;
  receiptNo: string;
  receiptDate: string;
  supplierId?: string | null;
  supplierName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  totalAmount?: number | null;
  status?: string | null;
  paymentStatus?: string | null;
  remarks?: string | null;
  lines?: GarageGoodsReceiptLineDto[];
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface GarageGoodsReceiptListResultDto {
  items: GarageGoodsReceiptDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  /** Tổng toàn bộ dòng khớp bộ lọc, theo tên cột số (khớp `V2Column.key`) */
  summaries?: Record<string, number>;
}

export interface ColumnOptionsResultDto {
  items: { label: string; value: string }[];
  total: number;
  next: number | null;
}

/** Backend bọc bản ghi đơn trong `{ message, data }` */
export interface GarageGoodsReceiptEnvelopeDto {
  message: string;
  data: GarageGoodsReceiptDto;
}

export interface NextCodeDto {
  nextCode: string;
}

export interface GarageGoodsReceiptPayloadDto {
  receiptNo?: string;
  receiptDate: string;
  supplierId?: string;
  supplierName?: string;
  branchId?: string;
  branchName?: string;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  remarks?: string;
  lines?: GarageGoodsReceiptLineDto[];
}
