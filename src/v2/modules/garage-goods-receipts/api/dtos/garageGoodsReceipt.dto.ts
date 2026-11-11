import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";

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
  /** Id dòng đơn mua garage được nhận (API) */
  procurementOrderLineId?: string | null;
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
  /** Đơn mua garage nguồn (API) */
  garageProcurementOrderId?: string | null;
  /** Số đơn mua nguồn và tổng tiền đơn (API, chỉ đọc) */
  garageProcurementOrderNo?: string | null;
  orderTotalAmount?: number | null;
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
  /** Số liệu tổng theo tên cột số (khớp `V2Column.key`); `null` = không tính được */
  summaries?: Record<string, V2SummaryMetric | null>;
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
  garageProcurementOrderId?: string;
  receiptNo?: string;
  receiptDate: string;
  supplierId?: string;
  supplierName?: string;
  branchId?: string | null;
  branchName?: string | null;
  totalAmount?: number;
  status?: string;
  paymentStatus?: string;
  remarks?: string;
  lines?: GarageGoodsReceiptLineDto[];
}
