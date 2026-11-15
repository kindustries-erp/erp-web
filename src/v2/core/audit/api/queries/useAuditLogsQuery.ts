import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { AuditLogRow } from "../dtos/audit-log.dto";
import type { AuditApi } from "../auditApi.type";
import type { AuditKeys } from "../auditKeys";

export interface UseAuditLogsQueryParams {
  api: AuditApi;
  keys: AuditKeys;
  query: V2TableQuery;
  onError?: (error: unknown) => void;
}

export function useAuditLogsQuery({
  api,
  keys,
  query,
  onError,
}: UseAuditLogsQueryParams): V2ModuleListData<AuditLogRow> {
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
    total: result.data?.total ?? 0,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
