import { usePurchaseOrderListController } from "@/v2/core/purchase-orders";
import { garagePurchaseOrdersConfig } from "../garagePurchaseOrders.config";

/** Trạng thái màn Đơn mua hàng Garage: logic nằm ở core, module chỉ truyền cấu hình */
export function useGaragePurchaseOrdersPage() {
  return usePurchaseOrderListController(garagePurchaseOrdersConfig);
}

export type GaragePurchaseOrdersPageState = ReturnType<
  typeof useGaragePurchaseOrdersPage
>;
