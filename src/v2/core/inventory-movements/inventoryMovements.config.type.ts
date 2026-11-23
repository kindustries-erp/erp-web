import type { LucideIcon } from "lucide-react";
import type { InventoryMovementsApi } from "./api/inventoryMovementsApi.type";
import type { InventoryMovementsKeys } from "./api/inventoryMovementsKeys";
import type { StockVoucherTypeCode } from "./domain/stockVoucher";

/** Một loại chứng từ kho mà module khai báo (hiển thị ở cột Loại và thanh tab) */
export interface StockVoucherTypeConfig {
  code: StockVoucherTypeCode;
  /** Khóa i18n của nhãn loại, ví dụ `v2.<module>.types.issue` */
  labelKey: string;
  labelFallback: string;
  /** Chiều di chuyển kho chính của loại này, dùng chọn màu nhãn */
  direction: "IN" | "OUT" | "ADJUST";
  /** Icon hiển thị ở tab loại khi tab đang chọn */
  icon?: LucideIcon;
}

/** Cấu hình để một module ghép core: API riêng, khóa cache, bảng, quyền và danh sách loại phiếu */
export interface InventoryMovementsModuleConfig {
  api: InventoryMovementsApi;
  keys: InventoryMovementsKeys;
  voucherTableId: string;
  balanceTableId: string;
  voucherTypes: readonly StockVoucherTypeConfig[];
  /** Cột hiển thị theo từng chế độ xem hệ thống của bảng chứng từ */
  voucherViewVisibility: Record<string, Record<string, boolean>>;
  /** Cột hiển thị theo từng chế độ xem hệ thống của bảng tồn kho */
  balanceViewVisibility: Record<string, Record<string, boolean>>;
}
