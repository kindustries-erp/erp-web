import type { ListParams } from "@/shared/types/pagination";

export interface InventoryItemListFilters extends ListParams {
  status?: string;
  itemType?: string;
}

export function createInventoryItemsListKey(filters: InventoryItemListFilters) {
  return ["inventory-items", "list", normalizeFilters(filters)] as const;
}

export function createInventoryMastersKey(
  kind: "uoms" | "item-types",
  params?: ListParams & { isActive?: boolean },
) {
  return ["inventory-masters", kind, normalizeFilters(params ?? {})] as const;
}

function normalizeFilters<T extends Record<string, unknown>>(filters: T): T {
  return Object.fromEntries(
    Object.entries(filters)
      .filter(
        ([, value]) => value !== undefined && value !== null && value !== "",
      )
      .sort(([a], [b]) => a.localeCompare(b)),
  ) as T;
}
