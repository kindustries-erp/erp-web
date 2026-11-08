import type { GoodsReceiptFormField } from "./domain/goodsReceipt";
import type { GoodsReceiptApi } from "./api/goodsReceiptApi.type";
import type { GoodsReceiptKeys } from "./api/goodsReceiptKeys";

/** Cấu hình để một module ghép core: API riêng, khóa cache, bảng, quyền và trường bắt buộc */
export interface GoodsReceiptModuleConfig {
  api: GoodsReceiptApi;
  keys: GoodsReceiptKeys;
  /** Id bảng để lưu cấu hình cột của người dùng */
  tableId: string;
  /** Tên collection để kiểm tra quyền (create/update/delete) */
  permissionCollection: string;
  /** Trường bắt buộc, theo thứ tự hiển thị trên form */
  requiredFields: readonly GoodsReceiptFormField[];
  /** Cột hiển thị theo từng chế độ xem hệ thống */
  viewVisibility: Record<string, Record<string, boolean>>;
}
