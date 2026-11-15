import type { GoodsReceiptFormField } from "./domain/goodsReceipt";
import type { GoodsReceiptFormLine } from "./domain/goodsReceiptLine";
import type { GoodsReceiptApi } from "./api/goodsReceiptApi.type";
import type { GoodsReceiptKeys } from "./api/goodsReceiptKeys";

/** Dữ liệu điền sẵn cho phiếu nhập mới khi lập từ một đơn mua */
export interface GoodsReceiptPrefill {
  sourceOrderId: string;
  /** Số và tổng tiền của đơn mua, hiển thị chỉ đọc trên phiếu */
  sourceOrderNo?: string;
  sourceOrderTotal?: number;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  lines: GoodsReceiptFormLine[];
}

/** Nguồn đơn mua: module cung cấp cách tải đơn và chuyển thành dữ liệu điền sẵn */
export interface GoodsReceiptSourceOrderLoader {
  load: (orderId: string) => Promise<GoodsReceiptPrefill>;
  /** Tìm đơn mua có thể nhập kho (đã phát hành, chưa nhận đủ) cho ô chọn đơn mua */
  search: (term: string) => Promise<GoodsReceiptSourceOrderOption[]>;
}

/** Một lựa chọn trong ô chọn đơn mua */
export interface GoodsReceiptSourceOrderOption {
  id: string;
  orderNo: string;
  supplierName: string;
  totalAmount: number;
}

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
  /** Có hay không hỗ trợ lập phiếu từ đơn mua (`?fromOrder=<id>`) */
  sourceOrder?: GoodsReceiptSourceOrderLoader;
}
