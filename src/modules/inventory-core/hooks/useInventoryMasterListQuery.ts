import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import { createInventoryMastersKey } from "@/shared/lib/queryKeys";
import {
  inventoryCoreApi,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export type InventoryMasterQueryKind = "uoms" | "item-types";

export interface UseInventoryMasterListQueryParams {
  kind: InventoryMasterQueryKind;
  search?: string;
  isActive?: boolean;
}

export function useInventoryMasterListQuery(
  params: UseInventoryMasterListQueryParams,
) {
  const normalizedParams = useMemo(
    () => ({
      page: 1,
      pageSize: 200,
      search: params.search?.trim() || undefined,
      isActive: params.isActive,
    }),
    [params.isActive, params.search],
  );

  return useAppQuery<PaginatedResponse<InventoryMasterOption>>({
    queryKey: createInventoryMastersKey(params.kind, normalizedParams),
    queryFn: () =>
      params.kind === "uoms"
        ? inventoryCoreApi.listUoms(normalizedParams)
        : inventoryCoreApi.listItemTypes(normalizedParams),
    placeholderData: (previousData) => previousData,
    enabled: params.kind === "uoms" || params.kind === "item-types",
  });
}
