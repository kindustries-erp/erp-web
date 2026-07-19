import type { ListParams } from "@/shared/types/pagination";

export interface InventoryItemListFilters extends ListParams {
  status?: string;
  itemType?: string;
}

export interface WarehouseVoucherListFilters extends ListParams {
  search?: string;
}

export function createInventoryItemsListKey(filters: InventoryItemListFilters) {
  return ["inventory-items", "list", normalizeFilters(filters)] as const;
}

export function createInventoryMastersKey(
  kind: "uoms" | "item-types" | "tracking-categories",
  params?: ListParams & { isActive?: boolean },
) {
  return ["inventory-masters", kind, normalizeFilters(params ?? {})] as const;
}

export function createWarehouseReceiptsKey(
  filters: WarehouseVoucherListFilters,
) {
  return ["warehouse-vouchers", "receipts", normalizeFilters(filters)] as const;
}

export function createWarehouseIssuesKey(filters: WarehouseVoucherListFilters) {
  return ["warehouse-vouchers", "issues", normalizeFilters(filters)] as const;
}

export interface SalesOrderListFilters extends ListParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerId?: string;
  notFullyIssued?: boolean;
}

export function createSalesOrdersKey(filters: SalesOrderListFilters) {
  return ["sales-orders", "list", normalizeFilters(filters)] as const;
}

export interface AfterSalesListFilters extends ListParams {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortField?: string;
  sortOrder?: string;
  dealerId?: string;
  column_search?: string;
  column_filters?: string;
}

export function createAfterSalesKey(filters: AfterSalesListFilters) {
  return ["after-sales", "list", normalizeFilters(filters)] as const;
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
