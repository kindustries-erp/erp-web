import { useQuery } from "@tanstack/react-query";
import {
  inventoryCoreApi,
  type InventorySerialListParams,
  type InventorySerialRow,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export function useInventorySerialsQuery(params: InventorySerialListParams) {
  return useQuery<PaginatedResponse<InventorySerialRow>, Error>({
    queryKey: ["inventory-serials", "list", params],
    queryFn: () => inventoryCoreApi.listSerials(params),
    placeholderData: (prev) => prev,
  });
}
