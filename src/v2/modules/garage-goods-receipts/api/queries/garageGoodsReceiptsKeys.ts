import type { V2TableQuery } from "@/v2/shared/types/v2-table";

export const garageGoodsReceiptsKeys = {
  all: ["v2-garage-goods-receipts"] as const,
  list: (query: V2TableQuery) =>
    [...garageGoodsReceiptsKeys.all, "list", query] as const,
  detail: (id: string) =>
    [...garageGoodsReceiptsKeys.all, "detail", id] as const,
};
