import {
  PackageMinus,
  PackagePlus,
  ArrowDownToLine,
  SlidersHorizontal,
} from "lucide-react";
import {
  createInventoryMovementsKeys,
  stockBalanceViewVisibility,
  stockVoucherViewVisibility,
} from "@/v2/core/inventory-movements";
import type {
  InventoryMovementsModuleConfig,
  StockVoucherTypeConfig,
} from "@/v2/core/inventory-movements";
import { garageStockApi } from "./api/garageStockApi";

/** Mã loại phiếu mua hàng: mở drawer đầy đủ của core goods-receipts, không phải drawer chỉ đọc */
export const GARAGE_PURCHASE_RECEIPT_TYPE = "PURCHASE_RECEIPT";

export const garageVoucherTypes: readonly StockVoucherTypeConfig[] = [
  {
    code: GARAGE_PURCHASE_RECEIPT_TYPE,
    labelKey: "v2.garageStockVouchers.types.purchaseReceipt",
    labelFallback: "Nhập mua hàng",
    direction: "IN",
    icon: PackagePlus,
  },
  {
    code: "OTHER_RECEIPT",
    labelKey: "v2.garageStockVouchers.types.otherReceipt",
    labelFallback: "Nhập khác",
    direction: "IN",
    icon: ArrowDownToLine,
  },
  {
    code: "ISSUE",
    labelKey: "v2.garageStockVouchers.types.issue",
    labelFallback: "Xuất kho",
    direction: "OUT",
    icon: PackageMinus,
  },
  {
    code: "ADJUSTMENT",
    labelKey: "v2.garageStockVouchers.types.adjustment",
    labelFallback: "Điều chỉnh",
    direction: "ADJUST",
    icon: SlidersHorizontal,
  },
];

/** Cấu hình ghép core cho chứng từ kho và tồn kho Garage */
export const inventoryMovementsGarageConfig: InventoryMovementsModuleConfig = {
  api: garageStockApi,
  keys: createInventoryMovementsKeys(["v2-garage-stock"]),
  voucherTableId: "inventory-movements-vouchers-garage-table",
  balanceTableId: "inventory-movements-balances-garage-table",
  voucherTypes: garageVoucherTypes,
  voucherViewVisibility: stockVoucherViewVisibility,
  balanceViewVisibility: stockBalanceViewVisibility,
};
