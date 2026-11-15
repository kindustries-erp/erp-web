import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { StockBalanceRow, StockTab } from "../../domain/stockBalance";
import type { InventoryMovementsApi } from "../inventoryMovementsApi.type";
import type { InventoryMovementsKeys } from "../inventoryMovementsKeys";

export interface UseStockBalancesQueryParams {
  api: InventoryMovementsApi;
  keys: InventoryMovementsKeys;
  query: V2TableQuery;
  tab: StockTab;
  onError?: (error: unknown) => void;
}

/** Số dư tồn theo mã hàng; summaries và số đếm tab đi theo đúng hợp đồng list v2 */
export function useStockBalancesQuery({
  api,
  keys,
  query,
  tab,
  onError,
}: UseStockBalancesQueryParams) {
  const result = useQuery({
    queryKey: keys.balances(query, tab),
    queryFn: () => api.listBalances(query, tab),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);
  return {
    items: (result.data?.items ?? []) as StockBalanceRow[],
    total: result.data?.total ?? 0,
    summaries: result.data?.summaries,
    tabCounts: result.data?.extraData?.tabCounts ?? {},
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
