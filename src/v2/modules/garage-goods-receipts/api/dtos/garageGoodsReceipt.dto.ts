import type { V2SummaryMetric } from "@/v2/shared/types/v2-table";
import type { V2PaginatedResponse } from "@/v2/shared/types/v2-pagination";

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
  /** Hoàn nhập được khi hàng chưa xuất/điều chỉnh (chỉ phiếu đã nhập kho) */
  reversible?: boolean;
  reverseBlockedReason?: string | null;
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

/** Response danh sách: `items`, `pagination`, `summaries` (tổng theo tên cột số, khớp `V2Column.key`; `null` = không tính được) */
export type GarageGoodsReceiptListResultDto =
  V2PaginatedResponse<GarageGoodsReceiptDto> & {
    summaries?: Record<string, V2SummaryMetric | null>;
  };

/** Response column-options chuẩn v2: `items` và `pagination` (có next/previous) */
export type ColumnOptionsResultDto = V2PaginatedResponse<{
  label: string;
  value: string;
}>;

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
