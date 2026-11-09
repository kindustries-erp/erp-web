import type {
  V2FetchOptionsParams,
  V2FetchOptionsResult,
  V2SummaryMetric,
  V2TableQuery,
} from "@/v2/shared/types/v2-table";
import type { ProcurementActionKey } from "./procurement.rules";

/** Bộ lọc riêng của danh sách procurement, gửi thêm vào query API. */
export interface ProcurementListFilter {
  /** Trạng thái chứng từ; thiếu thì không lọc theo trạng thái */
  status?: string;
  /** only: chỉ phiếu đã xóa mềm (xóa cứng cần quyền purge) */
  deleted?: "only";
}

export type ProcurementTableQuery = V2TableQuery & ProcurementListFilter;

export type ProcurementFetchOptionsParams = V2FetchOptionsParams &
  Pick<ProcurementListFilter, "deleted">;

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
  /** Khối vòng đời duyệt dùng chung PR/PO (API). */
  approval?: ProcurementApprovalSummary;
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
  /** Email người tạo (API), hiển thị ở cột "Người tạo". */
  createdByEmail?: string | null;
  /** Khối vòng đời duyệt dùng chung PR/PO (API). */
  approval?: ProcurementApprovalSummary;
  createdAt: string;
}

/** Một bước duyệt: người thực hiện, email, thời điểm, lý do (reject/cancel/close). */
export interface ProcurementApprovalStep {
  by: string | null;
  byEmail: string | null;
  at: string | null;
  reason?: string | null;
}

/** Khối approval của API. Bước chưa xảy ra là null. */
export interface ProcurementApprovalSummary {
  approverId: string | null;
  approverEmail: string | null;
  submit: ProcurementApprovalStep | null;
  approve: ProcurementApprovalStep | null;
  reject: ProcurementApprovalStep | null;
  cancel: ProcurementApprovalStep | null;
  close: ProcurementApprovalStep | null;
  issue: ProcurementApprovalStep | null;
}

/** Sự kiện trong nhật ký duyệt (khớp DTO API). Không có id nội bộ của nhật ký. */
export interface ProcurementApprovalEvent {
  action: string;
  fromStatus: string;
  toStatus: string;
  actorId: string;
  actorName: string | null;
  actorEmail: string | null;
  actorRoles: string[];
  comment: string | null;
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

/** Phân trang của danh sách API (object `pagination`). */
export interface ProcurementPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** Kết quả danh sách chuẩn của API: `items`, `pagination`, `summaries` (tổng cột số trên toàn bộ dòng khớp). */
export interface ProcurementListResponse<T> {
  items: T[];
  pagination: ProcurementPagination;
  summaries: Record<string, V2SummaryMetric | null>;
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
  list: (query: ProcurementTableQuery) => Promise<{
    items: T[];
    total: number;
    summaries?: Record<string, V2SummaryMetric | null>;
  }>;
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
  options?: (
    params: ProcurementFetchOptionsParams,
  ) => Promise<V2FetchOptionsResult>;
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
