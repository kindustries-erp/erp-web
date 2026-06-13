import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
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

export function createWarehouseReceiptsKey(params: WarehouseVoucherListParams) {
  return [
    "warehouse-vouchers",
    "receipts",
    normalize(params as unknown as Record<string, unknown>),
  ] as const;
}

export function createWarehouseIssuesKey(params: WarehouseVoucherListParams) {
  return [
    "warehouse-vouchers",
    "issues",
    normalize(params as unknown as Record<string, unknown>),
  ] as const;
}

function normalize(filters: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      )
      .sort(([a], [b]) => a.localeCompare(b)),
  );
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
