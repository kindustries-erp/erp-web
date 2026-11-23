import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import type { V2SummaryMetric, V2TableQuery } from "@/v2/shared/types/v2-table";
import type { UserRecord } from "../../domain/user";
import type { UserApi } from "../userApi.type";
import type { UserKeys } from "../userKeys";

export interface UseUsersQueryParams {
  api: UserApi;
  keys: UserKeys;
  query: V2TableQuery;
  onError?: (error: unknown) => void;
}

/** Metric của cột "Email" (đếm dòng): tổng toàn bộ, số dòng trang hiện tại, lũy kế đến hết trang */
const countMetric = (
  data: { pagination?: { total: number }; items?: unknown[] } | undefined,
  query: V2TableQuery,
): V2SummaryMetric => {
  const total = data?.pagination?.total ?? 0;
  return {
    total,
    pageSubtotal: data?.items?.length ?? 0,
    cumulative: Math.min(query.page * query.pageSize, total),
  };
};

export function useUsersQuery({
  api,
  keys,
  query,
  onError,
}: UseUsersQueryParams): V2ModuleListData<UserRecord> {
  const result = useQuery({
    queryKey: keys.list(query),
    queryFn: () => api.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: result.data?.items ?? [],
    total: result.data?.pagination.total ?? 0,
    summaries: {
      email: countMetric(result.data, query),
      ...result.data?.summaries,
    },
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
