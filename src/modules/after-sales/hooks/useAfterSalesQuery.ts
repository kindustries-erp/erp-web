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
    }),
    [
      params.page,
      params.pageSize,
      params.search,
      params.dateFrom,
      params.dateTo,
    ],
  );

  return useAppQuery({
    queryKey: createAfterSalesKey(normalized),
    queryFn: () => inventoryCoreApi.listSerialLifecycles(normalized),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}
