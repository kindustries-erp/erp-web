import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import {
  createAfterSalesKey,
  type AfterSalesListFilters,
} from "@/shared/lib/queryKeys";
import { inventoryCoreApi } from "@/modules/inventory-core/api/inventoryCoreApi";

export function useAfterSalesQuery(
  params: AfterSalesListFilters,
  enabled = true,
) {
  const normalized = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
      dealerId: params.dealerId,
      column_search: params.column_search,
      column_filters: params.column_filters,
    }),
    [
      params.page,
      params.pageSize,
      params.search,
      params.dateFrom,
      params.dateTo,
      params.sortField,
      params.sortOrder,
      params.dealerId,
      params.column_search,
      params.column_filters,
    ],
  );

  return useAppQuery({
    queryKey: createAfterSalesKey(normalized),
    queryFn: () => inventoryCoreApi.listSerialLifecycles(normalized),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}
