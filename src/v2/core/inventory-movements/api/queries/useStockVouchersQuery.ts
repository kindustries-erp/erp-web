import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { StockVoucherRow } from "../../domain/stockVoucher";
import type { InventoryMovementsApi } from "../inventoryMovementsApi.type";
import type { InventoryMovementsKeys } from "../inventoryMovementsKeys";

export interface UseStockVouchersQueryParams {
  api: InventoryMovementsApi;
  keys: InventoryMovementsKeys;
  query: V2TableQuery;
  /** Loại phiếu cần lọc; bỏ trống là tất cả */
  type?: string;
  onError?: (error: unknown) => void;
}

/** Danh sách chứng từ gộp cho bảng server-side */
export function useStockVouchersQuery({
  api,
  keys,
  query,
  type,
  onError,
}: UseStockVouchersQueryParams): V2ModuleListData<StockVoucherRow> {
  const result = useQuery({
    queryKey: keys.vouchers(query, type),
    queryFn: () => api.listVouchers(query, type),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);
  return {
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    summaries: result.data?.summaries,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
