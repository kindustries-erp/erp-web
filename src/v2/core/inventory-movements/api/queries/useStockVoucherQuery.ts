import { useQuery } from "@tanstack/react-query";
import type { InventoryMovementsApi } from "../inventoryMovementsApi.type";
import type { InventoryMovementsKeys } from "../inventoryMovementsKeys";

export interface UseStockVoucherQueryParams {
  api: InventoryMovementsApi;
  keys: InventoryMovementsKeys;
  type: string | null;
  id: string | null;
}

/** Chi tiết chỉ đọc của một chứng từ kho */
export function useStockVoucherQuery({
  api,
  keys,
  type,
  id,
}: UseStockVoucherQueryParams) {
  return useQuery({
    queryKey: keys.voucher(type ?? "", id ?? ""),
    queryFn: () => api.getVoucher(type as string, id as string),
    enabled: Boolean(type && id),
    staleTime: 30_000,
  });
}
