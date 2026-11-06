import type { V2FetchOptions, V2TableQuery } from "@/v2/shared/types/v2-table";
import type { ProcurementActionKey } from "./procurement.rules";

/** Dòng danh sách PO (đã bỏ dòng chi tiết, khớp response danh sách của API). */
export interface ProcurementOrderRow {
  id: string;
  orderNo: string;
  orderDate: string;
  expectedDate: string | null;
  supplierId: string | null;
  supplierName: string | null;
  sourceType: "DIRECT" | "REQUEST";
  requestId: string | null;
  status: string;
  fulfillmentStatus: string;
  totalAmount: string;
  approvedTotal: string | null;
  /** Người duyệt được chỉ định khi gửi duyệt (null nếu không có). */
  approverId?: string | null;
  remarks: string | null;
  branchId?: string | null;
  branchName: string | null;
  paymentStatus: string;
  supplierInvoiceNo: string | null;
  createdBy: string | null;
  /** Email người tạo, chỉ có trong danh sách. */
  createdByEmail?: string | null;
  issuedAt: string | null;
}

/** Dòng danh sách PR (entity gốc của API). */
export interface ProcurementRequestRow {
  id: string;
  requestNo: string;
  requestDate?: string | null;
  neededDate?: string | null;
  title: string | null;
  status: string;
  orderingStatus: string;
  estimatedTotal?: string | number | null;
  branchId?: string | null;
  branchName: string | null;
  createdBy: string | null;
  /** Người duyệt được chỉ định khi gửi duyệt. */
  approverId?: string | null;
  createdAt: string;
}

/** Sự kiện phê duyệt trong nhật ký duyệt của đề nghị mua hàng. */
export interface ProcurementApprovalEvent {
  id: string;
  docType: string;
  docId: string;
  action: string;
  actorId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  reason?: string | null;
  createdAt: string;
}

/** Dòng chi tiết dùng chung của PR và PO khi đọc một chứng từ. */
export interface ProcurementDetailLine {
  id: string;
  lineType: "GOODS" | "SERVICE";
  itemId?: string | null;
  itemCode?: string | null;
  itemName?: string | null;
  description?: string | null;
  /** API trả số; chuỗi vẫn được chấp nhận để tương thích dữ liệu cũ. */
  qtyOrdered?: number | string | null;
  qtyRequested?: number | string | null;
  qtyFulfilled?: number | string | null;
  unitPrice?: number | string | null;
  estUnitPrice?: number | string | null;
  amount?: number | string | null;
  requestLineId?: string | null;
}

export interface ProcurementOrderDetail extends ProcurementOrderRow {
  lines: ProcurementDetailLine[];
}

export interface ProcurementRequestDetail extends ProcurementRequestRow {
  branchId: string | null;
  requestDate: string;
  neededDate: string | null;
  remarks: string | null;
  lines: ProcurementDetailLine[];
}

/** Kết quả danh sách chuẩn của API: `rows` đổi thành `items` ở phía web. */
export interface ProcurementListResponse<T> {
  rows: T[];
  total: number;
}

/** Dòng bản nháp PO điền sẵn từ PR đã duyệt (còn lại chưa đặt). */
export interface ProcurementPoDraftLine {
  requestLineId: string;
  lineNo: number;
  lineType: "GOODS" | "SERVICE";
  itemId: string | null;
  itemCode: string | null;
  itemName: string | null;
  description: string | null;
  qtyRemaining: number;
  estUnitPrice: number | null;
}

export interface ProcurementPoDraft {
  requestId: string;
  requestNo: string;
  lines: ProcurementPoDraftLine[];
}

/** Payload dòng gửi lên API (PR và PO khác tên trường đơn giá). */
export type ProcurementLinePayload = Record<string, unknown>;

/**
 * Hợp đồng gọi API của một họ chứng từ procurement. Mỗi module cung cấp
 * base path riêng (ví dụ `/api/v2/garage-procurement-orders`).
 * D: chi tiết, C: payload tạo, H: payload sửa đầu đơn.
 */
/** Tham chiếu tối thiểu tới một chứng từ (đủ để chuyển trạng thái hoặc mở PO). */
export interface ProcurementDocumentRef {
  id: string;
}

export interface ProcurementApi<T, D = unknown, C = unknown, H = unknown> {
  list: (query: V2TableQuery) => Promise<{ items: T[]; total: number }>;
  /** `approverId` chỉ dùng cho gửi duyệt khi khóa duyệt đang bật. */
  transition: (
    id: string,
    action: ProcurementActionKey,
    reason?: string,
    approverId?: string | null,
  ) => Promise<unknown>;
  get: (id: string) => Promise<D>;
  create: (payload: C) => Promise<{ id: string }>;
  updateHeader?: (id: string, payload: H) => Promise<unknown>;
  replaceLines: (
    id: string,
    lines: ProcurementLinePayload[],
  ) => Promise<unknown>;
  remove?: (id: string) => Promise<unknown>;
  /** Xóa cứng nháp; chỉ người có quyền purge mới thấy nút */
  purge?: (id: string) => Promise<unknown>;
  /** Chỉ PR có: bản nháp PO điền sẵn (chỉ đọc) */
  poDraft?: (id: string) => Promise<ProcurementPoDraft>;
  /** Nhật ký các bước duyệt của đề nghị mua hàng */
  approvalEvents?: (id: string) => Promise<ProcurementApprovalEvent[]>;
  options?: V2FetchOptions;
}

/** Khóa bật/tắt duyệt của một họ chứng từ (đọc từ API cấu hình duyệt). */
export interface ProcurementApprovalSetting {
  docType: string;
  approvalEnabled: boolean;
}

/** Người có quyền duyệt, dùng cho dropdown chọn người duyệt. */
export interface ProcurementApprover {
  id: string;
  email: string;
}
