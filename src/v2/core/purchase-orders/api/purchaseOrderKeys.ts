import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/**
 * Khóa React Query của một họ PO. `base` do module truyền vào để tách cache
 * giữa các module (mỗi module có cache riêng, không chung với họ PO khác).
 */
export const createPurchaseOrderKeys = (base: readonly string[]) => {
  const all = base;
  return {
    all,
    list: (query: V2TableQuery) => [...all, "list", query] as const,
    detail: (id: string) => [...all, "detail", id] as const,
    nextNo: () => [...all, "next-no"] as const,
  };
};

export type PurchaseOrderKeys = ReturnType<typeof createPurchaseOrderKeys>;
