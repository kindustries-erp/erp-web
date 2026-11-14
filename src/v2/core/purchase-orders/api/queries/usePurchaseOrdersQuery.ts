import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { PurchaseOrderRecord } from "../../domain/purchaseOrder";
import type { PurchaseOrderApi } from "../purchaseOrderApi.type";
import type { PurchaseOrderKeys } from "../purchaseOrderKeys";

export interface UsePurchaseOrdersQueryParams {
  api: PurchaseOrderApi;
  keys: PurchaseOrderKeys;
  query: V2TableQuery;
  onError?: (error: unknown) => void;
}

/** Danh sách PO cho bảng server-side; lỗi tải gọi `onError` */
export function usePurchaseOrdersQuery({
  api,
  keys,
  query,
  onError,
}: UsePurchaseOrdersQueryParams): V2ModuleListData<PurchaseOrderRecord> {
  const result = useQuery({
    queryKey: keys.list(query),
    queryFn: () => api.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // Lỗi tải danh sách hiện toast (useQuery v5 không còn onError)
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
