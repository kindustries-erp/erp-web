import {
  inventoryCoreApi,
  type InventorySerialListParams,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { TabStateRecord } from "../types";

export function getTrackedGoodsTrackingPolicy(tab: string): string {
  switch (tab) {
    case "vehicle":
      return "VEHICLE";
    case "parts":
      return "SERIAL";
    case "lot":
      return "LOT";
    case "custom":
      return "CUSTOM";
    default:
      return "SERIAL";
  }
}

export function getTrackedGoodsQueryConfig(
  tab: string,
  tabState?: TabStateRecord,
) {
  const policy = getTrackedGoodsTrackingPolicy(tab);

  const params: InventorySerialListParams = {
    page: tabState?.page || 1,
    pageSize: tabState?.pageSize || 50,
    search: tabState?.search || undefined,
    itemType: tabState?.itemTypeFilter || undefined,
    trackingPolicy: policy,
    status: tabState?.statusFilter || undefined,
    missingSerial: tabState?.missingSerialFilter || undefined,
    sort: ["-created_at"],
    column_search: "{}",
    column_filters: "{}",
  };

  const queryKey = ["inventory-serials", "list", params];

  return {
    queryKey,
    queryFn: () => inventoryCoreApi.listSerials(params),
    staleTime: 60000,
  };
}
