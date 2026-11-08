import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { ProcurementListConfig } from "./procurementListConfig.type";

/** Truy vấn danh sách server-side cho bảng V2; lỗi tải hiện toast. */
export function useProcurementQuery<T extends { id: string }>(
  config: ProcurementListConfig<T>,
  query: V2TableQuery,
  onError: (error: unknown) => void,
): V2ModuleListData<T> {
  const result = useQuery({
    queryKey: [config.queryKey, "list", query],
    queryFn: () => config.api.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  React.useEffect(() => {
    if (result.error) onError(result.error);
  }, [result.error, onError]);

  return {
    items: result.data?.items ?? [],
    total: result.data?.total ?? 0,
    summaries: result.data?.summaries,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
