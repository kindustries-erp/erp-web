import type { GaragePurchaseOrder } from "@/v2/modules/garage-purchase-orders/domain/entities/garagePurchaseOrder";

/** Bao response của API: `{ message, data }` */
export interface GaragePurchaseOrderEnvelopeDto {
  message?: string;
  data: GaragePurchaseOrder;
}

/** Danh sách PO garage (phân trang phía server) */
export interface GaragePurchaseOrderListResultDto {
  items: GaragePurchaseOrder[];
  total: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  summaries?: Record<string, number>;
}

/** Dòng gửi lên API. Số lượng và đơn giá là chuỗi số (contract erp-api) */
export interface GaragePurchaseOrderLinePayloadDto {
  itemCode?: string;
  itemName?: string;
  description?: string;
  qtyOrdered: string;
  unitPrice: string;
}

/**
 * Payload tạo/sửa PO garage. Không có `status`, `createdBy`, `amount`, `branchId`,
 * `supplierId`: API từ chối các trường này (forbidNonWhitelisted).
 */
export interface GaragePurchaseOrderPayloadDto {
  poNo?: string;
  orderDate: string;
  expectedDate: string | null;
  remarks: string | null;
  supplierInvoiceNo: string | null;
  branchName: string | null;
  supplierName: string | null;
  lines: GaragePurchaseOrderLinePayloadDto[];
}

/** Kết quả gợi ý giá trị cột (cùng hình dạng với các module V2 khác) */
export interface GaragePurchaseOrderColumnOptionsDto {
  items: { label: string; value: string }[];
  total: number;
  next: number | null;
}

/** Số phiếu kế tiếp để xem trước */
export interface GaragePurchaseOrderNextNoDto {
  nextNo: string;
}
