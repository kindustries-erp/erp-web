import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import { createInventoryItemsListKey } from "@/shared/lib/queryKeys";
import {
  inventoryCoreApi,
  type ErpInventoryItem,
  type ListParams,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export interface UseInventoryItemsQueryParams {
  page: number;
  pageSize: number;
  sort?: string[];
  search?: string;
  status?: string;
  itemType?: string;
}

export function useInventoryItemsQuery(params: UseInventoryItemsQueryParams) {
  const normalizedParams = useMemo<ListParams>(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      sort: params.sort,
      search: params.search?.trim() || undefined,
      status: params.status || undefined,
      itemType: params.itemType || undefined,
    }),
    [
      params.itemType,
      params.page,
      params.pageSize,
      params.sort,
      params.search,
      params.status,
    ],
  );

  return useAppQuery<PaginatedResponse<ErpInventoryItem>>({
    queryKey: createInventoryItemsListKey(normalizedParams),
    queryFn: () => inventoryCoreApi.list(normalizedParams),
    placeholderData: (previousData) => previousData,
  });
}
