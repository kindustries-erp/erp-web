import type { V2TableQuery } from "@/v2/shared/types/v2-table";

/**
 * Khóa React Query của một họ phiếu nhập. `base` do module truyền vào để
 * giữ nguyên khóa cache hiện tại của từng module.
 */
export const createGoodsReceiptKeys = (base: readonly string[]) => {
  const all = base;
  return {
    all,
    list: (query: V2TableQuery) => [...all, "list", query] as const,
    detail: (id: string) => [...all, "detail", id] as const,
    nextCode: () => [...all, "next-code"] as const,
  };
};

export type GoodsReceiptKeys = ReturnType<typeof createGoodsReceiptKeys>;
