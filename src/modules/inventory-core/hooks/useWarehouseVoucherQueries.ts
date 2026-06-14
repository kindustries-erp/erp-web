import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import {
  warehouseVouchersCoreApi,
  type WarehouseRow,
  type WarehouseVoucherListParams,
} from "../api/warehouseVouchersCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export function useWarehouseVouchersQuery(
  params: WarehouseVoucherListParams,
  enabled = true,
) {
  const normalized = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
      type: params.type,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      status: params.status,
      partnerId: params.partnerId,
      sort: params.sort,
    }),
    [
      params.page,
      params.pageSize,
      params.search,
      params.type,
      params.dateFrom,
      params.dateTo,
      params.status,
      params.partnerId,
      params.sort,
    ],
  );

  return useAppQuery<PaginatedResponse<WarehouseRow>>({
    queryKey: ["warehouse-vouchers", "unified", normalized],
    queryFn: () => warehouseVouchersCoreApi.list(normalized),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}
