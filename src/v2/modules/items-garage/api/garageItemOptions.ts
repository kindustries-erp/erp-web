import { v2HttpClient } from "@/v2/shared/api/v2HttpClient";

export interface GarageItemOption {
  itemCode: string;
  itemName: string;
  unit?: string | null;
}

/** Gợi ý mã hàng garage theo mã hoặc tên (tìm trên server, tối đa 15 dòng). */
export async function listGarageItemOptions(
  search: string,
): Promise<GarageItemOption[]> {
  const { data } = await v2HttpClient.get<{ items: GarageItemOption[] }>(
    "/api/v2/items-garage",
    { params: { search: search.trim(), page: 1, pageSize: 15 } },
  );
  return data.items;
}
