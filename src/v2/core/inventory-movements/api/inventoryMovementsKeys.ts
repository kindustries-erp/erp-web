import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/** Khóa React Query của một họ kho; `base` do module truyền vào */
export const createInventoryMovementsKeys = (base: readonly string[]) => ({
  all: base,
  vouchers: (query: V2TableQuery, type?: string) =>
    [...base, "vouchers", type ?? "ALL", query] as const,
  voucher: (type: string, id: string) =>
    [...base, "voucher", type, id] as const,
  balances: (query: V2TableQuery, tab: string) =>
    [...base, "balances", tab, query] as const,
  transactions: (itemCode: string, page: number) =>
    [...base, "transactions", itemCode, page] as const,
  counts: (scope: "vouchers" | "balances") =>
    [...base, "counts", scope] as const,
});

export type InventoryMovementsKeys = ReturnType<
  typeof createInventoryMovementsKeys
>;
