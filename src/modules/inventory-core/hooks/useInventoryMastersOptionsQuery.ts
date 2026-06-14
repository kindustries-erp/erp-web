import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import { createInventoryMastersKey } from "@/shared/lib/queryKeys";
import {
  inventoryCoreApi,
  type InventoryMasterOption,
} from "@/modules/inventory-core/api/inventoryCoreApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export function useInventoryMastersOptionsQuery() {
  const uomParams = useMemo(
    () => ({ page: 1, pageSize: 200, isActive: true }),
    [],
  );
  const itemTypeParams = useMemo(
    () => ({ page: 1, pageSize: 200, isActive: true }),
    [],
  );

  const uomsQuery = useAppQuery<PaginatedResponse<InventoryMasterOption>>({
    queryKey: createInventoryMastersKey("uoms", uomParams),
    queryFn: () => inventoryCoreApi.listUoms(uomParams),
  });

  const itemTypesQuery = useAppQuery<PaginatedResponse<InventoryMasterOption>>({
    queryKey: createInventoryMastersKey("item-types", itemTypeParams),
    queryFn: () => inventoryCoreApi.listItemTypes(itemTypeParams),
  });

  return {
    uomsQuery,
    itemTypesQuery,
  };
}
