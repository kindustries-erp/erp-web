import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import {
  createWarehouseIssuesKey,
  createWarehouseReceiptsKey,
} from "@/shared/lib/queryKeys";
import {
  goodsReceiptsCoreApi,
  type ErpGoodsReceipt,
} from "@/modules/goods-receipts-core/api/goodsReceiptsCoreApi";
import {
  goodsIssuesCoreApi,
  type ErpGoodsIssue,
} from "@/modules/goods-issues-core/api/goodsIssuesCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export interface WarehouseVoucherListParams {
  page: number;
  pageSize: number;
  search?: string;
}

export function useWarehouseReceiptsQuery(
  params: WarehouseVoucherListParams,
  enabled = true,
) {
  const normalized = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
    }),
    [params.page, params.pageSize, params.search],
  );

  return useAppQuery<PaginatedResponse<ErpGoodsReceipt>>({
    queryKey: createWarehouseReceiptsKey(normalized),
    queryFn: () => goodsReceiptsCoreApi.list(normalized),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}

export function useWarehouseIssuesQuery(
  params: WarehouseVoucherListParams,
  enabled = true,
) {
  const normalized = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
    }),
    [params.page, params.pageSize, params.search],
  );

  return useAppQuery<PaginatedResponse<ErpGoodsIssue>>({
    queryKey: createWarehouseIssuesKey(normalized),
    queryFn: () => goodsIssuesCoreApi.list(normalized),
    placeholderData: (previousData) => previousData,
    enabled,
  });
}
