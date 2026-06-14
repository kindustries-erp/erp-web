import { useMemo } from "react";
import { useAppQuery } from "@/shared/hooks/useAppQuery";
import {
  operationalApi,
  type InventoryStockRow,
  type OperationalDocument,
  type OperationalVariant,
} from "@/modules/operational/api/operationalApi";
import type { PaginatedResponse } from "@/shared/types/pagination";

export interface OperationalListQueryParams {
  variant: OperationalVariant;
  page: number;
  pageSize: number;
  search?: string;
  branch_id?: string;
  supplier_id?: string;
  recurring?: boolean;
  payment_status?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  item_type?: string;
  sort?: string[];
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

export function createOperationalListKey(params: OperationalListQueryParams) {
  return [
    "operational-list",
    params.variant,
    normalize(params as unknown as Record<string, unknown>),
  ] as const;
}

export function useOperationalListQuery(params: OperationalListQueryParams) {
  const normalized = useMemo(
    () => ({
      variant: params.variant,
      page: params.page,
      pageSize: params.pageSize,
      search: params.search?.trim() || undefined,
      branch_id: params.branch_id || undefined,
      supplier_id: params.supplier_id || undefined,
      recurring: params.recurring,
      payment_status: params.payment_status || undefined,
      status: params.status || undefined,
      date_from: params.date_from || undefined,
      date_to: params.date_to || undefined,
      item_type: params.item_type || undefined,
      sort: params.sort || undefined,
    }),
    [params],
  );

  return useAppQuery<
    PaginatedResponse<OperationalDocument | InventoryStockRow>
  >({
    queryKey: createOperationalListKey(normalized),
    queryFn: async () => {
      if (normalized.variant === "inventory") {
        return operationalApi.listInventoryStock({
          page: normalized.page,
          pageSize: normalized.pageSize,
          search: normalized.search,
          item_type: normalized.item_type,
        }) as Promise<
          PaginatedResponse<OperationalDocument | InventoryStockRow>
        >;
      }

      if (normalized.variant === "sales")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return operationalApi.listSales(normalized as any);
      if (normalized.variant === "purchase")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return operationalApi.listPurchases(normalized as any);
      if (normalized.variant === "expenses")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return operationalApi.listExpenses(normalized as any);
      if (normalized.variant === "receivables")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return operationalApi.listReceivables(normalized as any);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return operationalApi.listPayables(normalized as any);
    },
    placeholderData: (previousData) => previousData,
  });
}
