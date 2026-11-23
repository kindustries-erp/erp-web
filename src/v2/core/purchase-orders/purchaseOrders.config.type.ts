import type { PurchaseOrderFormField } from "./domain/purchaseOrder";
import type { PurchaseOrderApi } from "./api/purchaseOrderApi.type";
import type { PurchaseOrderKeys } from "./api/purchaseOrderKeys";

/** Cấu hình để một module ghép core PO: API riêng, khóa cache, bảng, quyền và trường bắt buộc */
export interface PurchaseOrderModuleConfig {
  api: PurchaseOrderApi;
  keys: PurchaseOrderKeys;
  /** Id bảng để lưu cấu hình cột của người dùng */
  tableId: string;
  /** Tên collection để kiểm tra quyền (create/update/delete) */
  permissionCollection: string;
  /** Trường bắt buộc, theo thứ tự hiển thị trên form */
  requiredFields: readonly PurchaseOrderFormField[];
  /** Cột hiển thị theo từng chế độ xem hệ thống */
  viewVisibility: Record<string, Record<string, boolean>>;
}
