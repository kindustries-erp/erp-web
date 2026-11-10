import type { ProcurementActionKey } from "../procurement.rules";
import type { ProcurementApi } from "../procurement.types";

/** Cấu hình một màn danh sách procurement: module truyền vào, core xử lý phần còn lại. */
export interface ProcurementListConfig<T extends { id: string }> {
  api: ProcurementApi<T>;
  /** Khóa gốc của React Query, ví dụ `v2-garage-procurement-orders` */
  queryKey: string;
  /** Mã quyền (collection) trong RBAC */
  permissionCollection: string;
  /** Các hành động chuyển trạng thái khả dụng cho một dòng */
  availableActions: (row: T) => ProcurementActionKey[];
  /** Chỉ chứng từ nháp mới mở được drawer sửa và xóa */
  isEditable: (row: T) => boolean;
  /** Hiển thị tên chứng từ trong modal xác nhận */
  rowLabel: (row: T) => string;
  /** PR: đường dẫn trang PO để chuyển sang khi "Tạo PO từ PR" */
  poHref?: string;
  /** PR: dòng có còn phần chưa đặt để tạo PO không */
  canOrderFromRequest?: (row: T) => boolean;
  /**
   * Đường dẫn API cấu hình duyệt (`{path}/setting`, `{path}/approvers`).
   * Thiếu thì màn không có khóa duyệt và hành vi như cũ.
   */
  approvalConfigPath?: string;
  /** PO: API của đề nghị mua, để điền sẵn khi tạo PO từ PR */
  requestApi?: ProcurementApi<unknown>;
}
