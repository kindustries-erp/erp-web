import {
  createPurchaseOrderKeys,
  purchaseOrderViewVisibility,
} from "@/v2/core/purchase-orders";
import type { PurchaseOrderModuleConfig } from "@/v2/core/purchase-orders";
import { garagePurchaseOrdersV2Api } from "./api/garagePurchaseOrdersApi";

/** Cấu hình ghép core cho màn Đơn mua hàng Garage: API, khóa cache, bảng và quyền riêng của garage */
export const garagePurchaseOrdersConfig: PurchaseOrderModuleConfig = {
  api: garagePurchaseOrdersV2Api,
  keys: createPurchaseOrderKeys(["v2-garage-purchase-orders"]),
  tableId: "erp-garage-purchase-orders-table",
  permissionCollection: "garage_purchase_orders",
  requiredFields: ["orderDate"],
  viewVisibility: purchaseOrderViewVisibility,
};
