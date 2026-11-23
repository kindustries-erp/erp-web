import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { InventoryMovementsApi } from "../inventoryMovementsApi.type";
import type { InventoryMovementsKeys } from "../inventoryMovementsKeys";

export interface UseStockTransactionsQueryParams {
  api: InventoryMovementsApi;
  keys: InventoryMovementsKeys;
  itemCode: string | null;
  page: number;
  pageSize?: number;
  costingMethod?: "WEIGHTED_AVG" | "FIFO";
  dateFrom?: string;
  dateTo?: string;
}

/** Thẻ kho của một mã hàng; chỉ gọi khi đã chọn mã */
export function useStockTransactionsQuery({
  api,
  keys,
  itemCode,
  page,
  pageSize = 20,
  costingMethod = "WEIGHTED_AVG",
  dateFrom,
  dateTo,
}: UseStockTransactionsQueryParams) {
  return useQuery({
    queryKey: keys.transactions(
      itemCode ?? "",
      page,
      costingMethod,
      dateFrom,
      dateTo,
    ),
    queryFn: () =>
      api.listTransactions(
        itemCode as string,
        page,
        pageSize,
        costingMethod,
        dateFrom || dateTo ? { dateFrom, dateTo } : undefined,
      ),
    enabled: Boolean(itemCode),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
