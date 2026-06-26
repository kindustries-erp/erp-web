import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import { createInventoryMastersKey } from "@/shared/lib/queryKeys";
import {
  inventoryCoreApi,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export type InventoryMasterQueryKind =
  | "uoms"
  | "item-types"
  | "tracking-categories";

export interface UseInventoryMasterListQueryParams {
  kind: InventoryMasterQueryKind;
  page?: number;
  pageSize?: number;
  sort?: string[];
  search?: string;
  isActive?: boolean;
}

export function useInventoryMasterListQuery(
  params: UseInventoryMasterListQueryParams,
) {
  const normalizedParams = useMemo(
    () => ({
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 200,
      sort: params.sort,
      search: params.search?.trim() || undefined,
      isActive: params.isActive,
    }),
    [params.isActive, params.search, params.page, params.pageSize, params.sort],
  );

  return useAppQuery<PaginatedResponse<InventoryMasterOption>>({
    queryKey: createInventoryMastersKey(params.kind, normalizedParams),
    queryFn: () =>
      params.kind === "uoms"
        ? inventoryCoreApi.listUoms(normalizedParams)
        : params.kind === "item-types"
          ? inventoryCoreApi.listItemTypes(normalizedParams)
          : inventoryCoreApi.listTrackingCategories(normalizedParams),
    placeholderData: (previousData) => previousData,
    enabled:
      params.kind === "uoms" ||
      params.kind === "item-types" ||
      params.kind === "tracking-categories",
  });
}
