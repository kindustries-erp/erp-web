import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import {
  createSalesOrdersKey,
  type SalesOrderListFilters,
} from "@/shared/lib/queryKeys";
import {
  salesOrdersCoreApi,
  type ErpSalesOrder,
} from "@/modules/sales-orders-core/api/salesOrdersCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export function useSalesOrdersQuery(
  params: SalesOrderListFilters,
  enabled = true,
) {
  const normalized = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
      status: params.status,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      customerId: params.customerId,
      notFullyIssued: params.notFullyIssued,
      column_search: params.column_search,
      column_filters: params.column_filters,
      sortField: params.sortField,
      sortOrder: params.sortOrder,
    }),
    [
      params.page,
      params.pageSize,
      params.search,
      params.status,
      params.dateFrom,
      params.dateTo,
      params.customerId,
      params.notFullyIssued,
      params.column_search,
      params.column_filters,
      params.sortField,
      params.sortOrder,
    ],
  );

  return useAppQuery<PaginatedResponse<ErpSalesOrder>>({
    queryKey: createSalesOrdersKey(normalized),
    queryFn: () => salesOrdersCoreApi.list(normalized as any),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}
