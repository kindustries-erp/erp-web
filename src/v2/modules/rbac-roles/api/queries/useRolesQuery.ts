import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { V2ModuleListData } from "@/v2/shared/components/templates/v2-module-page/V2ModulePage.type";
import type { V2TableQuery } from "@/v2/shared/types/v2-table";
import type { Role } from "../../domain/entities/role";
import { rolesV2Api } from "../rolesApi";
import { rolesKeys } from "./rolesKeys";

export function useRolesQuery(
  query: V2TableQuery,
  onError?: (error: unknown) => void,
): V2ModuleListData<Role> {
  const result = useQuery({
    queryKey: rolesKeys.list(query),
    queryFn: () => rolesV2Api.list(query),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  // Lỗi tải danh sách hiện toast (useQuery v5 không còn onError)
  React.useEffect(() => {
    if (result.error) onError?.(result.error);
  }, [result.error, onError]);

  return {
    items: (result.data?.items ?? []) as Role[],
    total: result.data?.pagination.total ?? 0,
    loading: result.isFetching,
    refetch: () => void result.refetch(),
  };
}
